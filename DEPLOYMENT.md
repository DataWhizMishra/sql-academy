# Deploying to Vercel (Services)

This repo deploys as a **single Vercel project with two [services](https://vercel.com/docs/services)**:

- `frontend` — Next.js, public at `/`
- `backend` — Express API, public at `/api/*`

Both build independently and share one domain, so the browser calls the API
same-origin at `/api/...` — no cross-origin base URL and no CORS needed in
production. Routing lives in the root [`vercel.json`](./vercel.json):

```json
{
  "services": {
    "frontend": { "root": "frontend", "framework": "nextjs" },
    "backend":  { "root": "backend",  "framework": "express", "entrypoint": "app.js" }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": { "service": "backend" } },
    { "source": "/(.*)",     "destination": { "service": "frontend" } }
  ]
}
```

A service receives the **original request path**, so `/api/challenges` reaches
the backend as `/api/challenges` — matching the routes Express mounts under
`/api/*` in `backend/app.js`.

## Setup

1. Import this repo as one Vercel project and enable **Services** (a project
   builds as services when the `services` key is present in `vercel.json`).
2. Set environment variables on the project:
   - `READONLY_DATABASE_URL` — read-only Postgres connection string. Prefer a
     **pooled** endpoint (Neon / Supabase pooler / PgBouncer); serverless opens
     many short-lived connections.
   - `DB_POOL_MAX` — optional; per-instance pool size (default `5`).
   - `CORS_ORIGIN` / `NEXT_PUBLIC_API_URL` are **not needed** in services mode
     (same origin). Only set `NEXT_PUBLIC_API_URL` if you point the frontend at
     a separately hosted API instead.
3. Deploy. Everything is served from the one project domain.

## Service-to-service calls (bindings) — not used here

Vercel [bindings](https://vercel.com/docs/services/bindings) let one service
call another privately, server-side, via an injected URL. **This repo adds no
bindings**: the only frontend→backend traffic is the *browser* fetching
`/api/*`, which goes through the public top-level rewrite — not a binding.
Bindings resolve in server-side functions only (never in the browser, builds,
or middleware), so one would do nothing here. If you later add **server-side**
Next.js code that calls the backend directly, declare a binding on the
`frontend` service and read the injected URL there.

## Local development

```bash
# Option A — mirror production with one command (binding vars injected):
vercel dev

# Option B — the two dev servers separately:
cd backend  && npm install && npm run dev   # http://localhost:4000
cd frontend && npm install && npm run dev   # http://localhost:3000
```

With Option B the frontend defaults to `http://localhost:4000` for the API in
development (override with `NEXT_PUBLIC_API_URL` in `frontend/.env.local`); the
Express app allows the `http://localhost:3000` origin via `CORS_ORIGIN`.

`backend/app.js` exports the Express app (the Vercel `entrypoint`);
`backend/server.js` is the local entrypoint that calls `app.listen`.

## Database

`DATABASE_URL` and the seed script (`npm run seed`, loads
`english_words_479k.txt`) are for one-time setup only and are not used at
runtime — the API runs read-only via `READONLY_DATABASE_URL`. Seed your hosted
Postgres once before relying on the deployed API. Never commit real
credentials; keep them in Vercel's env settings and the gitignored
`backend/.env`.
