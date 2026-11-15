/**
 * AWS SBG SKIT - Server-side Admin Change Password API Handler
 * Endpoint: POST /api/auth/change-password
 */

const crypto = require('crypto');
const { createSessionToken } = require('../utils/validation');

const FIRESTORE_AUTH_URL = 'https://firestore.googleapis.com/v1/projects/aws-sbg-skit/databases/(default)/documents/registrations/sbg_admin_auth';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed.' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const currentPassword = (payload.currentPassword || '').trim();
    const newUsername = (payload.newUsername || '').trim().toLowerCase();
    const newPassword = (payload.newPassword || '').trim();

    if (!currentPassword) {
      return res.status(400).json({ success: false, error: 'Current password is required.' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long.' });
    }

    // 1. Fetch active credentials solely from Firestore
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
    } catch (e) {
      console.warn('Firestore fetch failed:', e);
    }

    if (!targetHash) {
      return res.status(503).json({ success: false, error: 'Authentication database unavailable.' });
    }

    // 2. Verify current password
    const curHash = crypto.createHash('sha256').update(`${targetUser}:${currentPassword}`).digest('hex');
    const expectedBuf = Buffer.from(targetHash);
    const inputBuf = Buffer.from(curHash);

    const isMatch = expectedBuf.length === inputBuf.length && crypto.timingSafeEqual(expectedBuf, inputBuf);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect.' });
    }

    // 3. Compute new hash
    const finalUser = newUsername || targetUser;
    const newHash = crypto.createHash('sha256').update(`${finalUser}:${newPassword}`).digest('hex');
    const nowIso = new Date().toISOString();

    // 4. Persist to Firestore cloud database
    const patchRes = await fetch(FIRESTORE_AUTH_URL, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          username: { stringValue: finalUser },
          hash: { stringValue: newHash },
          updatedAt: { stringValue: nowIso }
        }
      })
    });

    if (!patchRes.ok) {
      const errText = await patchRes.text();
      return res.status(500).json({ success: false, error: 'Failed to update credentials in database: ' + errText });
    }

    const token = createSessionToken(finalUser);
    return res.status(200).json({
      success: true,
      message: 'Admin credentials updated successfully in database!',
      username: finalUser,
      hash: newHash,
      token
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error: ' + err.message });
  }
};
