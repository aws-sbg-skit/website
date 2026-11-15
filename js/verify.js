/**
 * AWS SBG SKIT - Certificate Verification Portal Controller
 */

(function () {
  'use strict';

  const service = window.AwsSbgEventsService;
  const engine = window.AwsCertificateEngine;

  const verifyForm = document.getElementById('verifyForm');
  const certSearchInput = document.getElementById('certSearchInput');
  const verifySearchBtn = document.getElementById('verifySearchBtn');
  const verifyResultContainer = document.getElementById('verifyResultContainer');
  const verifyExplainerCards = document.getElementById('verifyExplainerCards');

  let activeRenderedCanvas = null;

  async function handleVerification(certId) {
    if (!certId || !certId.trim()) return;
    const cleanId = certId.trim().toUpperCase();

    // Update UI state
    verifySearchBtn.disabled = true;
    verifySearchBtn.innerHTML = '<span>Verifying...</span>';
    verifyResultContainer.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
        <div style="font-size: 24px; margin-bottom: 12px; animation: spin 1s linear infinite;">⏳</div>
        <p>Querying AWS SBG SKIT Verified Credential Registry...</p>
      </div>
    `;

    try {
      // Lookup certificate
      const cert = await service.getCertificateById(cleanId);

      if (cert) {
        renderValidCertificate(cert);
      } else {
        renderInvalidCertificate(cleanId);
      }
    } catch (err) {
      console.error('Verification error:', err);
      renderInvalidCertificate(cleanId, err.message);
    } finally {
      verifySearchBtn.disabled = false;
      verifySearchBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <span>Verify</span>
      `;
    }
  }

  async function renderValidCertificate(cert) {
    const issueDateStr = cert.issueDate || '2026';
    const cleanRole = formatRoleName(cert.role);
    const liveBaseUrl = (engine && typeof engine.getLiveVerifyBaseUrl === 'function')
      ? engine.getLiveVerifyBaseUrl()
      : (service && typeof service.getLiveVerifyBaseUrl === 'function' ? service.getLiveVerifyBaseUrl() : 'https://aws-sbg-skit.vercel.app');
    const verifyUrl = `${liveBaseUrl}/verify.html?id=${encodeURIComponent(cert.id)}`;

    // Build LinkedIn Add-To-Profile URL
    const linkedinUrl = buildLinkedInCertUrl(cert, verifyUrl);

    verifyResultContainer.innerHTML = `
      <div class="verify-result-card">
        <div class="verify-status-banner is-valid">
          <div class="status-indicator">
            <div class="status-icon">✓</div>
            <div>
              <div class="status-title">Verified Authentic Certificate</div>
              <div style="font-size: 12px; color: var(--text-muted);">Official AWS Student Builder Group Credential</div>
            </div>
          </div>
          <div class="verify-id-pill">
            <span>ID: <strong>${escapeHTML(cert.id)}</strong></span>
          </div>
        </div>

        <div class="verify-details-grid">
          <div class="verify-meta-item">
            <span class="verify-meta-label">Recipient Name</span>
            <span class="verify-meta-value" style="color: #fff; font-size: 18px;">${escapeHTML(cert.attendeeName)}</span>
          </div>

          <div class="verify-meta-item">
            <span class="verify-meta-label">Credential Track / Role</span>
            <span class="verify-meta-value" style="color: var(--aws-green);">${escapeHTML(cleanRole)}</span>
          </div>

          <div class="verify-meta-item">
            <span class="verify-meta-label">Event / Activity</span>
            <span class="verify-meta-value">${escapeHTML(cert.eventTitle || 'AWS Community Session')}</span>
          </div>

          <div class="verify-meta-item">
            <span class="verify-meta-label">Date of Issuance</span>
            <span class="verify-meta-value">${escapeHTML(issueDateStr)}</span>
          </div>

          <div class="verify-meta-item">
            <span class="verify-meta-label">Issuing Organization</span>
            <span class="verify-meta-value">AWS Student Builder Group &bull; SKIT</span>
          </div>
        </div>

        <!-- Live Canvas Preview Section -->
        <div class="verify-preview-section">
          <div class="verify-preview-frame" id="verifyCanvasHolder">
            <div style="padding: 40px; color: var(--text-muted);">Generating high-resolution view...</div>
          </div>

          <div class="verify-actions">
            <button type="button" class="btn-verify-action btn-download-primary" id="downloadPngBtn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Download Official PNG</span>
            </button>

            <button type="button" class="btn-verify-action" id="downloadPdfBtn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <span>Download PDF</span>
            </button>

            <a href="${escapeHTML(linkedinUrl)}" target="_blank" rel="noopener" class="btn-verify-action btn-linkedin">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              <span>Add to LinkedIn</span>
            </a>

            <button type="button" class="btn-verify-action" id="copyShareLinkBtn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
              <span>Copy Link</span>
            </button>
          </div>
        </div>
      </div>
    `;

    // Render Certificate on Canvas
    try {
      const renderResult = await engine.renderCertificate({
        attendeeName: cert.attendeeName,
        eventTitle: cert.eventTitle,
        eventDescription: cert.description,
        eventDate: cert.issueDate,
        role: cert.role,
        customText: cert.customText,
        templateKey: cert.templateKey || 'format1',
        certificateId: cert.id,
        verifyBaseUrl: liveBaseUrl
      });

      activeRenderedCanvas = renderResult.canvas;
      const holder = document.getElementById('verifyCanvasHolder');
      if (holder) {
        holder.innerHTML = '';
        holder.appendChild(activeRenderedCanvas);
      }

      // Attach download listeners
      const downloadPngBtn = document.getElementById('downloadPngBtn');
      if (downloadPngBtn) {
        downloadPngBtn.addEventListener('click', () => {
          const filename = `AWS-SBG-Certificate-${cert.attendeeName.replace(/[^a-zA-Z0-9]/g, '_')}-${cert.id}.png`;
          engine.downloadPng(activeRenderedCanvas, filename);
        });
      }

      const downloadPdfBtn = document.getElementById('downloadPdfBtn');
      if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', () => {
          const filename = `AWS-SBG-Certificate-${cert.attendeeName.replace(/[^a-zA-Z0-9]/g, '_')}-${cert.id}.pdf`;
          engine.downloadPdf(activeRenderedCanvas, filename);
        });
      }

      const copyShareLinkBtn = document.getElementById('copyShareLinkBtn');
      if (copyShareLinkBtn) {
        copyShareLinkBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(verifyUrl).then(() => {
            copyShareLinkBtn.innerHTML = `<span>✓ Copied!</span>`;
            setTimeout(() => {
              copyShareLinkBtn.innerHTML = `
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
                <span>Copy Link</span>
              `;
            }, 2000);
          });
        });
      }
    } catch (renderErr) {
      console.warn('Canvas render error:', renderErr);
    }

    if (verifyExplainerCards) verifyExplainerCards.style.display = 'none';
  }

  function renderInvalidCertificate(cleanId, customMessage) {
    verifyResultContainer.innerHTML = `
      <div class="verify-result-card">
        <div class="verify-status-banner is-invalid">
          <div class="status-indicator">
            <div class="status-icon">✕</div>
            <div>
              <div class="status-title">Certificate Not Found</div>
              <div style="font-size: 12px; color: var(--text-muted);">No official credential matches the entered identifier</div>
            </div>
          </div>
          <div class="verify-id-pill">
            <span>Query: <code>${escapeHTML(cleanId)}</code></span>
          </div>
        </div>

        <div style="padding: 32px 24px; text-align: center;">
          <h3 style="margin: 0 0 10px; font-size: 18px; color: #fff;">Invalid or Unrecognized Certificate ID</h3>
          <p style="color: var(--text-muted); font-size: 14px; max-width: 520px; margin: 0 auto 20px; line-height: 1.6;">
            ${customMessage || 'We could not locate a credential with this ID in the AWS SBG SKIT registry. Please double-check for any typos, or contact the student builder community coordinators.'}
          </p>
          <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=aws.sbg.skit@gmail.com&su=Certificate%20Verification%20Inquiry%20${encodeURIComponent(cleanId)}" target="_blank" rel="noopener noreferrer" class="btn-verify-action">
              ✉️ Contact Admin
            </a>
            <a href="index.html#events" class="btn-verify-action">
              Explore SKIT Events
            </a>
          </div>
        </div>
      </div>
    `;
    if (verifyExplainerCards) verifyExplainerCards.style.display = 'grid';
  }

  function formatRoleName(role) {
    switch (role) {
      case 'volunteer': return 'Volunteer Contribution';
      case 'coordinator': return 'Event Lead & Coordinator';
      case 'speaker': return 'Speaker & Session Lead';
      case 'winner': return 'Competition Winner';
      case 'participant':
      default:
        return 'Participant';
    }
  }

  function buildLinkedInCertUrl(cert, certUrl) {
    const certName = encodeURIComponent((cert.eventTitle || 'AWS Cloud Session') + ' — AWS SBG SKIT');
    const orgName = encodeURIComponent('AWS Student Builder Group SKIT');
    const certId = encodeURIComponent(cert.id || '');
    const url = encodeURIComponent(certUrl);

    // Extract year & month from issueDate if possible
    const now = new Date();
    const issueYear = now.getFullYear();
    const issueMonth = now.getMonth() + 1;

    return `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${certName}&organizationName=${orgName}&issueYear=${issueYear}&issueMonth=${issueMonth}&certUrl=${url}&certId=${certId}`;
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // URL Query Param Inspection on Page Load
  function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const paramId = urlParams.get('id') || window.location.hash.replace('#', '');
    if (paramId && paramId.trim()) {
      certSearchInput.value = paramId.trim();
      handleVerification(paramId.trim());
    }

    verifyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = certSearchInput.value.trim();
      if (id) {
        // Update URL query string without reloading
        const newUrl = `${window.location.pathname}?id=${encodeURIComponent(id)}`;
        window.history.pushState({ id }, '', newUrl);
        handleVerification(id);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

