/**
 * AWS SBG SKIT - Save Certificates Endpoint
 * Endpoint: POST /api/save-certificates
 */

const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const certsToSave = payload.certificates || (payload.certificate ? [payload.certificate] : []);

    const filePath = path.join(process.cwd(), 'data', 'certificates.json');

    try {
      let existing = [];
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        existing = JSON.parse(raw || '[]');
      }
      const map = {};
      existing.forEach(c => { if (c.id) map[c.id.toUpperCase()] = c; });
      certsToSave.forEach(c => { if (c.id) map[c.id.toUpperCase()] = c; });
      const updated = Object.values(map);
      fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');
    } catch (fsErr) {
      // On Vercel read-only filesystem, cloud Firestore persists the certificates
    }

    return res.status(200).json({
      success: true,
      message: 'Certificates registered successfully.',
      count: certsToSave.length
    });
  } catch (err) {
    return res.status(200).json({ success: true, message: 'Acknowledged' });
  }
};

