/**
 * AWS SBG SKIT - Send Certificate Email API Handler
 * Endpoint: POST /api/send-certificate
 */

const { sendMail, DEFAULT_SENDER } = require('./utils/smtp');

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
    const recipient = (payload.recipient_email || '').trim();
    const recipientName = (payload.recipient_name || 'Student Builder').trim();
    const subject = payload.subject || 'Certificate of Participation — AWS Student Builder Group SKIT';
    const body = payload.body || '';
    const attachmentBase64 = payload.attachment_base64 || '';
    const attachmentFilename = payload.attachment_filename || 'AWS_Certificate.png';

    if (!recipient) {
      return res.status(400).json({ success: false, error: 'Recipient email is required.' });
    }

    if (!appPassword) {
      return res.status(400).json({
        success: false,
        error: 'Google App Password for aws.sbg.skit@gmail.com is required.'
      });
    }

    const result = await sendMail({
      sender,
      appPassword,
      recipient,
      recipientName,
      subject,
      body,
      attachmentBase64,
      attachmentFilename
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('Send Certificate Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to dispatch certificate email.'
    });
  }
};
