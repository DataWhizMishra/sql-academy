# SQL Scrabble Academy

A gamified SQL learning platform. Every challenge queries one real dataset —
a 466,000-word English dictionary — progressing from `GROUP BY` basics to
recursive CTEs, Scrabble-bag joins, and query optimization.

## Stack

- **Frontend:** Next.js (App Router) + Tailwind CSS + Monaco Editor + React Three Fiber
- **Backend:** Node.js / Express — validates and sandboxes every query before it reaches Postgres
- **Database:** PostgreSQL

## Project layout

```
db/        init.sql (schema + readonly role), seed_dictionary.js (loads the word list)
backend/   Express API: query execution sandbox + the 12-challenge curriculum
frontend/  Next.js app: level navigation, SQL editor, hint/approach/reveal UI, 3D scene
```

## 1. Database setup

```bash
createdb sql_academy
psql -d sql_academy -f db/init.sql
```

`init.sql` creates `dictionary`, seeds `scrabble_tiles` with the standard
100-tile distribution, and creates a `sql_academy_readonly` role with
SELECT-only grants — the only credential the running API ever holds.

Then load the dictionary from the word list already in this folder:

```bash
cd db
npm init -y && npm install pg pg-copy-streams
DATABASE_URL=postgres://postgres:postgres@localhost:5432/sql_academy node seed_dictionary.js
```

## 2. Backend API

```bash
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL / READONLY_DATABASE_URL
npm run dev            # http://localhost:4000
```

Query safety is layered three ways (see `middleware/validateQuery.js` and
`routes/query.js`): only single `SELECT`/`WITH` statements are accepted, the
API connects exclusively as the readonly Postgres role, and every query runs
inside a `READ ONLY` transaction with a 5s statement timeout and a 500-row
cap — then is always rolled back.

## 3. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # point at the backend above
npm run dev            # http://localhost:3000
```

## Curriculum

| # | Tier | Challenge | Topics |
|---|------|-----------|--------|
| 1 | Beginner | Letter of the Alphabet | SUBSTRING, GROUP BY, COUNT |
| 2 | Beginner | Word Length Distribution | LENGTH, GROUP BY |
| 3 | Beginner | Average & Median Length | AVG, PERCENTILE_CONT |
| 4 | Beginner | Neighbors of Kayak | LEAD, LAG, Window Functions |
| 5 | Intermediate | Palindrome Finder | REVERSE |
| 6 | Intermediate | Anagram Groups | STRING_AGG, CTEs |
| 7 | Intermediate | Unlimited Scrabble | Cross Joins, Subset Logic |
| 8 | Intermediate | Subset Matching | Character Counting |
| 9 | Advanced | Realistic Scrabble Bag | Reference-table Joins |
| 10 | Advanced | Maximum Scrabble Score | Complex JOINs, SUM |
| 11 | Advanced | Board-Context Scrabble | Recursive CTEs |
| 12 | Advanced | Query Optimization | EXPLAIN ANALYZE, Indexing |

Full hint / approach / solution text for every challenge lives in
`backend/data/challenges.js`. The frontend's `/challenge/[id]` route is
generic, so all 12 are already playable end-to-end — the task brief asked
to highlight the first 3 in detail, which `app/challenge/[id]/page.tsx` and
`ChallengeActions.tsx` do for any id.

## Notes / next steps

- This repo folder (`words sql`) sits inside a git repository rooted at your
  user profile directory — nothing here has been committed. If you want
  version control scoped to just this project, run `git init` inside
  `words sql` itself.
- Challenges 11 (board-context) and parts of 7 (optimal letter-set search)
  are intentionally left as guided/conceptual in the curriculum data — they
  need either a `board_state` table or a combinatorial search that doesn't
  belong in a single SQL statement; the `approach` text explains why.
