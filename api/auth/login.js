/**
 * AWS SBG SKIT - Server-side Admin Login API Handler
 * Endpoint: POST /api/auth/login
 */

const crypto = require('crypto');
const { checkRateLimit, validateLogin, createSessionToken } = require('../utils/validation');

// Master admin credentials (customizable via env vars)
const ADMIN_USER = (process.env.ADMIN_USER || 'admin').toLowerCase();
// Default SHA-256 hash for 'password123'
const DEFAULT_HASH = 'c8b0d8a4a585323c7e2c9d7624779327548d6a033a9ee9e427d3faad84e40df6';
const ADMIN_HASH = process.env.ADMIN_PASSWORD_HASH || DEFAULT_HASH;

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

  // Rate Limiting (5 login attempts per 5 minutes per IP to block brute force)
  const clientIp = req.headers['x-forwarded-for'] || (req.socket && req.socket.remoteAddress) || '127.0.0.1';
  if (!checkRateLimit(clientIp, 'admin_login', 5, 300000)) {
    return res.status(429).json({
      success: false,
      errors: ['Too many failed login attempts. Account temporarily locked for 5 minutes.']
    });
  }

  try {
    // 1. Validation
    const { valid, errors, sanitized } = validateLogin(req.body);
    if (!valid) {
      return res.status(400).json({ success: false, errors });
    }

    const { username, password } = sanitized;

    // 2. Compute input password hash (SHA-256)
    const inputHash = crypto.createHash('sha256').update(`${username}:${password}`).digest('hex');

    // 3. Constant-time comparison to prevent timing attacks
    const expectedBuf = Buffer.from(ADMIN_HASH);
    const inputBuf = Buffer.from(inputHash);

    const isUserMatch = username === ADMIN_USER;
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
