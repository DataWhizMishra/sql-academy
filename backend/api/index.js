// Vercel serverless entrypoint. An Express app is itself a (req, res) handler,
// so exporting it lets Vercel's Node runtime invoke it directly. The catch-all
// rewrite in vercel.json forwards every path here with the original URL intact,
// so Express still matches its own /api/* routes.
module.exports = require('../app');
