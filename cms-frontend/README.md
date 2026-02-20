# CMS Frontend — Angular SPA

Angular 17 frontend for the Customer Management System.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| npm | 9+ |
| Angular CLI | `npm install -g @angular/cli` |

---

## Setup

```bash
# 1. Go to the frontend directory
cd cms-frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm start
# → http://localhost:4200
```

> Make sure the CMS API (`cms-api`) is running on `http://localhost:3000` before starting the frontend.

---

## Environment

| File | Usage |
|------|-------|
| `src/environments/environment.ts` | Development (default) |
| `src/environments/environment.prod.ts` | Production build |

To point at a different API, update `apiBaseUrl` in the relevant environment file.

---

## Default Login

| Field | Value |
|-------|-------|
| Email | `admin@cms.com` |
| Password | `Admin@123` |

> Seed the admin user first: `cd ../cms-api && npm run seed:admin`

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start dev server (`ng serve`) |
| `npm run build` | Build for production |
| `npm run build:prod` | Explicit production build |
| `npm test` | Run unit tests |
| `ng lint` | Lint the project |

---

## Project Structure

```
src/app/
├── core/                         # Singleton services, guards, interceptors
│   ├── guards/
│   │   ├── auth.guard.ts         # Protect /customers routes
│   │   └── no-auth.guard.ts      # Redirect logged-in users away from /login
│   ├── interceptors/
│   │   ├── auth.interceptor.ts   # Attach JWT to every request
│   │   └── error.interceptor.ts  # Global HTTP error handling
│   └── services/
│       ├── auth.service.ts       # Login / logout / token management
│       └── notification.service.ts  # Toast snackbar helper
│
├── shared/                       # Reusable across feature modules
│   ├── components/
│   │   ├── confirm-dialog/       # Reusable delete confirmation dialog
│   │   ├── loading-spinner/      # Spinner with optional overlay
│   │   └── page-header/          # Page title + back button + action slot
│   ├── directives/
│   │   └── numeric-only.directive.ts
│   ├── models/index.ts           # All TypeScript interfaces / DTOs
│   ├── pipes/
│   │   └── format-phone.pipe.ts
│   └── shared.module.ts
│
└── features/
    ├── auth/
    │   └── login/                # Login page
    └── customers/
        ├── components/
        │   ├── shell/            # Navbar layout wrapper
        │   ├── customer-list/    # Paginated, searchable table
        │   ├── customer-form/    # Create & Edit (with embedded address)
        │   ├── customer-detail/  # Full detail + address list
        │   └── address-form/     # Reusable address sub-form
        └── services/
            ├── customer.service.ts
            ├── address.service.ts
            └── reference.service.ts
```

---

## Key Design Patterns

- **Single API call**: `POST /customers` and `PUT /customers/:id` include the address payload — no separate address-creation call needed.
- **`takeUntilDestroyed`**: All subscriptions are destroyed via Angular's `DestroyRef` — no manual `ngOnDestroy` needed.
- **`ConfirmDialogComponent`**: Reusable `MatDialog` modal used for every destructive action.
- **`ErrorInterceptor`**: 401/403/404/500 errors are caught globally; 400/409 are surfaced as field-level form errors by the component.
- **Cascading dropdowns**: States are fetched once and `shareReplay(1)` cached. Selecting a state fires `getCitiesByState()` and resets the city control.
- **Mobile responsive**: Desktop uses `mat-table`; mobile (≤767px) falls back to stacked `mat-card` lists. All forms use a 2-column grid that collapses to 1 column on small screens.
