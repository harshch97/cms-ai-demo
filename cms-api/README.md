# CMS API — Customer Management System (Backend)

Node.js + Express + TypeScript REST API backed by PostgreSQL using raw SQL queries (no ORM).

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Project Structure](#2-project-structure)
3. [Environment Setup](#3-environment-setup)
4. [Database Setup](#4-database-setup)
5. [Install Dependencies](#5-install-dependencies)
6. [Run Database Migrations](#6-run-database-migrations)
7. [Run the Project](#7-run-the-project)
8. [Build for Production](#8-build-for-production)
9. [Available npm Scripts](#9-available-npm-scripts)
10. [API Overview](#10-api-overview)

---

## 1. Prerequisites

Make sure the following are installed on your machine before proceeding:

| Tool | Minimum Version | Download |
|------|----------------|----------|
| Node.js | v18+ | https://nodejs.org |
| npm | v9+ | Bundled with Node.js |
| PostgreSQL | v14+ | https://www.postgresql.org/download |

Verify your installations:

```bash
node --version
npm --version
psql --version
```

---

## 2. Project Structure

```
cms-api/
├── src/
│   ├── config/
│   │   ├── db.ts             # PostgreSQL pool + query helper
│   │   └── env.ts            # Typed environment variable loader
│   ├── controllers/          # Request handlers (no business logic)
│   ├── db/
│   │   ├── migrate.ts        # Migration runner
│   │   └── migrations/       # SQL migration files (run in order)
│   │       ├── 001_create_customers.sql
│   │       ├── 002_create_addresses.sql
│   │       ├── 003_create_reference_tables.sql
│   │       └── 004_seed_reference_data.sql
│   ├── middleware/           # Auth, validation, error handling, logging
│   ├── repositories/         # Raw SQL queries (data access layer)
│   ├── routes/               # Express routers
│   ├── services/             # Business logic layer
│   ├── types/                # TypeScript interfaces & DTOs
│   ├── utils/                # Logger, response helpers, error classes
│   ├── app.ts                # Express app setup
│   └── server.ts             # Server entry point
├── .env.example              # Environment variable template
├── package.json
└── tsconfig.json
```

---

## 3. Environment Setup

Copy the example env file and fill in your values:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# or manually create a .env file in the cms-api folder
```

Edit `.env` with your database credentials and JWT secret:

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
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=8h
```

> **Important:** Never commit the `.env` file to version control. It is already listed in `.gitignore`.

---

## 4. Database Setup

### 4.1 Create the PostgreSQL Database and User

Connect to PostgreSQL as a superuser (e.g. `postgres`) and run:

```sql
-- Create a dedicated user for the application
CREATE USER cms_user WITH PASSWORD 'cms_password';

-- Create the database owned by that user
CREATE DATABASE cms_db OWNER cms_user;

-- Grant all privileges (required for migrations to create tables)
GRANT ALL PRIVILEGES ON DATABASE cms_db TO cms_user;
```

You can run these commands using `psql`:

```bash
# Connect as the postgres superuser
psql -U postgres

# Then paste the SQL above
```

Or use pgAdmin / any PostgreSQL GUI tool to execute the same statements.

### 4.2 Verify the Connection

```bash
psql -U cms_user -d cms_db -h localhost
```

If you see the `cms_db=#` prompt, the connection is working.

---

## 5. Install Dependencies

```bash
cd cms-api
npm install
```

---

## 6. Run Database Migrations

Migrations are SQL files in `src/db/migrations/` executed in filename order. The runner tracks applied migrations in a `schema_migrations` table — it is safe to run multiple times (idempotent).

```bash
npm run db:migrate
```

**Expected output:**

```
Starting database migrations...
  [RUN]   001_create_customers.sql
  [RUN]   002_create_addresses.sql
  [RUN]   003_create_reference_tables.sql
  [RUN]   004_seed_reference_data.sql
Migrations complete. 4 migration(s) applied.
```

If a migration has already been applied, it will be skipped:

```
  [SKIP]  001_create_customers.sql — already applied
```

### What the migrations create

| File | Purpose |
|------|---------|
| `001_create_customers.sql` | `customers` table with indexes |
| `002_create_addresses.sql` | `addresses` table with FK → customers |
| `003_create_reference_tables.sql` | `states` and `cities` tables (`cities.state_id` FK → `states`) |
| `004_seed_reference_data.sql` | Seeds all Indian states and their cities |

---

## 8. Run the Project

### Development Mode (with hot reload)

Uses `ts-node-dev` which watches for file changes and auto-restarts the server.

```bash
npm run dev
```

**Expected output:**

```
[INFO] Server is running on port 3000
[INFO] Database connection established
[INFO] Environment: development
```

The API will be available at: `http://localhost:3000/api/v1`

---

## 9. Build for Production

Compile TypeScript to JavaScript in the `dist/` folder:

```bash
npm run build
```

Start the compiled server:

```bash
npm start
```

> In production, set `NODE_ENV=production` in your environment. This switches logs to structured JSON format.

---

## 10. Available npm Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `ts-node-dev --respawn src/server.ts` | Start dev server with hot reload |
| `npm run build` | `tsc -p tsconfig.json` | Compile TypeScript → `dist/` |
| `npm start` | `node dist/server.js` | Start the compiled production server |
| `npm run db:migrate` | `ts-node-dev src/db/migrate.ts` | Run all pending SQL migrations |
| `npm run seed:admin` | `ts-node-dev src/db/seed-admin.ts` | Create the default admin user |
| `npm run lint` | `eslint src/**/*.ts --fix` | Lint and auto-fix source files |
| `npm test` | `jest --runInBand` | Run test suite |
| `npm run test:coverage` | `jest --coverage` | Run tests with coverage report |

---

## 11. API Overview

All endpoints are prefixed with `/api/v1`. Most endpoints require a **Bearer JWT token** in the `Authorization` header.

### Authentication Header

```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

#### Authentication (No auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Login and receive a JWT token |

**Login request body:**
```json
{
  "email": "admin@cms.com",
  "password": "Admin@123"
}
```

**Login success response (`200 OK`):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "8h",
    "user": {
      "id": 1,
      "name": "Admin",
      "email": "admin@cms.com"
    }
  }
}
```

Copy the `token` value and pass it as a Bearer token in all subsequent requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Customers (Auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/customers` | List customers (paginated + search) |
| `POST` | `/customers` | Create a new customer |
| `GET` | `/customers/:id` | Get customer by ID (includes addresses) |
| `PUT` | `/customers/:id` | Update customer |
| `DELETE` | `/customers/:id` | Delete customer (cascades addresses) |

**Query params for `GET /customers`:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | `1` | Page number |
| `limit` | number | `10` | Records per page |
| `search` | string | — | Search by name or email (ILIKE) |

#### Addresses (Auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/customers/:id/addresses` | List addresses for a customer |
| `POST` | `/customers/:id/addresses` | Add address to a customer |
| `PUT` | `/addresses/:addressId` | Update an address |
| `DELETE` | `/addresses/:addressId` | Delete an address |

#### Reference Data (No auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/reference/states` | List all states |
| `GET` | `/reference/states/:stateId/cities` | List cities for a state (cascading dropdown) |
| `GET` | `/reference/cities` | List all cities |

### Standard Response Shape

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

**Paginated:**
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

---

## Troubleshooting

### `ECONNREFUSED` on startup
PostgreSQL is not running. Start it:
```bash
# Windows (PowerShell as Administrator)
Start-Service postgresql*

# or via pgAdmin → right-click server → Connect
```

### `password authentication failed for user "cms_user"`
The credentials in `.env` do not match what was created in PostgreSQL. Re-check `DB_USER` and `DB_PASSWORD`, or re-run the user creation SQL in section 4.1.

### `relation "customers" does not exist`
Migrations haven't been run yet. Execute `npm run db:migrate`.

### `Cannot find module` errors after pulling new code
Dependencies may be out of date. Run `npm install` again.
