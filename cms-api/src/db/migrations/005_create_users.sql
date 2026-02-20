-- Migration: 005_create_users
-- Creates the users table used for API authentication.
-- Passwords are stored as bcrypt hashes — never plain text.

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL        PRIMARY KEY,
  name          VARCHAR(150)  NOT NULL,
  email         VARCHAR(255)  NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_users_email    UNIQUE  (email),
  CONSTRAINT chk_users_name    CHECK   (name  <> ''),
  CONSTRAINT chk_users_email   CHECK   (email <> '')
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
