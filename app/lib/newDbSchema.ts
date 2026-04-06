type User = {
  id: string; // uuid
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date; // ISO 8601 date string
  updatedAt: Date; // ISO 8601 date string
  removedAt: Date | null; // ISO 8601 date string or null if not removed
};
// constraint: email must be unique

type Quiz = {
  id: string; // uuid
  name: string;
  owner_id: string; // foreign key to User.id
  description: string | null;
  thumbnail: string | null; // url
  createdAt: Date; // ISO 8601 date string
  updatedAt: Date; // ISO 8601 date string
};
// constraint, unique(name, owner_id)

type Question = {
  id: string; // uuid
  quiz_id: string; // foreign key to Quiz.id
  question: string;
  options: string[];
  correct: number[];
  timeNeededMs: number;
  createdAt: Date;
  updatedAt: Date;
};
// constraint: unique(question, quiz_id)

type Session = {
  id: string; // uuid
  quiz_id: string; // foreign key to Quiz.id
  position: number;
  isoTimeLastQuestionStarted: Date | null; // ISO 8601 date string
  active: boolean;
  createdAt: Date; // ISO 8601 date string
  updatedAt: Date; // ISO 8601 date string
};
// constraint: only one active session per quiz

type Results = {
  session_player_id: string; // foreign key to SessionPlayers.id
  question_id: string; // foreign key to Question.id
  answer_ids: number[];
  correct: boolean;
  questionStartedAt: Date;
  answeredAt: Date | null;
};
// primary key: (session_player_id, question_id)

type SessionPlayers = {
  id: string; // uuid
  session_id: string; // foreign key to Session.id
  user_id: string | null; // foreign key to User.id, null if guest
  name: string;
  joinedAt: Date;
};
// primary key: id
// constraint: unique (session_id, user_id) where user_id is not null
