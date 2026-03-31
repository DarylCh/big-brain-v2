import { Question } from './types';

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
  name?: string;
  owner?: string;
  createdAt?: string;
  thumbnail?: string | null;
  active?: number | null;
  oldSessions?: number[];
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
  questions?: object[];
};

export type SessionStatusResponse = {
  results: object;
};

export type SessionResultsResponse = {
  results: object[];
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
  question: object;
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
  questions: Question[];
  thumbnail: string | null;
  createdAt: string;
};

export type PlayerResultsResponse = object[];

const parseJson = async <T>(response: Response): Promise<T> => {
  return (await response.json()) as T;
};

const withAuthHeader = (token?: string, contentType = true): HeadersInit => {
  const headers: Record<string, string> = {};
  if (contentType) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
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
  register: (body: RegisterRequest) =>
    requestJson<AuthResponse>('/api/admin/auth/register', {
      method: 'POST',
      headers: withAuthHeader(undefined, true),
      body: JSON.stringify(body),
    }),

  login: (body: LoginRequest) =>
    requestJson<AuthResponse>('/api/admin/auth/login', {
      method: 'POST',
      headers: withAuthHeader(undefined, true),
      body: JSON.stringify(body),
    }),

  logout: (token: string) =>
    requestJson<Record<string, never>>('/api/admin/auth/logout', {
      method: 'POST',
      headers: withAuthHeader(token, true),
    }),

  getAdminQuizzes: (token: string) =>
    requestJson<QuizListResponse>('/api/admin/quiz', {
      method: 'GET',
      headers: withAuthHeader(token, false),
    }),

  createQuiz: (token: string, body: CreateQuizRequest) =>
    requestJson<CreateQuizResponse>('/api/admin/quiz', {
      method: 'POST',
      headers: withAuthHeader(token, true),
      body: JSON.stringify(body),
    }),

  getQuiz: (token: string, quizId: string) =>
    requestJson<AdminGetQuizResponse>(
      `/api/admin/quiz/${encodeURIComponent(quizId)}`,
      {
        method: 'GET',
        headers: withAuthHeader(token, false),
      }
    ),

  updateQuiz: (token: string, quizId: string, body: UpdateQuizRequest) =>
    requestJson<Record<string, never>>(
      `/api/admin/quiz/${encodeURIComponent(quizId)}`,
      {
        method: 'PUT',
        headers: withAuthHeader(token, true),
        body: JSON.stringify(body),
      }
    ),

  deleteQuiz: (token: string, quizId: string) =>
    requestJson<Record<string, never>>(
      `/api/admin/quiz/${encodeURIComponent(quizId)}`,
      {
        method: 'DELETE',
        headers: withAuthHeader(token, false),
      }
    ),

  startQuiz: (token: string, quizId: string) =>
    requestJson<Record<string, never>>(
      `/api/admin/quiz/${encodeURIComponent(quizId)}/start`,
      {
        method: 'POST',
        headers: withAuthHeader(token, false),
      }
    ),

  advanceQuiz: (token: string, quizId: string) =>
    requestJson<{ stage: number }>(
      `/api/admin/quiz/${encodeURIComponent(quizId)}/advance`,
      {
        method: 'POST',
        headers: withAuthHeader(token, false),
      }
    ),

  endQuiz: (token: string, quizId: string) =>
    requestJson<Record<string, never>>(
      `/api/admin/quiz/${encodeURIComponent(quizId)}/end`,
      {
        method: 'POST',
        headers: withAuthHeader(token, false),
      }
    ),

  getSessionStatus: (token: string, sessionId: string) =>
    requestJson<SessionStatusResponse>(
      `/api/admin/session/${encodeURIComponent(sessionId)}/status`,
      {
        method: 'GET',
        headers: withAuthHeader(token, false),
      }
    ),

  getSessionResults: (token: string, sessionId: string) =>
    requestJson<SessionResultsResponse>(
      `/api/admin/session/${encodeURIComponent(sessionId)}/results`,
      {
        method: 'GET',
        headers: withAuthHeader(token, false),
      }
    ),

  joinSession: (sessionId: string, body: JoinSessionRequest) =>
    requestJson<JoinSessionResponse>(
      `/api/play/join/${encodeURIComponent(sessionId)}`,
      {
        method: 'POST',
        headers: withAuthHeader(undefined, true),
        body: JSON.stringify(body),
      }
    ),

  getPlayerStatus: (playerId: string) =>
    requestJson<PlayerStatusResponse>(
      `/api/play/${encodeURIComponent(playerId)}/status`,
      {
        method: 'GET',
      }
    ),

  getPlayerQuestion: (playerId: string) =>
    requestJson<PlayerQuestionResponse>(
      `/api/play/${encodeURIComponent(playerId)}/question`,
      {
        method: 'GET',
      }
    ),

  getCorrectAnswerIds: (playerId: string) =>
    requestJson<PlayerAnswerIdsResponse>(
      `/api/play/${encodeURIComponent(playerId)}/answer`,
      {
        method: 'GET',
      }
    ),

  submitPlayerAnswers: (playerId: string, body: SubmitAnswersRequest) =>
    requestJson<Record<string, never>>(
      `/api/play/${encodeURIComponent(playerId)}/answer`,
      {
        method: 'PUT',
        headers: withAuthHeader(undefined, true),
        body: JSON.stringify(body),
      }
    ),

  getPlayerResults: (playerId: string) =>
    requestJson<PlayerResultsResponse>(
      `/api/play/${encodeURIComponent(playerId)}/results`,
      {
        method: 'GET',
      }
    ),
};
