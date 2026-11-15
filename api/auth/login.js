/**
 * AWS SBG SKIT - Server-side Admin Login API Handler
 * Endpoint: POST /api/auth/login
 */

const crypto = require('crypto');
const { validateLogin, createSessionToken } = require('../utils/validation');

// Master admin credentials source: Firestore Database (registrations/sbg_admin_auth)
const FIRESTORE_AUTH_URL = 'https://firestore.googleapis.com/v1/projects/aws-sbg-skit/databases/(default)/documents/registrations/sbg_admin_auth';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, errors: ['Method not allowed.'] });
  }

  try {
    // 1. Validation
    const { valid, errors, sanitized } = validateLogin(req.body);
    if (!valid) {
      return res.status(400).json({ success: false, errors });
    }

    const { username, password } = sanitized;

    // 2. Fetch live credentials solely from Firestore database (no hardcoded password fallback)
    let targetUser = (process.env.ADMIN_USER || 'admin').toLowerCase();
    let targetHash = process.env.ADMIN_PASSWORD_HASH || null;

    try {
      const fireRes = await fetch(FIRESTORE_AUTH_URL);
      if (fireRes.ok) {
        const fireData = await fireRes.json();
        if (fireData.fields && fireData.fields.hash && fireData.fields.hash.stringValue) {
          targetUser = (fireData.fields.username?.stringValue || targetUser).toLowerCase();
          targetHash = fireData.fields.hash.stringValue;
        }
      }
    } catch (dbErr) {
      console.warn('Database auth lookup warning:', dbErr);
    }

    if (!targetHash) {
      return res.status(503).json({
        success: false,
        errors: ['Authentication database unavailable or credentials not set in database.']
      });
    }

    // 3. Compute input password hash (SHA-256)
    const inputHash = crypto.createHash('sha256').update(`${username}:${password}`).digest('hex');

    // 4. Constant-time comparison to prevent timing attacks
    const expectedBuf = Buffer.from(targetHash);
    const inputBuf = Buffer.from(inputHash);

    const isUserMatch = username.toLowerCase() === targetUser.toLowerCase();
    const isPassMatch = expectedBuf.length === inputBuf.length && crypto.timingSafeEqual(expectedBuf, inputBuf);

    if (isUserMatch && isPassMatch) {
      const token = createSessionToken(username);
      return res.status(200).json({
        success: true,
        username,
        token,
        expiresIn: '24h'
      });
    } else {
      return res.status(401).json({
        success: false,
        errors: ['Invalid username or password.']
      });
    }
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, errors: ['Internal server error during login.'] });
  }
};
