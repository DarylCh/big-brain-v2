import jwt from 'jsonwebtoken';
import AsyncLock from 'async-lock';
import { Redis } from '@upstash/redis';
import bcrypt from 'bcryptjs';
import { dbMutateSingle, dbQuery } from './clients/dbClient';
import { InputError, AccessError } from './errors';

import {
  quizQuestionPublicReturn,
  quizQuestionGetCorrectAnswers,
  quizQuestionGetDuration,
} from './custom';
import { Admins, Question, Quizzes, Session, Sessions } from './types';
import { PublicQuestionReturn } from '../api/play/[playerid]/question/route';
import { QuizListItem } from './clients/apiClient';
import { QuestionRow, SessionRow } from './database/dbTypes';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

// TODO: REVIEW - Remove Redis/AsyncLock once all functions are migrated to Neon
const lock = new AsyncLock();
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
const REDIS_KEY = process.env.REDIS_KEY!;

/***************************************************************
                       State Management
 * TODO: REVIEW - Remove this entire block once all functions below
 * are migrated to Neon. Redis, AsyncLock, reload/persist/update/save/reset
 * are only needed by unmigrated functions.
 ***************************************************************/

let admins: Admins = {};
let quizzes: Quizzes = {};
let sessions: Sessions = {};

type DbState = { admins: Admins; quizzes: Quizzes; sessions: Sessions };

const reload = async () => {
  try {
    const data = await redis.get<DbState>(REDIS_KEY);
    if (data) {
      admins = data.admins;
      quizzes = data.quizzes;
      sessions = data.sessions;
    }
  } catch {} // keep current state if Redis unavailable
};

await reload();
// Write to Redis directly — only call from within a held lock
const persist = async () => {
  try {
    await redis.set(REDIS_KEY, { admins, quizzes, sessions });
  } catch (error) {
    console.error('ERROR: Failed to write to Redis', error);
    throw new Error('Writing to database failed');
  }
};

export const update = async (
  newAdmins: Admins,
  newQuizzes: Quizzes,
  newSessions: Sessions
): Promise<void> => {
  await lock.acquire('db', async () => {
    try {
      await redis.set(REDIS_KEY, {
        admins: newAdmins,
        quizzes: newQuizzes,
        sessions: newSessions,
      });
    } catch (error) {
      console.error('ERROR: Failed to write to Redis', error);
      throw new Error('Writing to database failed');
    }
  });
};

export const save = async () => await update(admins, quizzes, sessions);
export const resetQuizzesAndSessions = async () => {
  await update(admins, {}, {});
  quizzes = {};
  sessions = {};
};
export const reset = async () => {
  await update({}, {}, {});
  admins = {};
  quizzes = {};
  sessions = {};
};

/***************************************************************
                       Helper Functions
 * TODO: REVIEW - newSessionId, newQuizId, newPlayerId, mutateLock,
 * copy, randNum, generateId can all be removed once all functions
 * are migrated to Neon. isAnswerAvailable needs rewriting to query DB.
 ***************************************************************/

const newSessionId = () => generateId(Object.keys(sessions), 999999);
const newPlayerId = () =>
  generateId(
    Object.keys(sessions)
      .map((s) => Object.keys(sessions[s].players))
      .flat()
  );

const isAnswerAvailable = (session: Session) => {
  if (session.position === -1 || session.isoTimeLastQuestionStarted === null) {
    return false;
  }

  const startedAtMs = new Date(session.isoTimeLastQuestionStarted).getTime();
  if (Number.isNaN(startedAtMs)) {
    return false;
  }

  const durationMs =
    quizQuestionGetDuration(session.questions[session.position]) * 1000;
  return Date.now() >= startedAtMs + durationMs;
};
const mutateLock = async <T>(callback: () => T | Promise<T>) => {
  let result: T;
  await lock.acquire('db', async () => {
    await reload();
    result = await callback();
    await persist(); // write directly — no nested lock acquire
  });

  return result!;
};

const copy = (x: unknown) => JSON.parse(JSON.stringify(x));
const randNum = (max: number) =>
  Math.round(
    Math.random() * (max - Math.floor(max / 10)) + Math.floor(max / 10)
  );
const generateId = (currentList: string[], max = 999999999) => {
  let R = randNum(max);
  while (currentList.includes(R.toString())) {
    R = randNum(max);
  }
  // TODO: investigate error throws
  return R.toString();
};

/***************************************************************
                       Auth Functions
***************************************************************/

