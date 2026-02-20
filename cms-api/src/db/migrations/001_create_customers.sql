-- Migration: 001_create_customers
-- Creates the customers master table with all required constraints.

CREATE TABLE IF NOT EXISTS customers (
  id           SERIAL        PRIMARY KEY,
  full_name    VARCHAR(150)  NOT NULL,
  company_name VARCHAR(150)  NOT NULL,
  phone_number VARCHAR(20)   NOT NULL,
  email        VARCHAR(255)  NOT NULL,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- Unique email constraint — enforced at DB level in addition to app layer
  CONSTRAINT uq_customers_email UNIQUE (email),

  -- Ensure mandatory fields are never empty strings
  CONSTRAINT chk_customers_full_name    CHECK (full_name    <> ''),
  CONSTRAINT chk_customers_company_name CHECK (company_name <> ''),
  CONSTRAINT chk_customers_phone_number CHECK (phone_number <> ''),
  CONSTRAINT chk_customers_email        CHECK (email        <> '')
);

CREATE INDEX IF NOT EXISTS idx_customers_email
  ON customers (email);

CREATE INDEX IF NOT EXISTS idx_customers_full_name
  ON customers (full_name);
