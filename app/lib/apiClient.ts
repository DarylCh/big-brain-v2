/**
 * @file apiClient.ts
 *
 * Typed HTTP client for all BigBrain API routes.
 *
 * Two groups of routes are covered:
 *  - Admin routes (/api/admin/...) — require a JWT bearer token obtained via
 *    `login` or `register`. Pass the token as the first argument to each method.
 *  - Player routes (/api/play/...) — unauthenticated. Identified by a numeric
 *    playerId returned from `joinSession`.
 *
 * All methods throw an `Error` with the server's error message on non-2xx
 * responses, so callers should wrap them in try/catch.
 *
 * @example
 * const { token } = await apiClient.login({ email, password });
 * const { quizzes } = await apiClient.getAdminQuizzes(token);
 */
import { Question, Player, PlayerAnswer } from './types';
import type { PublicQuestionReturn } from '../api/play/[playerid]/question/route';

export type ApiError = {
  error: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  name: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
};

export type QuizListItem = {
  id: number;
  name: string;
  owner: string;
  createdAt: string;
  thumbnail: string | null;
  active: number | null;
  oldSessions: number[];
  numQuestions: number;
};

export type QuizListResponse = {
  quizzes: QuizListItem[];
};

export type CreateQuizRequest = {
  name: string;
};

export type CreateQuizResponse = {
  quizId: string;
};

export type UpdateQuizRequest = {
  name?: string;
  thumbnail?: string;
  description?: string;
  defaultQuestionDuration?: number | null;
  questions?: Question[];
};

export type SessionStatus = {
  active: boolean;
  answerAvailable: boolean;
  isoTimeLastQuestionStarted: string | null;
  position: number;
  questions: Question[];
  players: string[];
};

export type SessionStatusResponse = {
  results: SessionStatus;
};

export type SessionResultsResponse = {
  results: Player[];
};

export type JoinSessionRequest = {
  name: string;
};

export type JoinSessionResponse = {
  playerId: number;
};

export type PlayerStatusResponse = {
  started: boolean;
};

export type PlayerQuestionResponse = {
  question: PublicQuestionReturn;
};

export type PlayerAnswerIdsResponse = {
  answerIds: number[];
};

export type SubmitAnswersRequest = {
  answerIds: number[];
};

export type AdminGetQuizResponse = {
  active: number | null;
  oldSessions: number[];
  name: string;
  owner: string;
  description: string | null;
  defaultQuestionDuration: number | null;
  questions: Question[];
  thumbnail: string | null;
  createdAt: string;
};

export type PlayerResultsResponse = PlayerAnswer[];

const parseJson = async <T>(response: Response): Promise<T> => {
  return (await response.json()) as T;
};

const withAuthHeader = (token?: string, contentType = true): HeadersInit => {
  const headers: Record<string, string> = {};
  if (contentType) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    console.log('CALLING WITH TOKEN: ', token);
    headers.Authorization = token;
  }
  return headers;
};

const requestJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error((body as ApiError).error ?? `HTTP ${response.status}`);
  }
  return parseJson<T>(response);
};

