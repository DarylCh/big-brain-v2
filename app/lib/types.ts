export type Question = {
  question: string;
  options: string[];
  Correct: number[];
  timeNeeded: number;
}

export type PlayerAnswer = {
  questionStartedAt: string | null;
  answeredAt: string | null;
  answerIds: number[];
  correct: boolean;
};

export type Player = {
  name: string;
  answers: PlayerAnswer[];
};

export type Session = {
  quizId: string;
  position: number;
  isoTimeLastQuestionStarted: string | null;
  players: { [playerId: string]: Player };
  questions: Question[];
  active: boolean;
  answerAvailable: boolean;
};

export type Sessions = { [sessionId: string]: Session };

export type Admin = {
  name: string;
  password: string;
  sessionActive: boolean;
};

export type Admins = { [email: string]: Admin };

export type Quiz = {
  name: string;
  owner: string;
  questions: Question[];
  thumbnail: string | null;
  active: number | null;
  createdAt: string;
};

export type Quizzes = { [quizId: string]: Quiz };

export type SessionTimeouts = { [sessionId: string]: NodeJS.Timeout };
