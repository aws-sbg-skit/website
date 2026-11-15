/**
 * AWS SBG SKIT - Zero-Dependency Pure Node.js SMTP Client for Gmail SSL (Port 465)
 * Fully compatible with Vercel Serverless Functions and local Node environments.
 */

const tls = require('tls');

const DEFAULT_SENDER = 'aws.sbg.skit@gmail.com';
const GMAIL_HOST = 'smtp.gmail.com';
const GMAIL_PORT = 465;

/**
 * Test authentication credentials against Gmail SMTP SSL
 */
function testSmtp(sender, appPassword) {
  const cleanSender = (sender || DEFAULT_SENDER).trim();
  const cleanPass = (appPassword || '').trim().replace(/\s+/g, '');

  if (!cleanPass) {
    return Promise.reject(new Error('Google App Password is required. Generate one at Google Account > Security > App Passwords.'));
  }

  return new Promise((resolve, reject) => {
    let resolved = false;
    const socket = tls.connect(GMAIL_PORT, GMAIL_HOST, { rejectUnauthorized: true }, () => {
      let state = 'CONNECTED';
      let buffer = '';

      const timer = setTimeout(() => {
        cleanup(new Error('Connection timed out waiting for Gmail SMTP greeting.'));
      }, 15000);

      function cleanup(err) {
        clearTimeout(timer);
        if (!resolved) {
          resolved = true;
          try { socket.destroy(); } catch (e) {}
          if (err) reject(err);
        }
      }

      socket.on('error', cleanup);
      socket.on('close', () => {
        if (!resolved) cleanup(new Error('Connection closed prematurely by Gmail server.'));
      });

      socket.on('data', chunk => {
        buffer += chunk.toString('utf-8');
        const lines = buffer.split('\r\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line) continue;
          const code = parseInt(line.slice(0, 3), 10);
          const isFinal = line.charAt(3) === ' ';
          if (!isFinal) continue; // Skip intermediate lines of multi-line responses (e.g. 250-...)

          if (code >= 400) {
            cleanup(new Error(`Gmail SMTP error (${code}): ${line}`));
            return;
          }

          if (state === 'CONNECTED' && code === 220) {
            state = 'EHLO';
            socket.write('EHLO localhost\r\n');
          } else if (state === 'EHLO' && code === 250) {
            state = 'AUTH';
            socket.write('AUTH LOGIN\r\n');
          } else if (state === 'AUTH' && code === 334) {
            state = 'USER';
            socket.write(Buffer.from(cleanSender).toString('base64') + '\r\n');
          } else if (state === 'USER' && code === 334) {
            state = 'PASS';
            socket.write(Buffer.from(cleanPass).toString('base64') + '\r\n');
          } else if (state === 'PASS' && code === 235) {
            clearTimeout(timer);
            resolved = true;
            try { socket.end('QUIT\r\n'); } catch (e) {}
            resolve({
              success: true,
              message: `Successfully verified Gmail connection for ${cleanSender}!`
            });
            return;
          }
        }
      });
    });
  });
}

/**
 * Send an email with optional base64 attachment via Gmail SMTP SSL in a single clean state machine
 */
