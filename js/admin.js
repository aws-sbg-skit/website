/**
 * AWS SBG SKIT - Admin Portal Controller
 */

(function () {
  'use strict';

  const service = window.AwsSbgEventsService;

  // DOM Elements - Login
  const loginWrapper = document.getElementById('loginWrapper');
  const adminApp = document.getElementById('adminApp');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const adminUsernameInput = document.getElementById('adminUsername');
  const adminPasswordInput = document.getElementById('adminPassword');
  const loginErrorMsg = document.getElementById('loginErrorMsg');
  const loginErrorText = document.getElementById('loginErrorText');
  const loginSubmitBtn = document.getElementById('loginSubmitBtn');

  // DOM Elements - Navigation & Header
  const navUsername = document.getElementById('navUsername');
  const navUserInitial = document.getElementById('navUserInitial');
  const logoutBtn = document.getElementById('logoutBtn');
  const adminTabs = document.querySelectorAll('.admin-tab');

  // DOM Elements - Stats
  const statTotalEvents = document.getElementById('statTotalEvents');
  const statOpenEvents = document.getElementById('statOpenEvents');
  const statTotalRegistrations = document.getElementById('statTotalRegistrations');
  const statTotalChampions = document.getElementById('statTotalChampions');
  const statDbStatus = document.getElementById('statDbStatus');
  const statDbSyncInfo = document.getElementById('statDbSyncInfo');
  const badgeEventsCount = document.getElementById('badgeEventsCount');
  const badgeRegsCount = document.getElementById('badgeRegsCount');
  const badgeChampionsCount = document.getElementById('badgeChampionsCount');

  // DOM Elements - Events Tab
  const adminEventsGrid = document.getElementById('adminEventsGrid');
  const eventSearchInput = document.getElementById('eventSearchInput');
  const eventFilterStatus = document.getElementById('eventFilterStatus');
  const openNewEventModalBtn = document.getElementById('openNewEventModalBtn');

  // DOM Elements - Registrations Tab
  const regEventFilter = document.getElementById('regEventFilter');
  const regSearchInput = document.getElementById('regSearchInput');
  const registrationsTableBody = document.getElementById('registrationsTableBody');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const copyEmailsBtn = document.getElementById('copyEmailsBtn');

  // DOM Elements - Hall of Fame / Champions Tab
  const adminChampionsGrid = document.getElementById('adminChampionsGrid');
  const champSearchInput = document.getElementById('champSearchInput');
  const openNewChampionModalBtn = document.getElementById('openNewChampionModalBtn');
  const championModalOverlay = document.getElementById('championModalOverlay');
  const championEditorForm = document.getElementById('championEditorForm');
  const modalChampionTitle = document.getElementById('modalChampionTitle');
  const editChampionId = document.getElementById('editChampionId');
  const formChampTitle = document.getElementById('formChampTitle');
  const formChampBadge = document.getElementById('formChampBadge');
  const formChampEvent = document.getElementById('formChampEvent');
  const formChampSubtitle = document.getElementById('formChampSubtitle');
  const formChampDesc = document.getElementById('formChampDesc');
  const formChampImageUrl = document.getElementById('formChampImageUrl');
  const formChampFile = document.getElementById('formChampFile');
  const champImgPreviewContainer = document.getElementById('champImgPreviewContainer');
  const champImgPreview = document.getElementById('champImgPreview');
  const closeChampionModalBtn = document.getElementById('closeChampionModalBtn');
  const cancelChampionModalBtn = document.getElementById('cancelChampionModalBtn');
  const saveChampionBtnText = document.getElementById('saveChampionBtnText');

  // DOM Elements - Settings Tab
  const firebaseConfigInput = document.getElementById('firebaseConfigInput');
  const saveFirebaseConfigBtn = document.getElementById('saveFirebaseConfigBtn');
  const clearFirebaseConfigBtn = document.getElementById('clearFirebaseConfigBtn');
  const changePasswordForm = document.getElementById('changePasswordForm');
  const currentPasswordInput = document.getElementById('currentPasswordInput');
  const newUsernameInput = document.getElementById('newUsernameInput');
  const newPasswordInput = document.getElementById('newPasswordInput');
  const resetDefaultCredsBtn = document.getElementById('resetDefaultCredsBtn');

  // DOM Elements - Event Modal
  const eventModalOverlay = document.getElementById('eventModalOverlay');
  const eventEditorForm = document.getElementById('eventEditorForm');
  const modalEventTitle = document.getElementById('modalEventTitle');
  const editEventId = document.getElementById('editEventId');
  const formEventTitle = document.getElementById('formEventTitle');
  const formEventCategory = document.getElementById('formEventCategory');
  const formEventStatus = document.getElementById('formEventStatus');
  const formEventDateDisplay = document.getElementById('formEventDateDisplay');
  const formEventDateISO = document.getElementById('formEventDateISO');
  const formEventVenue = document.getElementById('formEventVenue');
  const formEventCapacity = document.getElementById('formEventCapacity');
  const formEventGoodies = document.getElementById('formEventGoodies');
  const formEventDesc = document.getElementById('formEventDesc');
  const formEventPhotos = document.getElementById('formEventPhotos');
  const formEventFeedback = document.getElementById('formEventFeedback');
  const formEventRegType = document.getElementById('formEventRegType');
  const formEventExternalUrl = document.getElementById('formEventExternalUrl');
  const externalRegUrlGroup = document.getElementById('externalRegUrlGroup');

  // Registration Fields Selector Elements
  const nativeFieldsConfigGroup = document.getElementById('nativeFieldsConfigGroup');
  const fieldReqPhone = document.getElementById('fieldReqPhone');
  const fieldReqBranch = document.getElementById('fieldReqBranch');
  const fieldReqYear = document.getElementById('fieldReqYear');
  const fieldReqRoll = document.getElementById('fieldReqRoll');
  const fieldReqQuery = document.getElementById('fieldReqQuery');
  const customQuestionsSection = document.getElementById('customQuestionsSection');
  const addCustomQuestionBtn = document.getElementById('addCustomQuestionBtn');
  const customQuestionsList = document.getElementById('customQuestionsList');
  const noCustomQuestionsMsg = document.getElementById('noCustomQuestionsMsg');

  const closeEventModalBtn = document.getElementById('closeEventModalBtn');
  const cancelEventModalBtn = document.getElementById('cancelEventModalBtn');
  const saveEventBtnText = document.getElementById('saveEventBtnText');

  // Toast
  const adminToast = document.getElementById('adminToast');
  const toastMsg = document.getElementById('toastMsg');
  const toastIcon = document.getElementById('toastIcon');
  let toastTimer = null;

  // Cached state
  let cachedEvents = [];
  let cachedRegistrations = [];
  let cachedChampions = [];

  // ===================================================
  // INITIALIZATION & AUTH STATE
  // ===================================================
  function init() {
    if (adminPasswordInput) adminPasswordInput.value = '';
    if (adminLoginForm) adminLoginForm.reset();
    checkAuthState();
    attachEventListeners();

    // Prevent browser autofill from writing stored password into the login input
    setTimeout(() => {
      if (!service.isAuthenticated() && adminPasswordInput) {
        adminPasswordInput.value = '';
      }
    }, 150);
  }

  function checkAuthState() {
    if (service.isAuthenticated()) {
      showDashboard();
    } else {
      showLogin();
    }
  }

  function showLogin() {
    loginWrapper.style.display = 'flex';
    adminApp.style.display = 'none';
    if (adminPasswordInput) adminPasswordInput.value = '';
    if (adminUsernameInput) adminUsernameInput.value = '';
    if (adminLoginForm) adminLoginForm.reset();
    setTimeout(() => {
      if (adminPasswordInput) adminPasswordInput.value = '';
      if (adminUsernameInput) adminUsernameInput.focus();
    }, 50);
  }

  function showDashboard() {
    loginWrapper.style.display = 'none';
    adminApp.style.display = 'flex';

    const currentUser = service.getCurrentUser() || 'Admin';
    navUsername.textContent = currentUser;
    navUserInitial.textContent = currentUser.charAt(0).toUpperCase();

    loadDashboardData();
  }

  async function loadDashboardData() {
    updateDbStatusBadge();
    await Promise.all([loadEvents(), loadRegistrations(), loadChampions()]);
    updateStats();
    loadFirebaseConfigView();
  }

  function updateDbStatusBadge() {
    if (service.isFirebaseReady) {
      statDbStatus.textContent = 'Firebase Cloud';
      statDbStatus.style.color = '#10b981';
      statDbSyncInfo.textContent = 'Real-time Firestore Sync Active';
    } else {
      statDbStatus.textContent = 'Local Storage';
      statDbStatus.style.color = 'var(--orange)';
      statDbSyncInfo.textContent = 'Offline cache (ready for Firebase)';
    }
  }

  function showToast(message, type = 'success') {
    if (toastTimer) clearTimeout(toastTimer);
    toastMsg.textContent = message;
    adminToast.className = 'admin-toast show ' + type;
    toastIcon.textContent = type === 'success' ? '✓' : '⚠️';
    toastTimer = setTimeout(() => {
      adminToast.classList.remove('show');
    }, 3800);
  }

  // Rate limiting / Brute-force lockout state
  let failedLoginAttempts = 0;
  let lockoutTimer = null;
  let lockoutEndTime = 0;

  // ===================================================
  // AUTHENTICATION LOGIC WITH BRUTE-FORCE PROTECTION
  // ===================================================
  function checkLockout() {
    const now = Date.now();
    if (lockoutEndTime > now) {
      const remainingSeconds = Math.ceil((lockoutEndTime - now) / 1000);
      loginErrorText.textContent = `Too many failed attempts. Login locked for ${remainingSeconds}s.`;
      loginErrorMsg.style.display = 'flex';
      loginSubmitBtn.disabled = true;
      loginSubmitBtn.style.opacity = '0.5';
      return true;
    }
    return false;
  }

  function startLockout(seconds = 60) {
    lockoutEndTime = Date.now() + (seconds * 1000);
    checkLockout();

    if (lockoutTimer) clearInterval(lockoutTimer);
    lockoutTimer = setInterval(() => {
      const remaining = Math.ceil((lockoutEndTime - Date.now()) / 1000);
      if (remaining <= 0) {
        clearInterval(lockoutTimer);
        failedLoginAttempts = 0;
        loginErrorMsg.style.display = 'none';
        loginSubmitBtn.disabled = false;
        loginSubmitBtn.style.opacity = '1';
      } else {
        loginErrorText.textContent = `Too many failed attempts. Login locked for ${remaining}s.`;
      }
    }, 1000);
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (checkLockout()) return;

    loginErrorMsg.style.display = 'none';

    const username = adminUsernameInput.value.trim();
    const password = adminPasswordInput.value;

    // Client-side field validation
    let hasError = false;
    if (window.AwsValidation) {
      const userVal = window.AwsValidation.validateUsername(username);
      if (!userVal.valid) {
        window.AwsValidation.showFieldError(adminUsernameInput, userVal.message);
        hasError = true;
      } else {
        window.AwsValidation.clearFieldError(adminUsernameInput);
      }

      const passVal = window.AwsValidation.validatePassword(password, 6);
      if (!passVal.valid) {
        window.AwsValidation.showFieldError(adminPasswordInput, passVal.message);
        hasError = true;
      } else {
        window.AwsValidation.clearFieldError(adminPasswordInput);
      }
    }

    if (hasError) return;

    loginSubmitBtn.disabled = true;
    loginSubmitBtn.style.opacity = '0.7';

    try {
      const res = await service.login(username, password);
      if (res.success) {
        failedLoginAttempts = 0;
        if (lockoutTimer) clearInterval(lockoutTimer);
        if (adminPasswordInput) adminPasswordInput.value = '';
        if (adminLoginForm) adminLoginForm.reset();
        showDashboard();
        showToast(`Welcome back, ${res.username}!`);
      } else {
        failedLoginAttempts++;
        if (adminPasswordInput) adminPasswordInput.value = '';
        if (failedLoginAttempts >= 5) {
          startLockout(60);
        } else {
          loginErrorText.textContent = (res.message || 'Invalid username or password.') + ` (${5 - failedLoginAttempts} attempts left)`;
          loginErrorMsg.style.display = 'flex';
        }
      }
    } catch (err) {
      if (adminPasswordInput) adminPasswordInput.value = '';
      loginErrorText.textContent = err.message || 'Sign in error';
      loginErrorMsg.style.display = 'flex';
    } finally {
      if (lockoutEndTime <= Date.now()) {
        loginSubmitBtn.disabled = false;
        loginSubmitBtn.style.opacity = '1';
      }
    }
  }

  function handleLogout() {
    service.logout();
    if (adminPasswordInput) adminPasswordInput.value = '';
    if (adminUsernameInput) adminUsernameInput.value = '';
    if (adminLoginForm) adminLoginForm.reset();
    showLogin();
    showToast('Signed out of admin portal.', 'success');
  }

  async function handleResetToDefault() {
    if (confirm('Are you sure you want to reset admin credentials back to default?\n\nUsername: admin\nPassword: password123')) {
      try {
        const res = await service.resetAdminCredentials();
        showToast(res.message, 'success');
        if (adminUsernameInput) adminUsernameInput.value = 'admin';
        if (adminPasswordInput) {
          adminPasswordInput.value = '';
          adminPasswordInput.focus();
        }
        if (navUsername) navUsername.textContent = 'admin';
        if (navUserInitial) navUserInitial.textContent = 'A';
      } catch (err) {
        alert('Error resetting credentials: ' + err.message);
      }
    }
  }

  // ===================================================
  // TAB NAVIGATION
  // ===================================================
  function switchTab(tabName) {
    adminTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    const tabEvents = document.getElementById('tabEventsView');
    const tabRegs = document.getElementById('tabRegistrationsView');
    const tabChamps = document.getElementById('tabChampionsView');
    const tabSettings = document.getElementById('tabSettingsView');

    if (tabEvents) tabEvents.style.display = tabName === 'events' ? 'block' : 'none';
    if (tabRegs) tabRegs.style.display = tabName === 'registrations' ? 'block' : 'none';
    if (tabChamps) tabChamps.style.display = tabName === 'champions' ? 'block' : 'none';
    if (tabSettings) tabSettings.style.display = tabName === 'settings' ? 'block' : 'none';

    if (tabName === 'events') renderEventsGrid();
    if (tabName === 'registrations') renderRegistrationsTable();
    if (tabName === 'champions') renderChampionsGrid();
  }

  // ===================================================
  // EVENTS LOGIC
  // ===================================================
  async function loadEvents() {
    cachedEvents = await service.getEvents();
    renderEventsGrid();
    populateEventFilterDropdown();
  }

  function renderEventsGrid() {
    const query = (eventSearchInput.value || '').trim().toLowerCase();
    const statusFilter = eventFilterStatus.value;

    const filtered = cachedEvents.filter(ev => {
      const matchQuery = !query ||
        ev.title.toLowerCase().includes(query) ||
        (ev.description && ev.description.toLowerCase().includes(query)) ||
        (ev.tag && ev.tag.toLowerCase().includes(query));

      const matchStatus = statusFilter === 'all' || ev.status === statusFilter;
      return matchQuery && matchStatus;
    });

    if (filtered.length === 0) {
      adminEventsGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <h4>No Events Found</h4>
          <p>No events match your current filter or search criteria.</p>
        </div>
      `;
      return;
    }

    adminEventsGrid.innerHTML = filtered.map(ev => {
      const regsForEvent = cachedRegistrations.filter(r => r.eventId === ev.id);
      const regCount = regsForEvent.length;
      const capacity = ev.capacity || 100;
      const fillPercent = Math.min(100, Math.round((regCount / capacity) * 100));

      const statusClass = ev.status === 'open' ? 'open' : (ev.status === 'upcoming' ? 'upcoming' : 'done');
      const statusLabel = ev.status === 'open' ? '● Registrations Open' : (ev.status === 'upcoming' ? 'Upcoming' : 'Completed');
      const isExternal = ev.registrationType === 'external';
      const regTypeBadge = isExternal
        ? `<span class="event-reg-badge external" title="${escapeHTML(ev.externalRegistrationUrl || '')}">🔗 External Form</span>`
        : `<span class="event-reg-badge native">📍 Website</span>`;

      return `
        <div class="admin-event-card" data-event-id="${ev.id}">
          <div>
            <div class="event-card-top">
              <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                <span class="event-category-badge">${escapeHTML(ev.category || 'Workshop')}</span>
                ${regTypeBadge}
              </div>
              <span class="event-status-pill ${statusClass}">${statusLabel}</span>
            </div>
            <h3>${escapeHTML(ev.title)}</h3>
            <p>${escapeHTML(ev.description || 'No description provided.')}</p>

            <div class="event-meta-info">
              <div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>${escapeHTML(ev.dateDisplay)}</span>
              </div>
              <div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>${escapeHTML(ev.venue || 'SKIT Campus')}</span>
              </div>
              <div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                </svg>
                <span><b>${regCount}</b> / ${capacity} Registered (${fillPercent}%)</span>
              </div>
            </div>
          </div>

          <div class="event-card-actions">
            <button class="btn-view-regs" onclick="AwsAdminApp.viewEventRegistrations('${ev.id}')">
              <span>View Attendee List (${regCount})</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            <div class="card-action-btns">
              <button class="btn-icon" title="${ev.registrationOpen ? 'Close Registrations' : 'Open Registrations'}" onclick="AwsAdminApp.toggleReg('${ev.id}', ${!ev.registrationOpen})">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  ${ev.registrationOpen
                    ? '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>'
                    : '<polygon points="5 3 19 12 5 21 5 3"></polygon>'}
                </svg>
              </button>
              <button class="btn-icon" title="Edit Event" onclick="AwsAdminApp.openEditModal('${ev.id}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </button>
              <button class="btn-icon delete" title="Delete Event" onclick="AwsAdminApp.confirmDeleteEvent('${ev.id}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Dynamic Custom Questions Builder Helpers
  function clearCustomQuestionsList() {
    if (customQuestionsList) customQuestionsList.innerHTML = '';
    if (noCustomQuestionsMsg) noCustomQuestionsMsg.style.display = 'block';
  }

  function addCustomQuestionRow(data = {}) {
    if (!customQuestionsList) return;
    if (noCustomQuestionsMsg) noCustomQuestionsMsg.style.display = 'none';

    const qid = data.id || ('cq_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6));
    const prompt = data.prompt || '';
    const isRequired = !!data.required;

    const row = document.createElement('div');
    row.className = 'custom-q-row';
    row.dataset.qid = qid;

    row.innerHTML = `
      <span class="custom-q-index">Q:</span>
      <input type="text" class="custom-q-prompt" placeholder="e.g. GitHub Profile URL, Team Name, Prior Experience..." value="${escapeHTML(prompt)}" required>
      <label class="custom-q-toggle" title="Toggle Required / Optional for attendees">
        <input type="checkbox" class="custom-q-req-checkbox" ${isRequired ? 'checked' : ''}>
        <span class="custom-q-req-text ${isRequired ? 'is-required' : 'is-optional'}">${isRequired ? 'Required *' : 'Optional'}</span>
      </label>
      <button type="button" class="custom-q-del-btn" title="Remove question">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;

    // Event: Toggle Required Label
    const checkbox = row.querySelector('.custom-q-req-checkbox');
    const labelSpan = row.querySelector('.custom-q-req-text');
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        labelSpan.textContent = 'Required *';
        labelSpan.className = 'custom-q-req-text is-required';
      } else {
        labelSpan.textContent = 'Optional';
        labelSpan.className = 'custom-q-req-text is-optional';
      }
    });

    // Event: Delete Row
    const delBtn = row.querySelector('.custom-q-del-btn');
    delBtn.addEventListener('click', () => {
      row.remove();
      updateCustomQuestionIndices();
    });

    customQuestionsList.appendChild(row);
    updateCustomQuestionIndices();

    const input = row.querySelector('.custom-q-prompt');
    if (!prompt && input) input.focus();
  }

  function updateCustomQuestionIndices() {
    if (!customQuestionsList) return;
    const rows = customQuestionsList.querySelectorAll('.custom-q-row');
    if (rows.length === 0) {
      if (noCustomQuestionsMsg) noCustomQuestionsMsg.style.display = 'block';
    } else {
      if (noCustomQuestionsMsg) noCustomQuestionsMsg.style.display = 'none';
      rows.forEach((r, idx) => {
        const idxSpan = r.querySelector('.custom-q-index');
        if (idxSpan) idxSpan.textContent = `Q${idx + 1}:`;
      });
    }
  }

  function getCustomQuestionsFromForm() {
    if (!customQuestionsList) return [];
    const rows = customQuestionsList.querySelectorAll('.custom-q-row');
    const list = [];
    rows.forEach((r, idx) => {
      const promptInput = r.querySelector('.custom-q-prompt');
      const reqCheckbox = r.querySelector('.custom-q-req-checkbox');
      const prompt = promptInput ? promptInput.value.trim() : '';
      if (prompt) {
        list.push({
          id: r.dataset.qid || ('cq_' + idx),
          prompt: prompt,
          required: reqCheckbox ? reqCheckbox.checked : false
        });
      }
    });
    return list;
  }

  function openNewEventModal() {
    eventEditorForm.reset();
    editEventId.value = '';
    modalEventTitle.textContent = 'Publish New Event';
    saveEventBtnText.textContent = 'Publish Event';
    formEventStatus.value = 'open';
    formEventGoodies.value = '🎁 Goodies Included';
    formEventCapacity.value = '120';
    formEventCategory.value = 'Workshop';
    if (formEventRegType) formEventRegType.value = 'native';
    if (externalRegUrlGroup) externalRegUrlGroup.style.display = 'none';
    if (nativeFieldsConfigGroup) nativeFieldsConfigGroup.style.display = 'block';

    if (fieldReqPhone) fieldReqPhone.checked = true;
    if (fieldReqBranch) fieldReqBranch.checked = true;
    if (fieldReqYear) fieldReqYear.checked = true;
    if (fieldReqRoll) fieldReqRoll.checked = true;
    if (fieldReqQuery) fieldReqQuery.checked = true;

    clearCustomQuestionsList();

    if (formEventExternalUrl) {
      formEventExternalUrl.value = '';
      formEventExternalUrl.required = false;
      if (window.AwsValidation) window.AwsValidation.clearFieldError(formEventExternalUrl);
    }
    eventModalOverlay.classList.add('open');
  }

  function openEditModal(eventId) {
    const ev = cachedEvents.find(e => e.id === eventId);
    if (!ev) return;

    editEventId.value = ev.id;
    modalEventTitle.textContent = 'Edit Event: ' + ev.title;
    saveEventBtnText.textContent = 'Save Changes';

    formEventTitle.value = ev.title || '';
    formEventCategory.value = ev.category || 'Workshop';
    formEventStatus.value = ev.status || 'open';
    formEventDateDisplay.value = ev.dateDisplay || '';
    formEventDateISO.value = ev.dateISO || '';
    formEventVenue.value = ev.venue || '';
    formEventCapacity.value = ev.capacity || 120;
    formEventGoodies.value = ev.goodies || '🎁 Goodies Included';
    formEventDesc.value = ev.description || '';
    formEventPhotos.value = ev.photosUrl || '';
    formEventFeedback.value = ev.feedbackUrl || '';

    const isExt = ev.registrationType === 'external';
    if (formEventRegType) formEventRegType.value = isExt ? 'external' : 'native';
    if (externalRegUrlGroup) externalRegUrlGroup.style.display = isExt ? 'block' : 'none';
    if (nativeFieldsConfigGroup) nativeFieldsConfigGroup.style.display = isExt ? 'none' : 'block';

    const rf = ev.registrationFields || { phone: true, branch: true, year: true, rollNumber: true, query: true };
    if (fieldReqPhone) fieldReqPhone.checked = rf.phone !== false;
    if (fieldReqBranch) fieldReqBranch.checked = rf.branch !== false;
    if (fieldReqYear) fieldReqYear.checked = rf.year !== false;
    if (fieldReqRoll) fieldReqRoll.checked = rf.rollNumber !== false;
    if (fieldReqQuery) fieldReqQuery.checked = rf.query !== false;

    // Load custom questions
    clearCustomQuestionsList();
    if (Array.isArray(rf.customQuestions) && rf.customQuestions.length > 0) {
      rf.customQuestions.forEach(q => addCustomQuestionRow(q));
    } else if (rf.custom && rf.customLabel) {
      addCustomQuestionRow({ id: 'cq_legacy', prompt: rf.customLabel, required: false });
    }

    if (formEventExternalUrl) {
      formEventExternalUrl.value = ev.externalRegistrationUrl || '';
      formEventExternalUrl.required = isExt;
      if (window.AwsValidation) window.AwsValidation.clearFieldError(formEventExternalUrl);
    }

    eventModalOverlay.classList.add('open');
  }

  function closeEventModal() {
    eventModalOverlay.classList.remove('open');
  }

  async function handleEventFormSubmit(e) {
    e.preventDefault();
    const id = editEventId.value.trim();

    // Client-side Validation
    let hasError = false;
    const titleVal = window.AwsValidation ? window.AwsValidation.validateEventTitle(formEventTitle.value) : { valid: true };
    if (!titleVal.valid) {
      window.AwsValidation.showFieldError(formEventTitle, titleVal.message);
      hasError = true;
    } else if (window.AwsValidation) {
      window.AwsValidation.clearFieldError(formEventTitle);
    }

    const capVal = window.AwsValidation ? window.AwsValidation.validateCapacity(formEventCapacity.value) : { valid: true };
    if (!capVal.valid) {
      window.AwsValidation.showFieldError(formEventCapacity, capVal.message);
      hasError = true;
    } else if (window.AwsValidation) {
      window.AwsValidation.clearFieldError(formEventCapacity);
    }

    // Validate URLs (prevent javascript: or data: XSS)
    const validateUrlField = (inputEl, required = false) => {
      const val = inputEl ? inputEl.value.trim() : '';
      if (!val) {
        if (required) {
          if (window.AwsValidation) window.AwsValidation.showFieldError(inputEl, 'This URL field is required.');
          return false;
        }
        if (window.AwsValidation) window.AwsValidation.clearFieldError(inputEl);
        return true;
      }
      if (!/^https?:\/\//i.test(val)) {
        if (window.AwsValidation) window.AwsValidation.showFieldError(inputEl, 'URL must begin with http:// or https://');
        return false;
      }
      if (window.AwsValidation) window.AwsValidation.clearFieldError(inputEl);
      return true;
    };

    if (!validateUrlField(formEventPhotos)) hasError = true;
    if (!validateUrlField(formEventFeedback)) hasError = true;

    const isExternalReg = formEventRegType && formEventRegType.value === 'external';
    if (isExternalReg) {
      if (!validateUrlField(formEventExternalUrl, true)) hasError = true;
    } else if (formEventExternalUrl && window.AwsValidation) {
      window.AwsValidation.clearFieldError(formEventExternalUrl);
    }

    if (hasError) return;

    const customQuestions = isExternalReg ? [] : getCustomQuestionsFromForm();

    const eventData = {
      id: id || undefined,
      title: formEventTitle.value.trim(),
      category: formEventCategory.value,
      status: formEventStatus.value,
      dateDisplay: formEventDateDisplay.value.trim(),
      dateISO: formEventDateISO.value || undefined,
      venue: formEventVenue.value.trim(),
      capacity: parseInt(formEventCapacity.value, 10) || 120,
      goodies: formEventGoodies.value.trim(),
      description: formEventDesc.value.trim(),
      photosUrl: formEventPhotos.value.trim(),
      feedbackUrl: formEventFeedback.value.trim(),
      registrationType: isExternalReg ? 'external' : 'native',
      externalRegistrationUrl: isExternalReg ? formEventExternalUrl.value.trim() : '',
      registrationFields: isExternalReg ? null : {
        phone: fieldReqPhone ? fieldReqPhone.checked : true,
        branch: fieldReqBranch ? fieldReqBranch.checked : true,
        year: fieldReqYear ? fieldReqYear.checked : true,
        rollNumber: fieldReqRoll ? fieldReqRoll.checked : true,
        query: fieldReqQuery ? fieldReqQuery.checked : true,
        customQuestions: customQuestions,
        custom: customQuestions.length > 0,
        customLabel: customQuestions.length > 0 ? customQuestions[0].prompt : ''
      },
      registrationOpen: formEventStatus.value === 'open'
    };

    try {
      const saved = await service.saveEvent(eventData);
      closeEventModal();
      showToast(id ? 'Event updated successfully!' : 'Event published live on website!');
      await loadEvents();
      updateStats();
    } catch (err) {
      alert('Error saving event: ' + err.message);
    }
  }

  async function toggleReg(eventId, isOpen) {
    try {
      await service.toggleRegistrationStatus(eventId, isOpen);
      showToast(isOpen ? 'Registrations opened for this event.' : 'Registrations closed.');
      await loadEvents();
      updateStats();
    } catch (err) {
      alert('Error toggling registration: ' + err.message);
    }
  }

  async function confirmDeleteEvent(eventId) {
    const ev = cachedEvents.find(e => e.id === eventId);
    if (!ev) return;

    if (confirm(`Are you sure you want to delete "${ev.title}"? This will also remove any captured registrations for this event.`)) {
      try {
        await service.deleteEvent(eventId);
        showToast('Event deleted.');
        await loadEvents();
        await loadRegistrations();
        updateStats();
      } catch (err) {
        alert('Error deleting event: ' + err.message);
      }
    }
  }

  // ===================================================
  // REGISTRATIONS LOGIC
  // ===================================================
  async function loadRegistrations() {
    cachedRegistrations = await service.getAllRegistrations();
    renderRegistrationsTable();
  }

  function populateEventFilterDropdown() {
    const selected = regEventFilter.value || 'all';
    regEventFilter.innerHTML = '<option value="all">All Events</option>' +
      cachedEvents.map(e => `<option value="${e.id}">${escapeHTML(e.title)}</option>`).join('');
    regEventFilter.value = selected;
  }

  function viewEventRegistrations(eventId) {
    switchTab('registrations');
    regEventFilter.value = eventId;
    renderRegistrationsTable();
  }

  function renderRegistrationsTable() {
    const filterEventId = regEventFilter.value;
    const search = (regSearchInput.value || '').trim().toLowerCase();

    const filtered = cachedRegistrations.filter(r => {
      const matchEvent = filterEventId === 'all' || r.eventId === filterEventId;
      const matchSearch = !search ||
        (r.fullName && r.fullName.toLowerCase().includes(search)) ||
        (r.email && r.email.toLowerCase().includes(search)) ||
        (r.rollNumber && r.rollNumber.toLowerCase().includes(search)) ||
        (r.phone && r.phone.toLowerCase().includes(search)) ||
        (r.id && r.id.toLowerCase().includes(search));
      return matchEvent && matchSearch;
    });

    if (filtered.length === 0) {
      registrationsTableBody.innerHTML = `
        <tr>
          <td colspan="8">
            <div class="empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
              <h4>No Registrations Found</h4>
              <p>No student signups recorded for this filter.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    registrationsTableBody.innerHTML = filtered.map(r => {
      const regDate = r.registeredAt ? new Date(r.registeredAt).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }) : '—';

      let customBadges = '';
      if (Array.isArray(r.customResponses) && r.customResponses.length > 0) {
        customBadges = r.customResponses.map(cr => `
          <div class="student-meta" style="color: #93c5fd; font-size: 11px; margin-top: 2px;" title="${escapeHTML(cr.prompt)}: ${escapeHTML(cr.answer)}">
            <span style="color: var(--text-dim);">${escapeHTML(cr.prompt)}:</span> <strong>${escapeHTML(cr.answer || '—')}</strong>
          </div>
        `).join('');
      } else if (r.customQuestion && r.customAnswer) {
        customBadges = `
          <div class="student-meta" style="color: #93c5fd; font-size: 11px; margin-top: 2px;">
            <span style="color: var(--text-dim);">${escapeHTML(r.customQuestion)}:</span> <strong>${escapeHTML(r.customAnswer)}</strong>
          </div>
        `;
      }

      return `
        <tr>
          <td><span class="table-reg-id">${escapeHTML(r.id || '—')}</span></td>
          <td>
            <strong>${escapeHTML(r.fullName)}</strong>
            ${r.query ? `<div class="student-meta" style="color: var(--orange-light);" title="${escapeHTML(r.query)}">Note: "${escapeHTML(r.query)}"</div>` : ''}
            ${customBadges}
          </td>
          <td>
            <div><a href="mailto:${escapeHTML(r.email)}" style="color: var(--blue-light); text-decoration: none;">${escapeHTML(r.email)}</a></div>
            <div class="student-meta"><a href="tel:${escapeHTML(r.phone)}" style="color: var(--text-dim); text-decoration: none;">📞 ${escapeHTML(r.phone)}</a></div>
          </td>
          <td>
            <div>${escapeHTML(r.branch || 'CSE')} (${escapeHTML(r.year || '1st Year')})</div>
            <div class="student-meta">${escapeHTML(r.college || 'SKIT Jaipur')}</div>
          </td>
          <td><code>${escapeHTML(r.rollNumber || '—')}</code></td>
          <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHTML(r.eventTitle || '')}">
            ${escapeHTML(r.eventTitle || '—')}
          </td>
          <td style="font-size: 12px; color: var(--text-dim);">${regDate}</td>
          <td>
            <button class="btn-icon delete" title="Cancel/Remove Registration" onclick="AwsAdminApp.confirmDeleteRegistration('${r.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function handleExportCsv() {
    const filterEventId = regEventFilter.value;
    let regs = cachedRegistrations;
    let eventTitle = 'All-Events';

    if (filterEventId !== 'all') {
      regs = regs.filter(r => r.eventId === filterEventId);
      const ev = cachedEvents.find(e => e.id === filterEventId);
      if (ev) eventTitle = ev.title.replace(/[^a-zA-Z0-9_-]/g, '_');
    }

    if (regs.length === 0) {
      alert('No registrations available to export.');
      return;
    }

    const csvData = service.generateRegistrationsCSV(regs, eventTitle);
    if (csvData) {
      const filename = `aws-sbg-skit-${eventTitle}-registrations-${Date.now()}.csv`;
      service.downloadCSV(csvData, filename);
      showToast(`Exported ${regs.length} registrations to CSV!`);
    }
  }

  function handleCopyEmails() {
    const filterEventId = regEventFilter.value;
    let regs = cachedRegistrations;
    if (filterEventId !== 'all') {
      regs = regs.filter(r => r.eventId === filterEventId);
    }

    if (regs.length === 0) {
      alert('No attendee emails to copy.');
      return;
    }

    const emails = Array.from(new Set(regs.map(r => r.email).filter(Boolean))).join(', ');
    navigator.clipboard.writeText(emails).then(() => {
      showToast(`Copied ${regs.length} attendee email(s) to clipboard!`);
    }).catch(err => {
      prompt('Copy the attendee emails below:', emails);
    });
  }

  async function confirmDeleteRegistration(regId) {
    if (confirm('Are you sure you want to delete this registration?')) {
      try {
        await service.deleteRegistration(regId);
        showToast('Registration deleted.');
        await loadRegistrations();
        updateStats();
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  }

  // ===================================================
  // STATS & METRICS
  // ===================================================
  function updateStats() {
    const totalEvents = cachedEvents.length;
    const openEvents = cachedEvents.filter(e => e.status === 'open').length;
    const totalRegs = cachedRegistrations.length;
    const totalChamps = cachedChampions.length;

    if (statTotalEvents) statTotalEvents.textContent = totalEvents;
    if (statOpenEvents) statOpenEvents.textContent = openEvents;
    if (statTotalRegistrations) statTotalRegistrations.textContent = totalRegs;
    if (statTotalChampions) statTotalChampions.textContent = totalChamps;

    if (badgeEventsCount) badgeEventsCount.textContent = totalEvents;
    if (badgeRegsCount) badgeRegsCount.textContent = totalRegs;
    if (badgeChampionsCount) badgeChampionsCount.textContent = totalChamps;
  }

  // ===================================================
  // HALL OF FAME / CHAMPIONS LOGIC
  // ===================================================
  async function loadChampions() {
    try {
      cachedChampions = await service.getChampions();
      renderChampionsGrid();
      updateStats();
    } catch (err) {
      console.warn('Failed to load champions:', err);
    }
  }

  function renderChampionsGrid() {
    if (!adminChampionsGrid) return;
    const search = (champSearchInput && champSearchInput.value || '').trim().toLowerCase();
    const filtered = cachedChampions.filter(c => {
      if (!search) return true;
      return (c.title && c.title.toLowerCase().includes(search)) ||
             (c.badge && c.badge.toLowerCase().includes(search)) ||
             (c.desc && c.desc.toLowerCase().includes(search)) ||
             (c.subtitle && c.subtitle.toLowerCase().includes(search));
    });

    if (filtered.length === 0) {
      adminChampionsGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="8" r="7"></circle>
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
          </svg>
          <h4>No Champions Found</h4>
          <p>No Hall of Fame entries match your search criteria.</p>
        </div>
      `;
      return;
    }

    adminChampionsGrid.innerHTML = filtered.map(ch => {
      const img = ch.imageUrl || 'assets/spotlight/winner-1.jpg';
      return `
        <div class="admin-champ-card" data-champ-id="${ch.id}">
          <div class="admin-champ-img-wrap">
            <span class="admin-champ-badge-overlay">${escapeHTML(ch.badge || '🏆 WINNER')}</span>
            <img src="${escapeHTML(img)}" alt="${escapeHTML(ch.title)}" onerror="this.src='assets/spotlight/winner-1.jpg'">
          </div>
          <div class="admin-champ-content">
            <h3>${escapeHTML(ch.title)}</h3>
            ${ch.subtitle ? `<div style="font-size: 12px; color: var(--orange-light); margin-bottom: 6px;">${escapeHTML(ch.subtitle)}</div>` : ''}
            <p>${escapeHTML(ch.desc || 'No description provided.')}</p>

            <div class="admin-champ-footer">
              <span class="admin-champ-likes">❤️ ${ch.likes || 0} likes</span>
              <div class="card-action-btns">
                <button class="btn-icon" title="Edit Champion" onclick="AwsAdminApp.openEditChampionModal('${ch.id}')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                </button>
                <button class="btn-icon delete" title="Delete Winner" onclick="AwsAdminApp.confirmDeleteChampion('${ch.id}')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function openNewChampionModal() {
    championEditorForm.reset();
    editChampionId.value = '';
    modalChampionTitle.textContent = 'Add Winner to Hall of Fame';
    saveChampionBtnText.textContent = 'Save Winner';
    formChampBadge.value = '🏆 1st PLACE';
    champImgPreviewContainer.style.display = 'none';
    champImgPreview.src = '';
    championModalOverlay.classList.add('open');
  }

  function openEditChampionModal(champId) {
    const ch = cachedChampions.find(c => c.id === champId);
    if (!ch) return;

    editChampionId.value = ch.id;
    modalChampionTitle.textContent = 'Edit Winner: ' + ch.title;
    saveChampionBtnText.textContent = 'Save Changes';

    formChampTitle.value = ch.title || '';
    formChampBadge.value = ch.badge || '🏆 1st PLACE';
    formChampEvent.value = ch.event || '';
    formChampSubtitle.value = ch.subtitle || '';
    formChampDesc.value = ch.desc || '';
    formChampImageUrl.value = ch.imageUrl || '';

    if (ch.imageUrl) {
      champImgPreview.src = ch.imageUrl;
      champImgPreviewContainer.style.display = 'block';
    } else {
      champImgPreviewContainer.style.display = 'none';
    }

    championModalOverlay.classList.add('open');
  }

  function closeChampionModal() {
    championModalOverlay.classList.remove('open');
  }

  function handleChampionFileUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const img = new Image();
      img.onload = () => {
        // Optimize using canvas to max 1000px
        const maxDim = 1000;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        formChampImageUrl.value = compressedDataUrl;
        champImgPreview.src = compressedDataUrl;
        champImgPreviewContainer.style.display = 'block';
        showToast('Winner photo uploaded & optimized!', 'success');
      };
      img.src = uploadEvent.target.result;
    };
    reader.readAsDataURL(file);
  }

  async function handleChampionFormSubmit(e) {
    e.preventDefault();
    const id = editChampionId.value.trim();
    const title = formChampTitle.value.trim();
    const badge = formChampBadge.value.trim();
    const imageUrl = formChampImageUrl.value.trim();

    if (!title) {
      alert('Winner title/name is required.');
      return;
    }
    if (!imageUrl) {
      alert('Please upload an image or provide an image URL for the winner.');
      return;
    }

    const champData = {
      id: id || undefined,
      title,
      badge: badge || '🏆 WINNER',
      event: formChampEvent.value.trim(),
      subtitle: formChampSubtitle.value.trim(),
      desc: formChampDesc.value.trim(),
      imageUrl
    };

    try {
      await service.saveChampion(champData);
      closeChampionModal();
      showToast(id ? 'Winner updated successfully!' : 'Winner added to Hall of Fame live!');
      await loadChampions();
    } catch (err) {
      alert('Error saving winner: ' + err.message);
    }
  }

  async function confirmDeleteChampion(champId) {
    const ch = cachedChampions.find(c => c.id === champId);
    if (!ch) return;

    if (confirm(`Are you sure you want to remove "${ch.title}" from the Hall of Fame?`)) {
      try {
        await service.deleteChampion(champId);
        showToast('Winner removed from Hall of Fame.');
        await loadChampions();
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  }

  // ===================================================
  // SETTINGS & CLOUD LOGIC
  // ===================================================
  function loadFirebaseConfigView() {
    const cfg = service.getFirebaseConfig();
    if (cfg) {
      firebaseConfigInput.value = JSON.stringify(cfg, null, 2);
    }
  }

  function handleSaveFirebaseConfig() {
    const raw = firebaseConfigInput.value.trim();
    if (!raw) {
      service.setFirebaseConfig(null);
      updateDbStatusBadge();
      showToast('Firebase config cleared. Using local store.', 'success');
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      const res = service.setFirebaseConfig(parsed);
      if (res.success) {
        updateDbStatusBadge();
        showToast('Firebase configuration saved and initialized!', 'success');
      } else {
        alert('Configuration error: ' + res.error);
      }
    } catch (err) {
      alert('Invalid JSON: ' + err.message);
    }
  }

  function handleClearFirebaseConfig() {
    if (confirm('Reset to local browser storage?')) {
      firebaseConfigInput.value = '';
      service.setFirebaseConfig(null);
      updateDbStatusBadge();
      showToast('Switched to local storage mode.', 'success');
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    const curPass = currentPasswordInput.value;
    const newUsername = newUsernameInput.value.trim();
    const newPass = newPasswordInput.value;

    if (!curPass) {
      alert('Please enter your current password.');
      return;
    }

    if (newUsername && window.AwsValidation) {
      const uVal = window.AwsValidation.validateUsername(newUsername);
      if (!uVal.valid) {
        alert(uVal.message);
        return;
      }
    }

    if (newPass.length < 6) {
      alert('New password must be at least 6 characters long.');
      return;
    }

    try {
      const res = await service.changeAdminPassword(curPass, newUsername, newPass);
      if (res.success) {
        showToast(res.message);
        changePasswordForm.reset();
        const updatedUser = service.getCurrentUser() || 'admin';
        navUsername.textContent = updatedUser;
        navUserInitial.textContent = updatedUser.charAt(0).toUpperCase();
      } else {
        alert(res.message);
      }
    } catch (err) {
      alert('Error updating password: ' + err.message);
    }
  }

  // ===================================================
  // HELPERS & EVENT LISTENERS
  // ===================================================
  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function attachEventListeners() {
    adminLoginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);

    if (resetDefaultCredsBtn) {
      resetDefaultCredsBtn.addEventListener('click', handleResetToDefault);
    }

    adminTabs.forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Events filters
    eventSearchInput.addEventListener('input', renderEventsGrid);
    eventFilterStatus.addEventListener('change', renderEventsGrid);
    openNewEventModalBtn.addEventListener('click', openNewEventModal);

    // Event modal handlers
    closeEventModalBtn.addEventListener('click', closeEventModal);
    cancelEventModalBtn.addEventListener('click', closeEventModal);
    eventEditorForm.addEventListener('submit', handleEventFormSubmit);

    if (formEventRegType && externalRegUrlGroup) {
      formEventRegType.addEventListener('change', () => {
        const isExt = formEventRegType.value === 'external';
        externalRegUrlGroup.style.display = isExt ? 'block' : 'none';
        if (nativeFieldsConfigGroup) {
          nativeFieldsConfigGroup.style.display = isExt ? 'none' : 'block';
        }
        if (formEventExternalUrl) {
          formEventExternalUrl.required = isExt;
          if (!isExt && window.AwsValidation) {
            window.AwsValidation.clearFieldError(formEventExternalUrl);
          }
        }
      });
    }

    if (addCustomQuestionBtn) {
      addCustomQuestionBtn.addEventListener('click', () => {
        addCustomQuestionRow();
      });
    }

    eventModalOverlay.addEventListener('click', (e) => {
      if (e.target === eventModalOverlay) closeEventModal();
    });

    // Registrations handlers
    regEventFilter.addEventListener('change', renderRegistrationsTable);
    regSearchInput.addEventListener('input', renderRegistrationsTable);
    exportCsvBtn.addEventListener('click', handleExportCsv);
    copyEmailsBtn.addEventListener('click', handleCopyEmails);

    // Champions handlers
    if (openNewChampionModalBtn) openNewChampionModalBtn.addEventListener('click', openNewChampionModal);
    if (closeChampionModalBtn) closeChampionModalBtn.addEventListener('click', closeChampionModal);
    if (cancelChampionModalBtn) cancelChampionModalBtn.addEventListener('click', closeChampionModal);
    if (championEditorForm) championEditorForm.addEventListener('submit', handleChampionFormSubmit);
    if (champSearchInput) champSearchInput.addEventListener('input', renderChampionsGrid);
    if (formChampFile) formChampFile.addEventListener('change', handleChampionFileUpload);
    if (formChampImageUrl) {
      formChampImageUrl.addEventListener('input', () => {
        const url = formChampImageUrl.value.trim();
        if (url) {
          champImgPreview.src = url;
          champImgPreviewContainer.style.display = 'block';
        } else {
          champImgPreviewContainer.style.display = 'none';
        }
      });
    }
    if (championModalOverlay) {
      championModalOverlay.addEventListener('click', (e) => {
        if (e.target === championModalOverlay) closeChampionModal();
      });
    }

    // Settings handlers
    saveFirebaseConfigBtn.addEventListener('click', handleSaveFirebaseConfig);
    clearFirebaseConfigBtn.addEventListener('click', handleClearFirebaseConfig);
    changePasswordForm.addEventListener('submit', handleChangePassword);
  }

  // Public API for inline onclick handlers
  window.AwsAdminApp = {
    viewEventRegistrations,
    toggleReg,
    openEditModal,
    confirmDeleteEvent,
    confirmDeleteRegistration,
    openEditChampionModal,
    confirmDeleteChampion
  };

  // Run on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

