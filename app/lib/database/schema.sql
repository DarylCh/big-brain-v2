CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  email         TEXT        NOT NULL,
  password_hash TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  removed_at    TIMESTAMPTZ,
  CONSTRAINT users_email_unique UNIQUE (email)
);

CREATE TABLE quizzes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  owner_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description TEXT,
  thumbnail   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT quizzes_name_owner_unique UNIQUE (name, owner_id)
);

CREATE TABLE questions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id        UUID        NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question       TEXT        NOT NULL,
  options        TEXT[]      NOT NULL,
  correct        INTEGER[]   NOT NULL,
  time_needed_ms INTEGER     NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT questions_question_quiz_unique UNIQUE (question, quiz_id)
);

CREATE TABLE sessions (
  id                              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id                         UUID        NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  position                        INTEGER     NOT NULL DEFAULT 0,
  iso_time_last_question_started  TIMESTAMPTZ,
  active                          BOOLEAN     NOT NULL DEFAULT false,
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only one active session per quiz at a time
CREATE UNIQUE INDEX sessions_one_active_per_quiz ON sessions (quiz_id) WHERE active = true;

CREATE TABLE session_players (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID        NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id    UUID        REFERENCES users(id) ON DELETE SET NULL,
  name       TEXT        NOT NULL,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- a user can only join a session once
  CONSTRAINT session_players_user_session_unique UNIQUE (session_id, user_id)
);

CREATE TABLE results (
  session_player_id   UUID        NOT NULL REFERENCES session_players(id) ON DELETE CASCADE,
  question_id         UUID        NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer_ids          INTEGER[]   NOT NULL,
  correct             BOOLEAN     NOT NULL,
  question_started_at TIMESTAMPTZ NOT NULL,
  answered_at         TIMESTAMPTZ,
  PRIMARY KEY (session_player_id, question_id)
);
