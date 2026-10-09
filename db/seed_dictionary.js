// Loads db/../english_words_479k.txt (one word per line) into the `dictionary`
// table using PostgreSQL's COPY stream — the only sane way to insert ~466k
// rows without doing 466k round trips.
//
// Usage: node db/seed_dictionary.js
// Requires: DATABASE_URL env var pointing at the OWNER/migration role
//           (not the readonly API role — this writes data).

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { Client } = require('pg');
const copyFrom = require('pg-copy-streams').from;

const WORDLIST_PATH = path.join(__dirname, '..', 'english_words_479k.txt');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log('Clearing existing dictionary rows...');
  await client.query('TRUNCATE dictionary RESTART IDENTITY');

  console.log(`Streaming ${WORDLIST_PATH} into dictionary via COPY...`);
  const stream = client.query(copyFrom('COPY dictionary (word) FROM STDIN'));
  const fileStream = fs.createReadStream(WORDLIST_PATH);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let count = 0;
  for await (const rawLine of rl) {
    const word = rawLine.trim();
    // Skip blanks and anything longer than the VARCHAR(45) column.
    if (!word || word.length > 45) continue;
    // Escape backslashes/tabs/newlines per COPY TEXT format rules.
    const escaped = word.replace(/\\/g, '\\\\').replace(/\t/g, '\\t');
    stream.write(escaped + '\n');
    count++;
  }
  stream.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  console.log(`Loaded ${count} words into dictionary.`);
  await client.end();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
