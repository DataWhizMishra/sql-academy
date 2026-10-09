// Reference notes for every SQL topic the curriculum tags a challenge with.
// Keys match the exact `topics` strings in backend/data/challenges.js, so the
// challenge page can surface the right notes just by looking up its own tags.
//
// Every `example.sql` is a single SELECT / WITH statement that runs as-is
// against this app's schema — dictionary(id, word) and
// scrabble_tiles(letter, points, bag_count) — so the "Load into editor"
// button always produces something the query sandbox will accept.
// A few performance/architecture topics are concepts rather than queries;
// those set `runnable: false` and the editor button is hidden for them.

export type NoteCategory =
  | 'Strings'
  | 'Aggregation'
  | 'Window Functions'
  | 'Joins & Sets'
  | 'CTEs & Recursion'
  | 'Performance & Design';

export interface SqlNote {
  /** Matches a challenge topic tag exactly. */
  topic: string;
  category: NoteCategory;
  /** One or two sentences: what it is and when you reach for it. */
  definition: string;
  /** Generic form, not tied to our tables. */
  syntax: string;
  example: {
    sql: string;
    /** One line explaining what the example returns. */
    note: string;
    /** false = DDL/EXPLAIN/concept the read-only sandbox can't execute. */
    runnable?: boolean;
  };
}

export const CATEGORY_ORDER: NoteCategory[] = [
  'Strings',
  'Aggregation',
  'Window Functions',
  'Joins & Sets',
  'CTEs & Recursion',
  'Performance & Design',
];

