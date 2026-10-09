# Deploying to Vercel

This repo is a monorepo with two apps:

- `frontend/` — Next.js (the UI)
- `backend/` — Express API (`/api/*`, read-only SQL execution against Postgres)

> **Why there is no root `vercel.json` with a `services` block.**
> Vercel has no `services` key — a Vercel **project builds exactly one
> framework**, and a monorepo is deployed as **multiple projects**, each pointed
> at a subdirectory (its "Root Directory"). Cross-service routing is done with
> each project's own `vercel.json`, env vars, and domains — not a single root
> config. So the suggested `{ "services": { ... } }` file won't validate or
> deploy; the setup below is the working equivalent.

## Create two Vercel projects from this one repo

In the Vercel dashboard, **Add New → Project**, import this GitHub repo **twice**:

### 1. Backend project
- **Root Directory:** `backend`
- Framework preset: **Other** (Vercel auto-detects the serverless function in
  `backend/api/`; `backend/vercel.json` rewrites every path into the Express app)
- **Environment variables:**
  - `READONLY_DATABASE_URL` — the read-only Postgres connection string
    (prefer a **pooled** endpoint: Neon / Supabase pooler / PgBouncer, since
    serverless opens many short-lived connections)
  - `CORS_ORIGIN` — the frontend's deployed URL, e.g. `https://<frontend>.vercel.app`
  - `DB_POOL_MAX` — optional; defaults to `5` per instance
- After it deploys, note its URL, e.g. `https://<backend>.vercel.app`

### 2. Frontend project
- **Root Directory:** `frontend`
- Framework preset: **Next.js** (auto-detected)
- **Environment variable:**
  - `NEXT_PUBLIC_API_URL` — the backend project URL from above
    (`https://<backend>.vercel.app`, no trailing slash). The frontend calls
    `${NEXT_PUBLIC_API_URL}/api/...`.

Set `CORS_ORIGIN` (backend) and `NEXT_PUBLIC_API_URL` (frontend) to point at each
other, then redeploy both so the values take effect.

## Database

`DATABASE_URL` / the seed script (`npm run seed`, loads `english_words_479k.txt`)
are for **one-time local setup only** and are not used at runtime — the API runs
with the read-only role via `READONLY_DATABASE_URL`. Seed your hosted Postgres
once (locally, pointed at the hosted DB, or via a migration job) before relying
on the deployed API. Never commit real credentials; keep them in Vercel's env
settings and in the local, gitignored `backend/.env`.

## Local development (unchanged)

```bash
# backend
cd backend && npm install && npm run dev   # http://localhost:4000

# frontend
cd frontend && npm install && npm run dev   # http://localhost:3000
```

`backend/server.js` is the local entrypoint (it calls `app.listen`);
`backend/api/index.js` is the serverless entrypoint (it exports the same app
without listening). Both share `backend/app.js`.
