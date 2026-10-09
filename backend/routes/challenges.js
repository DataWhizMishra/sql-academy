const express = require('express');
const { listChallenges, getChallenge } = require('../data/challenges');
const { pool } = require('../db');
const { validateQuery } = require('../middleware/validateQuery');
const { compareResults } = require('../lib/compareResults');

const router = express.Router();

const STATEMENT_TIMEOUT_MS = 5000;
const ROW_LIMIT = 500;

// Runs an already-validated SELECT inside the shared READ ONLY sandbox and
// returns { rows, columns, rowCount } (capped at ROW_LIMIT). Caller owns the
// transaction so the student query and the solution run under the same guards.
async function runInTx(client, sql) {
  const wrapped = `SELECT * FROM (${sql}) AS _q LIMIT ${ROW_LIMIT}`;
  const result = await client.query(wrapped);
  return {
    rows: result.rows,
    columns: result.fields.map((f) => f.name),
    rowCount: result.rowCount,
  };
}

// GET /api/challenges — level-navigation list, no hint/approach/solution text.
router.get('/', (req, res) => {
  res.json(listChallenges());
});

// GET /api/challenges/:id — prompt + starter query only.
router.get('/:id', (req, res) => {
  const challenge = getChallenge(req.params.id);
  if (!challenge) return res.status(404).json({ error: 'Challenge not found.' });
  const { id, tier, title, topics, prompt, starterQuery } = challenge;
  res.json({ id, tier, title, topics, prompt, starterQuery });
});

// The next three are separate endpoints (rather than fields on the GET above)
// so the client only fetches — and the network tab only ever shows — exactly
// what the student clicked to reveal.
router.get('/:id/hint', (req, res) => {
  const challenge = getChallenge(req.params.id);
  if (!challenge) return res.status(404).json({ error: 'Challenge not found.' });
  res.json({ hint: challenge.hint });
});

router.get('/:id/approach', (req, res) => {
  const challenge = getChallenge(req.params.id);
  if (!challenge) return res.status(404).json({ error: 'Challenge not found.' });
  res.json({ approach: challenge.approach });
});

router.get('/:id/solution', (req, res) => {
  const challenge = getChallenge(req.params.id);
  if (!challenge) return res.status(404).json({ error: 'Challenge not found.' });
  res.json({ solution: challenge.solution });
});

// POST /api/challenges/:id/check  { query }
//
// Grades a submission by running BOTH the student query and the reference
// solution inside one READ ONLY transaction and comparing their result sets.
// The solution text never leaves the server. Some challenges can't be
// auto-graded — their canonical answer is conceptual/DDL (so the solution
// won't execute) or larger than the sandbox row cap (so a comparison would be
// unreliable). Those return { checkable: false } and the UI invites free
// exploration instead of pass/fail.
router.post('/:id/check', validateQuery, async (req, res) => {
  const challenge = getChallenge(req.params.id);
  if (!challenge) return res.status(404).json({ error: 'Challenge not found.' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN TRANSACTION READ ONLY');
    await client.query(`SET LOCAL statement_timeout = ${STATEMENT_TIMEOUT_MS}`);

    // The reference solution is trusted but may be conceptual/DDL — if it
    // doesn't run as a plain SELECT, this challenge simply isn't auto-gradable.
    let solution;
    try {
      const solSql = challenge.solution.replace(/;\s*$/, '');
      solution = await runInTx(client, solSql);
    } catch {
      return res.json({
        checkable: false,
        reason: 'This challenge is exploratory — its answer is conceptual, so there’s no single result to grade against. Run your query freely.',
      });
    }

    // If the canonical answer is truncated by the row cap, an exact comparison
    // would produce false negatives — treat it as exploratory too.
    if (solution.rowCount >= ROW_LIMIT) {
      return res.json({
        checkable: false,
        reason: `The expected answer has more than ${ROW_LIMIT} rows, which is larger than the sandbox can compare exactly. Run your query freely and compare against the approach.`,
      });
    }

    // Now run the student's query under the same guards.
    let user;
    try {
      user = await runInTx(client, req.cleanQuery);
    } catch (err) {
      return res.json({ checkable: true, correct: false, error: err.message });
    }

    const ordered = /\border\s+by\b/i.test(challenge.solution);
    const { correct, reason } = compareResults(user, solution, { ordered });

    res.json({
      checkable: true,
      correct,
      reason,
      expectedRowCount: solution.rowCount,
      yourRowCount: user.rowCount,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  } finally {
    await client.query('ROLLBACK').catch(() => {});
    client.release();
  }
});

module.exports = router;
