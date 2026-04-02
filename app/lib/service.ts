import jwt from 'jsonwebtoken';
import AsyncLock from 'async-lock';
import { Redis } from '@upstash/redis';
import { InputError, AccessError } from './errors';

import {
  quizQuestionPublicReturn,
  quizQuestionGetCorrectAnswers,
  quizQuestionGetDuration,
} from './custom';
import {
  Admins,
  PlayerAnswer,
  Question,
  Quiz,
  Quizzes,
  Session,
  Sessions,
} from './types';
import { PublicQuestionReturn } from '../api/play/[playerid]/question/route';
import { QuizListItem } from './apiClient';

const lock = new AsyncLock();
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const JWT_SECRET = 'llamallamaduck';
const REDIS_KEY = 'big-brain-db';

/***************************************************************
                       State Management
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

export const update = async (
  newAdmins: Admins,
  newQuizzes: Quizzes,
  newSessions: Sessions
): Promise<void> => {
  await lock.acquire('saveData', async () => {
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
***************************************************************/

const newSessionId = () => generateId(Object.keys(sessions), 999999);
const newQuizId = () => generateId(Object.keys(quizzes));
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
  await lock.acquire('sessionMutateLock', async () => {
    await reload();
    result = await callback();
    await save();
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

export const getEmailFromAuthorization = (authorization: string) => {
  try {
    const token = authorization.replace('Bearer ', '');
    const { email } = jwt.verify(token, JWT_SECRET) as { email: string };
    if (!(email in admins)) {
      throw new AccessError('Email not found in admins list');
    }
    return email;
  } catch (error: unknown) {
    console.error('Error in getEmailFromAuthorization: ', error);
    throw new AccessError('Invalid token');
  }
};

export const login = async (email: string, password: string) =>
  await mutateLock(() => {
    if (email in admins) {
      if (admins[email].password === password) {
        admins[email].sessionActive = true;
        return jwt.sign({ email, name: admins[email].name }, JWT_SECRET, {
          algorithm: 'HS256',
        });
      }
    }
    throw new InputError('Invalid username or password');
  });

export const logout = async (email: string) =>
  await mutateLock(() => {
    admins[email].sessionActive = false;
  });

export const register = async (email: string, password: string, name: string) =>
  await mutateLock(() => {
    if (email in admins) {
      throw new InputError('Email address already registered');
    }
    admins[email] = {
      name,
      password,
      sessionActive: true,
    };
    return jwt.sign({ email, name }, JWT_SECRET, { algorithm: 'HS256' });
  });

/***************************************************************
                       Quiz Functions
***************************************************************/

const newQuizPayload = (name: string, owner: string): Quiz => ({
  name,
  owner,
  description: null,
  defaultQuestionDuration: null,
  questions: [],
  thumbnail: null,
  active: null,
  createdAt: new Date().toISOString(),
});

export const assertOwnsQuiz = (email: string, quizId: string) => {
  if (!(quizId in quizzes)) {
    throw new InputError('Invalid quiz ID');
  } else if (quizzes[quizId].owner !== email) {
    throw new InputError('Admin does not own this Quiz');
  }
};

export const getQuizzesFromAdmin = async (
  email: string
): Promise<QuizListItem[]> => {
  await reload();
  return Object.keys(quizzes)
    .filter((key) => quizzes[key].owner === email)
    .map((key) => ({
      id: parseInt(key, 10),
      createdAt: quizzes[key].createdAt,
      name: quizzes[key].name,
      thumbnail: quizzes[key].thumbnail,
      owner: quizzes[key].owner,
      numQuestions: quizzes[key].questions.length,
      active: getActiveSessionIdFromQuizId(key),
      oldSessions: getInactiveSessionsIdFromQuizId(key),
    }));
};

export const addQuiz = async (name: string, email: string) =>
  await mutateLock(() => {
    if (name === undefined) {
      throw new InputError('Must provide a name for new quiz');
    } else {
      const newId = newQuizId();
      quizzes[newId] = newQuizPayload(name, email);
      return newId;
    }
  });

export const getQuiz = async (quizId: string) => {
  await reload();
  return {
    ...quizzes[quizId],
    active: getActiveSessionIdFromQuizId(quizId),
    oldSessions: getInactiveSessionsIdFromQuizId(quizId),
  };
};

export const updateQuiz = async (
  quizId: string,
  questions?: Question[],
  name?: string,
  thumbnail?: string,
  description?: string,
  defaultQuestionDuration?: number | null
) =>
  await mutateLock(() => {
    if (questions) {
      quizzes[quizId].questions = questions;
    }
    if (name) {
      quizzes[quizId].name = name;
    }
    if (thumbnail) {
      quizzes[quizId].thumbnail = thumbnail;
    }
    if (description !== undefined) {
      quizzes[quizId].description = description;
    }
    if (defaultQuestionDuration !== undefined) {
      quizzes[quizId].defaultQuestionDuration = defaultQuestionDuration;
    }
  });

export const removeQuiz = async (quizId: string) =>
  await mutateLock(() => {
    delete quizzes[quizId];
  });

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

export const endQuiz = async (quizId: string) =>
  await mutateLock(() => {
    const sessionObject = getActiveSessionFromQuizIdThrow(quizId);
    if (!sessionObject) {
      throw new InputError('Quiz has no active session');
    }
    sessionObject.session.active = false;
  });

/***************************************************************
                       Session Functions
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

const getInactiveSessionsIdFromQuizId = (quizId: string) =>
  Object.keys(sessions)
    .filter((sid) => sessions[sid].quizId === quizId && !sessions[sid].active)
    .map((s) => parseInt(s, 10));

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

export const assertOwnsSession = async (email: string, sessionId: string) => {
  await assertOwnsQuiz(email, sessions[sessionId].quizId);
};

export const sessionResults = (sessionId: string) => {
  const session = sessions[sessionId];
  if (session.active) {
    throw new InputError('Cannot get results for active session');
  } else {
    return Object.keys(session.players).map((pid) => session.players[pid]);
  }
};

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

export const submitAnswers = async (
  playerId: string,
  answerList: PlayerAnswer[]
) =>
  await mutateLock(() => {
    if (answerList === undefined || answerList.length === 0) {
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
          answerIds: answerList.map((a) => a.answerIds).flat(),
          correct:
            JSON.stringify(
              quizQuestionGetCorrectAnswers(
                session.questions[session.position]
              ).sort()
            ) === JSON.stringify(answerList.sort()),
        };
      }
    }
  });

export const getResults = (playerId: string) => {
  const session = sessions[sessionIdFromPlayerId(playerId)];
  if (session.active) {
    console.warn('Session is still active, results may be inaccurate');
  } else if (session.position === -1) {
    throw new InputError('Session has not started yet');
  }

  return session.players[playerId].answers;
};
