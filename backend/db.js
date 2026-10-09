const { Pool } = require('pg');

// The server holds exactly one credential: the readonly role from db/init.sql.
// It cannot write even if every application-layer guard below were bypassed.
// Keep the per-process pool small: on serverless (Vercel) many function
// instances run concurrently, and a large `max` on each can exhaust the
// database's connection limit. Override with DB_POOL_MAX, and prefer a pooled
// connection string (PgBouncer / Neon / Supabase pooler) in production.
const pool = new Pool({
  connectionString: process.env.READONLY_DATABASE_URL,
  max: Number(process.env.DB_POOL_MAX) || 5,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('Unexpected idle pool error:', err.message);
});

module.exports = { pool };
