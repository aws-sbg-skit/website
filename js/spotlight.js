/**
 * Builders Spotlight - Hall of Fame Bento Showcase Interactive Handler
 * Adds interactive photo lightbox and micro-animations for the Hall of Fame champions
 */

(function () {
  function initHallOfFame() {
    const container = document.getElementById('spotlightContainer');
    if (!container) return;

    // Create Photo Lightbox Modal
    let lightbox = document.getElementById('hofLightbox');
    if (!lightbox) {
      lightbox = document.createElement('div');
      lightbox.id = 'hofLightbox';
      lightbox.className = 'hof-lightbox';
      lightbox.setAttribute('role', 'dialog');
      lightbox.setAttribute('aria-modal', 'true');
      lightbox.innerHTML = `
        <div class="hof-lightbox-backdrop"></div>
        <div class="hof-lightbox-content">
          <button class="hof-lightbox-close" aria-label="Close modal">&times;</button>
          <div class="hof-lightbox-img-wrap">
            <img src="" alt="" id="hofLightboxImg">
          </div>
          <div class="hof-lightbox-caption" id="hofLightboxCaption"></div>
        </div>
      `;
      document.body.appendChild(lightbox);

      // Lightbox Styles injected if not already present
      if (!document.getElementById('hofLightboxStyles')) {
        const style = document.createElement('style');
        style.id = 'hofLightboxStyles';
        style.textContent = `
          .hof-lightbox {
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
            padding: 20px;
          }
          .hof-lightbox.open {
            opacity: 1;
            pointer-events: auto;
          }
          .hof-lightbox-backdrop {
            position: absolute;
            inset: 0;
            background: rgba(6, 10, 18, 0.88);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
          }
          .hof-lightbox-content {
            position: relative;
            z-index: 2;
            max-width: 800px;
            width: 100%;
            background: #0f1724;
            border: 1px solid rgba(255, 153, 0, 0.35);
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 25px 60px rgba(0,0,0,0.8), 0 0 30px rgba(255, 153, 0, 0.2);
            transform: scale(0.92) translateY(20px);
            transition: transform 0.35s cubic-bezier(0.2, 0.9, 0.2, 1);
          }
          .hof-lightbox.open .hof-lightbox-content {
            transform: scale(1) translateY(0);
          }
          .hof-lightbox-close {
            position: absolute;
            top: 12px;
            right: 14px;
            width: 34px;
            height: 34px;
            border-radius: 50%;
            border: 1px solid rgba(255, 255, 255, 0.15);
            background: rgba(255, 255, 255, 0.05);
            color: #ffffff;
            font-size: 22px;
            line-height: 1;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            z-index: 10;
          }
          .hof-lightbox-close:hover {
            background: rgba(255, 153, 0, 0.2);
            border-color: #ff9900;
            color: #ffc94d;
            transform: rotate(90deg);
          }
          .hof-lightbox-img-wrap {
            width: 100%;
            max-height: 70vh;
            border-radius: 10px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #080d14;
          }
          .hof-lightbox-img-wrap img {
            max-width: 100%;
            max-height: 70vh;
            object-fit: contain;
            border-radius: 8px;
          }
          .hof-lightbox-caption {
            margin-top: 14px;
            font-family: var(--display, 'Space Grotesk', sans-serif);
            font-size: 15px;
            color: #e2e8f0;
            text-align: center;
            font-weight: 600;
          }
        `;
        document.head.appendChild(style);
      }

      // Close handlers
      const closeBtn = lightbox.querySelector('.hof-lightbox-close');
      const backdrop = lightbox.querySelector('.hof-lightbox-backdrop');
      const closeModal = () => {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
      };

      closeBtn.addEventListener('click', closeModal);
      backdrop.addEventListener('click', closeModal);
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('open')) {
          closeModal();
        }
      });
    }

    // Attach click to all champion images
    const images = container.querySelectorAll('.hof-img-wrap img, .hof-banner-thumb img, .hof-mini-card img');
    images.forEach(img => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => {
        const lb = document.getElementById('hofLightbox');
        const lbImg = document.getElementById('hofLightboxImg');
        const lbCap = document.getElementById('hofLightboxCaption');
        if (lb && lbImg) {
          lbImg.src = img.src;
          lbImg.alt = img.alt || 'Hall of Fame Champion';
          if (lbCap) {
            const card = img.closest('.hof-card') || img.closest('.hof-mini-card');
            const titleText = img.dataset.title || (card ? (card.querySelector('.hof-card-title, .hof-banner-text strong')?.textContent) : null) || img.alt || 'Hall of Fame Champion';
            const descText = img.dataset.desc || (card ? (card.querySelector('.hof-card-desc, .hof-banner-text span')?.textContent) : null) || '';
            const badgeText = img.dataset.badge || (card ? (card.querySelector('.hof-tag, .hof-badge-winner')?.textContent) : null) || '';

            let capHtml = '';
            if (badgeText) {
              capHtml += `<span style="display:inline-block;margin-bottom:8px;font-family:var(--mono, monospace);font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#f59e0b;background:rgba(245,158,11,0.15);padding:3px 10px;border-radius:999px;border:1px solid rgba(245,158,11,0.4);">${badgeText}</span>`;
            }
            if (titleText) {
              capHtml += `<div style="font-family:var(--display, sans-serif);font-size:19px;font-weight:700;color:#ffffff;margin-bottom:4px;">${titleText}</div>`;
            }
            if (descText) {
              capHtml += `<div style="font-size:14px;color:#94a3b8;font-weight:400;line-height:1.4;">${descText}</div>`;
            }
            lbCap.innerHTML = capHtml;
          }
          lb.classList.add('open');
          document.body.style.overflow = 'hidden';
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHallOfFame);
  } else {
    initHallOfFame();
  }
})();
