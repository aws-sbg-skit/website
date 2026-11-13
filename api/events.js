/**
 * AWS SBG SKIT - Events API Handler
 * Endpoint: /api/events
 */

const { validateEvent, verifySessionToken, checkRateLimit } = require('./utils/validation');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Public GET
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: 'Events endpoint online.'
    });
  }

  // Protected Mutations: Require valid admin session token
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  const authCheck = verifySessionToken(token);

  if (!authCheck.valid) {
    return res.status(401).json({
      success: false,
      errors: ['Unauthorized. Valid admin session token required.']
    });
  }

  // Rate Limiting
  const clientIp = req.headers['x-forwarded-for'] || (req.socket && req.socket.remoteAddress) || '127.0.0.1';
  if (!checkRateLimit(clientIp, 'admin_events_mutate', 30, 60000)) {
    return res.status(429).json({ success: false, errors: ['Rate limit exceeded.'] });
  }

  // Validate event payload for POST and PUT
  if (req.method === 'POST' || req.method === 'PUT') {
    const { valid, errors, sanitized } = validateEvent(req.body);
    if (!valid) {
      return res.status(400).json({ success: false, errors });
    }

    return res.status(200).json({
      success: true,
      event: sanitized,
      message: req.method === 'POST' ? 'Event validated and created.' : 'Event validated and updated.'
    });
  }

  if (req.method === 'DELETE') {
    const eventId = (req.query.id || (req.body && req.body.id) || '').trim();
    if (!eventId) {
      return res.status(400).json({ success: false, errors: ['Event ID is required for deletion.'] });
    }
    return res.status(200).json({ success: true, message: `Event ${eventId} deleted.` });
  }

  return res.status(405).json({ success: false, errors: ['Method not allowed.'] });
};
