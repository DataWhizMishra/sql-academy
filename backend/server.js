// Local / long-running host entrypoint. On Vercel the app is served as a
// serverless function from api/index.js instead (which never calls listen).
const app = require('./app');

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`SQL Academy API listening on :${PORT}`));
