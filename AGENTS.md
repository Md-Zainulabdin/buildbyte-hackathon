# AGENTS.md — Kaarvan

> Working name **Kaarvan** (formerly SkillBridge). This file is the canonical, verified context for all
> agent work on this repository. It supersedes stale sections of `PROJECT_CONTEXT.md`.

## 1. Product Summary

**Kaarvan** is a platform where students and early-career people in Pakistan find small, verified,
skill-based opportunities — tutoring, mentorship, short projects, event support, community work —
and build a portable, provable track record from them.

Positioning: **NOT** a home-services/trade marketplace (TaskBid, Mahir, Karsaaz own this) and **NOT**
an internship/job board (Rozee.pk, Internee.pk own this). The differentiator is **verified completion +
portable reputation** for small, informal opportunities that never reach a job board.

Two actor types:

- **Providers** — students, freelancers, early-career people who apply to and complete opportunities.
- **Creators** — NGOs, schools, small businesses, community organizations who post opportunities.

## 2. Tech Stack

| Layer | Stack |
|---|---|
| Web frontend | React 19, TypeScript, Vite 6, Tailwind CSS 3, react-router-dom 7, Axios, lucide-react |
| Backend | FastAPI, SQLAlchemy 2 (async), PostgreSQL, Alembic, python-jose (JWT), passlib (bcrypt), httpx (Google OAuth) |
| Monorepo tooling | npm workspaces + Turborepo (npm@11.6.2) |
| Planned — mobile | Expo React Native (`apps/mobile`), expo-auth-session (PKCE), expo-secure-store |
| Planned — shared contracts | `@repo/types`, generated from OpenAPI schema (`openapi-typescript`) |
| Planned — AI layer | Separate service/module: semantic skill matching (embeddings), opportunity description assist, skill extraction, review anomaly detection |
| Testing (planned) | pytest + pytest-asyncio + httpx.AsyncClient on api; ESLint + `tsc --noEmit` on web; GitHub Actions CI |

## 3. Repository Structure

```
buildbyte-hackathon/
├── apps/
│   ├── web/                React 19 + Vite + TS + Tailwind (dev port 3000)
│   ├── api/                FastAPI + SQLAlchemy async (dev port 8000)
│   └── mobile/              [planned] Expo React Native
├── packages/
│   ├── eslint-config/
│   ├── typescript-config/
│   └── types/               [planned] shared DTOs generated from OpenAPI
├── package.json            workspace root; scripts: dev, dev:web, dev:api, build, lint, check-types, format
├── turbo.json
├── railway.json
├── AGENTS.md
└── README.md
```

### Backend (`apps/api/app/`)

```
app/
├── main.py            FastAPI app, CORS, lifespan, router mounts
├── config.py          Settings from env (currently plain class + os.getenv — MUST migrate to pydantic-settings)
├── database.py        Async engine + session factory + Base + get_db dependency
├── models/            SQLAlchemy ORM (user, opportunity, application, review)
├── schemas/           Pydantic request/response models
├── routes/            auth, users, opportunities, applications, reviews, matching
├── services/          Business logic layer
├── middleware/deps.py get_current_user (JWT decode + user load)
├── utils/security.py  bcrypt + JWT helpers
├── alembic/           env.py + versions/001_create_all_tables.py
└── alembic.ini        exists at apps/api/alembic.ini (NOT missing)
```

### Frontend (`apps/web/src/`)

```
src/
├── app.tsx             Routes (10 pages)
├── main.tsx            Entry
├── context/AuthContext.tsx
├── lib/api.ts          Axios client + hand-written TS types
├── pages/               LandingPage, AuthCallback, CreateProfile, PostOpportunity,
│                        OpportunityFeed, OpportunityDetail, Applications,
│                        CompletedTask, UserDashboard, CreatorDashboard
├── components/          layout/Navbar, opportunities/{OpportunityCard,FilterBar},
│                        forms/{TagInput,LocationSelect}, ui/{Badge,Field}, ErrorBoundary
└── constants/            index.ts (GOOGLE_AUTH_URL), locations.ts, categories.ts
```

## 4. Entities and Attributes

### User (`users`)

