# Frontend Technical Documentation

**Project:** Customer Management System – Angular SPA  
**Version:** 1.0  
**Date:** February 19, 2026  
**Tech Lead Author:** (Your Name)  
**Tech Stack:** Angular 17+ · TypeScript · Angular Material (or PrimeNG) · RxJS · HTTP Client  

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Project Structure](#2-project-structure)
3. [Technology Choices & Justification](#3-technology-choices--justification)
4. [Modules & Feature Areas](#4-modules--feature-areas)
5. [Routing Architecture](#5-routing-architecture)
6. [Component Inventory](#6-component-inventory)
7. [Service Layer](#7-service-layer)
8. [TypeScript Interfaces (Models)](#8-typescript-interfaces-models)
9. [Forms & Validation Strategy](#9-forms--validation-strategy)
10. [HTTP Communication](#10-http-communication)
11. [State Management](#11-state-management)
12. [Error Handling Strategy](#12-error-handling-strategy)
13. [Shared/Common Module](#13-sharedcommon-module)
14. [Environment Configuration](#14-environment-configuration)
15. [Angular Guards & Interceptors](#15-angular-guards--interceptors)
16. [Authentication (Login)](#16-authentication-login)
17. [Styling & UX Conventions](#17-styling--ux-conventions)
18. [Testing Strategy](#18-testing-strategy)
19. [Scripts & Commands](#19-scripts--commands)

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                      Angular SPA (Browser)                   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  AppModule (Root)                                   │    │
│  │   ├── CoreModule       (singleton services, guards) │    │
│  │   ├── SharedModule     (reusable UI components)     │    │
│  │   ├── CustomersModule  (feature module – lazy)      │    │
│  │   └── RouterModule     (client-side routing)        │    │
│  └─────────────────────────────────────────────────────┘    │
│                         │                                    │
│              Angular HTTP Client                             │
└─────────────────────────┼────────────────────────────────────┘
                          │ REST / JSON
                          ▼
               Node.js + Express API Server
```

---

## 2. Project Structure

```
cms-frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts        # Attaches JWT to every request
│   │   │   │   └── error.interceptor.ts       # Centralised HTTP error handling
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts              # Route auth protection
│   │   │   ├── services/
│   │   │   │   └── auth.service.ts            # Login / token management
│   │   │   └── core.module.ts
│   │   │
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── confirm-dialog/            # Reusable delete confirmation dialog
│   │   │   │   ├── loading-spinner/           # Global loading indicator
│   │   │   │   └── page-header/               # Reusable page title bar
│   │   │   ├── directives/
│   │   │   │   └── numeric-only.directive.ts  # PIN / phone input restriction
│   │   │   ├── pipes/
│   │   │   │   └── format-phone.pipe.ts
│   │   │   ├── models/                        # TypeScript interfaces (shared)
│   │   │   │   ├── customer.model.ts
│   │   │   │   ├── address.model.ts
│   │   │   │   └── api-response.model.ts
│   │   │   └── shared.module.ts
│   │   │
│   │   ├── features/
│   │   │   └── customers/
│   │   │       ├── components/
│   │   │       │   ├── customer-list/
│   │   │       │   │   ├── customer-list.component.ts
│   │   │       │   │   ├── customer-list.component.html
│   │   │       │   │   └── customer-list.component.scss
│   │   │       │   ├── customer-detail/
│   │   │       │   │   ├── customer-detail.component.ts
│   │   │       │   │   ├── customer-detail.component.html
│   │   │       │   │   └── customer-detail.component.scss
│   │   │       │   ├── customer-form/
│   │   │       │   │   ├── customer-form.component.ts
│   │   │       │   │   ├── customer-form.component.html
│   │   │       │   │   └── customer-form.component.scss
│   │   │       │   └── address-form/
│   │   │       │       ├── address-form.component.ts
│   │   │       │       ├── address-form.component.html
│   │   │       │       └── address-form.component.scss
│   │   │       ├── services/
│   │   │       │   ├── customer.service.ts    # HTTP calls for Customer API
│   │   │       │   ├── address.service.ts     # HTTP calls for Address API
│   │   │       │   └── reference.service.ts   # City / state dropdowns
│   │   │       ├── customers-routing.module.ts
│   │   │       └── customers.module.ts
│   │   │
│   │   ├── app-routing.module.ts
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   └── app.module.ts
│   │
│   ├── environments/
│   │   ├── environment.ts             # Dev config
│   │   └── environment.prod.ts        # Prod config
│   │
│   ├── assets/
│   └── styles/
│       ├── _variables.scss            # Design tokens (colours, spacing, fonts)
│       ├── _mixins.scss
│       └── styles.scss                # Global styles
│
├── angular.json
├── tsconfig.json
├── tsconfig.app.json
├── package.json
└── README.md
```

---

## 3. Technology Choices & Justification

| Package | Version (approx) | Purpose |
|---------|-------------------|---------|
| `@angular/core` | ^17.x | Framework |
| `@angular/forms` | ^17.x | Reactive Forms |
| `@angular/router` | ^17.x | Client-side routing |
| `@angular/common/http` | ^17.x | HTTP Client |
| `@angular/material` | ^17.x | UI component library |
| `rxjs` | ^7.x | Reactive async handling |
| `typescript` | ^5.x | Static typing |

> **UI Library:** Angular Material is recommended for consistency and accessibility. PrimeNG is an acceptable alternative.

---

## 4. Modules & Feature Areas

| Module | Type | Description |
|--------|------|-------------|
| `AppModule` | Root | Bootstraps the application |
| `CoreModule` | Singleton | Auth service, interceptors, guards — imported once |
| `SharedModule` | Shared | Reusable components, directives, pipes — imported in feature modules |
| `CustomersModule` | Feature (lazy) | All customer & address screens |

---

## 5. Routing Architecture

```
/                         → redirect to /customers
/customers                → CustomerListComponent
/customers/new            → CustomerFormComponent  (Create mode)
/customers/:id            → CustomerDetailComponent
/customers/:id/edit       → CustomerFormComponent  (Edit mode)
```

### Route Guards

| Guard | Applied to | Purpose |
|-------|-----------|---------|
| `AuthGuard` | All `/customers/**` routes | Redirect to login if no valid JWT |

### Lazy Loading

`CustomersModule` is lazy-loaded via `loadChildren` to keep the initial bundle small.

---

## 6. Component Inventory

### 6.1 `CustomerListComponent`

| Responsibility | Detail |
|----------------|--------|
| Display | Paginated table of customers |
| Inputs | None (fetches own data on init) |
| Outputs | Navigate to detail, form, or triggers delete |
| API calls | `GET /customers?page=&limit=&search=` |
| Features | Search input, pagination controls, add/edit/delete action buttons |

**Table Columns:**

| Column | Field |
|--------|-------|
| # | Row index |
| Full Name | `full_name` |
| Company | `company_name` |
| Phone | `phone_number` |
| Email | `email` |
| Actions | View / Edit / Delete buttons |

---

### 6.2 `CustomerDetailComponent`

| Responsibility | Detail |
|----------------|--------|
| Display | Full customer profile + address list |
| API calls | `GET /customers/:id` |
| Features | Edit customer button, address table with add/edit/delete per row |

---

### 6.3 `CustomerFormComponent`

| Responsibility | Detail |
|----------------|--------|
| Display | Reactive form — Create or Edit customer |
| Mode detection | Determined by presence of `:id` in route params |
| API calls | `POST /customers` (Create) or `PUT /customers/:id` (Edit) |
| Validation | Client-side Reactive Form validators |

**Form Fields:**

| Field | Control Type | Validators |
|-------|-------------|-----------|
| Full Name | Text input | Required, pattern (alpha + spaces), maxLength(150) |
| Company Name | Text input | Required, maxLength(150) |
| Phone Number | Text input | Required, pattern (numeric), minLength(7), maxLength(15) |
| Email | Email input | Required, email format |

---

### 6.4 `AddressFormComponent`

| Responsibility | Detail |
|----------------|--------|
| Display | Reactive form — Add or Edit address (modal or inline panel) |
| Mode detection | `address` input `@Input()` — null = Create, set = Edit |
| API calls | `POST /customers/:id/addresses` (Add) or `PUT /addresses/:addressId` (Edit) |

**Form Fields:**

| Field | Control Type | Validators |
|-------|-------------|-----------|
| House/Flat Number | Text input | Required, maxLength(50) |
| Building/Street | Text input | Required, maxLength(150) |
| Locality/Area | Text input | Required, maxLength(100) |
| City | Select (dropdown) | Required, value from reference list; **populated dynamically based on selected state** |
| State | Select (dropdown) | Required, value from reference list; **changing state resets city and reloads city options** |
| PIN Code | Text input | Required, pattern `^\d{6}$` |

---

### 6.5 `ConfirmDialogComponent` (Shared)

| Responsibility | Detail |
|----------------|--------|
| Display | Modal confirmation for destructive actions |
| Inputs | `@Input() title`, `@Input() message` |
| Outputs | `@Output() confirmed: EventEmitter<void>`, `@Output() cancelled: EventEmitter<void>` |
| Usage | Used for delete customer and delete address |

---

## 7. Service Layer

### 7.1 `CustomerService`

| Method | HTTP | Endpoint | Return Type |
|--------|------|----------|-------------|
| `getCustomers(page, limit, search?)` | GET | `/customers` | `Observable<PaginatedResponse<Customer>>` |
| `getCustomerById(id)` | GET | `/customers/:id` | `Observable<ApiResponse<CustomerWithAddresses>>` |
| `createCustomer(dto: CreateCustomerDto)` | POST | `/customers` | `Observable<ApiResponse<CustomerWithAddresses>>` |
| `updateCustomer(id, dto: UpdateCustomerDto)` | PUT | `/customers/:id` | `Observable<ApiResponse<CustomerWithAddresses>>` |
| `deleteCustomer(id)` | DELETE | `/customers/:id` | `Observable<ApiResponse<void>>` |

> `createCustomer()` sends the full customer + address in a **single request**. The payload must include a nested `address` object.  
> `updateCustomer()` sends customer fields and an **optional** nested `address` object. Include `address.id` to target a specific address; omit it to update the first address on record (or create a new one if none exists).

---

### 7.2 `AddressService`

| Method | HTTP | Endpoint | Return Type |
|--------|------|----------|-------------|
| `getAddresses(customerId)` | GET | `/customers/:id/addresses` | `Observable<ApiResponse<Address[]>>` |
| `updateAddress(addressId, dto)` | PUT | `/addresses/:addressId` | `Observable<ApiResponse<Address>>` |
| `deleteAddress(addressId)` | DELETE | `/addresses/:addressId` | `Observable<ApiResponse<void>>` |

> **`createAddress()` has been removed.** Address creation is handled atomically by `CustomerService.createCustomer()`. `AddressService` is retained only for standalone address update and delete operations accessible from the customer detail view.

---

### 7.3 `ReferenceService`

| Method | HTTP | Endpoint | Return Type |
|--------|------|----------|-------------|
| `getCities()` | GET | `/reference/cities` | `Observable<ApiResponse<CityItem[]>>` |
| `getStates()` | GET | `/reference/states` | `Observable<ApiResponse<ReferenceItem[]>>` |
| `getCitiesByState(stateId: number)` | GET | `/reference/states/:stateId/cities` | `Observable<ApiResponse<CityItem[]>>` |

> **Cascading dropdown pattern**: States are fetched once on form init and cached with `shareReplay(1)`. When the user selects a state, `getCitiesByState(state.id)` is called and the returned list replaces the city dropdown options. The city `FormControl` is reset to `null` each time the state changes to prevent a stale city value from an unrelated state being submitted.

---

## 8. TypeScript Interfaces (Models)

```typescript
/*── Customer ──────────────────────────────────────────*/
export interface Customer {
  id: number;                  // AUTO-INCREMENT INTEGER
  full_name: string;
  company_name: string;
  phone_number: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerWithAddresses extends Customer {
  addresses: Address[];
}

export interface CreateCustomerDto {
  full_name: string;
  company_name: string;
  phone_number: string;
  email: string;
  address: CreateAddressDto;          // required — sent in same API call
}

export interface UpdateCustomerDto {
  full_name?: string;
  company_name?: string;
  phone_number?: string;
  email?: string;
  address?: UpdateAddressDto & {
    id?: number;                       // optional — targets a specific address row
  };
}

/*── Address ───────────────────────────────────────────*/
export interface Address {
  id: number;                  // AUTO-INCREMENT INTEGER
  customer_id: number;         // FK → customers.id
  house_flat_number: string;
  building_street: string;
  locality_area: string;
  city: string;
  state: string;
  pin_code: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressDto {
  house_flat_number: string;
  building_street: string;
  locality_area: string;
  city: string;
  state: string;
  pin_code: string;
}

export interface UpdateAddressDto {
  house_flat_number?: string;
  building_street?: string;
  locality_area?: string;
  city?: string;
  state?: string;
  pin_code?: string;
}

/*── API Wrappers ──────────────────────────────────────*/
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
}

/*── Reference Data ──────────────────────────────────────────────*/
export interface ReferenceItem {
  id: number;
  name: string;                // value bound to dropdown option
}
// Used for city dropdowns; carries state_id to support cascade filtering
export interface CityItem {
  id: number;
  name: string;
  state_id: number;            // FK → states.id
}```

---

## 9. Forms & Validation Strategy

- **Approach:** Angular **Reactive Forms** (`FormGroup`, `FormControl`, `FormArray`)
- Validators applied at `FormControl` level using Angular built-in validators + custom validators
- Error messages displayed below each field using `*ngIf` bound to control's `invalid && touched` state
- Form submission blocked while form is `invalid`

### Custom Validators

| Validator | Rule | Applied To |
|-----------|------|-----------|
| `numericOnly` | `/^\d+$/` regex | Phone, PIN Code |
| `alphaWithSpaces` | `/^[a-zA-Z\s]+$/` regex | Full Name |
| `pinCodeLength` | Exactly 6 digits | PIN Code |

### Validation UX Rules

- Show error message only after field is **touched** (user has interacted with it)
- Highlight field border red on invalid + touched
- Disable submit button if form is `invalid` or pending API call (`isSubmitting` flag)
- Show inline API error (e.g., duplicate email) as a form-level error message

---

## 10. HTTP Communication

### API Base URL

Configured via `environment.ts`:

```typescript
// environment.ts (development)
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/api/v1'
};

// environment.prod.ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.yourdomain.com/api/v1'
};
```

### HTTP Interceptors

#### `AuthInterceptor`

- Automatically attaches `Authorization: Bearer <token>` header to every outbound request
- Reads token from `localStorage` / `sessionStorage`

#### `ErrorInterceptor`

- Catches all HTTP errors globally via `catchError` on the response observable
- Handles:
  - `401` → clear token + redirect to login
  - `400` → surface validation errors in a snackbar / toast
  - `404` → display "Not Found" toast
  - `500` → display generic error toast

---

## 11. State Management

For this application's scope, **dedicated state management (NgRx/Akita) is not required**. Component-level state with service-based data fetching is sufficient.

| Approach | Usage |
|----------|-------|
| Component state | Local `isLoading`, `errorMessage`, form data |
| Service + Subject | Broadcast refresh signals after create/update/delete |
| RxJS `BehaviorSubject` | Customer list cache in `CustomerService` |
| `shareReplay(1)` | Reference data (cities, states) caching |

**Refresh Pattern:**

After a successful create/update/delete, the affected service emits on a `refreshSubject` which the list component subscribes to and re-fetches data.

---

## 12. Error Handling Strategy

| Scenario | Handling |
|----------|---------|
| 400 Validation errors from API | Map `errors[]` array to relevant form controls using `setErrors()` |
| 404 Not Found | Show toast notification, optionally navigate back to list |
| 409 Conflict (duplicate email) | Show field-level error on the email control |
| 500 Server Error | Show generic error toast — do not expose internals |
| Network error (no connection) | Show "Unable to reach server" toast |

---

## 13. Shared/Common Module

`SharedModule` exports the following for use across feature modules:

| Export | Type | Description |
|--------|------|-------------|
| `ConfirmDialogComponent` | Component | Reusable delete confirmation |
| `LoadingSpinnerComponent` | Component | Full-page or inline spinner |
| `PageHeaderComponent` | Component | Consistent page title + breadcrumb |
| `NumericOnlyDirective` | Directive | Blocks non-numeric keystrokes |
| `FormatPhonePipe` | Pipe | Display formatting for phone numbers |
| `Angular Material modules` | Re-export | `MatTableModule`, `MatButtonModule`, `MatInputModule`, etc. |
| `ReactiveFormsModule` | Re-export | Available in all feature modules |
| `CommonModule` | Re-export | `*ngIf`, `*ngFor`, async pipe |

---

## 14. Environment Configuration

| Variable | Dev Value | Prod Value |
|----------|-----------|-----------|
| `apiBaseUrl` | `http://localhost:3000/api/v1` | `https://api.yourdomain.com/api/v1` |
| `production` | `false` | `true` |

Angular's `fileReplacements` in `angular.json` automatically swaps environments on production build.

---

## 15. Angular Guards & Interceptors

### `AuthGuard` (`CanActivate`)

- Checks if a valid JWT exists in storage
- If missing/expired → redirects to `/login`
- Applied to all routes under `/customers`

### `AuthInterceptor` (`HttpInterceptor`)

- Clones the outgoing request and appends the `Authorization` header
- Skips public endpoints (reference data, login)

### `ErrorInterceptor` (`HttpInterceptor`)

- Wraps the response with `catchError`
- Dispatches user-visible notifications via `MatSnackBar` / toast service

---

## 16. Authentication (Login)

### Overview

The CMS uses **JWT-based authentication**. Before accessing any customer route the user must log in. On success the API returns a `token` which is stored in `localStorage` and attached to every subsequent request via `AuthInterceptor`.

### Login Flow

```
User → /login → LoginComponent
  → POST /api/v1/auth/login  { email, password }
  ← { success: true, data: { token, user: { id, email } } }
  → store token in localStorage
  → redirect to /customers
```

### Auth Module

```
src/app/features/auth/
├── login/
│   ├── login.component.ts
│   ├── login.component.html
│   └── login.component.scss
├── auth-routing.module.ts
└── auth.module.ts
```

### `LoginComponent`

| Responsibility | Detail |
|----------------|--------|
| Display | Centered card with email + password fields |
| API calls | `POST /auth/login` via `AuthService.login(dto)` |
| On success | Stores token → navigates to `/customers` |
| On failure | Shows inline error message below the form |
| Redirect | Redirects already-authenticated users away from `/login` |

**Form Fields:**

| Field | Validators |
|-------|----------|
| Email | Required, valid email format |
| Password | Required, minLength(6) |

### `AuthService` (Core singleton)

| Method | Description |
|--------|-------------|
| `login(dto: LoginDto)` | POST `/auth/login`, stores token, returns `Observable<AuthResponse>` |
| `logout()` | Clears token from storage, navigates to `/login` |
| `getToken()` | Returns current JWT string or `null` |
| `isAuthenticated()` | Returns `true` if token exists and is not expired |
| `getCurrentUser()` | Returns decoded user payload from token |

### TypeScript Interfaces

```typescript
export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}
```

### Route Protection

| Route | Guard | Behaviour |
|-------|-------|-----------|
| `/login` | `NoAuthGuard` | Redirects to `/customers` if already logged in |
| `/customers/**` | `AuthGuard` | Redirects to `/login` if token missing or expired |

### Token Expiry Handling

- `AuthInterceptor` checks every response for `401 Unauthorized`
- On 401 → calls `AuthService.logout()` which clears storage and redirects to `/login`
- Token expiry checked client-side via `jwtDecode` before making requests (optional optimistic check)

---

## 17. Styling & UX Conventions

| Convention | Rule |
|-----------|------|
| CSS methodology | Component-scoped SCSS (Angular `encapsulation`) + BEM where needed |
| Spacing unit | 8px grid (`8px`, `16px`, `24px`, `32px`) |
| Colour tokens | Defined in `_variables.scss`, referenced via CSS custom properties |
| Typography | Angular Material typography scale |
| Button actions | Primary (blue) for create/save, Warn (red) for delete, Stroked for cancel |
| Loading state | Spinner + disabled controls during any async operation |
| Empty state | Friendly "No records found" message with CTA when list is empty |
| Confirmation | All destructive actions (delete) require dialog confirmation |
| Toast duration | Info/Success: 3s, Error: 6s |

---

## 18. Testing Strategy

| Level | Tool | Scope |
|-------|------|-------|
| Unit – Component | `jasmine` + `TestBed` | Component logic, form validation |
| Unit – Service | `jasmine` + `HttpClientTestingModule` | HTTP call shape, error mapping |
| Integration | Angular Testing Library (optional) | User interaction flows |
| E2E | Cypress or Playwright | Critical user journeys (create/view/edit/delete) |

### Priority Test Cases

| Case | Type |
|------|------|
| Customer form submits valid data | Unit |
| Customer form blocks submission with invalid email | Unit |
| PIN code rejects non-6-digit input | Unit |
| Customer list renders paginated results | Component |
| Delete customer shows confirmation dialog | Component |
| AuthInterceptor attaches JWT header | Unit |
| ErrorInterceptor redirects on 401 | Unit |

---

## 19. Scripts & Commands

```bash
# Install dependencies
npm install

# Start dev server
ng serve

# Build for production
ng build --configuration production

# Run unit tests
ng test

# Run E2E tests
ng e2e

# Lint
ng lint
```

---

## Appendix A – Screen-to-Component Mapping

| PRD Screen | Component | Route |
|-----------|-----------|-------|
| SCR-01 Customer List | `CustomerListComponent` | `/customers` |
| SCR-02 Customer Detail | `CustomerDetailComponent` | `/customers/:id` |
| SCR-03 Create Customer (with Address) | `CustomerFormComponent` + embedded `AddressFormComponent` | `/customers/new` |
| SCR-04 Edit Customer (with Address) | `CustomerFormComponent` + embedded `AddressFormComponent` | `/customers/:id/edit` |
| SCR-05 Delete Confirmation | `ConfirmDialogComponent` | Modal (reused) |

---

## Appendix B – API Integration Summary

| Service Method | API Endpoint | Component That Uses It |
|----------------|-------------|----------------------|
| `getCustomers()` | `GET /customers` | `CustomerListComponent` |
| `createCustomer(dto)` ¹ | `POST /customers` | `CustomerFormComponent` |
| `getCustomerById()` | `GET /customers/:id` | `CustomerDetailComponent` |
| `updateCustomer(id, dto)` ² | `PUT /customers/:id` | `CustomerFormComponent` |
| `deleteCustomer()` | `DELETE /customers/:id` | `CustomerListComponent` |
| `updateAddress()` | `PUT /addresses/:addressId` | `CustomerDetailComponent` |
| `deleteAddress()` | `DELETE /addresses/:addressId` | `CustomerDetailComponent` |
| `getCitiesByState(stateId)` | `GET /reference/states/:stateId/cities` | `AddressFormComponent` |
| `getStates()` | `GET /reference/states` | `AddressFormComponent` |

> ¹ `createCustomer(dto)` payload includes a nested `address` object — creates customer + address atomically.  
> ² `updateCustomer(id, dto)` payload includes an optional nested `address` object — updates customer and/or address atomically.  
> `createAddress()` has been removed; address creation is handled entirely by `CustomerService`.
