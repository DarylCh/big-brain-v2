// TypeScript types for each database table row

export type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
  removed_at: Date | null;
};

export type QuizRow = {
  id: string;
  name: string;
  owner_id: string;
  description: string | null;
  thumbnail: string | null;
  created_at: Date;
  updated_at: Date;
};

export type QuestionRow = {
  id: string;
  quiz_id: string;
  position: number;
  question: string;
  options: string[];
  correct: number[];
  time_needed_ms: number;
  created_at: Date;
  updated_at: Date;
};

export type SessionRow = {
  id: string;
  quiz_id: string;
  admin_id: string;
  position: number;
  iso_time_last_question_started: Date | null;
  active: boolean;
  created_at: Date;
  updated_at: Date;
};

export type SessionPlayerRow = {
  id: string;
  session_id: string;
  user_id: string | null;
  name: string;
  joined_at: Date;
};

export type ResultRow = {
  session_player_id: string;
  question_id: string;
  answer_ids: number[];
  correct: boolean;
  question_started_at: Date;
  answered_at: Date | null;
};