function sendMail({ sender, appPassword, recipient, recipientName, subject, body, attachmentBase64, attachmentFilename }) {
  const cleanSender = (sender || DEFAULT_SENDER).trim();
  const cleanPass = (appPassword || '').trim().replace(/\s+/g, '');
  const cleanRecipient = (recipient || '').trim();

  if (!cleanRecipient) {
    return Promise.reject(new Error('Recipient email address is required.'));
  }
  if (!cleanPass) {
    return Promise.reject(new Error('Google App Password for aws.sbg.skit@gmail.com is required.'));
  }

  return new Promise((resolve, reject) => {
    let resolved = false;
    const socket = tls.connect(GMAIL_PORT, GMAIL_HOST, { rejectUnauthorized: true }, () => {
      let state = 'CONNECTED';
      let buffer = '';

      const timer = setTimeout(() => {
        cleanup(new Error('SMTP timeout while dispatching email via Gmail.'));
      }, 30000);

      function cleanup(err) {
        clearTimeout(timer);
        if (!resolved) {
          resolved = true;
          try { socket.destroy(); } catch (e) {}
          if (err) reject(err);
        }
      }

      socket.on('error', cleanup);
      socket.on('close', () => {
        if (!resolved) cleanup(new Error('Connection closed prematurely by Gmail server during email dispatch.'));
      });

      socket.on('data', chunk => {
        buffer += chunk.toString('utf-8');
        const lines = buffer.split('\r\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line) continue;
          const code = parseInt(line.slice(0, 3), 10);
          const isFinal = line.charAt(3) === ' ';
          if (!isFinal) continue;

          if (code >= 400) {
            cleanup(new Error(`Gmail SMTP delivery failed (${code}): ${line}`));
            return;
          }

          if (state === 'CONNECTED' && code === 220) {
            state = 'EHLO';
            socket.write('EHLO localhost\r\n');
          } else if (state === 'EHLO' && code === 250) {
            state = 'AUTH';
            socket.write('AUTH LOGIN\r\n');
          } else if (state === 'AUTH' && code === 334) {
            state = 'USER';
            socket.write(Buffer.from(cleanSender).toString('base64') + '\r\n');
          } else if (state === 'USER' && code === 334) {
            state = 'PASS';
            socket.write(Buffer.from(cleanPass).toString('base64') + '\r\n');
          } else if (state === 'PASS' && code === 235) {
            state = 'MAIL_FROM';
            socket.write(`MAIL FROM:<${cleanSender}>\r\n`);
          } else if (state === 'MAIL_FROM' && code === 250) {
            state = 'RCPT_TO';
            socket.write(`RCPT TO:<${cleanRecipient}>\r\n`);
          } else if (state === 'RCPT_TO' && code === 250) {
            state = 'DATA';
            socket.write('DATA\r\n');
          } else if (state === 'DATA' && code === 354) {
            state = 'SENDING_BODY';

            const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
            const safeSubject = Buffer.from(subject || 'Your Certificate of Participation — AWS Student Builder Group SKIT').toString('base64');
            const safeName = recipientName ? `"${recipientName.replace(/"/g, '')}" ` : '';
            const normalizedBody = (body || '')
              .replace(/\r\n/g, '\n')
              .replace(/\n/g, '\r\n')
              .replace(/^\./gm, '..');

            let rawData = '';
            rawData += `From: AWS Student Builder Group SKIT <${cleanSender}>\r\n`;
            rawData += `To: ${safeName}<${cleanRecipient}>\r\n`;
            rawData += `Reply-To: ${cleanSender}\r\n`;
            rawData += `Subject: =?UTF-8?B?${safeSubject}?=\r\n`;
            rawData += `MIME-Version: 1.0\r\n`;

            if (attachmentBase64) {
              let cleanB64 = attachmentBase64;
              if (cleanB64.includes(',')) {
                cleanB64 = cleanB64.split(',')[1];
              }
              cleanB64 = cleanB64.replace(/[\r\n\s]+/g, '');
              const chunkedB64 = cleanB64.match(/.{1,76}/g)?.join('\r\n') || cleanB64;
              const safeFilename = (attachmentFilename || 'AWS_Certificate.png').replace(/"/g, '');

              rawData += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;
              rawData += `--${boundary}\r\n`;
              rawData += `Content-Type: text/plain; charset=UTF-8\r\n`;
              rawData += `Content-Transfer-Encoding: 8bit\r\n\r\n`;
              rawData += normalizedBody + '\r\n\r\n';

              rawData += `--${boundary}\r\n`;
              rawData += `Content-Type: application/octet-stream; name="${safeFilename}"\r\n`;
              rawData += `Content-Disposition: attachment; filename="${safeFilename}"\r\n`;
              rawData += `Content-Transfer-Encoding: base64\r\n\r\n`;
              rawData += chunkedB64 + '\r\n\r\n';
              rawData += `--${boundary}--\r\n`;
            } else {
              rawData += `Content-Type: text/plain; charset=UTF-8\r\n`;
              rawData += `Content-Transfer-Encoding: 8bit\r\n\r\n`;
              rawData += normalizedBody + '\r\n';
            }

            rawData += '\r\n.\r\n';
            socket.write(rawData);
          } else if (state === 'SENDING_BODY' && code === 250) {
            clearTimeout(timer);
            resolved = true;
            try { socket.end('QUIT\r\n'); } catch (e) {}
            resolve({
              success: true,
              message: `Certificate successfully emailed to ${cleanRecipient} from ${cleanSender}`,
              recipient: cleanRecipient
            });
            return;
          }
        }
      });
    });
  });
}

module.exports = {
  DEFAULT_SENDER,
  testSmtp,
  sendMail
};
