/**
 * AWS SBG SKIT - Automated Certificate Engine
 * High-Resolution Canvas Renderer with Dynamic QR Code & Verifiable Credentials
 */

(function (window) {
  'use strict';

  // Standard A4 Landscape Dimensions at 96 DPI: 1123 x 794
  const CANVAS_WIDTH = 1123;
  const CANVAS_HEIGHT = 794;

  const TEMPLATES = {
    format1: {
      id: 'format1',
      name: 'Dark Builder (Green Accent)',
      bgUrl: 'assets/certificates/template1.png',
      theme: 'dark',
      bgColor: '#161d26',
      cardX: 580,
      cardY: 420,
      cardWidth: 490,
      cardHeight: 200,
      textColor: '#ffffff',
      subTextColor: '#cbd5e1',
      accentColor: '#00e676',
      badgeBg: 'rgba(0, 230, 118, 0.1)',
      badgeBorder: 'rgba(0, 230, 118, 0.4)',
      qrDark: '#ffffff',
      qrLight: '#161d26'
    },
    format2: {
      id: 'format2',
      name: 'Light Cloud (Purple Accent)',
      bgUrl: 'assets/certificates/template2.png',
      theme: 'light',
      bgColor: '#ffffff',
      cardX: 580,
      cardY: 420,
      cardWidth: 490,
      cardHeight: 200,
      textColor: '#111827',
      subTextColor: '#4b5563',
      accentColor: '#9333ea',
      badgeBg: 'rgba(147, 51, 234, 0.08)',
      badgeBorder: 'rgba(147, 51, 234, 0.35)',
      qrDark: '#9333ea',
      qrLight: '#ffffff'
    }
  };

  // Image cache
  const imageCache = {};

  function loadImage(src) {
    if (imageCache[src]) {
      return Promise.resolve(imageCache[src]);
    }
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imageCache[src] = img;
        resolve(img);
      };
      img.onerror = (err) => reject(new Error('Failed to load certificate template: ' + src));
      img.src = src;
    });
  }

  function generateUniqueCertId() {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const year = new Date().getFullYear();
    return `AWS-SBG-SKIT-${year}-${code}`;
  }

  function getLiveVerifyBaseUrl() {
    if (typeof window !== 'undefined' && window.location) {
      const host = window.location.hostname;
      // If deployed live on a public domain (not localhost / private IP), use current origin
      if (host && host !== 'localhost' && host !== '127.0.0.1' && !host.startsWith('192.168.') && !host.startsWith('10.') && !host.endsWith('.local')) {
        return window.location.origin;
      }
    }
    // Default to official live production URL so QR codes and links generated locally work on phones & web!
    return 'https://aws-sbg-skit.vercel.app';
  }

  function formatCertDate(dateInput) {
    if (!dateInput) return '15 Nov, 2026';
    const str = String(dateInput).trim();
    // Remove ordinal suffixes (15th -> 15, 22nd -> 22, 1st -> 1, 3rd -> 3)
    const cleaned = str.replace(/(\d+)(st|nd|rd|th)/gi, '$1');
    const parsed = new Date(cleaned);
    if (!isNaN(parsed.getTime())) {
      const day = parsed.getDate();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[parsed.getMonth()];
      const year = parsed.getFullYear();
      return `${day} ${month}, ${year}`;
    }
    // Fallback regex matching (e.g. 15 Nov, 2026)
    const match = str.match(/(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)[,\s]+(\d{4})/i);
    if (match) {
      const shortMon = match[2].slice(0, 3);
      return `${match[1]} ${shortMon.charAt(0).toUpperCase() + shortMon.slice(1).toLowerCase()}, ${match[3]}`;
    }
    return str;
  }

  function buildRoleParagraph(role, eventTitle, description, dateStr, customText) {
    if (role === 'custom' && customText && customText.trim()) {
      return customText.trim();
    }

    const cleanTitle = (eventTitle || 'AWS Community Session').trim();
    // Event description limit capped strictly to 40 characters
    let cleanDesc = (description || '').trim();
    if (cleanDesc.length > 40) {
      cleanDesc = cleanDesc.slice(0, 40).trim();
    }
    const descPart = cleanDesc ? `, ${cleanDesc}` : '';
    const cleanDate = formatCertDate(dateStr);

    switch (role) {
      case 'volunteer':
        return `for serving as a Volunteer for ${cleanTitle}${descPart} held on ${cleanDate}.`;
      case 'coordinator':
        return `for successfully coordinating ${cleanTitle}${descPart} held on ${cleanDate}.`;
      case 'speaker':
        return `for delivering an expert session on ${cleanTitle}${descPart} held on ${cleanDate}.`;
      case 'winner':
        return `for outstanding achievement and winning in ${cleanTitle}${descPart} held on ${cleanDate}.`;
      case 'participant':
      default:
        return `for attending the ${cleanTitle}${descPart} held on ${cleanDate}.`;
    }
  }

  function wrapText(ctx, text, maxWidth) {
    const words = text.split(/\s+/);
    const lines = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  class CertificateEngine {
    constructor() {
      this.templates = TEMPLATES;
      this.customTemplates = {};
    }

    getTemplates() {
      return { ...this.templates, ...this.customTemplates };
    }

    setCustomTemplate(key, data) {
      this.customTemplates[key] = data;
    }

    async preload() {
      const promises = Object.values(this.templates).map(t => loadImage(t.bgUrl).catch(() => null));
      return Promise.all(promises);
    }

    async renderCertificate(options = {}) {
      const {
        attendeeName = 'Student Builder',
        eventTitle = 'AWS Cloud Workshop',
        eventDescription = '',
        eventDate = '15th Nov, 2026',
        role = 'participant',
        customText = '',
        templateKey = 'format1',
        certificateId = generateUniqueCertId(),
        verifyBaseUrl = ''
      } = options;

      // Determine effective live verification base URL (defaulting to live domain, never localhost)
      let effectiveBaseUrl = (verifyBaseUrl || '').trim();
      if (!effectiveBaseUrl || effectiveBaseUrl.includes('localhost') || effectiveBaseUrl.includes('127.0.0.1')) {
        effectiveBaseUrl = getLiveVerifyBaseUrl();
      }
      effectiveBaseUrl = effectiveBaseUrl.replace(/\/+$/, '');

      const tpl = this.getTemplates()[templateKey] || this.templates.format1;

      // Create High-Res Canvas
      const canvas = document.createElement('canvas');
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;
      const ctx = canvas.getContext('2d');

      // Enable smooth text & image rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // 1. Draw Background Template Image
      try {
        const bgImg = await loadImage(tpl.bgUrl);
        ctx.drawImage(bgImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      } catch (err) {
        console.warn('Could not load template background image, using fallback vector:', err);
        ctx.fillStyle = tpl.bgColor;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      // 2. Clear Placeholder Text Region
      // Bounding box (575 to 1090, 415 to 630) cleanly clears "Proudly present to",
      // placeholder name and old description while leaving Tracy Wang's signature at y=635 intact.
      const cardCenterX = 832;
      ctx.fillStyle = tpl.bgColor;
      ctx.fillRect(575, 415, 515, 215);

      // Re-draw single crisp "Proudly present to"
      ctx.fillStyle = tpl.theme === 'dark' ? '#94a3b8' : '#475569';
      ctx.font = '600 13px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '2px';
      ctx.fillText('Proudly present to', cardCenterX, 444);

      // 3. Draw Dynamic Participant Name in Bold Crisp Typography
      const cleanName = (attendeeName || 'Student Builder').trim();
      let nameFontSize = 32;
      if (cleanName.length > 28) nameFontSize = 23;
      else if (cleanName.length > 20) nameFontSize = 27;

      ctx.fillStyle = tpl.theme === 'dark' ? '#ffffff' : '#090d16';
      ctx.font = `800 ${nameFontSize}px "Space Grotesk", -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.letterSpacing = '0.5px';
      ctx.fillText(cleanName, cardCenterX, 492);

      // 4. Draw Role & Event Description Paragraph
      const paragraphText = buildRoleParagraph(role, eventTitle, eventDescription, eventDate, customText);
      ctx.fillStyle = tpl.theme === 'dark' ? '#cbd5e1' : '#334155';
      ctx.font = '500 13.5px "Space Grotesk", -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '0.1px';

      const maxTextWidth = 460;
      const lines = wrapText(ctx, paragraphText, maxTextWidth);
      const lineHeight = 21;
      const startY = 530;

      lines.forEach((line, idx) => {
        ctx.fillText(line, cardCenterX, startY + (idx * lineHeight));
      });

      // 5. Draw Monospace Verifiable ID Badge (positioned safely at y=598 above signature)
      const cleanId = (certificateId || generateUniqueCertId()).toUpperCase();
      ctx.textAlign = 'center';
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.letterSpacing = '1px';
      ctx.fillStyle = tpl.theme === 'dark' ? '#00e676' : '#9333ea';
      ctx.fillText(`ID: ${cleanId}`, cardCenterX, 598);

      // 6. Draw Real Verifiable QR Code
      const verifyUrl = `${effectiveBaseUrl}/verify.html?id=${encodeURIComponent(cleanId)}`;
      try {
        if (typeof window.qrcode === 'function') {
          const qr = window.qrcode(0, 'M');
          qr.addData(verifyUrl);
          qr.make();
          const moduleCount = qr.getModuleCount();
          const qrSize = 54;
          const cellSize = qrSize / moduleCount;
          const qrX = 992;
          const qrY = 642;

          // QR Code Background Box
          ctx.fillStyle = tpl.bgColor;
          ctx.fillRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8);
          ctx.strokeStyle = tpl.badgeBorder;
          ctx.lineWidth = 1;
          ctx.strokeRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8);

          // Draw QR Modules
          for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
              ctx.fillStyle = qr.isDark(row, col) ? (tpl.qrDark || (tpl.theme === 'dark' ? '#ffffff' : '#111827')) : tpl.bgColor;
              ctx.fillRect(qrX + col * cellSize, qrY + row * cellSize, Math.ceil(cellSize), Math.ceil(cellSize));
            }
          }

          // Small "SCAN TO VERIFY" caption below QR
          ctx.fillStyle = tpl.theme === 'dark' ? '#94a3b8' : '#475569';
          ctx.font = '600 7.5px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('SCAN TO VERIFY', qrX + (qrSize / 2), qrY + qrSize + 9);

          // Render live verification site domain below QR caption
          const displayDomain = effectiveBaseUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '');
          ctx.fillStyle = tpl.theme === 'dark' ? 'rgba(148, 163, 184, 0.75)' : 'rgba(71, 85, 105, 0.75)';
          ctx.font = '500 6.5px "JetBrains Mono", monospace';
          ctx.fillText(displayDomain, qrX + (qrSize / 2), qrY + qrSize + 19);
        }
      } catch (qrErr) {
        console.warn('QR Code rendering skipped:', qrErr);
      }

      return {
        canvas,
        certificateId: cleanId,
        templateKey,
        verifyUrl,
        verifyBaseUrl: effectiveBaseUrl,
        dataUrl: canvas.toDataURL('image/png')
      };
    }

    downloadPng(canvas, filename = 'certificate.png') {
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    downloadPdf(canvas, filename = 'certificate.pdf') {
      if (window.jspdf && window.jspdf.jsPDF) {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
        pdf.save(filename);
      } else {
        // Fallback to PNG download if jsPDF not available
        this.downloadPng(canvas, filename.replace('.pdf', '.png'));
      }
    }
  }

  const engineInstance = new CertificateEngine();
  engineInstance.generateUniqueCertId = generateUniqueCertId;
  engineInstance.getLiveVerifyBaseUrl = getLiveVerifyBaseUrl;
  engineInstance.formatCertDate = formatCertDate;

  window.AwsCertificateEngine = engineInstance;

})(window);

