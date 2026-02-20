-- Migration: 003_create_reference_tables
-- Creates DB-driven state and city lookup tables.
-- Cities have a state_id FK so the UI can filter cities by selected state.
-- States must be created first because cities references it.

CREATE TABLE IF NOT EXISTS states (
  id   SERIAL        PRIMARY KEY,
  name VARCHAR(100)  NOT NULL,
  CONSTRAINT uq_states_name  UNIQUE (name),
  CONSTRAINT chk_states_name CHECK  (name <> '')
);

CREATE INDEX IF NOT EXISTS idx_states_name ON states (name);

CREATE TABLE IF NOT EXISTS cities (
  id       SERIAL        PRIMARY KEY,
  name     VARCHAR(100)  NOT NULL,
  state_id INTEGER       NOT NULL,
  CONSTRAINT uq_cities_name_state UNIQUE (name, state_id),
  CONSTRAINT chk_cities_name      CHECK  (name <> ''),
  CONSTRAINT fk_cities_state
    FOREIGN KEY (state_id)
    REFERENCES states (id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cities_name     ON cities (name);
CREATE INDEX IF NOT EXISTS idx_cities_state_id ON cities (state_id);
