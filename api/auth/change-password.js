/**
 * AWS SBG SKIT - Server-side Admin Change Password API Handler
 * Endpoint: POST /api/auth/change-password
 */

const crypto = require('crypto');
const { createSessionToken } = require('../utils/validation');

const ADMIN_USER = (process.env.ADMIN_USER || 'admin').toLowerCase();
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

    // 1. Fetch active credentials
    let targetUser = ADMIN_USER;
    let targetHash = ADMIN_HASH;

    try {
      const fireRes = await fetch('https://firestore.googleapis.com/v1/projects/aws-sbg-skit/databases/(default)/documents/registrations/sbg_admin_auth');
      if (fireRes.ok) {
        const fireData = await fireRes.json();
        if (fireData.fields && fireData.fields.hash && fireData.fields.hash.stringValue) {
          targetUser = (fireData.fields.username?.stringValue || targetUser).toLowerCase();
          targetHash = fireData.fields.hash.stringValue;
        }
      }
    } catch (e) {}

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
    try {
      await fetch('https://firestore.googleapis.com/v1/projects/aws-sbg-skit/databases/(default)/documents/registrations/sbg_admin_auth', {
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
    } catch (fsErr) {
      console.warn('Failed to persist to Firestore:', fsErr);
    }

    const token = createSessionToken(finalUser);
    return res.status(200).json({
      success: true,
      message: 'Admin credentials updated successfully!',
      username: finalUser,
      hash: newHash,
      token
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error: ' + err.message });
  }
};
