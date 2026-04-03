type User = {
  id: string; // uuid
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  removedAt: string | null; // ISO 8601 date string or null if not removed
};

type Guest = {
  id: string; // uuid
  name: string;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
};

type Quiz = {
  id: string; // uuid
  name: string;
  owner_id: string; // foreign key to User.id
  description?: string;
  thumbnail?: string;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
};

type Question = {
  id: string; // uuid
  quiz_id: string; // foreign key to Quiz.id
  options: string[];
  correct: number[];
  timeNeededMs: number;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
};

type Session = {
  id: string; // uuid
  quiz_id: string; // foreign key to Quiz.id
  position: number;
  isoTimeLastQuestionStarted: string | null; // ISO 8601 date string
  active: boolean;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
};

type Results = {
  session_id: string; // foreign key to Session.id
  player_id: string; // foreign key to User.id
  question_index: number;
  answer_ids: number[];
  correct: boolean;
  questionStartedAt: string; // ISO 8601 date string
  answeredAt: string; // ISO 8601 date string
};