| Attribute | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| email | string, unique, indexed | |
| password_hash | string, nullable | null for google accounts |
| google_id | string, unique, nullable | |
| auth_provider | enum: email, google | |
| name | string | |
| bio | text, nullable | |
| skills | array of strings, nullable (JSON) | |
| location | string ("City, Area") | |
| availability | string, nullable | |
| portfolio_links | array of strings, nullable (JSON) | |
| verification_level | enum: unverified, email_verified, identity_verified | |
| reputation_score | float | currently a single ambiguous value; PLAN: split into completion_rate, on_time_rate, avg_rating, completed_count, with composite kept server-computed |
| is_active | boolean | |
| created_at / updated_at | datetime (tz) | |

### Opportunity (`opportunities`)

| Attribute | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| title | string | |
| description | text | |
| organization | string, nullable | model currently NOT NULL |
| location | string, nullable | |
| required_skills | array of strings, nullable (JSON) | |
| is_paid | boolean | PLAN: kept, validated to match track |
| payment_amount | float, nullable | |
| deadline | datetime, nullable | |
| estimated_hours | integer, nullable | |
| urgency | enum: low, medium, high, critical | |
| category | enum (9 values) | PLAN: collapse into `track` enum (compensated/community) + free-text `category_tag` |
| status | enum: open, in_progress, completed, cancelled | PLAN: enforce state machine in service layer |
| creator_id | UUID (FK → User) | |
| created_at / updated_at | datetime (tz) | |

### Application (`applications`)

| Attribute | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| user_id | UUID (FK → User) | |
| opportunity_id | UUID (FK → Opportunity) | |
| status | enum: pending, accepted, rejected, withdrawn | PLAN: enforce state machine |
| message | text, nullable | |
| created_at | datetime (tz) | |

PLAN: partial unique index on `(user_id, opportunity_id) WHERE status != 'withdrawn'` and on
`(opportunity_id) WHERE status = 'accepted'`.

### Review (`reviews`)

| Attribute | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| reviewer_id | UUID (FK → User) | |
| receiver_id | UUID (FK → User) | |
| application_id | UUID (FK → Application), currently nullable | PLAN: make NOT NULL |
| rating | integer, 1–5 (CheckConstraint) | |
| comments | text, nullable | |
| created_at | datetime (tz) | |

PLAN: unique on `(reviewer_id, application_id)`; authorization must verify reviewer/receiver are
actual participants of the completed application.

### WorkSubmission (`work_submissions`) — PLANNED, does not exist yet

Fields: id (UUID PK), application_id (FK unique), provider_id (FK → User), description (text),
hours_spent (float), evidence_links (JSON, nullable), notes (text, nullable), submitted_at,
confirmed_by_provider (bool), confirmed_by_creator (bool), creator_confirmed_at (datetime nullable).

Currently submissions are stored client-side only via `localStorage` (`submission_{id}`) in
`CompletedTask.tsx`. MUST become a real backend entity.

## 5. Architectural Rules / Conventions (Working Agreements)

1. **Schema changes ONLY via Alembic migrations.** `Base.metadata.create_all` in the lifespan is
   forbidden in production; remove it and run `alembic upgrade head` before boot.
2. **Reputation is computed ONLY in the backend** (`reputation_service`). The client-side formula
   (`completedTasks * 10 + reviews * 5`) in `UserDashboard.tsx` must be removed.
3. **TS types come from `@repo/types` (generated from OpenAPI), never hand-mirrored** in `lib/api.ts`.
   The category-vocabulary bug was caused by manual duplication.
4. **Status transitions are enforced in the service layer** via a single state machine module
   (`services/state_machine.py`), never unrestricted PATCH.
5. **"Accept contributor" is ONE atomic endpoint/transaction**, not two sequential client calls.
6. **Skills/normalization**: keep filter + matching logic consistent (lowercase set intersection),
   avoid Postgres-only case-sensitive overlap in the feed filter.
7. **No secrets in code.** No hardcoded JWT default; `JWT_SECRET_KEY` must fail fast when unset.
   `.env.example` files for `apps/api` and `apps/web`.
8. **Single source of truth per metric.** One backend-computed definition for completion rate,
   on-time rate, avg rating, completed count.
