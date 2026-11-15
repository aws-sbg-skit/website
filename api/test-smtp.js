/**
 * AWS SBG SKIT - Test SMTP Authentication Endpoint
 * Endpoint: POST /api/test-smtp
 */

const { testSmtp, DEFAULT_SENDER } = require('./utils/smtp');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Only POST is supported.' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const sender = (payload.sender_email || DEFAULT_SENDER).trim();
    const appPassword = (payload.app_password || '').trim().replace(/\s+/g, '');

    if (!appPassword) {
      return res.status(400).json({
        success: false,
        error: 'Google App Password is required. Generate one at Google Account > Security > App Passwords.'
      });
    }

    const result = await testSmtp(sender, appPassword);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Test SMTP Error:', err);
    return res.status(401).json({
      success: false,
      error: err.message || 'SMTP Authentication failed.'
    });
  }
};

