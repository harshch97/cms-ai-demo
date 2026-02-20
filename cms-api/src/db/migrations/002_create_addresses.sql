-- Migration: 002_create_addresses
-- Creates the addresses table with a FK to customers (ON DELETE CASCADE).

CREATE TABLE IF NOT EXISTS addresses (
  id                SERIAL        PRIMARY KEY,
  customer_id       INTEGER       NOT NULL,
  house_flat_number VARCHAR(50)   NOT NULL,
  building_street   VARCHAR(150)  NOT NULL,
  locality_area     VARCHAR(100)  NOT NULL,
  city              VARCHAR(100)  NOT NULL,
  state             VARCHAR(100)  NOT NULL,
  -- PIN code: exactly 6 numeric digits, enforced at DB and app levels
  pin_code          CHAR(6)       NOT NULL,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- FK: hard delete of a customer cascades to all their addresses
  CONSTRAINT fk_addresses_customer
    FOREIGN KEY (customer_id)
    REFERENCES customers (id)
    ON DELETE CASCADE,

  -- DB-level PIN code format constraint
  CONSTRAINT chk_addresses_pin_code
    CHECK (pin_code ~ '^[0-9]{6}$'),

  -- Ensure mandatory text fields are never empty strings
  CONSTRAINT chk_addresses_house_flat   CHECK (house_flat_number <> ''),
  CONSTRAINT chk_addresses_building     CHECK (building_street   <> ''),
  CONSTRAINT chk_addresses_locality     CHECK (locality_area     <> ''),
  CONSTRAINT chk_addresses_city         CHECK (city              <> ''),
  CONSTRAINT chk_addresses_state        CHECK (state             <> '')
);

CREATE INDEX IF NOT EXISTS idx_addresses_customer_id
  ON addresses (customer_id);
