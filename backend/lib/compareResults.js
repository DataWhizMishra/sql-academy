// Compares a student's query result against the reference solution's result.
//
// We compare VALUES, not column names — so a student who aliases a column
// `n` instead of `word_count` still passes. Comparison is column-order
// sensitive (the shape of the answer matters) but alias-insensitive.
//
// Ordering: if the reference solution contains an ORDER BY, the row order is
// part of the answer, so we compare row-by-row. Otherwise we compare as
// multisets (sorted), so a student whose rows come back in a different order
// is still correct.

function normalizeCell(value) {
  if (value === null || value === undefined) return '\u0000NULL';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') return JSON.stringify(value);
  // Numbers come back from pg as strings already; trim incidental whitespace.
  return String(value).trim();
}

function rowToTuple(row, columns) {
  return columns.map((c) => normalizeCell(row[c])).join('\u0001');
}

/**
 * @returns {{ correct: boolean, reason: string|null }}
 */
function compareResults(user, solution, { ordered }) {
  if (user.columns.length !== solution.columns.length) {
    return {
      correct: false,
      reason: `Expected ${solution.columns.length} column${solution.columns.length === 1 ? '' : 's'}, but your query returned ${user.columns.length}.`,
    };
  }

  if (user.rows.length !== solution.rows.length) {
    return {
      correct: false,
      reason: `Expected ${solution.rows.length} row${solution.rows.length === 1 ? '' : 's'}, but your query returned ${user.rows.length}.`,
    };
  }

  const userTuples = user.rows.map((r) => rowToTuple(r, user.columns));
  const solTuples = solution.rows.map((r) => rowToTuple(r, solution.columns));

  if (ordered) {
    for (let i = 0; i < solTuples.length; i++) {
      if (userTuples[i] !== solTuples[i]) {
        return {
          correct: false,
          reason: `Right number of rows, but the values (or their order) don't match — first difference is at row ${i + 1}.`,
        };
      }
    }
    return { correct: true, reason: null };
  }

  const a = [...userTuples].sort();
  const b = [...solTuples].sort();
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return { correct: false, reason: 'Right number of rows, but some values don’t match the expected answer.' };
    }
  }
  return { correct: true, reason: null };
}

module.exports = { compareResults };
