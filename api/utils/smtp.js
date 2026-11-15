/**
 * AWS SBG SKIT - Zero-Dependency Pure Node.js SMTP Client for Gmail SSL (Port 465)
 * Fully compatible with Vercel Serverless Functions and local Node environments.
 */

const tls = require('tls');

const DEFAULT_SENDER = 'aws.sbg.skit@gmail.com';
const GMAIL_HOST = 'smtp.gmail.com';
const GMAIL_PORT = 465;

function createSmtpSession(sender, appPassword) {
  const cleanSender = (sender || DEFAULT_SENDER).trim();
  const cleanPass = (appPassword || '').trim().replace(/\s+/g, '');

  if (!cleanPass) {
    return Promise.reject(new Error('Google App Password is required. Please generate a 16-character App Password at Google Account > Security > App Passwords.'));
  }

  return new Promise((resolve, reject) => {
    let resolved = false;
    const socket = tls.connect(GMAIL_PORT, GMAIL_HOST, { rejectUnauthorized: true }, () => {
      let state = 'CONNECTED';
      let buffer = '';

      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          socket.destroy();
          reject(new Error('Connection timed out waiting for Gmail SMTP response.'));
        }
      }, 15000);

      function cleanup(err) {
        clearTimeout(timer);
        if (!resolved) {
          resolved = true;
          if (err) reject(err);
        }
      }

      socket.on('error', cleanup);
      socket.on('close', () => {
        cleanup(new Error('Connection closed prematurely by Gmail server.'));
      });

      socket.on('data', chunk => {
        buffer += chunk.toString('utf-8');
        const lines = buffer.split('\r\n');
        buffer = lines.pop(); // keep remainder

        for (const line of lines) {
          if (!line) continue;
          const code = parseInt(line.slice(0, 3), 10);
          const isFinal = line.charAt(3) === ' ';
          if (!isFinal) continue; // skip multi-line continuation (e.g. 250-...)

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
          } else if (state === 'PASS') {
            if (code === 235) {
              clearTimeout(timer);
              resolved = true;
              resolve({ socket, sender: cleanSender });
              return;
            } else {
              socket.end('QUIT\r\n');
              cleanup(new Error(`Authentication failed for ${cleanSender}: Please ensure you are using a 16-character Google App Password (not your personal Google account password). Details: ${line}`));
              return;
            }
          } else if (code >= 400) {
            socket.end('QUIT\r\n');
            cleanup(new Error(`Gmail SMTP error (Code ${code}): ${line}`));
            return;
          }
        }
      });
    });
  });
}

async function testSmtp(sender, appPassword) {
  const session = await createSmtpSession(sender, appPassword);
  session.socket.end('QUIT\r\n');
  return {
    success: true,
    message: `Successfully verified Gmail connection for ${session.sender}!`
  };
}

async function sendMail({ sender, appPassword, recipient, recipientName, subject, body, attachmentBase64, attachmentFilename }) {
  if (!recipient || !recipient.trim()) {
    throw new Error('Recipient email address is required.');
  }

  const session = await createSmtpSession(sender, appPassword);
  const { socket, sender: cleanSender } = session;

  return new Promise((resolve, reject) => {
    let state = 'MAIL_FROM';
    let buffer = '';

    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error('Timeout while sending message data to Gmail.'));
    }, 25000);

    socket.write(`MAIL FROM:<${cleanSender}>\r\n`);

    socket.on('data', chunk => {
      buffer += chunk.toString('utf-8');
      const lines = buffer.split('\r\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (!line) continue;
        const code = parseInt(line.slice(0, 3), 10);
        const isFinal = line.charAt(3) === ' ';
        if (!isFinal) continue;

        if (state === 'MAIL_FROM' && code === 250) {
          state = 'RCPT_TO';
          socket.write(`RCPT TO:<${recipient.trim()}>\r\n`);
        } else if (state === 'RCPT_TO' && code === 250) {
          state = 'DATA';
          socket.write('DATA\r\n');
        } else if (state === 'DATA' && code === 354) {
          state = 'SENDING_BODY';

          const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
          let rawData = '';

          rawData += `From: AWS Student Builder Group SKIT <${cleanSender}>\r\n`;
          rawData += `To: ${recipientName ? `"${recipientName.replace(/"/g, '')}" ` : ''}<${recipient.trim()}>\r\n`;
          rawData += `Reply-To: ${cleanSender}\r\n`;
          rawData += `Subject: =?utf-8?B?${Buffer.from(subject || 'Your Certificate').toString('base64')}?=\r\n`;
          rawData += `MIME-Version: 1.0\r\n`;

          if (attachmentBase64) {
            rawData += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;
            rawData += `--${boundary}\r\n`;
            rawData += `Content-Type: text/plain; charset=utf-8\r\n`;
            rawData += `Content-Transfer-Encoding: 8bit\r\n\r\n`;
            rawData += (body || '') + '\r\n\r\n';

            // Attachment part
            let cleanB64 = attachmentBase64;
            if (cleanB64.includes(',')) {
              cleanB64 = cleanB64.split(',')[1];
            }
            cleanB64 = cleanB64.replace(/\s+/g, '');
            const chunkedB64 = cleanB64.match(/.{1,76}/g)?.join('\r\n') || cleanB64;
            const safeFilename = (attachmentFilename || 'AWS_Certificate.png').replace(/"/g, '');

            rawData += `--${boundary}\r\n`;
            rawData += `Content-Type: application/octet-stream; name="${safeFilename}"\r\n`;
            rawData += `Content-Disposition: attachment; filename="${safeFilename}"\r\n`;
            rawData += `Content-Transfer-Encoding: base64\r\n\r\n`;
            rawData += chunkedB64 + '\r\n\r\n';
            rawData += `--${boundary}--\r\n`;
          } else {
            rawData += `Content-Type: text/plain; charset=utf-8\r\n`;
            rawData += `Content-Transfer-Encoding: 8bit\r\n\r\n`;
            rawData += (body || '') + '\r\n';
          }

          rawData += '\r\n.\r\n';
          socket.write(rawData);
        } else if (state === 'SENDING_BODY' && code === 250) {
          clearTimeout(timer);
          socket.end('QUIT\r\n');
          resolve({
            success: true,
            message: `Certificate successfully emailed to ${recipient} from ${cleanSender}`,
            recipient: recipient.trim()
          });
          return;
        } else if (code >= 400) {
          clearTimeout(timer);
          socket.end('QUIT\r\n');
          reject(new Error(`Gmail SMTP delivery failed (Code ${code}): ${line}`));
          return;
        }
      }
    });

    socket.on('error', err => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

module.exports = {
  DEFAULT_SENDER,
  testSmtp,
  sendMail
};
