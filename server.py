"""
AWS SBG SKIT - Local Dev & Certificate Dispatch Server
Serves static assets and provides Gmail SMTP email dispatch API for aws.sbg.skit@gmail.com
"""

import http.server
import socketserver
import json
import base64
import smtplib
import sys
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

PORT = 8080
DEFAULT_SENDER = "aws.sbg.skit@gmail.com"

class SbgHttpHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and disable aggressive caching for local testing
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200, "OK")
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)

        try:
            payload = json.loads(post_data.decode('utf-8'))
        except Exception as e:
            self._send_json(400, {"success": False, "error": f"Invalid JSON payload: {str(e)}"})
            return

        if self.path == '/api/test-smtp':
            self._handle_test_smtp(payload)
        elif self.path == '/api/send-certificate':
            self._handle_send_certificate(payload)
        elif self.path == '/api/save-certificates':
            self._handle_save_certificates(payload)
        else:
            self._send_json(404, {"success": False, "error": f"Endpoint not found: {self.path}"})

    def _send_json(self, status_code, data):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def _handle_test_smtp(self, payload):
        sender = (payload.get('sender_email') or DEFAULT_SENDER).strip()
        app_password = (payload.get('app_password') or "").strip().replace(" ", "")

        if not app_password:
            self._send_json(400, {
                "success": False,
                "error": "Google App Password is required. Generate one at Google Account > Security > App Passwords."
            })
            return

        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10) as server:
                server.login(sender, app_password)
            self._send_json(200, {
                "success": True,
                "message": f"Successfully connected to Gmail SMTP as {sender}!"
            })
        except smtplib.SMTPAuthenticationError as auth_err:
            self._send_json(401, {
                "success": False,
                "error": f"Authentication failed for {sender}. Please verify that you are using a 16-character Google App Password (not your personal Google account password). Details: {str(auth_err)}"
            })
        except Exception as e:
            self._send_json(500, {
                "success": False,
                "error": f"SMTP Connection error: {str(e)}"
            })

    def _handle_save_certificates(self, payload):
        """
        Saves or updates certificate records in data/certificates.json so they are permanently
        persisted on disk and committed to the Git repository for live verification forever.
        """
        certs_to_save = payload.get('certificates') if isinstance(payload, dict) and 'certificates' in payload else (
            payload.get('certificate') if isinstance(payload, dict) and 'certificate' in payload else payload
        )
        if isinstance(certs_to_save, dict):
            certs_to_save = [certs_to_save]
        elif not isinstance(certs_to_save, list):
            self._send_json(400, {"success": False, "error": "Payload must be a certificate object or a list of certificates."})
            return

        json_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'certificates.json')
        os.makedirs(os.path.dirname(json_path), exist_ok=True)

        existing = []
        if os.path.exists(json_path):
            try:
                with open(json_path, 'r', encoding='utf-8') as f:
                    content = f.read().strip()
                    if content:
                        existing = json.loads(content)
            except Exception as e:
                print(f"[WARN] Failed to read existing certificates.json: {e}")
                existing = []

        # Index existing by cert id
        cert_map = {}
        for c in existing:
            cid = str(c.get('id') or '').strip().upper()
            if cid:
                cert_map[cid] = c

        # Merge new incoming certs
        updated_count = 0
        for item in certs_to_save:
            if not isinstance(item, dict):
                continue
            cid = str(item.get('id') or '').strip().upper()
            if not cid:
                continue
            if cid in cert_map:
                cert_map[cid].update(item)
            else:
                cert_map[cid] = item
            updated_count += 1

        all_certs = list(cert_map.values())
        # Sort by createdAt descending
        all_certs.sort(key=lambda x: str(x.get('createdAt') or x.get('issueDate') or ''), reverse=True)

        try:
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(all_certs, f, ensure_ascii=False, indent=2)
            print(f"[REGISTRY SAVED] Saved {updated_count} certs. Total in data/certificates.json: {len(all_certs)}")
            self._send_json(200, {
                "success": True,
                "message": f"Successfully persisted {updated_count} certificates in data/certificates.json",
                "totalCount": len(all_certs)
            })
        except Exception as e:
            self._send_json(500, {"success": False, "error": f"Failed to write certificates.json: {str(e)}"})

    def _handle_send_certificate(self, payload):
        sender = (payload.get('sender_email') or DEFAULT_SENDER).strip()
        app_password = (payload.get('app_password') or "").strip().replace(" ", "")
        recipient_email = (payload.get('recipient_email') or "").strip()
        recipient_name = (payload.get('recipient_name') or "Student Builder").strip()
        subject = payload.get('subject') or f"Certificate of Participation — AWS Student Builder Group SKIT"
        body_text = payload.get('body') or ""
        attachment_b64 = payload.get('attachment_base64') or ""
        attachment_filename = payload.get('attachment_filename') or "AWS_Certificate.png"

        if not recipient_email:
            self._send_json(400, {"success": False, "error": "Recipient email is required."})
            return

        if not app_password:
            self._send_json(400, {
                "success": False,
                "error": "Google App Password for aws.sbg.skit@gmail.com is required to send emails."
            })
            return

        try:
            msg = MIMEMultipart()
            msg['From'] = f"AWS Student Builder Group SKIT <{sender}>"
            msg['To'] = recipient_email
            msg['Subject'] = subject
            msg['Reply-To'] = sender

            # Email body
            msg.attach(MIMEText(body_text, 'plain', 'utf-8'))

            # Optional attachment (PNG or PDF from Base64)
            if attachment_b64:
                # Strip data URL prefix if present (e.g. data:image/png;base64,)
                if ',' in attachment_b64:
                    attachment_b64 = attachment_b64.split(',', 1)[1]

                raw_bytes = base64.b64decode(attachment_b64)
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(raw_bytes)
                encoders.encode_base64(part)
                part.add_header('Content-Disposition', f'attachment; filename="{attachment_filename}"')
                msg.attach(part)

            with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=15) as server:
                server.login(sender, app_password)
                server.send_message(msg)

            print(f"[MAIL SENT] To: {recipient_email} | Attachment: {attachment_filename}")
            self._send_json(200, {
                "success": True,
                "message": f"Certificate successfully emailed to {recipient_email} from {sender}",
                "recipient": recipient_email
            })

        except smtplib.SMTPAuthenticationError as auth_err:
            self._send_json(401, {
                "success": False,
                "error": f"Authentication failed for {sender}. Please ensure your 16-character App Password is correct: {str(auth_err)}"
            })
        except Exception as e:
            print(f"[MAIL ERROR] {recipient_email}: {str(e)}")
            self._send_json(500, {
                "success": False,
                "error": f"Failed to send email to {recipient_email}: {str(e)}"
            })

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), SbgHttpHandler) as httpd:
        print(f"AWS SBG SKIT Server running at http://localhost:{PORT}")
        print(f"Serving static files and Gmail SMTP API (sender: {DEFAULT_SENDER})")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")

if __name__ == '__main__':
    main()

