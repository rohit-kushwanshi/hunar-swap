# Hunar Swap — Skill Exchange Platform
**"Hunar Ke Badle Hunar"** — Share your skills, learn something new.

---

## Project Structure

```
hunar-swap/
├── database/
│   └── schema.sql          ← PostgreSQL schema + sample data
├── backend/                ← Express API (port 5000)
│   ├── .env.example        ← Copy this to .env and fill it in
│   └── src/
│       ├── index.ts        ← Entry point
│       ├── app.ts          ← Express app setup
│       ├── lib/
│       │   ├── db.ts       ← Drizzle ORM + PostgreSQL connection
│       │   ├── schema.ts   ← Database table definitions
│       │   ├── logger.ts   ← Pino logger
│       │   └── validators.ts ← Zod request schemas
│       ├── middlewares/
│       │   └── auth.ts     ← JWT auth middleware
│       └── routes/
│           ├── auth.ts, users.ts, skills.ts
│           ├── requests.ts, messages.ts, dashboard.ts
│           └── health.ts
└── frontend/               ← React + Vite (port 3000)
    └── src/
        ├── lib/api-client.ts   ← All API calls + TypeScript types
        ├── hooks/use-auth.tsx  ← Auth context + hooks
        ├── components/
        │   ├── navbar.tsx
        │   └── protected-route.tsx
        └── pages/
            ├── home.tsx, login.tsx, register.tsx
            ├── dashboard.tsx, skills.tsx, skill-detail.tsx
            ├── profile.tsx, requests.tsx, chat.tsx
```

---

## Setup & Running (VS Code)

### Step 1 — PostgreSQL Database

Make sure PostgreSQL is installed and running, then:

```bash
psql -U postgres -c "CREATE DATABASE hunarswap;"
psql -U postgres -d hunarswap -f database/schema.sql
```

This creates all tables and inserts 3 sample users with skills.

### Step 2 — Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set your real values:
```
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/hunarswap
SESSION_SECRET=any-random-secret-string
```

Then run:
```bash
npm run dev
```

Backend starts at: **http://localhost:5000**

### Step 3 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at: **http://localhost:3000**

---

## Sample Login Credentials

| Email | Password |
|-------|----------|
| aryan@example.com | password123 |
| priya@example.com | password123 |
| rohan@example.com | password123 |

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS, TanStack Query, Wouter |
| Backend | Express 5, JWT, bcryptjs, Drizzle ORM |
| Database | PostgreSQL |
| Validation | Zod |
| Logging | Pino |

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | — | Register new user |
| POST | /api/auth/login | — | Login, returns JWT |
| GET | /api/auth/me | ✓ | Get current user |
| GET | /api/skills | — | List/search skills |
| POST | /api/skills | ✓ | Create skill |
| GET | /api/skills/:id | — | Get skill detail |
| GET | /api/requests | ✓ | List exchange requests |
| POST | /api/requests | ✓ | Send exchange request |
| GET | /api/messages/conversations | ✓ | List conversations |
| GET | /api/messages/:userId | ✓ | Get messages with user |
| POST | /api/messages/:userId | ✓ | Send message |
| GET | /api/dashboard/stats | ✓ | User stats |
