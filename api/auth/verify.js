/**
 * AWS SBG SKIT - Server-side Token Verification Endpoint
 * Endpoint: GET /api/auth/verify
 */

const { verifySessionToken } = require('../utils/validation');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

  const result = verifySessionToken(token);
  if (result.valid) {
    return res.status(200).json({ valid: true, username: result.username });
  } else {
    return res.status(401).json({ valid: false, error: result.expired ? 'Session expired.' : 'Invalid token.' });
  }
};

