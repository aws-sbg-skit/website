/**
 * AWS SBG SKIT - Events Client & Native Registration Modal Handler
 */

(function () {
  'use strict';

  const service = window.AwsSbgEventsService;

  // Cache for active event being registered
  let activeEvent = null;

  // ===================================================
  // 1. DYNAMIC TIMELINE RENDERING
  // ===================================================
  async function initEventsTimeline() {
    const timelineContainer = document.querySelector('#events .timeline');
    if (!timelineContainer) return;

    // Immediate safety: ensure all existing timeline cards are visible
    timelineContainer.querySelectorAll('.tl-item').forEach(el => el.classList.add('in'));

    const service = window.AwsSbgEventsService;
    if (!service) {
      console.warn('AwsSbgEventsService not available yet.');
      attachRegisterTriggers();
      return;
    }

    try {
      const events = await service.getEvents();
      if (!events || events.length === 0) return;

      // Render timeline HTML
      renderTimelineHTML(timelineContainer, events);
    } catch (err) {
      console.warn('Could not load dynamic events, keeping default markup:', err);
      timelineContainer.querySelectorAll('.tl-item').forEach(el => el.classList.add('in'));
    }
  }

  function renderTimelineHTML(container, events) {
    container.innerHTML = events.map(ev => {
      const isDone = ev.status === 'done';
      const isOpen = ev.registrationOpen && !isDone;
      const isFeatured = !!ev.isFeatured;

      // CSS Classes: ALWAYS include 'in' so it is immediately visible
      let itemClasses = 'tl-item reveal in';
      if (isDone) itemClasses += ' done';
      if (isFeatured) itemClasses += ' tl-item-featured';

      let cardClasses = 'event-card spotlight';
      if (isFeatured) cardClasses += ' event-card-featured';

      let dotClasses = 'tl-dot';
      if (isFeatured) dotClasses += ' tl-dot-featured';

      // Badge
      let badgeHtml = '';
      if (isFeatured) {
        badgeHtml = '<span class="badge badge-featured">⭐ Featured Event</span>';
      } else if (isDone) {
        badgeHtml = `<span class="badge done">${escapeHTML(ev.badge || ('Done — ' + ev.dateDisplay))}</span>`;
      } else if (isOpen) {
        badgeHtml = `<span class="badge soon" style="color: #34d399; border-color: rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.08);">● Open for Registration</span>`;
      } else {
        badgeHtml = `<span class="badge soon">${escapeHTML(ev.badge || ('Upcoming — ' + ev.dateDisplay))}</span>`;
      }

      // Goodies
      const goodiesHtml = ev.goodies ? `<span class="badge-goodies">${escapeHTML(ev.goodies)}</span>` : '';

      // Action Buttons
      let actionButtonsHtml = '';
      if (isDone) {
        actionButtonsHtml += `
          <button class="btn-reg" disabled style="opacity: 0.7;">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Completed
          </button>
        `;

        if (ev.feedbackUrl) {
          actionButtonsHtml += `
            <a href="${escapeHTML(ev.feedbackUrl)}" target="_blank" rel="noopener" class="btn-feed">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Feedback Form
            </a>
          `;
        }

        if (ev.photosUrl) {
          actionButtonsHtml += `
            <a href="${escapeHTML(ev.photosUrl)}" target="_blank" rel="noopener" class="btn-photos">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              Photos 📸
            </a>
          `;
        }
      } else if (isOpen) {
        if (ev.registrationType === 'external' && ev.externalRegistrationUrl) {
          // External Link (Google Forms / Luma / External Registration)
          actionButtonsHtml += `
            <a href="${escapeHTML(ev.externalRegistrationUrl)}" target="_blank" rel="noopener" class="btn-reg" style="cursor: pointer; opacity: 1; pointer-events: auto; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              Register (Google Form) ↗
            </a>
          `;
        } else {
          // Native Active Register Button
          actionButtonsHtml += `
            <button class="btn-reg native-reg-trigger" data-event-id="${escapeHTML(ev.id)}" style="cursor: pointer; opacity: 1; pointer-events: auto;">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
              Register Now →
            </button>
          `;
        }
      } else {
        // Upcoming announcement
        actionButtonsHtml += `
          <button class="btn-reg" disabled>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Opening Soon
          </button>
        `;
      }

      return `
        <div class="${itemClasses}" data-event-id="${escapeHTML(ev.id)}">
          <div class="${dotClasses}"></div>
          <div class="${cardClasses}">
            ${isFeatured ? '<div class="featured-glow-ring"></div>' : ''}
            <div>
              <div class="event-top">
                ${badgeHtml}
                ${goodiesHtml}
              </div>
              <h3>${escapeHTML(ev.title)}</h3>
              <p>${escapeHTML(ev.description || '')}</p>
              <div class="event-actions">
                ${actionButtonsHtml}
              </div>
            </div>
            <div class="event-tag ${isFeatured ? 'event-tag-featured' : ''}">${escapeHTML(ev.tag || ev.category || 'Event')}</div>
          </div>
        </div>
      `;
    }).join('');

    // Guarantee all dynamic items are visible and spotlight hover is attached
    container.querySelectorAll('.tl-item').forEach(el => {
      el.classList.add('in');
      el.style.opacity = '1';
      el.style.visibility = 'visible';
    });

    attachSpotlightHover(container);
    attachRegisterTriggers();
  }

  function attachSpotlightHover(container) {
    if (!container) return;
    container.querySelectorAll('.spotlight').forEach(card => {
      let r = null;
      card.addEventListener('mouseenter', () => { r = card.getBoundingClientRect(); });
      card.addEventListener('mousemove', (e) => {
        if (!r) r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
      card.addEventListener('mouseleave', () => { r = null; });
    });
  }

  // ===================================================
  // 2. NATIVE REGISTRATION MODAL
  // ===================================================
  function ensureRegistrationModal() {
    if (document.getElementById('nativeRegModal')) return;

    const modalMarkup = `
      <div class="reg-modal-backdrop" id="nativeRegModal" role="dialog" aria-modal="true">
        <div class="reg-modal-content">
          <button class="reg-modal-close" id="closeRegModalBtn" aria-label="Close modal">&times;</button>
          
          <div class="reg-modal-header">
            <div class="reg-modal-kicker">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 8v4l3 3"></path>
              </svg>
              <span>AWS SBG SKIT &bull; Native Registration</span>
            </div>
            <h3 id="modalEventTitle">Event Title</h3>
            <div class="reg-modal-meta">
              <span id="modalEventDate">📅 Date</span>
              <span id="modalEventVenue">📍 Venue</span>
            </div>
          </div>

          <div class="reg-modal-body">
            <!-- Seat Counter Indicator -->
            <div class="reg-seat-counter" id="modalSeatCounter">
              <span>🎟️ Free Entry &bull; Exclusive Swag for Registered Attendees</span>
              <span id="modalSeatsRemaining">Seats Available</span>
            </div>

            <!-- Error Box -->
            <div class="reg-error-box" id="regErrorBox"></div>

            <!-- Registration Form -->
            <form id="nativeRegistrationForm" autocomplete="on">
              <div class="reg-form-group">
                <label for="regFullName">Full Name <span class="req">*</span></label>
                <input type="text" id="regFullName" class="reg-input" placeholder="e.g. Rahul Sharma" required>
              </div>

              <div class="reg-form-row">
                <div class="reg-form-group">
                  <label for="regEmail">College Email <span class="req">*</span></label>
                  <input type="email" id="regEmail" class="reg-input" placeholder="name@skit.ac.in" required>
                </div>

                <div class="reg-form-group">
                  <label for="regPhone">WhatsApp / Mobile <span class="req">*</span></label>
                  <input type="tel" id="regPhone" class="reg-input" placeholder="9876543210" pattern="[0-9]{10}" maxlength="10" title="Please enter a valid 10-digit mobile number" required>
                </div>
              </div>

              <div class="reg-form-row">
                <div class="reg-form-group">
                  <label for="regBranch">Branch / Department <span class="req">*</span></label>
                  <select id="regBranch" class="reg-input" required>
                    <option value="Computer Science & Engineering (CSE)">CSE</option>
                    <option value="Information Technology (IT)">IT</option>
                    <option value="Computer Science (AI)">CS (AI)</option>
                    <option value="Computer Science (DS)">CS (Data Science)</option>
                    <option value="Computer Science (IoT)">CS (IoT)</option>
                    <option value="Electronics & Communication (ECE)">ECE</option>
                    <option value="Electrical Engineering (EE)">EE</option>
                    <option value="Mechanical Engineering (ME)">ME</option>
                    <option value="Civil Engineering (CE)">Civil</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div class="reg-form-group">
                  <label for="regYear">Year of Study <span class="req">*</span></label>
                  <select id="regYear" class="reg-input" required>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              </div>

              <div class="reg-form-group">
                <label for="regRollNumber">College / RTU Roll No. <span class="req">*</span></label>
                <input type="text" id="regRollNumber" class="reg-input" placeholder="e.g. 23ESKCS123" required>
              </div>

              <div class="reg-form-group">
                <label for="regQuery">Any question or expectation from this session? (Optional)</label>
                <textarea id="regQuery" class="reg-input" placeholder="e.g. Want to learn how to deploy serverless architectures"></textarea>
              </div>

              <button type="submit" class="reg-submit-btn" id="regSubmitBtn">
                <span>Confirm My Registration 🚀</span>
              </button>
            </form>

            <!-- Success Confirmation View (Hidden by default) -->
            <div class="reg-success-card" id="regSuccessCard" style="display: none;">
              <div class="reg-success-icon">✓</div>
              <h4>You're Registered!</h4>
              <p>Your seat has been reserved for <strong id="successEventTitle">Event</strong>. We look forward to seeing you there!</p>

              <div>
                <span class="reg-id-badge" id="successRegId">SBG-XXXXX</span>
              </div>

              <div class="reg-success-actions">
                <a href="#" id="googleCalBtn" target="_blank" rel="noopener" class="reg-cal-btn">
                  📅 Add to Google Calendar
                </a>
                <button type="button" class="reg-cal-btn" id="doneModalBtn" style="cursor: pointer;">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalMarkup);
    bindModalEvents();
  }

  function bindModalEvents() {
    const modal = document.getElementById('nativeRegModal');
    const closeBtn = document.getElementById('closeRegModalBtn');
    const form = document.getElementById('nativeRegistrationForm');
    const doneBtn = document.getElementById('doneModalBtn');

    const nameInput = document.getElementById('regFullName');
    const emailInput = document.getElementById('regEmail');
    const phoneInput = document.getElementById('regPhone');
    const rollInput = document.getElementById('regRollNumber');

    // Real-time input validation on blur and input
    if (window.AwsValidation) {
      nameInput.addEventListener('input', () => {
        const res = window.AwsValidation.validateName(nameInput.value);
        if (res.valid) window.AwsValidation.clearFieldError(nameInput);
      });
      nameInput.addEventListener('blur', () => {
        const res = window.AwsValidation.validateName(nameInput.value);
        if (!res.valid) window.AwsValidation.showFieldError(nameInput, res.message);
        else window.AwsValidation.clearFieldError(nameInput);
      });

      emailInput.addEventListener('input', () => {
        const res = window.AwsValidation.validateEmail(emailInput.value);
        if (res.valid) window.AwsValidation.clearFieldError(emailInput);
      });
      emailInput.addEventListener('blur', () => {
        const res = window.AwsValidation.validateEmail(emailInput.value);
        if (!res.valid) window.AwsValidation.showFieldError(emailInput, res.message);
        else window.AwsValidation.clearFieldError(emailInput);
      });

      phoneInput.addEventListener('input', () => {
        const res = window.AwsValidation.validatePhone(phoneInput.value);
        if (res.valid) window.AwsValidation.clearFieldError(phoneInput);
      });
      phoneInput.addEventListener('blur', () => {
        const res = window.AwsValidation.validatePhone(phoneInput.value);
        if (!res.valid) window.AwsValidation.showFieldError(phoneInput, res.message);
        else window.AwsValidation.clearFieldError(phoneInput);
      });

      rollInput.addEventListener('input', () => {
        const res = window.AwsValidation.validateRollNumber(rollInput.value);
        if (res.valid) window.AwsValidation.clearFieldError(rollInput);
      });
      rollInput.addEventListener('blur', () => {
        const res = window.AwsValidation.validateRollNumber(rollInput.value);
        if (!res.valid) window.AwsValidation.showFieldError(rollInput, res.message);
        else window.AwsValidation.clearFieldError(rollInput);
      });
    }

    closeBtn.addEventListener('click', closeRegistrationModal);
    if (doneBtn) doneBtn.addEventListener('click', closeRegistrationModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeRegistrationModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeRegistrationModal();
      }
    });

    form.addEventListener('submit', handleRegistrationSubmit);
  }

  function attachRegisterTriggers() {
    ensureRegistrationModal();

    const triggers = document.querySelectorAll('.native-reg-trigger');
    triggers.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const eventId = btn.dataset.eventId;
        if (!eventId) return;

        const event = await service.getEventById(eventId);
        if (!event) return;

        openRegistrationModal(event);
      });
    });
  }

  async function openRegistrationModal(event) {
    activeEvent = event;
    ensureRegistrationModal();

    const modal = document.getElementById('nativeRegModal');
    const titleEl = document.getElementById('modalEventTitle');
    const dateEl = document.getElementById('modalEventDate');
    const venueEl = document.getElementById('modalEventVenue');
    const remainingEl = document.getElementById('modalSeatsRemaining');
    const form = document.getElementById('nativeRegistrationForm');
    const successCard = document.getElementById('regSuccessCard');
    const errorBox = document.getElementById('regErrorBox');

    titleEl.textContent = event.title;
    dateEl.textContent = '📅 ' + event.dateDisplay;
    venueEl.textContent = '📍 ' + (event.venue || 'SKIT Campus');

    // Seat count
    const existingRegs = await service.getRegistrationsByEvent(event.id);
    const capacity = event.capacity || 120;
    const remaining = Math.max(0, capacity - existingRegs.length);
    remainingEl.textContent = `${remaining} seats remaining (${existingRegs.length}/${capacity} filled)`;

    // Reset views
    errorBox.style.display = 'none';
    form.reset();
    form.style.display = 'block';
    successCard.style.display = 'none';

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeRegistrationModal() {
    const modal = document.getElementById('nativeRegModal');
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  async function handleRegistrationSubmit(e) {
    e.preventDefault();
    if (!activeEvent) return;

    const errorBox = document.getElementById('regErrorBox');
    const submitBtn = document.getElementById('regSubmitBtn');
    const form = document.getElementById('nativeRegistrationForm');
    const successCard = document.getElementById('regSuccessCard');
    const successTitle = document.getElementById('successEventTitle');
    const successRegId = document.getElementById('successRegId');
    const googleCalBtn = document.getElementById('googleCalBtn');

    const nameInput = document.getElementById('regFullName');
    const emailInput = document.getElementById('regEmail');
    const phoneInput = document.getElementById('regPhone');
    const rollInput = document.getElementById('regRollNumber');

    // Client-side Validation Checks
    let hasError = false;
    let firstErrorField = null;

    if (window.AwsValidation) {
      const nameVal = window.AwsValidation.validateName(nameInput.value);
      if (!nameVal.valid) {
        window.AwsValidation.showFieldError(nameInput, nameVal.message);
        hasError = true;
        if (!firstErrorField) firstErrorField = nameInput;
      } else {
        window.AwsValidation.clearFieldError(nameInput);
      }

      const emailVal = window.AwsValidation.validateEmail(emailInput.value);
      if (!emailVal.valid) {
        window.AwsValidation.showFieldError(emailInput, emailVal.message);
        hasError = true;
        if (!firstErrorField) firstErrorField = emailInput;
      } else {
        window.AwsValidation.clearFieldError(emailInput);
      }

      const phoneVal = window.AwsValidation.validatePhone(phoneInput.value);
      if (!phoneVal.valid) {
        window.AwsValidation.showFieldError(phoneInput, phoneVal.message);
        hasError = true;
        if (!firstErrorField) firstErrorField = phoneInput;
      } else {
        window.AwsValidation.clearFieldError(phoneInput);
      }

      const rollVal = window.AwsValidation.validateRollNumber(rollInput.value);
      if (!rollVal.valid) {
        window.AwsValidation.showFieldError(rollInput, rollVal.message);
        hasError = true;
        if (!firstErrorField) firstErrorField = rollInput;
      } else {
        window.AwsValidation.clearFieldError(rollInput);
      }
    }

    if (hasError) {
      if (firstErrorField) firstErrorField.focus();
      return;
    }

    errorBox.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Verifying &amp; Reserving Seat...</span>';

    const regData = {
      eventId: activeEvent.id,
      fullName: nameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      branch: document.getElementById('regBranch').value,
      year: document.getElementById('regYear').value,
      rollNumber: rollInput.value.trim(),
      query: document.getElementById('regQuery').value.trim()
    };

    try {
      const result = await service.registerAttendee(regData);

      // On Success
      form.style.display = 'none';
      successCard.style.display = 'block';
      successTitle.textContent = activeEvent.title;
      successRegId.textContent = result.registrationId;

      // Google Calendar Link
      const gcalUrl = buildGoogleCalendarUrl(activeEvent);
      if (googleCalBtn) {
        googleCalBtn.href = gcalUrl;
      }
    } catch (err) {
      errorBox.textContent = err.message || 'Registration failed. Please check your details and try again.';
      errorBox.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Confirm My Registration 🚀</span>';
    }
  }

  function buildGoogleCalendarUrl(event) {
    const text = encodeURIComponent(event.title + ' — AWS SBG SKIT');
    const details = encodeURIComponent((event.description || '') + '\n\nOrganized by AWS Student Builder Group at SKIT Jaipur.');
    const location = encodeURIComponent(event.venue || 'SKIT Jaipur');

    // Default 2-hour event timing
    const dateStr = (event.dateISO || new Date().toISOString().split('T')[0]).replace(/-/g, '');
    const dates = `${dateStr}T100000Z/${dateStr}T120000Z`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}`;
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

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEventsTimeline);
  } else {
    initEventsTimeline();
  }

})();