export const apiClient = {
  /**
   * POST /api/admin/auth/register
   * Registers a new admin account.
   * @param body - { email, password, name }
   * @returns { token } - JWT bearer token
   */
  register: (body: RegisterRequest) =>
    requestJson<AuthResponse>('/api/admin/auth/register', {
      method: 'POST',
      headers: withAuthHeader(undefined, true),
      body: JSON.stringify(body),
    }),

  /**
   * POST /api/admin/auth/login
   * Authenticates an admin and returns a session token.
   * @param body - { email, password }
   * @returns { token } - JWT bearer token
   */
  login: (body: LoginRequest) =>
    requestJson<AuthResponse>('/api/admin/auth/login', {
      method: 'POST',
      headers: withAuthHeader(undefined, true),
      body: JSON.stringify(body),
    }),

  /**
   * POST /api/admin/auth/logout
   * Invalidates the current admin session.
   * @param token - Bearer token of the authenticated admin
   * @returns {} - Empty object on success
   */
  logout: (token: string) =>
    requestJson<Record<string, never>>('/api/admin/auth/logout', {
      method: 'POST',
      headers: withAuthHeader(token, true),
    }),

  /**
   * GET /api/admin/quiz
   * Returns all quizzes owned by the authenticated admin.
   * @param token - Bearer token of the authenticated admin
   * @returns { quizzes } - Array of QuizListItem
   */
  getAdminQuizzes: (token: string) =>
    requestJson<QuizListResponse>('/api/admin/quiz', {
      method: 'GET',
      headers: withAuthHeader(token, false),
    }),

  /**
   * POST /api/admin/quiz
   * Creates a new quiz for the authenticated admin.
   * @param token - Bearer token of the authenticated admin
   * @param body - { name }
   * @returns { quizId } - ID of the newly created quiz
   */
  createQuiz: (token: string, body: CreateQuizRequest) =>
    requestJson<CreateQuizResponse>('/api/admin/quiz', {
      method: 'POST',
      headers: withAuthHeader(token, true),
      body: JSON.stringify(body),
    }),

  /**
   * GET /api/admin/quiz/:quizId
   * Returns full details of a specific quiz owned by the admin.
   * @param token - Bearer token of the authenticated admin
   * @param quizId - ID of the quiz to retrieve
   * @returns { name, owner, questions, thumbnail, active, oldSessions, createdAt }
   */
  getQuiz: (token: string, quizId: string) =>
    requestJson<AdminGetQuizResponse>(
      `/api/admin/quiz/${encodeURIComponent(quizId)}`,
      {
        method: 'GET',
        headers: withAuthHeader(token, false),
      }
    ),

  /**
   * PUT /api/admin/quiz/:quizId
   * Updates one or more fields of a quiz.
   * @param token - Bearer token of the authenticated admin
   * @param quizId - ID of the quiz to update
   * @param body - Partial update: { name?, thumbnail?, questions? }
   * @returns {} - Empty object on success
   */
  updateQuiz: (token: string, quizId: string, body: UpdateQuizRequest) =>
    requestJson<Record<string, never>>(
      `/api/admin/quiz/${encodeURIComponent(quizId)}`,
      {
        method: 'PUT',
        headers: withAuthHeader(token, true),
        body: JSON.stringify(body),
      }
    ),

  /**
   * DELETE /api/admin/quiz/:quizId
   * Permanently deletes a quiz and all its data.
   * @param token - Bearer token of the authenticated admin
   * @param quizId - ID of the quiz to delete
   * @returns {} - Empty object on success
   */
  deleteQuiz: (token: string, quizId: string) =>
    requestJson<Record<string, never>>(
      `/api/admin/quiz/${encodeURIComponent(quizId)}`,
      {
        method: 'DELETE',
        headers: withAuthHeader(token, false),
      }
    ),

  /**
   * POST /api/admin/quiz/:quizId/start
   * Starts a new session for the given quiz. Players can now join.
   * @param token - Bearer token of the authenticated admin
   * @param quizId - ID of the quiz to start
   * @returns {} - Empty object on success
   */
  startQuiz: (token: string, quizId: string) =>
    requestJson<Record<string, never>>(
      `/api/admin/quiz/${encodeURIComponent(quizId)}/start`,
      {
        method: 'POST',
        headers: withAuthHeader(token, false),
      }
    ),

  /**
   * POST /api/admin/quiz/:quizId/advance
   * Advances the active session to the next question.
   * @param token - Bearer token of the authenticated admin
   * @param quizId - ID of the quiz whose session to advance
   * @returns { stage } - The new question position (0-indexed)
   */
  advanceQuiz: (token: string, quizId: string) =>
    requestJson<{ stage: number }>(
      `/api/admin/quiz/${encodeURIComponent(quizId)}/advance`,
      {
        method: 'POST',
        headers: withAuthHeader(token, false),
      }
    ),

  /**
   * POST /api/admin/quiz/:quizId/end
   * Ends the active session for the given quiz.
   * @param token - Bearer token of the authenticated admin
   * @param quizId - ID of the quiz whose session to end
   * @returns {} - Empty object on success
   */
  endQuiz: (token: string, quizId: string) =>
    requestJson<Record<string, never>>(
      `/api/admin/quiz/${encodeURIComponent(quizId)}/end`,
      {
        method: 'POST',
        headers: withAuthHeader(token, false),
      }
    ),

  /**
   * GET /api/admin/session/:sessionId/status
   * Returns the current status of a session (position, players, active state).
   * @param token - Bearer token of the authenticated admin
   * @param sessionId - ID of the session to query
   * @returns { results: SessionStatus }
   */
  getSessionStatus: (token: string, sessionId: string) =>
    requestJson<SessionStatusResponse>(
      `/api/admin/session/${encodeURIComponent(sessionId)}/status`,
      {
        method: 'GET',
        headers: withAuthHeader(token, false),
      }
    ),

  /**
   * GET /api/admin/session/:sessionId/results
   * Returns the final results for a completed session. Fails if session is still active.
   * @param token - Bearer token of the authenticated admin
   * @param sessionId - ID of the completed session
   * @returns { results } - Array of Player objects with name and per-question answers
   */
  getSessionResults: (token: string, sessionId: string) =>
    requestJson<SessionResultsResponse>(
      `/api/admin/session/${encodeURIComponent(sessionId)}/results`,
      {
        method: 'GET',
        headers: withAuthHeader(token, false),
      }
    ),

  /**
   * POST /api/play/join/:sessionId
   * Joins a game session as a player. Session must not have started yet.
   * @param sessionId - ID of the session to join
   * @param body - { name } - Display name for the player
   * @returns { playerId } - Unique numeric ID assigned to the player
   */
  joinSession: (sessionId: string, body: JoinSessionRequest) =>
    requestJson<JoinSessionResponse>(
      `/api/play/join/${encodeURIComponent(sessionId)}`,
      {
        method: 'POST',
        headers: withAuthHeader(undefined, true),
        body: JSON.stringify(body),
      }
    ),

  /**
   * GET /api/play/:playerId/status
   * Polls whether the quiz session has started for the player.
   * @param playerId - The player's assigned ID
   * @returns { started } - true once the admin has advanced past position -1
   */
  getPlayerStatus: (playerId: string) =>
    requestJson<PlayerStatusResponse>(
      `/api/play/${encodeURIComponent(playerId)}/status`,
      {
        method: 'GET',
      }
    ),

  /**
   * GET /api/play/:playerId/question
   * Returns the current question for the player's active session.
   * @param playerId - The player's assigned ID
   * @returns { question: PublicQuestionReturn } - Question text, options, time limit, and metadata
   */
  getPlayerQuestion: (playerId: string) =>
    requestJson<PlayerQuestionResponse>(
      `/api/play/${encodeURIComponent(playerId)}/question`,
      {
        method: 'GET',
      }
    ),

  /**
   * GET /api/play/:playerId/answer
   * Returns the correct answer IDs for the current question. Only available after the time limit expires.
   * @param playerId - The player's assigned ID
   * @returns { answerIds } - Array of correct option indices
   */
  getCorrectAnswerIds: (playerId: string) =>
    requestJson<PlayerAnswerIdsResponse>(
      `/api/play/${encodeURIComponent(playerId)}/answer`,
      {
        method: 'GET',
      }
    ),

  /**
   * PUT /api/play/:playerId/answer
   * Submits the player's selected answer IDs for the current question.
   * Must be called before the question time limit expires.
   * @param playerId - The player's assigned ID
   * @param body - { answerIds } - Array of selected option indices
   * @returns {} - Empty object on success
   */
  submitPlayerAnswers: (playerId: string, body: SubmitAnswersRequest) =>
    requestJson<Record<string, never>>(
      `/api/play/${encodeURIComponent(playerId)}/answer`,
      {
        method: 'PUT',
        headers: withAuthHeader(undefined, true),
        body: JSON.stringify(body),
      }
    ),

  /**
   * GET /api/play/:playerId/results
   * Returns the player's per-question results after the session ends.
   * @param playerId - The player's assigned ID
   * @returns PlayerAnswer[] - Array of answers with correctness, timestamps, and submitted IDs
   */
  getPlayerResults: (playerId: string) =>
    requestJson<PlayerResultsResponse>(
      `/api/play/${encodeURIComponent(playerId)}/results`,
      {
        method: 'GET',
      }
    ),

  /**
   * DELETE /api/admin/delete
   * Resets all data in the store.
   * @param token - Admin JWT bearer token
   * @returns {} - Empty object on success
   */
  deleteStore: (token: string) => {
    console.log('deleteStore called with token: ', token);
    return requestJson<Record<string, never>>('/api/admin/delete', {
      method: 'DELETE',
      headers: withAuthHeader(token, false),
    });
  },
};
