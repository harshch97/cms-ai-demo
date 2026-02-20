# Backend Technical Documentation

**Project:** Customer Management System – API Server  
**Version:** 1.0  
**Date:** February 19, 2026  
**Tech Lead Author:** (Your Name)  
**Tech Stack:** Node.js · Express · TypeScript · PostgreSQL · `pg` (raw SQL, no ORM)  

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Project Structure](#2-project-structure)
3. [Technology Choices & Justification](#3-technology-choices--justification)
4. [Environment Configuration](#4-environment-configuration)
5. [Database Design & Raw SQL Strategy](#5-database-design--raw-sql-strategy)
6. [Layer Architecture](#6-layer-architecture)
7. [API Endpoints Specification](#7-api-endpoints-specification)
8. [Request & Response Interfaces (TypeScript)](#8-request--response-interfaces-typescript)
9. [Error Handling Strategy](#9-error-handling-strategy)
10. [Validation Strategy](#10-validation-strategy)
11. [Security Considerations](#11-security-considerations)
12. [Logging Strategy](#12-logging-strategy)
13. [Testing Strategy](#13-testing-strategy)
14. [Scripts & Commands](#14-scripts--commands)

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                     Angular SPA (Client)                 │
└─────────────────────────┬────────────────────────────────┘
                          │ HTTP / JSON (REST)
                          ▼
┌──────────────────────────────────────────────────────────┐
│           Node.js + Express API Server (TypeScript)      │
│  ┌─────────┐  ┌────────────┐  ┌───────────┐  ┌────────┐ │
│  │ Router  │→ │ Controller │→ │  Service  │→ │  Repo  │ │
│  └─────────┘  └────────────┘  └───────────┘  └───┬────┘ │
└──────────────────────────────────────────────────┼───────┘
                                                   │ Raw SQL (pg)
                                                   ▼
                                        ┌──────────────────┐
                                        │     PostgreSQL   │
                                        └──────────────────┘
```

- **Router** → maps HTTP verbs + paths to controllers  
- **Controller** → handles HTTP req/res, delegates business logic  
- **Service** → orchestrates business rules, calls repository  
- **Repository** → executes raw SQL via `pg` pool  

---

## 2. Project Structure

```
cms-api/
├── src/
│   ├── config/
│   │   ├── db.ts                  # pg Pool setup
│   │   └── env.ts                 # typed env variables
│   ├── repositories/
│   │   ├── customer.repository.ts # all customer raw SQL queries
│   │   ├── address.repository.ts  # all address raw SQL queries
│   │   └── reference.repository.ts# cities & states DB queries
│   ├── controllers/
│   ├── services/
│   │   ├── customer.service.ts
│   │   └── address.service.ts
│   ├── routes/
│   │   ├── index.ts               # mounts all routers
│   │   ├── customer.routes.ts
│   │   ├── address.routes.ts
│   │   └── reference.routes.ts
│   ├── middleware/
│   │   ├── error.middleware.ts    # global error handler
│   │   ├── validate.middleware.ts # request validation wrapper
│   │   └── auth.middleware.ts     # JWT verification
│   ├── validators/
│   │   ├── customer.validator.ts  # Joi / zod schemas
│   │   └── address.validator.ts
│   ├── types/
│   │   ├── customer.types.ts      # TypeScript interfaces
│   │   ├── address.types.ts
│   │   └── api.types.ts           # generic ApiResponse, PaginatedResponse
│   ├── utils/
│   │   ├── logger.ts              # winston logger
│   │   └── response.util.ts       # standardise API response shape
│   └── app.ts                     # Express app bootstrap
├── server.ts                      # Entry point (starts HTTP server)
├── .env.example
├── tsconfig.json
├── package.json
└── README.md
```

---

## 3. Technology Choices & Justification

| Package | Version (approx) | Purpose |
|---------|-------------------|---------|
| `express` | ^4.18 | HTTP framework |
| `pg` | ^8.11 | PostgreSQL raw SQL driver (no ORM) |
| `typescript` | ^5.x | Static typing |
| `ts-node-dev` | ^2.x | Dev server with hot reload |
| `zod` | ^3.x | Runtime schema validation |
| `jsonwebtoken` | ^9.x | JWT generation & verification |
| `bcryptjs` | ^2.x | Password hashing (future) |
| `helmet` | ^7.x | Security headers |
| `cors` | ^2.x | CORS policy |
| `winston` | ^3.x | Structured logging |
| `dotenv` | ^16.x | Env variable loading |

---

## 4. Environment Configuration

### `.env.example`

```dotenv
# Server
NODE_ENV=development
PORT=3000
API_PREFIX=/api/v1

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USER=cms_user
DB_PASSWORD=cms_password
DB_NAME=cms_db
DB_POOL_MIN=2
DB_POOL_MAX=10

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=8h
```

### `src/config/env.ts`

Typed wrapper that validates required env vars on startup — throws immediately if any are missing.

---

## 5. Database Design & Raw SQL Strategy

### 5.1 SQL DDL Scripts

#### `customers` Table

```sql
CREATE TABLE customers (
  id           SERIAL       PRIMARY KEY,
  full_name    VARCHAR(150) NOT NULL,
  company_name VARCHAR(150) NOT NULL,
  phone_number VARCHAR(20)  NOT NULL,
  email        VARCHAR(255) NOT NULL UNIQUE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_full_name ON customers(full_name);
```

#### `addresses` Table

```sql
CREATE TABLE addresses (
  id                 SERIAL       PRIMARY KEY,
  customer_id        INTEGER      NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  house_flat_number  VARCHAR(50)  NOT NULL,
  building_street    VARCHAR(150) NOT NULL,
  locality_area      VARCHAR(100) NOT NULL,
  city               VARCHAR(100) NOT NULL,
  state              VARCHAR(100) NOT NULL,
  pin_code           CHAR(6)      NOT NULL CHECK (pin_code ~ '^[0-9]{6}$'),
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_addresses_customer_id ON addresses(customer_id);
```

#### `states` Reference Table

```sql
CREATE TABLE states (
  id    SERIAL       PRIMARY KEY,
  name  VARCHAR(100) NOT NULL,
  CONSTRAINT uq_states_name UNIQUE (name),
  CONSTRAINT chk_states_name CHECK (name <> '')
);
```

#### `cities` Reference Table

```sql
CREATE TABLE cities (
  id       SERIAL       PRIMARY KEY,
  name     VARCHAR(100) NOT NULL,
  state_id INTEGER      NOT NULL,
  CONSTRAINT uq_cities_name_state UNIQUE (name, state_id),
  CONSTRAINT chk_cities_name      CHECK (name <> ''),
  CONSTRAINT fk_cities_state      FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE
);
CREATE INDEX idx_cities_state_id ON cities (state_id);
```

> `states` must be created **before** `cities` due to the FK dependency. Cities are unique within a state — the same city name may exist in multiple states.

> Reference data is seeded via SQL seed scripts. Cities are inserted using a subquery pattern: `INSERT INTO cities (name, state_id) SELECT 'City', id FROM states WHERE name = 'State' ON CONFLICT (name, state_id) DO NOTHING;`

### 5.2 Raw Query Conventions

- **Parameterised queries only** — never string-concatenate user input into SQL.
- All parameters passed as the second argument to `pool.query(sql, [params])`.
- Repository methods return `Promise<T>` — never expose the `pg` `QueryResult` outside the repository layer.
- Database connection pooled via a singleton `pool` from `pg.Pool`.

### 5.3 Repository Query Examples (Intent Only — No Code Generated Yet)

| Repository Method | SQL Intent |
|-------------------|-----------|
| `findAll(page, limit, search)` | `SELECT … FROM customers WHERE full_name ILIKE $1 OR email ILIKE $1 LIMIT $2 OFFSET $3` |
| `findById(id)` | `SELECT … FROM customers WHERE id = $1` |
| `create(data)` | `INSERT INTO customers (…) VALUES (…) RETURNING *` |
| `update(id, data)` | `UPDATE customers SET … updated_at = NOW() WHERE id = $1 RETURNING *` |
| `deleteById(id)` | `DELETE FROM customers WHERE id = $1` |
| `findAddressesByCustomerId(customerId)` | `SELECT … FROM addresses WHERE customer_id = $1 ORDER BY created_at ASC` |
| `createAddress(customerId, data)` | `INSERT INTO addresses (…) VALUES (…) RETURNING *` |
| `updateAddress(addressId, data)` | `UPDATE addresses SET … WHERE id = $1 RETURNING *` |
| `deleteAddress(addressId)` | `DELETE FROM addresses WHERE id = $1` |
| `getAllCities()` | `SELECT id, name, state_id FROM cities ORDER BY name ASC` |
| `getCitiesByState(stateId)` | `SELECT id, name, state_id FROM cities WHERE state_id = $1 ORDER BY name ASC` |
| `getAllStates()` | `SELECT id, name FROM states ORDER BY name ASC` |
| `cityExistsForState(cityName, stateName)` | `SELECT EXISTS (SELECT 1 FROM cities c JOIN states s ON c.state_id = s.id WHERE LOWER(c.name) = LOWER($1) AND LOWER(s.name) = LOWER($2))` |
| `stateExists(name)` | `SELECT EXISTS (SELECT 1 FROM states WHERE LOWER(name) = LOWER($1))` |

---

## 6. Layer Architecture

### 6.1 Router Layer

- Lives in `src/routes/`
- Applies middleware chains: `[authMiddleware, validateMiddleware(schema), controller]`
- No business logic in routes

### 6.2 Controller Layer

- Lives in `src/controllers/`
- Responsibility: parse request, call service, send response
- Must catch errors and forward to Express global error handler via `next(error)`
- Returns standardised `ApiResponse<T>` shape

### 6.3 Service Layer

- Lives in `src/services/`
- Responsibility: business logic, orchestration, input mapping
- Calls one or more repository methods
- Throws typed `AppError` instances for domain violations (e.g., duplicate email)

### 6.4 Repository Layer

- Lives in `src/repositories/`
- Responsibility: **raw SQL execution only** — no business logic
- Each method accepts typed parameters and returns typed domain objects
- Uses the shared `pg.Pool` singleton from `src/config/db.ts`

---

## 7. API Endpoints Specification

### Base URL: `/api/v1`

---

#### 7.1 Customer Endpoints

---

##### `GET /customers`

List customers with pagination and optional search.

| | Detail |
|---|---|
| Auth Required | Yes (JWT) |
| Query Params | `page` (default: 1), `limit` (default: 10), `search` (optional string) |
| Success Response | `200 OK` — `PaginatedResponse<Customer>` |
| Error Responses | `401 Unauthorized`, `500 Internal Server Error` |

**Response Body:**
```json
{
  "success": true,
  "data": {
    "items": [ { "id": "...", "full_name": "...", "email": "...", "..." } ],
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

##### `POST /customers`

Create a new customer **and their address** in a single atomic transaction.

| | Detail |
|---|---|
| Auth Required | Yes (JWT) |
| Request Body | `CreateCustomerDto` (includes nested `address` object) |
| Success Response | `201 Created` — `ApiResponse<CustomerWithAddresses>` |
| Error Responses | `400 Bad Request` (validation), `409 Conflict` (duplicate email), `500` |

**Request Body:**
```json
{
  "full_name": "John Doe",
  "company_name": "Acme Corp",
  "phone_number": "9876543210",
  "email": "john.doe@acme.com",
  "address": {
    "house_flat_number": "12A",
    "building_street": "Baker Street",
    "locality_area": "Westminster",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pin_code": "400001"
  }
}
```

---

##### `GET /customers/:id`

Get a single customer with all their addresses.

| | Detail |
|---|---|
| Auth Required | Yes (JWT) |
| Path Param | `id` — integer (AUTO-INCREMENT) |
| Success Response | `200 OK` — `ApiResponse<CustomerWithAddresses>` |
| Error Responses | `404 Not Found`, `500` |

---

##### `PUT /customers/:id`

Update an existing customer and optionally their address in a **single atomic transaction**.

Address update behaviour:
- `address.id` provided → updates that specific address (must belong to this customer)
- Address fields provided without `address.id` → updates the customer's first address, or creates one if none exist
- `address` key omitted entirely → only customer fields are updated

| | Detail |
|---|---|
| Auth Required | Yes (JWT) |
| Path Param | `id` — integer (AUTO-INCREMENT) |
| Request Body | `UpdateCustomerDto` (all fields optional, at least one required) |
| Success Response | `200 OK` — `ApiResponse<CustomerWithAddresses>` |
| Error Responses | `400`, `404`, `409`, `500` |

---

##### `DELETE /customers/:id`

Delete a customer **and all associated addresses** (cascade).

| | Detail |
|---|---|
| Auth Required | Yes (JWT) |
| Path Param | `id` — integer (AUTO-INCREMENT) |
| Success Response | `200 OK` — `ApiResponse<{ message: string }>` |
| Error Responses | `404`, `500` |

---

#### 7.2 Address Endpoints

---

##### `POST /customers/:id/addresses`

> **Removed.** Address creation is now handled as part of `POST /customers`.
> Use `PUT /customers/:id` with an `address` object to add an address to an existing customer who has none.

---

##### `GET /customers/:id/addresses`

List all addresses for a customer.

| | Detail |
|---|---|
| Auth Required | Yes (JWT) |
| Path Param | `id` — customer integer ID |
| Success Response | `200 OK` — `ApiResponse<Address[]>` |
| Error Responses | `404`, `500` |

---

##### `PUT /addresses/:addressId`

Update an address.

| | Detail |
|---|---|
| Auth Required | Yes (JWT) |
| Path Param | `addressId` — integer |
| Request Body | `UpdateAddressDto` |
| Success Response | `200 OK` — `ApiResponse<Address>` |
| Error Responses | `400`, `404`, `500` |

---

##### `DELETE /addresses/:addressId`

Delete a single address.

| | Detail |
|---|---|
| Auth Required | Yes (JWT) |
| Path Param | `addressId` — integer |
| Success Response | `200 OK` — `ApiResponse<{ message: string }>` |
| Error Responses | `404`, `500` |

---

#### 7.3 Reference Data Endpoints

##### `GET /reference/cities`

Returns all cities (unfiltered) from the `cities` DB table.

| | Detail |
|---|---|
| Auth Required | No |
| Success Response | `200 OK` — `ApiResponse<CityItem[]>` |

##### `GET /reference/states`

Returns state list from the `states` DB table.

| | Detail |
|---|---|
| Auth Required | No |
| Success Response | `200 OK` — `ApiResponse<ReferenceItem[]>` |

##### `GET /reference/states/:stateId/cities`

Returns only the cities that belong to the given state. Used by the frontend to populate the city dropdown after a state is selected.

| | Detail |
|---|---|
| Auth Required | No |
| Path Param | `stateId` — integer ID of the state |
| Success Response | `200 OK` — `ApiResponse<CityItem[]>` |
| Error Response | `404 Not Found` if `stateId` does not match any state |

---

## 8. Request & Response Interfaces (TypeScript)

### 8.1 Domain Models

```typescript
/*── Customer ──────────────────────────────────*/
interface Customer {
  id: number;                  // AUTO-INCREMENT INTEGER
  full_name: string;
  company_name: string;
  phone_number: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

interface CustomerWithAddresses extends Customer {
  addresses: Address[];
}

/*── Address ───────────────────────────────────*/
interface Address {
  id: number;                  // AUTO-INCREMENT INTEGER
  customer_id: number;         // FK → customers.id
  house_flat_number: string;
  building_street: string;
  locality_area: string;
  city: string;
  state: string;
  pin_code: string;            // 6 digit string
  created_at: Date;
  updated_at: Date;
}

/*── Reference Data ────────────────────────────*/
interface ReferenceItem {
  id: number;
  name: string;
}
interface CityItem {
  id: number;
  name: string;
  state_id: number;  // FK → states.id
}```

### 8.2 DTOs (Data Transfer Objects)

```typescript
/*── Customer DTOs ─────────────────────────────*/
/** Address is required on creation */
interface CreateCustomerDto {
  full_name: string;
  company_name: string;
  phone_number: string;
  email: string;
  address: CreateAddressDto;   // required — created atomically with the customer
}

/**
 * On update, address is optional.
 * address.id targets a specific address; omit to update first address or create one.
 */
interface UpdateCustomerDto {
  full_name?: string;
  company_name?: string;
  phone_number?: string;
  email?: string;
  address?: UpdateAddressDto & { id?: number };
}

/*── Address DTOs ──────────────────────────────*/
interface CreateAddressDto {
  house_flat_number: string;
  building_street: string;
  locality_area: string;
  city: string;
  state: string;
  pin_code: string;
}

interface UpdateAddressDto {
  house_flat_number?: string;
  building_street?: string;
  locality_area?: string;
  city?: string;
  state?: string;
  pin_code?: string;
}
```

### 8.3 Generic API Response

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ValidationError {
  field: string;
  message: string;
}
```

---

## 9. Error Handling Strategy

### Error Classes

| Class | HTTP Status | Description |
|-------|-------------|-------------|
| `ValidationError` | 400 | Zod schema failure |
| `NotFoundError` | 404 | Entity not found in DB |
| `ConflictError` | 409 | Duplicate unique constraint (email) |
| `AppError` | 4xx/5xx | Base class with `statusCode` |
| Unhandled | 500 | Generic internal server error |

### Middleware Flow

```
Request → Route → Controller → Service → Repository
                                ↕ throws AppError
              ← ← ← ← ← ← ← controller calls next(error)
                          ↓
              Global Error Middleware (error.middleware.ts)
                          ↓
              Sends standardised ApiResponse with error details
```

---

## 10. Validation Strategy

- **Library:** `zod` for schema definition and parsing
- Validation occurs in **middleware** (`validate.middleware.ts`) before controllers execute
- Schemas defined per DTO in `src/validators/`
- On failure → `400 Bad Request` with `errors[]` array indicating each invalid field

### Validation Rules Enforced Server-Side

| Field | Zod Rule |
|-------|---------|
| `full_name` | `z.string().min(1).max(150).regex(/^[a-zA-Z\s]+$/)` |
| `email` | `z.string().email().max(255)` |
| `phone_number` | `z.string().min(7).max(15).regex(/^\d+$/)` |
| `pin_code` | `z.string().regex(/^\d{6}$/)` |
| `city` | `z.string()` validated against values from `cities` DB table at service layer |
| `state` | `z.string()` validated against values from `states` DB table at service layer |

---

## 11. Security Considerations

| Concern | Mitigation |
|---------|-----------|
| SQL Injection | Parameterised queries via `pg` — never string interpolation |
| XSS | `helmet` middleware sets security headers |
| CORS | Configured whitelist via `cors` package |
| JWT Tampering | Verified on every protected route via `auth.middleware.ts` |
| Excessive Payloads | Express `json({ limit: '10kb' })` |
| Sensitive Data Leak | Errors in production mode do not expose stack traces |

---

## 12. Logging Strategy

- **Library:** `winston`
- Log levels: `error`, `warn`, `info`, `debug`
- Each request logged with method, path, status code, and duration (via middleware)
- DB query errors logged at `error` level with query context (no sensitive param values)
- Production: JSON format; Development: colourised console format

---

## 13. Testing Strategy

| Level | Tool | Scope |
|-------|------|-------|
| Unit | `jest` | Service logic, validator schemas |
| Integration | `jest` + `supertest` | API endpoint behaviour with test DB |
| DB | Test container / separate schema | Repository raw SQL correctness |

- Each repository method to have at least one integration test covering happy path + error path
- Validation tests to cover all boundary conditions per PRD

---

## 14. Scripts & Commands

```jsonc
// package.json scripts (intent)
{
  "scripts": {
    "dev": "ts-node-dev --respawn src/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/server.js",
    "lint": "eslint src/**/*.ts",
    "test": "jest --runInBand",
    "test:coverage": "jest --coverage",
    "db:migrate": "node dist/db/migrate.js"   // runs DDL scripts
  }
}
```

---

## Appendix A – HTTP Status Code Reference

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET / PUT / DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation failure |
| 401 | Unauthorized | Missing or invalid JWT |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate unique value (email) |
| 500 | Internal Server Error | Unhandled exception |

---

## Appendix B – pg Pool Configuration

| Setting | Value | Reason |
|---------|-------|--------|
| `min` connections | 2 | Always-warm pool for fast response |
| `max` connections | 10 | Prevent DB overload |
| `idleTimeoutMillis` | 30000 | Release idle connections after 30s |
| `connectionTimeoutMillis` | 2000 | Fail fast if DB unavailable |
