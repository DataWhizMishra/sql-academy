const express = require('express');
const { pool } = require('../db');
const { validateQuery } = require('../middleware/validateQuery');

const router = express.Router();

const STATEMENT_TIMEOUT_MS = 5000;
const ROW_LIMIT = 500;

// POST /api/query/execute  { query: string }
//
// Three independent layers keep this safe for arbitrary student SQL:
//   1. validateQuery   - rejects non-SELECT text and stacked statements.
//   2. Postgres role    - sql_academy_readonly only has SELECT grants.
//   3. This handler     - runs inside an explicit READ ONLY transaction
//                         with a 5s statement_timeout, wraps the query so
//                         a row cap applies no matter what the student
//                         wrote, and always rolls back (belt + suspenders
//                         even though nothing here can write).
router.post('/execute', validateQuery, async (req, res) => {
  const client = await pool.connect();
  const startedAt = Date.now();

  try {
    await client.query('BEGIN TRANSACTION READ ONLY');
    await client.query(`SET LOCAL statement_timeout = ${STATEMENT_TIMEOUT_MS}`);

    const wrapped = `SELECT * FROM (${req.cleanQuery}) AS _student_query LIMIT ${ROW_LIMIT}`;
    const result = await client.query(wrapped);

    res.json({
      rows: result.rows,
      columns: result.fields.map((f) => f.name),
      rowCount: result.rowCount,
      truncatedAt: result.rowCount === ROW_LIMIT ? ROW_LIMIT : null,
      durationMs: Date.now() - startedAt,
    });
  } catch (err) {
    // Postgres error messages are safe to surface — they're the whole point
    // of a learning tool (syntax errors, unknown columns, etc).
    res.status(400).json({ error: err.message });
  } finally {
    await client.query('ROLLBACK').catch(() => {});
    client.release();
  }
});

module.exports = router;
