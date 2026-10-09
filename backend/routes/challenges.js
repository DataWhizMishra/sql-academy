const express = require('express');
const { listChallenges, getChallenge } = require('../data/challenges');

const router = express.Router();

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

module.exports = router;
