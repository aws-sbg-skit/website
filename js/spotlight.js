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

  function initPhotoLikes() {
    const STORAGE_KEY = 'aws_sbg_photo_likes';
    const defaultLikes = {
      'winner-1': 42,
      'cloud-quest': 58,
      'winner-2': 35,
      'winner-6': 47,
      'winner-4': 28,
      'winner-5': 31,
      'winner-3': 39,
      'cloud-quest-winner-1': 33,
      'cloud-quest-winner-2': 36,
      'aws-101-quiz-winner': 40
    };

    let store = { userLikes: [], counts: {} };
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          store.userLikes = Array.isArray(parsed.userLikes) ? parsed.userLikes : [];
          store.counts = (parsed.counts && typeof parsed.counts === 'object') ? parsed.counts : {};
        }
      }
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }

    // Populate missing default counts
    Object.keys(defaultLikes).forEach(id => {
      if (typeof store.counts[id] !== 'number') {
        store.counts[id] = defaultLikes[id];
      }
    });

    function saveStore() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      } catch (err) {
        console.warn('LocalStorage save error:', err);
      }
    }

    function getLabel(count) {
      return count === 1 ? '1 like' : `${count} likes`;
    }

    function updateButtonUI(btn, id) {
      const isLiked = store.userLikes.includes(id);
      const count = typeof store.counts[id] === 'number' ? store.counts[id] : (defaultLikes[id] || 0);
      btn.classList.toggle('is-liked', isLiked);
      btn.setAttribute('aria-pressed', isLiked ? 'true' : 'false');
      btn.setAttribute('aria-label', `${isLiked ? 'Unlike' : 'Like'} photo (${getLabel(count)})`);
      btn.setAttribute('title', `${isLiked ? 'Unlike' : 'Like'} photo (${getLabel(count)})`);
      const tooltip = btn.querySelector('.like-tooltip');
      if (tooltip) {
        tooltip.textContent = getLabel(count);
      }
    }

    const buttons = document.querySelectorAll('.img-like-btn');
    buttons.forEach(btn => {
      const id = btn.dataset.likeId;
      if (!id) return;

      updateButtonUI(btn, id);

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const currentlyLiked = store.userLikes.includes(id);
        if (currentlyLiked) {
          store.userLikes = store.userLikes.filter(item => item !== id);
          store.counts[id] = Math.max(0, (store.counts[id] || 1) - 1);
        } else {
          store.userLikes.push(id);
          store.counts[id] = (store.counts[id] || 0) + 1;
          triggerLikeEffect(btn);
        }

        saveStore();

        // Update all buttons with this ID in current document
        document.querySelectorAll(`.img-like-btn[data-like-id="${id}"]`).forEach(b => {
          updateButtonUI(b, id);
        });
      });

      btn.addEventListener('touchstart', () => {
        btn.classList.add('show-tooltip');
        setTimeout(() => btn.classList.remove('show-tooltip'), 2000);
      }, { passive: true });
    });

    function triggerLikeEffect(btn) {
      const badge = document.createElement('span');
      badge.className = 'like-pop-indicator';
      badge.textContent = '+1';
      btn.appendChild(badge);
      setTimeout(() => {
        if (badge.parentNode) badge.parentNode.removeChild(badge);
      }, 700);
    }

    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && typeof parsed === 'object') {
            store = parsed;
            document.querySelectorAll('.img-like-btn').forEach(b => {
              const id = b.dataset.likeId;
              if (id) updateButtonUI(b, id);
            });
          }
        } catch (err) {}
      }
    });
  }

  function start() {
    initHallOfFame();
    initPhotoLikes();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
