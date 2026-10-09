// Defense-in-depth validation for student-submitted SQL.
//
// The real safety boundary is the `sql_academy_readonly` Postgres role
// (SELECT-only grants) plus a per-request READ ONLY transaction — see
// routes/query.js. Everything here just rejects obviously hostile input
// early, with a clear error, before it ever reaches the database.

const BLOCKED_KEYWORDS = [
  'insert', 'update', 'delete', 'truncate', 'drop', 'alter', 'create',
  'grant', 'revoke', 'copy', 'call', 'do', 'vacuum', 'reindex', 'cluster',
  'listen', 'notify', 'unlisten', 'set', 'reset', 'execute', 'prepare',
  'deallocate', 'lock', 'security', 'pg_sleep', 'pg_read_file',
  'pg_write_file', 'dblink', 'lo_import', 'lo_export',
];

const MAX_QUERY_LENGTH = 4000;

function validateQuery(req, res, next) {
  const { query } = req.body;

  if (typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'A non-empty "query" string is required.' });
  }

  const trimmed = query.trim();

  if (trimmed.length > MAX_QUERY_LENGTH) {
    return res.status(400).json({ error: `Query too long (max ${MAX_QUERY_LENGTH} characters).` });
  }

  // Strip exactly one trailing semicolon; anything after that is a second
  // statement and must be rejected outright (no stacked queries).
  const withoutTrailingSemi = trimmed.replace(/;\s*$/, '');
  if (withoutTrailingSemi.includes(';')) {
    return res.status(400).json({ error: 'Only a single statement is allowed (no semicolons inside the query).' });
  }

  const firstWord = withoutTrailingSemi.match(/^\s*\(?\s*([a-zA-Z]+)/);
  const leadingKeyword = firstWord ? firstWord[1].toLowerCase() : '';
  if (leadingKeyword !== 'select' && leadingKeyword !== 'with') {
    return res.status(400).json({ error: 'Only SELECT (or WITH ... SELECT) statements are allowed.' });
  }

  const lowered = withoutTrailingSemi.toLowerCase();
  for (const word of BLOCKED_KEYWORDS) {
    if (new RegExp(`\\b${word}\\b`).test(lowered)) {
      return res.status(400).json({ error: `Keyword "${word.toUpperCase()}" is not allowed in this sandbox.` });
    }
  }

  req.cleanQuery = withoutTrailingSemi;
  next();
}

module.exports = { validateQuery, MAX_QUERY_LENGTH };
