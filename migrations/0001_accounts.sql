-- HorseBrain accounts schema (Cloudflare D1 / SQLite)
-- Apply locally:      npx wrangler d1 migrations apply horsebrain --local
-- Apply to production: npx wrangler d1 migrations apply horsebrain --remote
--
-- Records are stored as JSON next to the columns we search or sort by,
-- so the shapes in server/utils/*.ts and shared/*.js stay the source of truth.

CREATE TABLE users (
  id          TEXT PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,          -- lower-case
  record      TEXT NOT NULL,                 -- UserRecord JSON (server/utils/users.ts)
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE TABLE programs (
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  track_id    TEXT NOT NULL,
  date        TEXT NOT NULL,                 -- YYYY-MM-DD
  record      TEXT NOT NULL,                 -- program record v1 JSON (shared/program-rules.js)
  summary     TEXT NOT NULL,                 -- summariseProgram() JSON, for the history list
  updated_at  TEXT NOT NULL,
  PRIMARY KEY (user_id, track_id, date)
);
CREATE INDEX programs_user_date ON programs (user_id, date DESC);

-- One-time email links. Only the SHA-256 of the token is stored.
CREATE TABLE tokens (
  hash        TEXT PRIMARY KEY,
  purpose     TEXT NOT NULL,                 -- verify-email | reset-password | change-email
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,                 -- account email when issued
  new_email   TEXT,                          -- change-email only
  expires_at  INTEGER NOT NULL               -- ms since epoch
);
CREATE INDEX tokens_user_purpose ON tokens (user_id, purpose);

-- Wrong-password lockout, per email (sha256)
CREATE TABLE auth_throttle (
  email_hash    TEXT PRIMARY KEY,
  count         INTEGER NOT NULL,
  first_at      INTEGER NOT NULL,
  locked_until  INTEGER NOT NULL DEFAULT 0
);

-- "One email of each kind per address per minute"
CREATE TABLE email_cooldowns (
  purpose     TEXT NOT NULL,
  email_hash  TEXT NOT NULL,
  until       INTEGER NOT NULL,
  PRIMARY KEY (purpose, email_hash)
);
