# User Prompt – Saved Request

**Date:** February 19, 2026  
**Role:** Tech Lead

---

## Original Prompt (verbatim)

> You are the Tech Lead  
> This is my functional requirement document.
>
> Based on the generate the PRD document  
> Also We need to use in this task Raw Query not using any ORM
>
> Tech Stack  
> Angular for frontend  
> Node For backend  
>
> both typescript  
>
> pls generate the backend and frontend technical documentation so we can use for the generate the code as well based on the functional and prd documentation
>
> I want all prompt to be saved also make sure u save my prompt as well.  
>
> Right now not any code generate the documentation

---

## Summary of Intent

The user (Tech Lead) requested the following deliverables — **documentation only, no code generation at this stage**:

| # | Deliverable | File |
|---|-------------|------|
| 1 | Save this prompt | `docs/00-User-Prompt.md` |
| 2 | Product Requirements Document (PRD) | `docs/01-PRD.md` |
| 3 | Backend Technical Documentation | `docs/02-Backend-Technical-Doc.md` |
| 4 | Frontend Technical Documentation | `docs/03-Frontend-Technical-Doc.md` |

---

## Constraints Captured

- **No ORM** — all database interactions must use raw SQL queries.
- **Frontend:** Angular (TypeScript)
- **Backend:** Node.js (TypeScript)
- **Database interactions:** raw SQL (e.g., `pg` / `mysql2` / `mssql` driver — to be confirmed in PRD).
- Source functional requirement: `Functional-Requirement.md`

---

## Decision Log — Confirmed Answers (February 19, 2026)

> Recorded from follow-up prompt by the Tech Lead.

| Question | Decision |
|----------|----------|
| Database engine | **PostgreSQL** |
| City/State dropdown source | **DB-driven** — `cities` and `states` tables, queried via raw SQL at runtime |
| Delete strategy | **Hard delete with cascade** — deleting a customer also removes all their addresses |
| Default pagination size | **10 records per page** |
| Primary key strategy | **AUTO-INCREMENT (SERIAL INTEGER)** — no UUID |
| ORM usage | **Confirmed: No ORM** — raw SQL only via `pg` driver throughout |

### Impact of decisions on documents

| Decision | PRD | Backend Doc | Frontend Doc |
|----------|-----|-------------|--------------|
| SERIAL instead of UUID | `id` column type updated | DDL changed to `SERIAL`, interfaces `id: number` | Interfaces `id: number` |
| DB-driven city/state | Section 8.3 updated | `reference.repository.ts` added, DDL for `cities`/`states` tables added, `ReferenceItem` interface added | `ReferenceItem` interface added, `ReferenceService` note updated |
| Hard delete confirmed | OQ-03 closed | No change needed | No change needed |
| Pagination = 10 | OQ-04 closed | Default `limit: 10` confirmed in endpoint spec | No change needed |