export const getUserIdFromAuthorization = (authorization: string): string => {
  try {
    const token = authorization.replace('Bearer ', '');
    const { userId } = jwt.verify(token, JWT_SECRET) as { userId: string };
    return userId;
  } catch (error: unknown) {
    console.error('Error in getUserIdFromAuthorization: ', error);
    throw new AccessError('Invalid token');
  }
};

export const login = async (
  email: string,
  password: string
): Promise<string> => {
  const rows = await dbQuery<
    { id: string; name: string; password_hash: string },
    string
  >(
    `SELECT id, name, password_hash FROM users WHERE email = $1 AND removed_at IS NULL`,
    [email]
  );
  if (rows.length === 0) {
    throw new InputError('Invalid username or password');
  }
  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password_hash as string);
  if (!valid) {
    throw new InputError('Invalid username or password');
  }
  return jwt.sign({ userId: user.id, name: user.name }, JWT_SECRET, {
    algorithm: 'HS256',
  });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const logout = async (_userId: string): Promise<void> => {
  // JWT is stateless — no server-side session to invalidate
};

export const register = async (
  email: string,
  password: string,
  name: string
): Promise<string> => {
  const existing = await dbQuery<{ id: string }, string>(
    `SELECT id FROM users WHERE email = $1`,
    [email]
  );
  if (existing.length > 0) {
    throw new InputError('Email address already registered');
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await dbMutateSingle<{ id: string; name: string }>`
    INSERT INTO users (name, email, password_hash) VALUES (${name}, ${email}, ${passwordHash})
    RETURNING id, name
  `;
  if (result.length === 0) {
    throw new Error('User registration failed');
  }
  return jwt.sign({ userId: result[0].id, name: result[0].name }, JWT_SECRET, {
    algorithm: 'HS256',
  });
};

/***************************************************************
                       Quiz Functions
***************************************************************/

// const newQuizPayload = (name: string, owner: string): Quiz => ({
//   name,
//   owner,
//   description: null,
//   defaultQuestionDuration: null,
//   questions: [],
//   thumbnail: null,
//   active: null,
//   createdAt: new Date().toISOString(),
// });

export const assertOwnsQuiz = async (
  userId: string,
  quizId: string
): Promise<void> => {
  const rows = await dbQuery<{ id: string }, string>(
    `SELECT id FROM quizzes WHERE id = $1 AND owner_id = $2`,
    [quizId, userId]
  );

  if (rows.length === 0) {
    throw new InputError('Quiz not found or you do not own this quiz');
  }
};

// TODO: REVIEW - Needs migration: query quizzes JOIN sessions.
// Return type QuizListItem uses numeric IDs/active; update to UUIDs.
export const getQuizzesFromAdmin = async (
  userId: string
): Promise<QuizListItem[]> => {
  const quizzes = await dbQuery<
    {
      id: string;
      name: string;
      owner_id: string;
      description: string | null;
      thumbnail: string | null;
      created_at: string;
      updated_at: string;
    },
    string
  >(
    `SELECT * FROM quizzes q
    WHERE owner_id = $1`,
    [userId]
  );
  const foundQuizIds = quizzes.map((q) => q.id);
  const [sessions, questions] = await Promise.all([
    dbQuery<
      {
        id: string;
        quiz_id: string;
        active: boolean;
        created_at: string;
        updated_at: string;
      },
      string[]
    >(`SELECT * FROM sessions where quiz_id = ANY($1)`, [foundQuizIds]),
    dbQuery<
      {
        id: string;
        quiz_id: string;
        question_text: string;
        created_at: string;
        updated_at: string;
      },
      string[]
    >(`SELECT * FROM questions where quiz_id = ANY($1)`, [foundQuizIds]),
  ]);

  return quizzes.map((quiz) => ({
    id: quiz.id,
    createdAt: quiz.created_at,
    name: quiz.name,
    thumbnail: quiz.thumbnail,
    owner: quiz.owner_id,
    numQuestions: questions.filter((q) => q.quiz_id === quiz.id).length,
    active: sessions.filter((s) => s.quiz_id === quiz.id && s.active).length,
    oldSessions: sessions
      .filter((s) => s.quiz_id === quiz.id && !s.active)
      .map((s) => s.id),
  }));
};

export const addQuiz = async (
  name: string,
  userId: string
): Promise<string> => {
  if (!name) {
    throw new InputError('Must provide a name for new quiz');
  }
  const result = await dbMutateSingle<{ id: string }>`
    INSERT INTO quizzes (name, owner_id) VALUES (${name}, ${userId}) RETURNING id
  `;
  return result[0].id;
};

// TODO: REVIEW - Needs migration: SELECT quizzes + questions JOIN + active/inactive sessions query.
export const getQuiz = async (
  quizId: string,
  userId: string
): Promise<{
  active: string | null;
  oldSessions: string[];
  name: string;
  owner: string;
  description: string | null;
  questions: Question[];
  thumbnail: string | null;
  createdAt: string;
}> => {
  const quiz = await dbQuery<
    {
      id: string;
      name: string;
      owner_id: string;
      description: string | null;
      default_question_duration: number | null;
      thumbnail: string | null;
      created_at: string;
    },
    string
  >(`SELECT * FROM quizzes WHERE id = $1 AND owner_id = $2`, [quizId, userId]);

  if (!quiz[0]) {
    throw new InputError('Quiz not found or you do not own this quiz');
  }

  const [sessions, questions] = await Promise.all([
    dbQuery<SessionRow, string>(`SELECT * FROM sessions where quiz_id = $1`, [
      quiz[0].id,
    ]),
    dbQuery<QuestionRow, string>(`SELECT * FROM questions where quiz_id = $1`, [
      quiz[0].id,
    ]),
  ]);

  return {
    name: quiz[0].name,
    owner: quiz[0].owner_id,
    description: quiz[0].description,
    questions: questions.length
      ? questions.map((q) => ({
          question: q.question,
          options: q.options,
          Correct: q.correct,
          timeNeeded: q.time_needed_ms,
        }))
      : [],
    thumbnail: quiz[0].thumbnail,
    createdAt: quiz[0].created_at,
    active:
      sessions.find((s) => s.quiz_id === quiz[0].id && s.active)?.id ?? null,
    oldSessions: sessions
      .filter((s) => s.quiz_id === quiz[0].id && !s.active)
      .map((s) => s.id),
  };
};

export const updateQuiz = async (
  userId: string,
  quizId: string,
  name?: string,
  thumbnail?: string,
  description?: string
): Promise<string> => {
  const result = await dbMutateSingle<{ id: string }>`
    UPDATE quizzes SET
      name        = COALESCE(${name ?? null}, name),
      thumbnail   = COALESCE(${thumbnail ?? null}, thumbnail),
      description = COALESCE(${description ?? null}, description),
      updated_at  = NOW()
    WHERE id = ${quizId} AND owner_id = ${userId}
    RETURNING id
  `;
  return result[0].id;
};

export const removeQuiz = async (quizId: string): Promise<void> => {
  const active = await dbQuery<{ id: string }, string>(
    `SELECT id FROM sessions WHERE quiz_id = $1 AND active = true`,
    [quizId]
  );
  if (active.length > 0) {
    throw new InputError('Cannot delete a quiz with an active session');
  }
  await dbMutateSingle`DELETE FROM quizzes WHERE id = ${quizId}`;
};

/***************************************************************
                       Question Functions
***************************************************************/

export const getQuestions = async (quizId: string): Promise<QuestionRow[]> => {
  return dbQuery<QuestionRow, string>(
    `SELECT * FROM questions WHERE quiz_id = $1 ORDER BY created_at ASC`,
    [quizId]
  );
};

export const addQuestions = async (
  quizId: string,
  questions: Question[]
): Promise<string[]> => {
  const ids: string[] = [];
  for (const q of questions) {
    const result = await dbMutateSingle<{ id: string }>`
      INSERT INTO questions (quiz_id, question, options, correct, time_needed_ms)
      VALUES (${quizId}, ${q.question}, ${q.options}, ${q.Correct}, ${q.timeNeeded})
      RETURNING id
    `;
    ids.push(result[0].id);
  }
  return ids;
};

export const updateQuestion = async (
  questionId: string,
  quizId: string,
  question?: string,
  options?: string[],
  correct?: number[],
  timeNeededMs?: number
): Promise<string> => {
  const result = await dbMutateSingle<{ id: string }>`
    UPDATE questions SET
      question      = COALESCE(${question ?? null}, question),
      options       = COALESCE(${options ?? null}, options),
      correct       = COALESCE(${correct ?? null}, correct),
      time_needed_ms = COALESCE(${timeNeededMs ?? null}, time_needed_ms),
      updated_at    = NOW()
    WHERE id = ${questionId} AND quiz_id = ${quizId}
    RETURNING id
  `;
  return result[0].id;
};

export const removeQuestion = async (
  questionId: string,
  quizId: string
): Promise<void> => {
  await dbMutateSingle`
    DELETE FROM questions WHERE id = ${questionId} AND quiz_id = ${quizId}
  `;
};

// TODO: REVIEW - Needs migration: check question count via SELECT COUNT(*) FROM questions WHERE quiz_id;
// INSERT INTO sessions; session no longer stores a copy of questions.
export const startQuiz = async (quizId: string) =>
  await mutateLock(() => {
    if (quizHasActiveSession(quizId)) {
      throw new InputError('Quiz already has active session');
    }
    if (!quizzes[quizId].questions.length) {
      throw new InputError('Cannot start a quiz with no questions');
    }
    const id = newSessionId();
    sessions[id] = newSessionPayload(quizId);
    return id;
  });

// TODO: REVIEW - Needs migration: player count via SELECT COUNT(*) FROM session_players;
// question count via SELECT COUNT(*) FROM questions WHERE quiz_id;
// UPDATE sessions SET position, iso_time_last_question_started.
export const advanceQuiz = async (quizId: string) =>
  await mutateLock(async () => {
    const sessionObject = getActiveSessionFromQuizIdThrow(quizId);
    if (!sessionObject) {
      throw new InputError('Quiz has no active session');
    }
    const { session } = sessionObject;
    if (!session.active) {
      throw new InputError('Cannot advance a quiz that is not active');
    }
    if (Object.keys(session.players).length === 0) {
      throw new InputError('Cannot advance a session with no players');
    } else {
      const totalQuestions = session.questions.length;
      session.position += 1;
      session.isoTimeLastQuestionStarted = new Date().toISOString();
      if (session.position >= totalQuestions) {
        return -2;
      }
      return session.position;
    }
  });

export const endQuiz = async (quizId: string): Promise<void> => {
  const result = await dbMutateSingle<{ id: string }>`
    UPDATE sessions SET active = false, updated_at = NOW()
    WHERE quiz_id = ${quizId} AND active = true
    RETURNING id
  `;
  if (result.length === 0) {
    throw new InputError('Quiz has no active session');
  }
};

/***************************************************************
                       Session Functions
 * TODO: REVIEW - quizHasActiveSession, getActiveSessionFromQuizIdThrow,
 * getActiveSessionIdFromQuizId,
 * getActiveSessionFromSessionId, sessionIdFromPlayerId, newSessionPayload,
 * newPlayerPayload — all need rewriting as DB queries or can be removed.
 ***************************************************************/

const quizHasActiveSession = (quizId: string) =>
  Object.keys(sessions).filter(
    (s) => sessions[s].quizId === quizId && sessions[s].active
  ).length > 0;

const getActiveSessionFromQuizIdThrow = (
  quizId: string
): { id: string; session: Session } | null => {
  if (!quizHasActiveSession(quizId)) {
    throw new InputError('Quiz has no active session');
  }
  const sessionId = getActiveSessionIdFromQuizId(quizId);
  if (sessionId !== null) {
    return { id: sessionId.toString(), session: sessions[sessionId] };
  }
  return null;
};

const getActiveSessionIdFromQuizId = (quizId: string) => {
  const activeSessions = Object.keys(sessions).filter(
    (s) => sessions[s].quizId === quizId && sessions[s].active
  );
  if (activeSessions.length === 1) {
    return parseInt(activeSessions[0], 10);
  }
  return null;
};

const getActiveSessionFromSessionId = (sessionId: string) => {
  if (sessionId in sessions) {
    if (sessions[sessionId].active) {
      return sessions[sessionId];
    }
  }
  throw new InputError('Session ID is not an active session');
};

const sessionIdFromPlayerId = (playerId: string) => {
  for (const sessionId of Object.keys(sessions)) {
    if (
      Object.keys(sessions[sessionId].players).filter((p) => p === playerId)
        .length > 0
    ) {
      return sessionId;
    }
  }
  throw new InputError('Player ID does not refer to valid player id');
};

const newSessionPayload = (quizId: string) => ({
  quizId,
  position: -1,
  isoTimeLastQuestionStarted: null,
  players: {},
  questions: copy(quizzes[quizId].questions),
  active: true,
});

const newPlayerPayload = (name: string, numQuestions: number) => ({
  name: name,
  answers: Array(numQuestions).fill({
    questionStartedAt: null,
    answeredAt: null,
    answerIds: [],
    correct: false,
  }),
});

// TODO: REVIEW - Needs migration: JOIN sessions + questions (separate table) + session_players.
// Position -1 convention needs to be handled (DB defaults to 0; define not-started sentinel).
export const sessionStatus = (sessionId: string) => {
  const session = sessions[sessionId];
  return {
    active: session.active,
    answerAvailable: isAnswerAvailable(session),
    isoTimeLastQuestionStarted: session.isoTimeLastQuestionStarted,
    position: session.position,
    questions: session.questions,
    players: Object.keys(session.players).map(
      (player) => session.players[player].name
    ),
  };
};

// TODO: REVIEW - Needs migration: SELECT sessions WHERE session_players.id = sessionPlayerId,
// then verify quiz ownership via quizzes JOIN users.
export const assertOwnsSession = async (email: string, sessionId: string) => {
  await assertOwnsQuiz(email, sessions[sessionId].quizId);
};

// TODO: REVIEW - Needs migration: SELECT results JOIN session_players WHERE session_id.
// Completely restructured from players[].answers to results table rows.
export const sessionResults = (sessionId: string) => {
  const session = sessions[sessionId];
  if (session.active) {
    throw new InputError('Cannot get results for active session');
  } else {
    return Object.keys(session.players).map((pid) => session.players[pid]);
  }
};

// TODO: REVIEW - Needs migration: INSERT INTO session_players (session_id, user_id, name).
// user_id should come from JWT if logged in, null for guests.
// Returns session_players.id (UUID) as the new playerId.
export const playerJoin = async (name: string, sessionId: string) =>
  await mutateLock(() => {
    if (name === undefined) {
      throw new InputError('Name must be supplied');
    } else {
      const session = getActiveSessionFromSessionId(sessionId);
      if (session.position > 0) {
        throw new InputError('Session has already begun');
      } else {
        const id = newPlayerId();
        session.players[id] = newPlayerPayload(name, session.questions.length);
        return parseInt(id, 10);
      }
    }
  });

// TODO: REVIEW - Needs migration: SELECT iso_time_last_question_started FROM sessions
// via JOIN session_players WHERE session_players.id = playerId.
export const hasStarted = (playerId: string) => {
  const session = getActiveSessionFromSessionId(
    sessionIdFromPlayerId(playerId)
  );
  if (session.isoTimeLastQuestionStarted !== null) {
    return true;
  } else {
    return false;
  }
};

// TODO: REVIEW - Needs migration: look up session via session_players.id, then
// SELECT question at sessions.position from questions WHERE quiz_id ORDER BY created_at.
export const getQuestion = (playerId: string): Promise<PublicQuestionReturn> =>
  Promise.resolve().then(() => {
    const session = getActiveSessionFromSessionId(
      sessionIdFromPlayerId(playerId)
    );
    if (session.position === -1) {
      throw new InputError('Session has not started yet');
    } else {
      return {
        ...quizQuestionPublicReturn(session.questions[session.position]),
        isoTimeLastQuestionStarted: session.isoTimeLastQuestionStarted,
        lastQuestion: session.position === session.questions.length - 1,
      };
    }
  });

// TODO: REVIEW - Needs migration: same session/question lookup as getQuestion;
// return correct[] from questions table for current position.
export const getAnswers = (playerId: string) => {
  const session = getActiveSessionFromSessionId(
    sessionIdFromPlayerId(playerId)
  );
  if (session.position === -1) {
    throw new InputError('Session has not started yet');
  } else if (!isAnswerAvailable(session)) {
    throw new InputError('Question time has not been completed');
  } else {
    return quizQuestionGetCorrectAnswers(session.questions[session.position]);
  }
};

// TODO: REVIEW - Needs migration: INSERT INTO results (session_player_id, question_id,
// answer_ids, correct, question_started_at, answered_at).
// Look up session_player_id from playerId, question_id from current session position.
export const submitAnswers = async (playerId: string, answerIds: number[]) =>
  await mutateLock(() => {
    if (answerIds === undefined || answerIds.length === 0) {
      throw new InputError('Answers must be provided');
    } else {
      const session = getActiveSessionFromSessionId(
        sessionIdFromPlayerId(playerId)
      );
      if (session.position === -1) {
        throw new InputError('Session has not started yet');
      } else if (isAnswerAvailable(session)) {
        throw new InputError("Can't answer question once answer is available");
      } else {
        session.players[playerId].answers[session.position] = {
          questionStartedAt: session.isoTimeLastQuestionStarted,
          answeredAt: new Date().toISOString(),
          answerIds: answerIds,
          correct:
            JSON.stringify(
              quizQuestionGetCorrectAnswers(
                session.questions[session.position]
              ).sort()
            ) === JSON.stringify([...answerIds].sort()),
        };
      }
    }
  });

// TODO: REVIEW - Needs migration: SELECT results WHERE session_player_id = playerId
// JOIN questions to include question text/options in return value.
export const getResults = (playerId: string) => {
  const session = sessions[sessionIdFromPlayerId(playerId)];
  if (session.active) {
    console.warn('Session is still active, results may be inaccurate');
  } else if (session.position === -1) {
    throw new InputError('Session has not started yet');
  }

  return session.players[playerId].answers;
};
