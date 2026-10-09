require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const queryRouter = require('./routes/query');
const challengesRouter = require('./routes/challenges');

const app = express();

// Behind Vercel's proxy, trust the forwarded headers so express-rate-limit
// and req.ip see the real client address rather than the proxy's.
app.set('trust proxy', 1);

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json({ limit: '10kb' }));

// Query execution is the expensive/sensitive path — rate limit it separately
// and more tightly than the rest of the API.
const executeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many queries — slow down and try again in a minute.' },
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/challenges', challengesRouter);
app.use('/api/query', executeLimiter, queryRouter);

app.use((req, res) => res.status(404).json({ error: 'Not found.' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

module.exports = app;
