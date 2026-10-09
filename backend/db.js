const { Pool } = require('pg');

// The server holds exactly one credential: the readonly role from db/init.sql.
// It cannot write even if every application-layer guard below were bypassed.
const pool = new Pool({
  connectionString: process.env.READONLY_DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('Unexpected idle pool error:', err.message);
});

module.exports = { pool };
