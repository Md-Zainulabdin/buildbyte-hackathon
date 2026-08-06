# Team Localhost Wale Represents — Kaarvan

**Members:** Muhammad Zain-ul-Abdin Ansari, Wasi Muzammil

---

## The Problem

Every day, communities face small but impactful problems that need skilled people — a school needs a volunteer math tutor, an NGO needs a graphic designer, a neighborhood needs a web developer. These needs are scattered across WhatsApp groups, Facebook posts, and word of mouth. Meanwhile, qualified students, freelancers, and volunteers nearby are looking for exactly these opportunities.

The problem isn't a lack of skilled people — it's the absence of a trusted, local coordination system.

## Solution

Kaarvan is a **hyperlocal opportunity and skill-matching platform** that connects communities with verified individuals based on skills, location, and availability. Unlike generic freelancing marketplaces, it focuses on community-driven requests and local impact.

**Skill Providers** (students, freelancers, volunteers, alumni) use it to build experience, earn money, volunteer, and expand their network.

**Opportunity Creators** (NGOs, schools, local businesses, community organizations) use it to find trusted help and reach local talent quickly.

---

## How It Works

**As a Creator:** Sign up → complete your profile → post an opportunity with title, description, category, urgency, location, and required skills → review applications on your dashboard → accept a contributor (status moves to `in_progress`) → mark as `completed` when done → leave a review.

**As a Provider:** Sign up → complete your profile (skills, location, availability) → browse the feed with filters → apply to opportunities → track status on your dashboard → if accepted, submit completed work → receive reviews and build reputation.

---

## Tech Stack

React 19, TypeScript, Vite, Tailwind CSS · FastAPI, SQLAlchemy (async), PostgreSQL · JWT + Google OAuth · Axios

---

## Setup

```
npm install
cd apps/api
python -m venv venv
venv\Scripts\pip install -r requirements.txt
```

Create `.env` in `apps/api/` (database URL, JWT secret, Google OAuth keys, FRONTEND_URL, CORS_ORIGINS) and `apps/web/` (VITE_API_URL). See the README in each folder for details.

Ensure PostgreSQL is running with a `kaarvan` database, then:

```
npm run dev
```

Open http://localhost:3000.

---

## What's Not Implemented (Hackathon Scope)

Real-time notifications, in-app chat, file uploads, advanced ML matching, admin panel, pagination, password reset, tests.
