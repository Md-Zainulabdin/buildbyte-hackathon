# SkillBridge — Backend

FastAPI + SQLAlchemy (async) + PostgreSQL.

## Scripts

```sh
uvicorn app.main:app --reload --port 8000
```

## Environment

Create `.env`:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/skillbridge
JWT_SECRET_KEY=your-secret-key
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Structure

```
app/
├── models/       # SQLAlchemy ORM (User, Opportunity, Application, Review)
├── routes/       # API route handlers (auth, users, opportunities, applications, reviews, matching)
├── schemas/      # Pydantic request/response models
├── services/     # Business logic layer
├── middleware/   # Auth dependency (JWT decoding)
├── config.py    # Settings from env
└── database.py  # Async session factory
```
