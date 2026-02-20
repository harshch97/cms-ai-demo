# Product Requirements Document (PRD)

**Project Name:** Customer Management System (CMS)  
**Version:** 1.0  
**Date:** February 19, 2026  
**Author / Tech Lead:** (Your Name)  
**Status:** Draft  

---

## Table of Contents

1. [Overview](#1-overview)
2. [Goals & Objectives](#2-goals--objectives)
3. [Stakeholders](#3-stakeholders)
4. [Tech Stack](#4-tech-stack)
5. [User Stories](#5-user-stories)
6. [Functional Scope](#6-functional-scope)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Data Model](#8-data-model)
9. [API Surface Overview](#9-api-surface-overview)
10. [UI Screen Inventory](#10-ui-screen-inventory)
11. [Validation Rules](#11-validation-rules)
12. [Acceptance Criteria](#12-acceptance-criteria)
13. [Out of Scope](#13-out-of-scope)
14. [Open Questions / Assumptions](#14-open-questions--assumptions)

---

## 1. Overview

The **Customer Management System (CMS)** is an internal web application that enables staff to create, view, update, and delete customer records.  
Each customer may have one or more associated addresses. The system enforces data validation before persistence and supports cascading removal of address data when a customer is deleted.

---

## 2. Goals & Objectives

| Goal | Description |
|------|-------------|
| G-01 | Provide a single interface for managing all customer master data |
| G-02 | Ensure data integrity through strict field-level validation |
| G-03 | Support a one-to-many customer-to-address relationship |
| G-04 | Deliver a responsive, user-friendly Angular SPA |
| G-05 | Expose a well-structured, versioned RESTful API in Node.js/TypeScript |
| G-06 | All database access must use raw SQL — no ORM |

---

## 3. Stakeholders

| Role | Responsibility |
|------|----------------|
| Tech Lead | Architecture, documentation, code reviews |
| Frontend Developer | Angular SPA implementation |
| Backend Developer | Node.js API implementation |
| QA Engineer | Test case design, regression testing |
| Product Owner | Requirement sign-off |

---

## 4. Tech Stack

| Layer | Technology | Language |
|-------|-----------|----------|
| Frontend | Angular 17+ | TypeScript |
| Backend | Node.js (Express) | TypeScript |
| Database | PostgreSQL (recommended) | SQL |
| DB Driver | `pg` (node-postgres) — **raw queries only, no ORM** | — |
| API Style | RESTful JSON over HTTP | — |
| Authentication | JWT (Phase 1 — basic, no roles) | — |
| Hosting | TBD | — |

> **Database Choice:** PostgreSQL is recommended. If the team prefers MySQL/MSSQL, the raw-query driver changes to `mysql2` / `mssql` respectively — all other architectural decisions remain the same.

---

## 5. User Stories

### Customer Management

| ID | As a… | I want to… | So that… |
|----|-------|-----------|----------|
| US-01 | Staff user | Add a new customer with full name, company, phone, and email | I can register them in the system |
| US-02 | Staff user | Search / list all customers | I can find a specific customer quickly |
| US-03 | Staff user | View all details of a specific customer | I can review or verify their information |
| US-04 | Staff user | Edit any field of an existing customer | I can keep data up to date |
| US-05 | Staff user | Delete a customer record | I can remove stale or duplicate entries |

### Address Management

| ID | As a… | I want to… | So that… |
|----|-------|-----------|----------|
| US-06 | Staff user | Add one or more addresses to a customer | I can store multiple delivery/billing locations |
| US-07 | Staff user | View all addresses linked to a customer | I can see all location data at once |
| US-08 | Staff user | Edit an existing address | I can correct outdated location data |
| US-09 | Staff user | Delete a specific address from a customer | I can remove invalid or unused addresses |
| US-10 | Staff user | See city/state selected from a dropdown | I can ensure standardised location data |
| US-11 | Staff user | See cities filtered by the selected state in the address form | I can only choose cities that belong to the chosen state |

---

## 6. Functional Scope

### 6.1 Customer Module

| Feature | Description |
|---------|-------------|
| Create Customer | Form with full name, company name, phone, email. POST to `/api/v1/customers` |
| List Customers | Paginated table. GET `/api/v1/customers` with optional search query param |
| View Customer | Detail view including all addresses. GET `/api/v1/customers/:id` |
| Update Customer | Inline or modal edit form. PUT `/api/v1/customers/:id` |
| Delete Customer | Confirmation dialog before delete. DELETE `/api/v1/customers/:id` |

### 6.2 Address Module

| Feature | Description |
|---------|-------------|
| Add Address | Nested form inside customer detail. POST `/api/v1/customers/:id/addresses` |
| List Addresses | Displayed as part of customer detail view |
| Update Address | Inline edit per address row. PUT `/api/v1/addresses/:addressId` |
| Delete Address | DELETE `/api/v1/addresses/:addressId` |
| City/State Dropdowns | State dropdown loads all states from DB. Once a state is chosen, the city dropdown is repopulated via `GET /api/v1/reference/states/:stateId/cities` and shows only cities belonging to that state. Changing the state resets the city selection. |

---

## 7. Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-01 | Performance | API response time < 500 ms for all CRUD operations under normal load |
| NFR-02 | Scalability | System should handle up to 10,000 customer records without degradation |
| NFR-03 | Security | All API endpoints protected by JWT auth; input sanitised to prevent SQL injection |
| NFR-04 | Reliability | 99.5% uptime target during business hours |
| NFR-05 | Maintainability | Code must be typed (TypeScript), linted (ESLint), and follow agreed conventions |
| NFR-06 | Usability | UI must be responsive and accessible (WCAG AA minimum) |
| NFR-07 | Data Integrity | Mandatory field validation enforced on both client and server side |
| NFR-08 | Auditability | Created/Updated timestamps stored for every record |

---

## 8. Data Model

### 8.1 Entity: `customers`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | SERIAL (AUTO-INCREMENT INTEGER) | PRIMARY KEY |
| `full_name` | VARCHAR(150) | NOT NULL |
| `company_name` | VARCHAR(150) | NOT NULL |
| `phone_number` | VARCHAR(20) | NOT NULL |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE |
| `created_at` | TIMESTAMP | DEFAULT NOW() |
| `updated_at` | TIMESTAMP | DEFAULT NOW() |

### 8.2 Entity: `addresses`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | SERIAL (AUTO-INCREMENT INTEGER) | PRIMARY KEY |
| `customer_id` | INTEGER | NOT NULL, FOREIGN KEY → customers(id) ON DELETE CASCADE |
| `house_flat_number` | VARCHAR(50) | NOT NULL |
| `building_street` | VARCHAR(150) | NOT NULL |
| `locality_area` | VARCHAR(100) | NOT NULL |
| `city` | VARCHAR(100) | NOT NULL |
| `state` | VARCHAR(100) | NOT NULL |
| `pin_code` | CHAR(6) | NOT NULL, CHECK (pin_code ~ '^[0-9]{6}$') |
| `created_at` | TIMESTAMP | DEFAULT NOW() |
| `updated_at` | TIMESTAMP | DEFAULT NOW() |

### 8.3 Reference Data: `cities` / `states`

DB-driven lookup tables. Separate `states` and `cities` tables are queried at runtime to populate the dropdown fields. This allows reference data to be maintained without redeployment.

**State-City Relationship**: `cities` holds a `state_id` foreign key that references `states(id)` with `ON DELETE CASCADE`. A city must belong to exactly one state. The unique constraint on `(name, state_id)` prevents duplicate city names within the same state while allowing the same city name in different states. The `GET /api/v1/reference/states/:stateId/cities` endpoint returns only the cities that belong to the given state, enabling the cascading dropdown UX.

```
states (1) ──────────── (M) cities
  id  ◄────────────────── state_id
```

### 8.4 Entity Relationship Diagram (ERD)

```
customers (1) ────────── (M) addresses
  id  ◄─────────────────── customer_id
```

---

## 9. API Surface Overview

> Full API specification is in the Backend Technical Document.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/customers` | List all customers (paginated + search) |
| POST | `/api/v1/customers` | Create a new customer |
| GET | `/api/v1/customers/:id` | Get customer by ID (with addresses) |
| PUT | `/api/v1/customers/:id` | Update customer |
| DELETE | `/api/v1/customers/:id` | Delete customer (+ cascade addresses) |
| POST | `/api/v1/customers/:id/addresses` | Add address to customer |
| GET | `/api/v1/customers/:id/addresses` | List addresses for customer |
| PUT | `/api/v1/addresses/:addressId` | Update an address |
| DELETE | `/api/v1/addresses/:addressId` | Delete an address |
| GET | `/api/v1/reference/cities` | Get all cities (unfiltered) |
| GET | `/api/v1/reference/states` | Get state reference list |
| GET | `/api/v1/reference/states/:stateId/cities` | Get cities filtered by state (used for cascading dropdown) |

---

## 10. UI Screen Inventory

| Screen ID | Screen Name | Description |
|-----------|-------------|-------------|
| SCR-01 | Customer List | Paginated table with search, add, edit, delete actions |
| SCR-02 | Customer Detail | Full customer info + address list with add/edit/delete |
| SCR-03 | Create Customer Form | Modal or separate page form for new customer |
| SCR-04 | Edit Customer Form | Pre-filled form for editing existing customer |
| SCR-05 | Add / Edit Address Form | Nested form within SCR-02 for address management |
| SCR-06 | Delete Confirmation Dialog | Reusable confirmation dialog for delete operations |

---

## 11. Validation Rules

| Field | Rule |
|-------|------|
| Full Name | Required, alpha + spaces only, max 150 chars |
| Company Name | Required, max 150 chars |
| Phone Number | Required, numeric, 7–15 digits |
| Email | Required, valid email format, unique |
| House/Flat Number | Required, alphanumeric, max 50 chars |
| Building/Street | Required, max 150 chars |
| Locality/Area | Required, max 100 chars |
| City | Required, must be from predefined dropdown |
| State | Required, must be from predefined dropdown |
| PIN Code | Required, exactly 6 numeric digits |

---

## 12. Acceptance Criteria

| ID | Criterion |
|----|-----------|
| AC-01 | A customer can be created with all mandatory fields and is persisted to the database |
| AC-02 | Duplicate email addresses are rejected with a clear error message |
| AC-03 | An invalid PIN code (non-6-digit / non-numeric) is rejected on both client and server |
| AC-04 | A customer can be deleted and all their associated addresses are removed automatically |
| AC-05 | A customer can have a minimum of 0 and maximum of N addresses |
| AC-06 | City and State fields only accept values from the predefined reference list |
| AC-07 | All API endpoints return appropriate HTTP status codes (200, 201, 400, 404, 500) |
| AC-08 | All list endpoints support pagination via `page` and `limit` query parameters |

---

## 13. Out of Scope

- User authentication / role-based access control (beyond basic JWT)
- Customer import/export (CSV, Excel)
- Email or SMS notifications
- Audit log trail
- Multi-language / i18n support
- Mobile native application

---

## 14. Open Questions / Assumptions

| ID | Item | Status |
|----|------|--------|
| OQ-01 | Database engine choice (PostgreSQL / MySQL / MSSQL) | **✅ Confirmed: PostgreSQL** |
| OQ-02 | Are city/state dropdowns static JSON or DB-driven? | **✅ Confirmed: DB-driven (`cities` and `states` tables)** |
| OQ-03 | Is soft delete required or hard delete? | **✅ Confirmed: Hard delete with cascade** |
| OQ-04 | Pagination default page size | **✅ Confirmed: 10 records per page** |
| OQ-05 | UUID vs AUTO-INCREMENT for primary keys | **✅ Confirmed: AUTO-INCREMENT (SERIAL INTEGER)** |
| OQ-06 | Will there be multiple environments (dev/staging/prod)? | Pending confirmation |