export const SQL_NOTES: SqlNote[] = [
  // ---------------------------------------------------------------- Strings
  {
    topic: 'SUBSTRING',
    category: 'Strings',
    definition:
      'Extracts part of a string by starting position and length. Positions are 1-based in SQL, so the first character is position 1, not 0.',
    syntax: 'SUBSTRING(string FROM start FOR length)  -- or SUBSTRING(string, start, length)',
    example: {
      sql: "SELECT word, substring(word, 1, 3) AS first_three\nFROM dictionary\nWHERE word = 'scrabble';",
      note: 'Returns "scr" — the first three characters of the word.',
      runnable: true,
    },
  },
  {
    topic: 'LENGTH',
    category: 'Strings',
    definition:
      'Returns the number of characters in a string. Commonly used to filter or group rows by how long a value is.',
    syntax: 'LENGTH(string)',
    example: {
      sql: 'SELECT length(word) AS len, count(*) AS words\nFROM dictionary\nGROUP BY len\nORDER BY len;',
      note: 'The length distribution of the dictionary: how many words have each length.',
      runnable: true,
    },
  },
  {
    topic: 'REVERSE',
    category: 'Strings',
    definition:
      'Reverses the characters of a string. The classic use is palindrome detection: a word equals its own reverse.',
    syntax: 'REVERSE(string)',
    example: {
      sql: 'SELECT word\nFROM dictionary\nWHERE word = reverse(word) AND length(word) >= 5\nORDER BY length(word) DESC\nLIMIT 10;',
      note: 'Finds the longest palindromes — words that read the same backwards.',
      runnable: true,
    },
  },
  {
    topic: 'String Comparison',
    category: 'Strings',
    definition:
      'Matching strings by pattern or equality. LIKE does simple wildcard matching (% = any run of characters, _ = one character); = is exact.',
    syntax: "string LIKE 'pattern'   -- % and _ are wildcards",
    example: {
      sql: "SELECT word\nFROM dictionary\nWHERE word LIKE 'q_a%'\nORDER BY word\nLIMIT 10;",
      note: "Words where q is followed by any letter, then 'a' (e.g. quack, quaint).",
      runnable: true,
    },
  },
  {
    topic: 'String Splitting',
    category: 'Strings',
    definition:
      'Turning one string into many rows of characters or tokens. regexp_split_to_table with an empty pattern explodes a word into one row per letter — the basis for scoring and tile logic.',
    syntax: 'regexp_split_to_table(string, pattern)  -- returns a set of rows',
    example: {
      sql: "SELECT regexp_split_to_table('scrabble', '') AS letter;",
      note: 'Produces 8 rows: s, c, r, a, b, b, l, e — one per character.',
      runnable: true,
    },
  },
  {
    topic: 'Character Counting',
    category: 'Strings',
    definition:
      'Counting how many times a character appears in a string — needed to check if a word can be built from a limited bag of letters. A common trick: compare LENGTH before and after REPLACE.',
    syntax: "LENGTH(word) - LENGTH(REPLACE(word, 'a', ''))  -- count of 'a'",
    example: {
      sql: "SELECT word, length(word) - length(replace(word, 'e', '')) AS e_count\nFROM dictionary\nORDER BY e_count DESC\nLIMIT 5;",
      note: "Ranks words by how many times the letter 'e' appears in them.",
      runnable: true,
    },
  },

  // ------------------------------------------------------------ Aggregation
  {
    topic: 'GROUP BY',
    category: 'Aggregation',
    definition:
      'Collapses rows that share a value into one row per group, so aggregate functions (COUNT, SUM, AVG…) report per group instead of over the whole table.',
    syntax: 'SELECT key, agg(col) FROM t GROUP BY key',
    example: {
      sql: 'SELECT substring(word, 1, 1) AS letter, count(*) AS words\nFROM dictionary\nGROUP BY letter\nORDER BY words DESC;',
      note: 'One row per starting letter, with how many words begin with it.',
      runnable: true,
    },
  },
  {
    topic: 'COUNT',
    category: 'Aggregation',
    definition:
      'Counts rows. COUNT(*) counts every row in the group; COUNT(col) skips NULLs; COUNT(DISTINCT col) counts unique non-NULL values.',
    syntax: 'COUNT(*) | COUNT(col) | COUNT(DISTINCT col)',
    example: {
      sql: 'SELECT count(*) AS total_words,\n       count(DISTINCT length(word)) AS distinct_lengths\nFROM dictionary;',
      note: 'Total word count, and how many different word-lengths exist.',
      runnable: true,
    },
  },
  {
    topic: 'AVG',
    category: 'Aggregation',
    definition:
      'Returns the arithmetic mean of a numeric column across the group. NULLs are ignored. Pair with ROUND to tidy the result.',
    syntax: 'AVG(numeric_col)',
    example: {
      sql: 'SELECT round(avg(length(word)), 2) AS avg_length\nFROM dictionary;',
      note: 'The mean word length across the whole dictionary.',
      runnable: true,
    },
  },
  {
    topic: 'SUM',
    category: 'Aggregation',
    definition:
      'Adds up a numeric column across the group. The heart of Scrabble scoring: sum the point value of each tile in a word.',
    syntax: 'SUM(numeric_col)',
    example: {
      sql: 'SELECT sum(points * bag_count) AS total_bag_points\nFROM scrabble_tiles;',
      note: 'The total point value of every tile in a full 100-tile Scrabble bag.',
      runnable: true,
    },
  },
  {
    topic: 'PERCENTILE_CONT',
    category: 'Aggregation',
    definition:
      'An ordered-set aggregate that returns a percentile by interpolation — PERCENTILE_CONT(0.5) is the median. It needs a WITHIN GROUP (ORDER BY …) clause.',
    syntax: 'PERCENTILE_CONT(fraction) WITHIN GROUP (ORDER BY col)',
    example: {
      sql: 'SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY length(word)) AS median_length\nFROM dictionary;',
      note: 'The median word length — the middle value, robust to outliers.',
      runnable: true,
    },
  },
  {
    topic: 'STRING_AGG',
    category: 'Aggregation',
    definition:
      'Concatenates values from many rows into one delimited string per group. Great for listing the members of each group on a single line.',
    syntax: 'STRING_AGG(expr, delimiter ORDER BY …)',
    example: {
      sql: "SELECT length(word) AS len, string_agg(word, ', ' ORDER BY word) AS words\nFROM dictionary\nWHERE length(word) = 2\nGROUP BY len;",
      note: 'Every 2-letter word collected into one comma-separated list.',
      runnable: true,
    },
  },

  // -------------------------------------------------------- Window Functions
  {
    topic: 'Window Functions',
    category: 'Window Functions',
    definition:
      'Compute a value across a set of rows related to the current row, WITHOUT collapsing them like GROUP BY does. Every input row stays in the output. Defined with an OVER (…) clause.',
    syntax: 'func() OVER (PARTITION BY … ORDER BY …)',
    example: {
      sql: 'SELECT word,\n       row_number() OVER (ORDER BY word) AS rank\nFROM dictionary\nWHERE length(word) = 3\nORDER BY word\nLIMIT 10;',
      note: 'Numbers each 3-letter word in alphabetical order, keeping all rows.',
      runnable: true,
    },
  },
  {
    topic: 'LEAD',
    category: 'Window Functions',
    definition:
      'A window function that reaches FORWARD to a later row — returns a column value from N rows after the current one, within the ordered window.',
    syntax: 'LEAD(col, offset) OVER (ORDER BY …)',
    example: {
      sql: 'SELECT word,\n       lead(word) OVER (ORDER BY word) AS next_word\nFROM dictionary\nWHERE length(word) = 3\nORDER BY word\nLIMIT 10;',
      note: 'Each word alongside the one that follows it alphabetically.',
      runnable: true,
    },
  },
  {
    topic: 'LAG',
    category: 'Window Functions',
    definition:
      'The mirror of LEAD: reaches BACKWARD to an earlier row — returns a column value from N rows before the current one, within the ordered window.',
    syntax: 'LAG(col, offset) OVER (ORDER BY …)',
    example: {
      sql: 'SELECT word,\n       lag(word) OVER (ORDER BY word) AS prev_word\nFROM dictionary\nWHERE length(word) = 3\nORDER BY word\nLIMIT 10;',
      note: 'Each word alongside the one that precedes it alphabetically.',
      runnable: true,
    },
  },

  // ------------------------------------------------------------- Joins & Sets
  {
    topic: 'Cross Joins',
    category: 'Joins & Sets',
    definition:
      'Produces the Cartesian product: every row of the left table paired with every row of the right. N × M rows out. Used to generate all combinations — e.g. every pair of letters.',
    syntax: 'FROM a CROSS JOIN b   -- or FROM a, b',
    example: {
      sql: 'SELECT a.letter AS first, b.letter AS second\nFROM scrabble_tiles a\nCROSS JOIN scrabble_tiles b\nLIMIT 10;',
      note: 'Every possible ordered pair of two tiles (26 × 26 combinations).',
      runnable: true,
    },
  },
  {
    topic: 'Joins with Reference Tables',
    category: 'Joins & Sets',
    definition:
      'Joining a main table to a small lookup/reference table to enrich each row with attributes — here, attaching point values and bag counts from scrabble_tiles to letters.',
    syntax: 'FROM main m JOIN reference r ON m.key = r.key',
    example: {
      sql: "SELECT t.letter, t.points\nFROM regexp_split_to_table('quiz', '') AS l(letter)\nJOIN scrabble_tiles t ON t.letter = l.letter\nORDER BY t.points DESC;",
      note: "Looks up the Scrabble point value of each letter in 'quiz'.",
      runnable: true,
    },
  },
  {
    topic: 'Complex JOINs',
    category: 'Joins & Sets',
    definition:
      'Combining several joins (and often aggregation) in one query — e.g. split words into letters, join each letter to its tile value, then sum per word to score it.',
    syntax: 'JOIN … JOIN … GROUP BY … to aggregate joined rows',
    example: {
      sql: "WITH letters AS (\n  SELECT word, regexp_split_to_table(word, '') AS ch\n  FROM dictionary WHERE length(word) = 5\n)\nSELECT l.word, sum(t.points) AS score\nFROM letters l\nJOIN scrabble_tiles t ON t.letter = l.ch\nGROUP BY l.word\nORDER BY score DESC\nLIMIT 5;",
      note: 'The top-scoring 5-letter words by total Scrabble tile value.',
      runnable: true,
    },
  },
  {
    topic: 'Subset Logic',
    category: 'Joins & Sets',
    definition:
      'Testing whether one collection is contained within another — e.g. can a word be spelled using only a given set of letters? Often expressed with NOT EXISTS or set-difference.',
    syntax: 'WHERE NOT EXISTS (SELECT … missing requirement)',
    example: {
      sql: "SELECT word\nFROM dictionary\nWHERE word ~ '^[aeiou]+$'\nORDER BY length(word) DESC\nLIMIT 5;",
      note: 'Words made up ONLY of vowels — the letter set {a,e,i,o,u}.',
      runnable: true,
    },
  },
  {
    topic: 'Array Comparison',
    category: 'Joins & Sets',
    definition:
      'Turning strings into arrays of characters and comparing them — e.g. two words are anagrams if their sorted letter arrays are equal.',
    syntax: 'string_to_array(str, NULL)  -- plus ARRAY(SELECT … ORDER BY …) to sort',
    example: {
      sql: "SELECT word,\n       array(SELECT unnest(string_to_array(word, NULL)) ORDER BY 1) AS sorted_letters\nFROM dictionary\nWHERE word IN ('listen', 'silent')\n;",
      note: 'Both words produce the same sorted letter array — they are anagrams.',
      runnable: true,
    },
  },
  {
    topic: 'Advanced Filtering',
    category: 'Joins & Sets',
    definition:
      'Precise WHERE conditions using regular expressions (~), ranges, and boolean combinations to select exactly the rows you want.',
    syntax: "WHERE col ~ 'regex' AND other_condition",
    example: {
      sql: "SELECT word\nFROM dictionary\nWHERE word ~ '^s.*s$' AND length(word) BETWEEN 4 AND 6\nORDER BY word\nLIMIT 10;",
      note: "Words that start and end with 's' and are 4–6 letters long.",
      runnable: true,
    },
  },

  // -------------------------------------------------------- CTEs & Recursion
  {
    topic: 'CTEs',
    category: 'CTEs & Recursion',
    definition:
      'A Common Table Expression (WITH … AS) names a subquery so you can reference it like a temporary table. It makes multi-step queries readable instead of deeply nested.',
    syntax: 'WITH name AS (SELECT …) SELECT … FROM name',
    example: {
      sql: 'WITH long_words AS (\n  SELECT word FROM dictionary WHERE length(word) > 15\n)\nSELECT count(*) AS very_long_words FROM long_words;',
      note: 'A CTE isolates the 15+ letter words, then the outer query counts them.',
      runnable: true,
    },
  },
  {
    topic: 'Recursive CTEs',
    category: 'CTEs & Recursion',
    definition:
      'A WITH RECURSIVE CTE references itself: a base (anchor) query seeds the result, then a recursive part repeatedly feeds on the previous output until it adds no new rows. Used for sequences, hierarchies, and graphs.',
    syntax: 'WITH RECURSIVE t AS (anchor UNION ALL recursive_step) SELECT … FROM t',
    example: {
      sql: 'WITH RECURSIVE nums AS (\n  SELECT 1 AS n\n  UNION ALL\n  SELECT n + 1 FROM nums WHERE n < 10\n)\nSELECT n FROM nums;',
      note: 'Generates the numbers 1 through 10 by repeatedly adding 1.',
      runnable: true,
    },
  },

  // ---------------------------------------------------- Performance & Design
  {
    topic: 'EXPLAIN ANALYZE',
    category: 'Performance & Design',
    definition:
      "Asks Postgres to show the query plan AND actually run it, reporting real timings and row counts per step. The first tool for understanding why a query is slow — look for 'Seq Scan' on large tables.",
    syntax: 'EXPLAIN ANALYZE <your query>',
    example: {
      sql: "EXPLAIN ANALYZE\nSELECT * FROM dictionary WHERE word = 'scrabble';",
      note: 'Shows the plan + real time. (Not runnable in this read-only sandbox — try it in psql.)',
      runnable: false,
    },
  },
  {
    topic: 'Indexing',
    category: 'Performance & Design',
    definition:
      'An index is a sorted side structure that lets Postgres find matching rows without scanning the whole table — turning a sequential scan into an index lookup. The trade-off: indexes speed reads but cost space and slow writes.',
    syntax: 'CREATE INDEX idx_name ON table (column);',
    example: {
      sql: 'CREATE INDEX idx_dictionary_word ON dictionary (word);',
      note: "After this, WHERE word = '…' uses an index scan instead of reading all 466k rows. (DDL — run in psql, not the sandbox.)",
      runnable: false,
    },
  },
  {
    topic: 'Relational Board Modeling',
    category: 'Performance & Design',
    definition:
      'Representing a 2D game board in relational tables — e.g. a board_state(row, col, letter) table — so SQL can reason about positions, adjacency, and placed tiles as plain rows.',
    syntax: 'CREATE TABLE board_state (row INT, col INT, letter CHAR(1));',
    example: {
      sql: 'SELECT r AS row, c AS col\nFROM generate_series(1, 3) AS r\nCROSS JOIN generate_series(1, 3) AS c\nORDER BY r, c;',
      note: 'Generates the coordinates of a 3×3 board grid — one row per cell.',
      runnable: true,
    },
  },
  {
    topic: 'Database Architecture',
    category: 'Performance & Design',
    definition:
      'The design decisions behind a schema: how tables, keys, and roles are structured, and how access is restricted. This app, for instance, runs every learner query as a SELECT-only role inside a read-only transaction.',
    syntax: 'Normalization • primary/foreign keys • least-privilege roles',
    example: {
      sql: "SELECT table_name\nFROM information_schema.tables\nWHERE table_schema = 'public'\nORDER BY table_name;",
      note: 'Lists the tables in this database — the dictionary and scrabble_tiles.',
      runnable: true,
    },
  },
];

const NOTE_BY_TOPIC = new Map(SQL_NOTES.map((n) => [n.topic, n]));

/** Look up the notes for a challenge's topic tags, preserving tag order. */
export function notesForTopics(topics: string[]): SqlNote[] {
  return topics
    .map((t) => NOTE_BY_TOPIC.get(t))
    .filter((n): n is SqlNote => n !== undefined);
}
