/**
 * AWS SBG SKIT - Server-side Registration API Handler
 * Endpoint: POST /api/register
 */

const crypto = require('crypto');
const { checkRateLimit, validateRegistration } = require('./utils/validation');

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      errors: ['Method not allowed. Only POST is accepted.']
    });
  }

  // Rate Limiting (10 registrations per minute per IP)
  const clientIp = req.headers['x-forwarded-for'] || (req.socket && req.socket.remoteAddress) || '127.0.0.1';
  if (!checkRateLimit(clientIp, 'register', 10, 60000)) {
    return res.status(429).json({
      success: false,
      errors: ['Too many registration requests. Please wait a minute and try again.']
    });
  }

  try {
    // 1. Strict Server-Side Validation
    const { valid, errors, sanitized } = validateRegistration(req.body);

    if (!valid) {
      return res.status(400).json({
        success: false,
        errors
      });
    }

    // 2. Generate Cryptographically Secure Registration ID
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const regId = `SBG-${randomSuffix}`;

    const registrationRecord = {
      id: regId,
      ...sanitized,
      registeredAt: new Date().toISOString(),
      verifiedByServer: true
    };

    return res.status(200).json({
      success: true,
      message: 'Registration successfully verified and captured.',
      registrationId: regId,
      registration: registrationRecord
    });
  } catch (err) {
    console.error('Server-side registration error:', err);
    return res.status(500).json({
      success: false,
      errors: ['An internal server error occurred while processing registration.']
    });
  }
};