9. **Do not add code comments unless asked.** Mimic existing style; verify library availability
   before using a new one.
10. **Run verification after changes**: `npm run lint`, `npm run check-types` (web), pytest (api,
    once added).

## 6. Known Issues & Priority (must resolve before mobile or redesign)

Ordered by dependency. All must be substantially done before `apps/mobile` scaffolding or a visual
redesign. Current status tracked inline (→ not started, →→ in progress, ✓ done).

1. **Wire Alembic properly** — `alembic.ini` now exists; still need to remove `create_all` from
   lifespan, add `alembic upgrade head` to boot/entrypoint, verify 001 matches models.
2. **Fix config/secrets** — migrate `config.py` to pydantic-settings; remove hardcoded
   `JWT_SECRET_KEY="change-me-in-production"`; add `.env.example` (api + web).
3. **Persist work submissions server-side** — new `WorkSubmission` entity + routes; remove the
   entire `localStorage` path. Blocks mobile categorically.
4. **DB-level integrity constraints** — partial unique index on active applications per
   `(user, opportunity)`; partial unique index on one accepted application per opportunity;
   make `Review.application_id` required; unique `(reviewer_id, application_id)`.
5. **Enforce a real status state machine** — valid transitions for `Opportunity.status` and
   `Application.status` enforced in the service layer.
6. **Atomic "accept contributor"** — one endpoint, not two sequential client calls.
7. **Fix reputation** — single backend-computed source of truth (completion rate, on-time rate,
   avg rating, completed count); delete client-side formula.
8. **Fix review authorization** — reviewer/receiver must be actual participants of a completed
   application; `application_id` required.
9. **Collapse categories into two tracks** (compensated / community) + free-text tag; fix the
   category-vocabulary mismatch between `FilterBar` (UI strings) and API enum keys.
10. **Generate `@repo/types` from OpenAPI** — replace hand-mirrored TS interfaces before mobile.
11. **Pagination on all list endpoints** (page/limit offset) + fix N+1 query patterns on dashboards
    (embed opportunity/provider in application responses; aggregate dashboard endpoints).
12. **Cross-platform dev scripts + Docker** — replace hardcoded `venv\Scripts\python.exe`; fix
    Dockerfiles for the monorepo (web build must resolve `@repo/*`); make railway.json per-service;
    add docker-compose for consistent local dev + CI.
13. **Basic automated tests** — pytest on state machine + reputation first, then integration; CI
    via GitHub Actions.

## 7. Commands (verified)

```sh
npm run dev          # turbo run dev (both apps)
npm run dev:web      # turbo run dev --filter=web  → http://localhost:3000
npm run dev:api      # turbo run dev:api --filter=api → http://localhost:8000
npm run build        # turbo run build
npm run lint         # turbo run lint (web: eslint .)
npm run check-types  # turbo run check-types (web: tsc --noEmit)
npm run format       # prettier --write "**/*.{ts,tsx,md}"
```

Backend (run from `apps/api` with venv activated):

```sh
python -m uvicorn app.main:app --reload --port 8000   # cross-platform dev start
alembic upgrade head                                   # apply migrations
```

Environment: create `apps/api/.env` (DATABASE_URL, JWT_SECRET_KEY, GOOGLE_CLIENT_ID/SECRET,
FRONTEND_URL, CORS_ORIGINS) and `apps/web/.env` (VITE_API_URL=http://localhost:8000/api).
PostgreSQL database `kaarvan` is the dev default (config.py, alembic.ini, READMEs all in sync).

## 8. Current Status Snapshot (verified at time of writing)

- Branch `dev`, working tree clean.
- Backend has no tests, no CI, `create_all` still in lifespan, config not pydantic-settings,
  no `.env.example`, no `WorkSubmission`, no pagination, no state machine, open review authorization.
- Frontend: `FilterBar` sends UI strings that never match API enum keys; `CompletedTask` uses
  `localStorage`; dashboards do N+1/sequential fetches; client-side reputation formula in
  `UserDashboard`.
- Dockerfiles exist (`apps/api/Dockerfile`, `apps/web/Dockerfile`) but the web one is broken for
  the npm-workspaces monorepo; `railway.json` is nixpacks-only.
