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

  // DOM Elements - Certificates Tab
  const badgeCertsCount = document.getElementById('badgeCertsCount');
  const certEventFilter = document.getElementById('certEventFilter');
  const certRoleSelect = document.getElementById('certRoleSelect');
  const certIssueDateInput = document.getElementById('certIssueDateInput');
  const certDescGroup = document.getElementById('certDescGroup');
  const certDescInput = document.getElementById('certDescInput');
  const certDescCharCount = document.getElementById('certDescCharCount');
  const uploadExcelInput = document.getElementById('uploadExcelInput');
  const certCustomTextGroup = document.getElementById('certCustomTextGroup');
  const certCustomTextInput = document.getElementById('certCustomTextInput');
  const formatCard1 = document.getElementById('formatCard1');
  const formatCard2 = document.getElementById('formatCard2');
  const certAttendeeCountLabel = document.getElementById('certAttendeeCountLabel');
  const btnPreviewSelectedCert = document.getElementById('btnPreviewSelectedCert');
  const btnBulkGenerateCerts = document.getElementById('btnBulkGenerateCerts');
  const btnBulkDownloadZip = document.getElementById('btnBulkDownloadZip');
  const btnBulkEmailCerts = document.getElementById('btnBulkEmailCerts');
  const selectAllCertsCheckbox = document.getElementById('selectAllCertsCheckbox');
  const certificatesTableBody = document.getElementById('certificatesTableBody');

  // DOM Elements - Certificate Preview Modal
  const certPreviewModalOverlay = document.getElementById('certPreviewModalOverlay');
  const closeCertPreviewModalBtn = document.getElementById('closeCertPreviewModalBtn');
  const certPreviewModalTitle = document.getElementById('certPreviewModalTitle');
  const certPreviewModalSub = document.getElementById('certPreviewModalSub');
  const certPreviewCanvasHolder = document.getElementById('certPreviewCanvasHolder');
  const certPreviewModalId = document.getElementById('certPreviewModalId');
  const certPreviewModalVerifyLink = document.getElementById('certPreviewModalVerifyLink');
  const certPreviewCopyLinkBtn = document.getElementById('certPreviewCopyLinkBtn');
  const certPreviewDownloadPngBtn = document.getElementById('certPreviewDownloadPngBtn');
  const certPreviewDownloadPdfBtn = document.getElementById('certPreviewDownloadPdfBtn');

  // DOM Elements - Bulk Email Modal
  const certEmailModalOverlay = document.getElementById('certEmailModalOverlay');
  const closeCertEmailModalBtn = document.getElementById('closeCertEmailModalBtn');
  const certEmailModalSubtitle = document.getElementById('certEmailModalSubtitle');
  const certEmailEventName = document.getElementById('certEmailEventName');
  const certEmailRecipientSummary = document.getElementById('certEmailRecipientSummary');
  const certEmailFormatBadge = document.getElementById('certEmailFormatBadge');
  const certEmailSubject = document.getElementById('certEmailSubject');
  const certEmailBodyTemplate = document.getElementById('certEmailBodyTemplate');
  const certEmailProgressContainer = document.getElementById('certEmailProgressContainer');
  const certEmailProgressLabel = document.getElementById('certEmailProgressLabel');
  const certEmailProgressPercent = document.getElementById('certEmailProgressPercent');
  const certEmailProgressBar = document.getElementById('certEmailProgressBar');
  const certEmailStatusLog = document.getElementById('certEmailStatusLog');
  const certEmailCopyLinksBatchBtn = document.getElementById('certEmailCopyLinksBatchBtn');
  const certEmailMailtoBtn = document.getElementById('certEmailMailtoBtn');
  const certEmailDispatchBtn = document.getElementById('certEmailDispatchBtn');
  const gmailAppPasswordInput = document.getElementById('gmailAppPasswordInput');
  const btnTestSmtpConnection = document.getElementById('btnTestSmtpConnection');
  const smtpConnectionBadge = document.getElementById('smtpConnectionBadge');
  const saveGmailAppPwCheckbox = document.getElementById('saveGmailAppPwCheckbox');

  // Toast
  const adminToast = document.getElementById('adminToast');
  const toastMsg = document.getElementById('toastMsg');
  const toastIcon = document.getElementById('toastIcon');
  let toastTimer = null;

  // Cached state
  let cachedEvents = [];
  let cachedRegistrations = [];
  let cachedChampions = [];
  let cachedCertificates = [];
  let currentPreviewCanvas = null;
  let currentPreviewCertId = '';
  let activeCertFormat = 'format1';

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
    await Promise.all([loadEvents(), loadRegistrations(), loadChampions(), loadCertificates()]);
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
    const tabCerts = document.getElementById('tabCertificatesView');
    const tabChamps = document.getElementById('tabChampionsView');
    const tabSettings = document.getElementById('tabSettingsView');

    if (tabEvents) tabEvents.style.display = tabName === 'events' ? 'block' : 'none';
    if (tabRegs) tabRegs.style.display = tabName === 'registrations' ? 'block' : 'none';
    if (tabCerts) tabCerts.style.display = tabName === 'certificates' ? 'block' : 'none';
    if (tabChamps) tabChamps.style.display = tabName === 'champions' ? 'block' : 'none';
    if (tabSettings) tabSettings.style.display = tabName === 'settings' ? 'block' : 'none';

    if (tabName === 'events') renderEventsGrid();
    if (tabName === 'registrations') renderRegistrationsTable();
    if (tabName === 'certificates') renderCertificatesTab();
    if (tabName === 'champions') renderChampionsGrid();
  }

  // ===================================================
  // EVENTS LOGIC
  // ===================================================
  async function loadEvents() {
    cachedEvents = await service.getEvents();
    renderEventsGrid();
    populateEventFilterDropdown();
    populateCertEventFilterDropdown();
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
    if (document.getElementById('tabCertificatesView') && document.getElementById('tabCertificatesView').style.display !== 'none') {
      renderCertificatesTable();
    }
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
    if (badgeCertsCount) badgeCertsCount.textContent = cachedCertificates.length;
  }

  // ===================================================
  // CERTIFICATES & AUTOMATED ISSUANCE LOGIC
  // ===================================================
  function getLiveVerifyBaseUrl() {
    if (window.AwsCertificateEngine && typeof window.AwsCertificateEngine.getLiveVerifyBaseUrl === 'function') {
      return window.AwsCertificateEngine.getLiveVerifyBaseUrl();
    }
    if (service && typeof service.getLiveVerifyBaseUrl === 'function') {
      return service.getLiveVerifyBaseUrl();
    }
    if (typeof window !== 'undefined' && window.location) {
      const host = window.location.hostname;
      if (host && host !== 'localhost' && host !== '127.0.0.1' && !host.startsWith('192.168.') && !host.startsWith('10.') && !host.endsWith('.local')) {
        return window.location.origin;
      }
    }
    return 'https://aws-sbg-skit.vercel.app';
  }

  async function loadCertificates() {
    try {
      if (service && service.getCertificates) {
        cachedCertificates = await service.getCertificates();
      } else {
        cachedCertificates = [];
      }
    } catch (e) {
      console.warn('Error loading certificates:', e);
      cachedCertificates = [];
    }
    updateCertBadge();
  }

  function updateCertBadge() {
    if (badgeCertsCount) {
      badgeCertsCount.textContent = cachedCertificates.length;
    }
  }

  function populateCertEventFilterDropdown() {
    if (!certEventFilter) return;
    const currentVal = certEventFilter.value;
    certEventFilter.innerHTML = '<option value="">-- Choose Event --</option>';

    cachedEvents.forEach(ev => {
      const opt = document.createElement('option');
      opt.value = ev.id;
      opt.textContent = `${ev.title} (${ev.dateDisplay || ev.date || 'TBA'})`;
      certEventFilter.appendChild(opt);
    });

    if (currentVal && cachedEvents.some(ev => ev.id === currentVal)) {
      certEventFilter.value = currentVal;
    } else if (cachedEvents.length > 0) {
      certEventFilter.value = cachedEvents[0].id;
      onCertEventChanged();
    }
  }

  function onCertEventChanged() {
    const selectedEventId = certEventFilter ? certEventFilter.value : '';
    const ev = cachedEvents.find(e => e.id === selectedEventId);
    if (ev) {
      const rawDate = ev.dateDisplay || ev.date || '15 Nov, 2026';
      if (certIssueDateInput) {
        // Automatically standardize date to "15 Nov, 2026"
        certIssueDateInput.value = window.AwsCertificateEngine && typeof window.AwsCertificateEngine.formatCertDate === 'function'
          ? window.AwsCertificateEngine.formatCertDate(rawDate)
          : rawDate.replace(/(\d+)(st|nd|rd|th)/gi, '$1');
      }
      if (certDescInput) {
        let desc = ev.description ? ev.description.slice(0, 40) : (ev.category || 'cloud workshop');
        if (desc.length > 40) desc = desc.slice(0, 40);
        certDescInput.value = desc;
        updateCertDescCharCount();
      }
    }
    renderCertificatesTable();
  }

  function updateCertDescCharCount() {
    if (certDescCharCount && certDescInput) {
      certDescCharCount.textContent = `${certDescInput.value.length} / 40`;
    }
  }

  function getSelectedCertFormat() {
    const radio = document.querySelector('input[name="certFormatChoice"]:checked');
    return radio ? radio.value : activeCertFormat;
  }

  function setSelectedCertFormat(formatKey) {
    activeCertFormat = formatKey === 'format2' ? 'format2' : 'format1';
    const radio = document.querySelector(`input[name="certFormatChoice"][value="${activeCertFormat}"]`);
    if (radio) radio.checked = true;

    if (formatCard1) formatCard1.classList.toggle('active', activeCertFormat === 'format1');
    if (formatCard2) formatCard2.classList.toggle('active', activeCertFormat === 'format2');

    const check1 = formatCard1 ? formatCard1.querySelector('.format-check') : null;
    const check2 = formatCard2 ? formatCard2.querySelector('.format-check') : null;
    if (check1) check1.textContent = activeCertFormat === 'format1' ? '✓ Active' : 'Select';
    if (check2) check2.textContent = activeCertFormat === 'format2' ? '✓ Active' : 'Select';

    if (certEmailFormatBadge) {
      certEmailFormatBadge.textContent = activeCertFormat === 'format1' ? 'Format 1: Dark Builder' : 'Format 2: Light Cloud';
    }
  }

  function renderCertificatesTab() {
    populateCertEventFilterDropdown();
    renderCertificatesTable();
  }

  function getEventRegistrationsForCert() {
    const selectedEventId = certEventFilter ? certEventFilter.value : '';
    if (!selectedEventId) return [];
    return cachedRegistrations.filter(r => r.eventId === selectedEventId);
  }

  function renderCertificatesTable() {
    if (!certificatesTableBody) return;
    const selectedEventId = certEventFilter ? certEventFilter.value : '';

    if (!selectedEventId) {
      certificatesTableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-dim);">
            Please select an event above to view registered participants and generate certificates.
          </td>
        </tr>
      `;
      if (certAttendeeCountLabel) certAttendeeCountLabel.textContent = '(0 participants)';
      return;
    }

    const eventRegs = getEventRegistrationsForCert();
    if (certAttendeeCountLabel) {
      certAttendeeCountLabel.textContent = `(${eventRegs.length} participants)`;
    }

    if (eventRegs.length === 0) {
      certificatesTableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-dim);">
            No participants registered for this event yet. As students register on the website, they will appear here automatically.
          </td>
        </tr>
      `;
      return;
    }

    certificatesTableBody.innerHTML = eventRegs.map(r => {
      const attendeeName = (r.fullName || r.name || 'Participant').trim();
      const cert = cachedCertificates.find(c => c.registrationId === r.id || (c.eventId === r.eventId && c.attendeeEmail?.toLowerCase() === r.email?.toLowerCase()));
      const certId = cert ? cert.id : null;
      const isSent = cert && cert.status === 'sent';
      const isReady = !!cert;

      const roleBadge = cert?.role || (certRoleSelect ? certRoleSelect.value : 'participant');

      let statusHtml = '<span class="badge-cert-pending">Pending</span>';
      if (isSent) {
        statusHtml = '<span class="badge-cert-sent">✓ Sent</span>';
      } else if (isReady) {
        statusHtml = '<span class="badge-cert-ready">● Ready</span>';
      }

      return `
        <tr data-reg-id="${escapeHTML(r.id)}">
          <td style="text-align: center;">
            <input type="checkbox" class="cert-row-checkbox" data-reg-id="${escapeHTML(r.id)}" data-cert-id="${certId || ''}">
          </td>
          <td>
            <div style="font-weight: 600; color: var(--text);">${escapeHTML(attendeeName)}</div>
            <div style="font-size: 11px; color: var(--text-dim);">${escapeHTML(r.phone || '')}</div>
          </td>
          <td>
            <span style="font-family: var(--mono); font-size: 12px; color: var(--text-dim);">${escapeHTML(r.email)}</span>
          </td>
          <td>
            <span style="font-size: 12px;">${escapeHTML(r.branch || '—')}</span>
            ${r.year ? `<small style="color: var(--text-dim); display: block;">${escapeHTML(r.year)}</small>` : ''}
          </td>
          <td>
            <span class="badge" style="background: rgba(255,255,255,0.06); color: var(--orange-light); text-transform: capitalize; font-size: 11px;">
              ${escapeHTML(roleBadge)}
            </span>
          </td>
          <td>
            ${certId 
              ? `<code style="font-family: var(--mono); color: var(--orange-light); font-size: 11.5px; font-weight: 600;">${escapeHTML(certId)}</code>` 
              : `<span style="color: var(--text-dim); font-size: 11.5px;">—</span>`
            }
          </td>
          <td>
            ${statusHtml}
          </td>
          <td>
            <div class="cert-action-btn-group">
              <button type="button" class="cert-icon-btn" onclick="window.AwsAdminApp.previewCert('${escapeHTML(r.id)}')" title="Live Preview Certificate">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span>Preview</span>
              </button>

              <button type="button" class="cert-icon-btn" onclick="window.AwsAdminApp.downloadCertPng('${escapeHTML(r.id)}')" title="Download High-Res PNG">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>PNG</span>
              </button>

              <button type="button" class="cert-icon-btn" onclick="window.AwsAdminApp.downloadCertPdf('${escapeHTML(r.id)}')" title="Download Print A4 PDF">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <span>PDF</span>
              </button>

              <button type="button" class="cert-icon-btn" onclick="window.AwsAdminApp.emailSingleCert('${escapeHTML(r.id)}')" title="Send Certificate Email">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </button>

              ${certId ? `
                <a href="${getLiveVerifyBaseUrl()}/verify.html?id=${encodeURIComponent(certId)}" target="_blank" class="cert-icon-btn" title="Open Official Verification Page (Live Registry)">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Generate or get existing certificate for a registration
  async function getOrGenerateCertificate(reg, ev) {
    const attendeeName = (reg.fullName || reg.name || 'Participant').trim();
    let cert = cachedCertificates.find(c => c.registrationId === reg.id || (c.eventId === reg.eventId && c.attendeeEmail?.toLowerCase() === reg.email?.toLowerCase()));
    if (cert) return cert;

    const role = certRoleSelect ? certRoleSelect.value : 'participant';
    const customText = certCustomTextInput ? certCustomTextInput.value : '';
    const issueDate = certIssueDateInput ? certIssueDateInput.value : (ev?.dateDisplay || '15th Nov, 2026');
    const desc = certDescInput ? certDescInput.value : (ev?.description ? ev.description.slice(0, 80) : '');
    const templateKey = getSelectedCertFormat();

    const certData = {
      eventId: ev ? ev.id : reg.eventId,
      eventTitle: ev ? ev.title : 'AWS SBG SKIT Event',
      eventDate: issueDate,
      eventDescription: desc,
      registrationId: reg.id,
      attendeeName: attendeeName,
      attendeeEmail: reg.email,
      attendeeBranch: reg.branch || '',
      attendeeYear: reg.year || '',
      role: role,
      customText: customText,
      templateKey: templateKey,
      status: 'ready'
    };

    cert = await service.saveCertificate(certData);
    await loadCertificates();
    return cert;
  }

  // Live Preview Modal logic
  async function previewCert(regId) {
    const selectedEventId = certEventFilter ? certEventFilter.value : '';
    const ev = cachedEvents.find(e => e.id === selectedEventId);
    const reg = cachedRegistrations.find(r => r.id === regId);
    if (!reg) return;

    showToast('Rendering live certificate preview...', 'info');

    const attendeeName = (reg.fullName || reg.name || 'Participant').trim();
    let cert = cachedCertificates.find(c => c.registrationId === reg.id || (c.eventId === reg.eventId && c.attendeeEmail?.toLowerCase() === reg.email?.toLowerCase()));
    const certId = cert ? cert.id : (window.AwsCertificateEngine && typeof AwsCertificateEngine.generateUniqueCertId === 'function' ? AwsCertificateEngine.generateUniqueCertId() : ('AWS-SBG-SKIT-2026-' + Math.random().toString(36).substring(2, 7).toUpperCase()));

    const role = cert?.role || (certRoleSelect ? certRoleSelect.value : 'participant');
    const customText = cert?.customText || (certCustomTextInput ? certCustomTextInput.value : '');
    const issueDate = cert?.eventDate || (certIssueDateInput ? certIssueDateInput.value : (ev?.dateDisplay || '15th Nov, 2026'));
    const desc = cert?.eventDescription || (certDescInput ? certDescInput.value : (ev?.description ? ev.description.slice(0, 80) : ''));
    const templateKey = cert?.templateKey || getSelectedCertFormat();

    const result = await window.AwsCertificateEngine.renderCertificate({
      attendeeName: attendeeName,
      eventTitle: ev ? ev.title : 'AWS SBG SKIT Event',
      eventDescription: desc,
      eventDate: issueDate,
      role: role,
      customText: customText,
      templateKey: templateKey,
      certificateId: certId,
      verifyBaseUrl: getLiveVerifyBaseUrl()
    });

    currentPreviewCanvas = result.canvas;
    currentPreviewCertId = result.certificateId;

    if (certPreviewCanvasHolder) {
      certPreviewCanvasHolder.innerHTML = '';
      certPreviewCanvasHolder.appendChild(result.canvas);
    }
    if (certPreviewModalTitle) {
      certPreviewModalTitle.textContent = `Certificate — ${attendeeName}`;
    }
    if (certPreviewModalSub) {
      certPreviewModalSub.textContent = `${ev ? ev.title : 'Event'} • Template: ${templateKey === 'format1' ? 'Dark Builder' : 'Light Cloud'}`;
    }
    if (certPreviewModalId) {
      certPreviewModalId.textContent = result.certificateId;
    }
    if (certPreviewModalVerifyLink) {
      certPreviewModalVerifyLink.href = `${getLiveVerifyBaseUrl()}/verify.html?id=${encodeURIComponent(result.certificateId)}`;
    }
    if (certPreviewModalOverlay) {
      certPreviewModalOverlay.style.display = 'flex';
    }
  }

  function previewFirstAttendee() {
    const eventRegs = getEventRegistrationsForCert();
    if (eventRegs.length === 0) {
      showToast('No participants available for this event to preview.', 'error');
      return;
    }
    previewCert(eventRegs[0].id);
  }

  function closeCertPreviewModal() {
    if (certPreviewModalOverlay) {
      certPreviewModalOverlay.style.display = 'none';
    }
  }

  async function downloadCertPng(regId) {
    const selectedEventId = certEventFilter ? certEventFilter.value : '';
    const ev = cachedEvents.find(e => e.id === selectedEventId);
    const reg = cachedRegistrations.find(r => r.id === regId);
    if (!reg) return;

    const attendeeName = (reg.fullName || reg.name || 'Participant').trim();
    showToast(`Generating PNG for ${attendeeName}...`, 'info');
    const cert = await getOrGenerateCertificate(reg, ev);

    const result = await window.AwsCertificateEngine.renderCertificate({
      attendeeName: attendeeName,
      eventTitle: ev ? ev.title : 'AWS SBG SKIT Event',
      eventDescription: cert.eventDescription,
      eventDate: cert.eventDate,
      role: cert.role,
      customText: cert.customText,
      templateKey: cert.templateKey || getSelectedCertFormat(),
      certificateId: cert.id,
      verifyBaseUrl: getLiveVerifyBaseUrl()
    });

    const safeName = attendeeName.replace(/[^a-zA-Z0-9_-]/g, '_');
    window.AwsCertificateEngine.downloadPng(result.canvas, `${safeName}_${cert.id}.png`);
    showToast(`PNG certificate downloaded for ${attendeeName}!`);
  }

  async function downloadCertPdf(regId) {
    const selectedEventId = certEventFilter ? certEventFilter.value : '';
    const ev = cachedEvents.find(e => e.id === selectedEventId);
    const reg = cachedRegistrations.find(r => r.id === regId);
    if (!reg) return;

    const attendeeName = (reg.fullName || reg.name || 'Participant').trim();
    showToast(`Generating PDF for ${attendeeName}...`, 'info');
    const cert = await getOrGenerateCertificate(reg, ev);

    const result = await window.AwsCertificateEngine.renderCertificate({
      attendeeName: attendeeName,
      eventTitle: ev ? ev.title : 'AWS SBG SKIT Event',
      eventDescription: cert.eventDescription,
      eventDate: cert.eventDate,
      role: cert.role,
      customText: cert.customText,
      templateKey: cert.templateKey || getSelectedCertFormat(),
      certificateId: cert.id,
      verifyBaseUrl: getLiveVerifyBaseUrl()
    });

    const safeName = attendeeName.replace(/[^a-zA-Z0-9_-]/g, '_');
    window.AwsCertificateEngine.downloadPdf(result.canvas, `${safeName}_${cert.id}.pdf`);
    showToast(`PDF certificate downloaded for ${attendeeName}!`);
  }

  async function emailSingleCert(regId) {
    const selectedEventId = certEventFilter ? certEventFilter.value : '';
    const ev = cachedEvents.find(e => e.id === selectedEventId);
    const reg = cachedRegistrations.find(r => r.id === regId);
    if (!reg) return;

    const savedPw = localStorage.getItem('aws_sbg_gmail_app_pw');
    if (!savedPw) {
      openBulkEmailModal();
      showToast('Please enter your Gmail App Password to send emails from aws.sbg.skit@gmail.com', 'info');
      return;
    }

    const attendeeName = (reg.fullName || reg.name || 'Participant').trim();
    showToast(`Sending certificate to ${attendeeName} from aws.sbg.skit@gmail.com...`, 'info');
    const cert = await getOrGenerateCertificate(reg, ev);

    try {
      const result = await window.AwsCertificateEngine.renderCertificate({
        attendeeName: attendeeName,
        eventTitle: ev ? ev.title : 'AWS Event',
        eventDescription: cert.eventDescription,
        eventDate: cert.eventDate,
        role: cert.role,
        customText: cert.customText,
        templateKey: cert.templateKey || getSelectedCertFormat(),
        certificateId: cert.id,
        verifyBaseUrl: getLiveVerifyBaseUrl()
      });

      const verifyUrl = `${getLiveVerifyBaseUrl()}/verify.html?id=${encodeURIComponent(cert.id)}`;
      const safeName = attendeeName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const attachmentBase64 = result.dataUrl.split(',')[1];
      const attachmentFilename = `${safeName}_${cert.id}.png`;

      const subject = `Your Certificate: ${ev ? ev.title : 'AWS Event'} — AWS SBG SKIT`;
      const body = `Dear ${attendeeName},\n\n` +
        `Congratulations on participating in "${ev ? ev.title : 'AWS Event'}" with the AWS Student Builder Group at SKIT, Jaipur!\n\n` +
        `Your official verified certificate is attached to this email. You can also view and verify your credential online anytime at:\n${verifyUrl}\n\n` +
        `Certificate ID: ${cert.id}\nDate of Issue: ${cert.eventDate}\n\n` +
        `You can also add this verified credential to your LinkedIn profile with 1 click.\n\n` +
        `Keep Building!\nAWS Student Builder Group, SKIT Jaipur\nhttps://builder.aws.com`;

      const resp = await fetch('/api/send-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_email: 'aws.sbg.skit@gmail.com',
          app_password: savedPw,
          recipient_email: reg.email,
          recipient_name: attendeeName,
          subject: subject,
          body: body,
          attachment_base64: attachmentBase64,
          attachment_filename: attachmentFilename
        })
      });

      const res = await resp.json();
      if (res.success) {
        await service.updateCertificateStatus(cert.id, 'sent');
        cert.status = 'sent';
        renderCertificatesTable();
        showToast(`Certificate sent to ${reg.email} from aws.sbg.skit@gmail.com!`);
      } else {
        showToast(`Send error: ${res.error}`, 'error');
        openBulkEmailModal();
      }
    } catch (e) {
      showToast(`Error: ${e.message}`, 'error');
    }
  }

  // Bulk Actions
  async function handleBulkGenerateCerts() {
    const selectedEventId = certEventFilter ? certEventFilter.value : '';
    const ev = cachedEvents.find(e => e.id === selectedEventId);
    if (!ev) {
      showToast('Please select an event first.', 'error');
      return;
    }

    const eventRegs = getEventRegistrationsForCert();
    if (eventRegs.length === 0) {
      showToast('No registrations found for this event.', 'error');
      return;
    }

    if (btnBulkGenerateCerts) {
      btnBulkGenerateCerts.disabled = true;
      btnBulkGenerateCerts.innerHTML = '<span>Generating...</span>';
    }

    let generatedCount = 0;
    try {
      for (const reg of eventRegs) {
        let cert = cachedCertificates.find(c => c.registrationId === reg.id || (c.eventId === reg.eventId && c.attendeeEmail?.toLowerCase() === reg.email?.toLowerCase()));
        if (!cert) {
          await getOrGenerateCertificate(reg, ev);
          generatedCount++;
        }
      }
      await loadCertificates();
      // Sync all generated certificates to persistent local database data/certificates.json
      try {
        await fetch('/api/save-certificates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ certificates: cachedCertificates })
        });
      } catch (syncErr) {}

      renderCertificatesTable();
      showToast(`Generated ${generatedCount} certificates successfully! (Total ready: ${eventRegs.length})`);
    } catch (err) {
      console.error(err);
      showToast('Error generating certificates.', 'error');
    } finally {
      if (btnBulkGenerateCerts) {
        btnBulkGenerateCerts.disabled = false;
        btnBulkGenerateCerts.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          <span>Generate All Certificates</span>
        `;
      }
    }
  }

  async function handleBulkDownloadZip() {
    if (!window.JSZip) {
      showToast('ZIP library not loaded. Please refresh page.', 'error');
      return;
    }

    const selectedEventId = certEventFilter ? certEventFilter.value : '';
    const ev = cachedEvents.find(e => e.id === selectedEventId);
    if (!ev) {
      showToast('Please select an event first.', 'error');
      return;
    }

    const eventRegs = getEventRegistrationsForCert();
    if (eventRegs.length === 0) {
      showToast('No participants to export.', 'error');
      return;
    }

    if (btnBulkDownloadZip) {
      btnBulkDownloadZip.disabled = true;
      btnBulkDownloadZip.innerHTML = '<span>Building ZIP...</span>';
    }

    showToast(`Rendering ${eventRegs.length} certificates and packaging ZIP archive...`, 'info');

    try {
      const zip = new window.JSZip();
      const safeEventTitle = (ev.title || 'Event').replace(/[^a-zA-Z0-9_-]/g, '_');
      const folder = zip.folder(`${safeEventTitle}_Certificates`);

      for (let i = 0; i < eventRegs.length; i++) {
        const reg = eventRegs[i];
        const attendeeName = (reg.fullName || reg.name || `Participant_${i+1}`).trim();
        const cert = await getOrGenerateCertificate(reg, ev);

        const result = await window.AwsCertificateEngine.renderCertificate({
          attendeeName: attendeeName,
          eventTitle: ev.title,
          eventDescription: cert.eventDescription,
          eventDate: cert.eventDate,
          role: cert.role,
          customText: cert.customText,
          templateKey: cert.templateKey || getSelectedCertFormat(),
          certificateId: cert.id,
          verifyBaseUrl: getLiveVerifyBaseUrl()
        });

        // Convert canvas to blob / base64
        const dataUrl = result.canvas.toDataURL('image/png');
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
        const safeName = attendeeName.replace(/[^a-zA-Z0-9_-]/g, '_');
        folder.file(`${safeName}_${cert.id}.png`, base64Data, { base64: true });
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(zipBlob);
      downloadLink.download = `${safeEventTitle}_Certificates.zip`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      setTimeout(() => URL.revokeObjectURL(downloadLink.href), 1000);

      showToast(`ZIP package downloaded successfully with ${eventRegs.length} certificates!`);
    } catch (err) {
      console.error(err);
      showToast('Failed to build ZIP archive: ' + err.message, 'error');
    } finally {
      if (btnBulkDownloadZip) {
        btnBulkDownloadZip.disabled = false;
        btnBulkDownloadZip.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="21 8 21 21 3 21 3 8"></polyline>
            <rect x="1" y="3" width="22" height="5"></rect>
            <line x1="10" y1="12" x2="14" y2="12"></line>
          </svg>
          <span>Download All (ZIP)</span>
        `;
      }
    }
  }

  // Excel / CSV Participant Upload
  function handleExcelUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const selectedEventId = certEventFilter ? certEventFilter.value : '';
    const ev = cachedEvents.find(e => e.id === selectedEventId);
    if (!ev) {
      showToast('Please select a target event before uploading participants Excel.', 'error');
      uploadExcelInput.value = '';
      return;
    }

    if (!window.XLSX) {
      showToast('Excel library loading... Please try again.', 'error');
      return;
    }

    showToast('Parsing participant spreadsheet...', 'info');

    const reader = new FileReader();
    reader.onload = async function (evt) {
      try {
        const data = evt.target.result;
        const workbook = window.XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = window.XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rows || rows.length === 0) {
          showToast('The uploaded Excel file appears to be empty.', 'error');
          uploadExcelInput.value = '';
          return;
        }

        let importedCount = 0;
        const defaultRole = certRoleSelect ? certRoleSelect.value : 'participant';

        for (const row of rows) {
          let name = '';
          let email = '';
          let phone = '';
          let roll = '';
          let branch = '';
          let year = '';
          let role = defaultRole;

          for (const key of Object.keys(row)) {
            const k = key.trim().toLowerCase();
            const val = String(row[key] || '').trim();
            if (!val) continue;

            if (k.includes('name') || k === 'participant' || k === 'student' || k === 'recipient') {
              if (!name) name = val;
            } else if (k.includes('email') || k.includes('mail')) {
              if (!email) email = val;
            } else if (k.includes('phone') || k.includes('mobile') || k.includes('whatsapp') || k.includes('contact')) {
              if (!phone) phone = val;
            } else if (k.includes('roll')) {
              if (!roll) roll = val;
            } else if (k.includes('branch') || k.includes('dept') || k.includes('department')) {
              if (!branch) branch = val;
            } else if (k.includes('year')) {
              if (!year) year = val;
            } else if (k.includes('role') || k.includes('track')) {
              role = val.toLowerCase();
            }
          }

          if (name && email) {
            let existing = cachedRegistrations.find(r => r.eventId === ev.id && r.email?.toLowerCase() === email.toLowerCase());
            if (!existing) {
              const regData = {
                id: 'reg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                eventId: ev.id,
                eventTitle: ev.title,
                eventDate: ev.dateDisplay,
                fullName: name,
                email: email.toLowerCase(),
                phone: phone,
                branch: branch || 'CSE',
                year: year || '1st Year',
                rollNumber: roll || '',
                registeredAt: new Date().toISOString()
              };
              cachedRegistrations.unshift(regData);

              // Auto-generate certificate
              await getOrGenerateCertificate(regData, ev);
              importedCount++;
            }
          }
        }

        localStorage.setItem('aws_sbg_registrations_v1', JSON.stringify(cachedRegistrations));
        await loadCertificates();
        renderCertificatesTable();
        showToast(`Successfully imported ${importedCount} participants from Excel! All certificates generated.`);
      } catch (err) {
        console.error('Excel parse error:', err);
        showToast('Error parsing Excel: ' + err.message, 'error');
      } finally {
        uploadExcelInput.value = '';
      }
    };
    reader.readAsBinaryString(file);
  }

  // Bulk Email Modal & SMTP Handlers
  function openBulkEmailModal() {
    const selectedEventId = certEventFilter ? certEventFilter.value : '';
    const ev = cachedEvents.find(e => e.id === selectedEventId);
    if (!ev) {
      showToast('Please select an event first.', 'error');
      return;
    }

    const eventRegs = getEventRegistrationsForCert();
    if (eventRegs.length === 0) {
      showToast('No registered participants found for this event.', 'error');
      return;
    }

    if (certEmailEventName) certEmailEventName.textContent = ev.title;
    if (certEmailRecipientSummary) certEmailRecipientSummary.textContent = `${eventRegs.length} verified participant emails queued`;
    if (certEmailFormatBadge) {
      const fmt = getSelectedCertFormat();
      certEmailFormatBadge.textContent = fmt === 'format1' ? 'Format 1: Dark Builder' : 'Format 2: Light Cloud';
    }
    if (certEmailProgressContainer) certEmailProgressContainer.style.display = 'none';

    // Load saved Gmail App Password
    if (gmailAppPasswordInput) {
      const savedPw = localStorage.getItem('aws_sbg_gmail_app_pw');
      if (savedPw) {
        gmailAppPasswordInput.value = savedPw;
        if (smtpConnectionBadge) {
          smtpConnectionBadge.textContent = '● Saved Password Loaded';
          smtpConnectionBadge.style.color = '#10b981';
          smtpConnectionBadge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
          smtpConnectionBadge.style.background = 'rgba(16, 185, 129, 0.1)';
        }
      } else {
        if (smtpConnectionBadge) {
          smtpConnectionBadge.textContent = 'App Password Required';
          smtpConnectionBadge.style.color = 'var(--orange-light)';
        }
      }
    }

    if (certEmailModalOverlay) {
      certEmailModalOverlay.style.display = 'flex';
    }
  }

  function closeBulkEmailModal() {
    if (certEmailModalOverlay) {
      certEmailModalOverlay.style.display = 'none';
    }
  }

  async function handleTestSmtpConnection() {
    const pw = (gmailAppPasswordInput ? gmailAppPasswordInput.value : '').trim().replace(/\s+/g, '');
    if (!pw) {
      showToast('Please enter your 16-character Google App Password first.', 'error');
      gmailAppPasswordInput.focus();
      return;
    }

    if (btnTestSmtpConnection) {
      btnTestSmtpConnection.disabled = true;
      btnTestSmtpConnection.innerHTML = '<span>Testing...</span>';
    }
    if (smtpConnectionBadge) {
      smtpConnectionBadge.textContent = 'Testing connection...';
      smtpConnectionBadge.style.color = 'var(--text-dim)';
    }

    try {
      const resp = await fetch('/api/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_email: 'aws.sbg.skit@gmail.com',
          app_password: pw
        })
      });

      const res = await resp.json();
      if (res.success) {
        if (smtpConnectionBadge) {
          smtpConnectionBadge.textContent = '✓ Connected to Gmail';
          smtpConnectionBadge.style.color = '#10b981';
          smtpConnectionBadge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
          smtpConnectionBadge.style.background = 'rgba(16, 185, 129, 0.1)';
        }
        showToast('Successfully verified Gmail connection for aws.sbg.skit@gmail.com!');
        if (saveGmailAppPwCheckbox && saveGmailAppPwCheckbox.checked) {
          localStorage.setItem('aws_sbg_gmail_app_pw', pw);
        }
      } else {
        if (smtpConnectionBadge) {
          smtpConnectionBadge.textContent = '✕ Connection Failed';
          smtpConnectionBadge.style.color = '#ef4444';
          smtpConnectionBadge.style.borderColor = 'rgba(239, 68, 68, 0.4)';
          smtpConnectionBadge.style.background = 'rgba(239, 68, 68, 0.1)';
        }
        showToast(res.error || 'Authentication failed. Check your App Password.', 'error');
      }
    } catch (err) {
      if (smtpConnectionBadge) {
        smtpConnectionBadge.textContent = '✕ Server Offline';
        smtpConnectionBadge.style.color = '#f59e0b';
      }
      showToast('Cannot reach local server dispatch API. Is server.py running on port 8080?', 'error');
    } finally {
      if (btnTestSmtpConnection) {
        btnTestSmtpConnection.disabled = false;
        btnTestSmtpConnection.innerHTML = '<span>Test Connection</span>';
      }
    }
  }

  async function handleCopyCertLinksCsv() {
    const selectedEventId = certEventFilter ? certEventFilter.value : '';
    const ev = cachedEvents.find(e => e.id === selectedEventId);
    const eventRegs = getEventRegistrationsForCert();

    if (!ev || eventRegs.length === 0) {
      showToast('No participants available.', 'error');
      return;
    }

    const rows = [
      ['Participant Name', 'College Email', 'WhatsApp / Mobile', 'Role', 'Certificate ID', 'Verification URL', 'Status'].join(',')
    ];

    for (const reg of eventRegs) {
      const attendeeName = (reg.fullName || reg.name || 'Participant').trim();
      const cert = await getOrGenerateCertificate(reg, ev);
      const verifyUrl = `${getLiveVerifyBaseUrl()}/verify.html?id=${encodeURIComponent(cert.id)}`;
      rows.push([
        `"${attendeeName.replace(/"/g, '""')}"`,
        `"${(reg.email || '').replace(/"/g, '""')}"`,
        `"${(reg.phone || '').replace(/"/g, '""')}"`,
        `"${(cert.role || 'participant').replace(/"/g, '""')}"`,
        `"${cert.id}"`,
        `"${verifyUrl}"`,
        `"${cert.status || 'ready'}"`
      ].join(','));
    }

    const csvContent = rows.join('\n');
    await navigator.clipboard.writeText(csvContent);
    showToast(`Copied certificate links CSV for ${eventRegs.length} participants to clipboard!`);
  }

  function handleBulkEmailMailto() {
    const selectedEventId = certEventFilter ? certEventFilter.value : '';
    const ev = cachedEvents.find(e => e.id === selectedEventId);
    const eventRegs = getEventRegistrationsForCert();

    if (!ev || eventRegs.length === 0) {
      showToast('No participants available.', 'error');
      return;
    }

    const emails = eventRegs.map(r => r.email).filter(Boolean);
    const subject = encodeURIComponent(certEmailSubject ? certEmailSubject.value : `Your Certificate — ${ev.title}`);
    const body = encodeURIComponent(
      `Hello Builders,\n\n` +
      `Your certificates for "${ev.title}" are now live on the official credential registry!\n\n` +
      `You can verify and download your certificate anytime at:\n${getLiveVerifyBaseUrl()}/verify.html\n\n` +
      `Keep Building!\nAWS Student Builder Group, SKIT Jaipur`
    );

    window.open(`mailto:?bcc=${encodeURIComponent(emails.join(','))}&subject=${subject}&body=${body}`, '_blank');
    showToast(`Opened email draft with ${emails.length} recipients in BCC.`);
  }

  // Automated Bulk Email Dispatch with Certificate Attachment
  async function handleBulkEmailDispatch() {
    const selectedEventId = certEventFilter ? certEventFilter.value : '';
    const ev = cachedEvents.find(e => e.id === selectedEventId);
    const eventRegs = getEventRegistrationsForCert();

    if (!ev || eventRegs.length === 0) {
      showToast('No participants available to email.', 'error');
      return;
    }

    const appPassword = (gmailAppPasswordInput ? gmailAppPasswordInput.value : '').trim().replace(/\s+/g, '');
    if (!appPassword) {
      showToast('Please enter your 16-character Google App Password for aws.sbg.skit@gmail.com.', 'error');
      gmailAppPasswordInput.focus();
      return;
    }

    if (saveGmailAppPwCheckbox && saveGmailAppPwCheckbox.checked) {
      localStorage.setItem('aws_sbg_gmail_app_pw', appPassword);
    }

    const attachFormat = document.querySelector('input[name="emailAttachmentFormat"]:checked')?.value || 'png';
    const rawSubject = certEmailSubject ? certEmailSubject.value : 'Your Certificate of Participation — AWS Student Builder Group SKIT';
    const rawBody = certEmailBodyTemplate ? certEmailBodyTemplate.value : '';

    if (certEmailDispatchBtn) {
      certEmailDispatchBtn.disabled = true;
      certEmailDispatchBtn.innerHTML = '<span>Sending from aws.sbg.skit@gmail.com...</span>';
    }
    if (certEmailProgressContainer) certEmailProgressContainer.style.display = 'block';
    if (certEmailStatusLog) certEmailStatusLog.innerHTML = '';

    let successCount = 0;
    let failCount = 0;
    const total = eventRegs.length;

    for (let i = 0; i < total; i++) {
      const reg = eventRegs[i];
      const attendeeName = (reg.fullName || reg.name || 'Participant').trim();
      const cert = await getOrGenerateCertificate(reg, ev);

      const pct = Math.round(((i + 1) / total) * 100);
      if (certEmailProgressBar) certEmailProgressBar.style.width = `${pct}%`;
      if (certEmailProgressPercent) certEmailProgressPercent.textContent = `${pct}%`;
      if (certEmailProgressLabel) certEmailProgressLabel.textContent = `Sending ${i + 1} of ${total}: ${attendeeName}...`;

      try {
        // Render certificate on canvas
        const result = await window.AwsCertificateEngine.renderCertificate({
          attendeeName: attendeeName,
          eventTitle: ev.title,
          eventDescription: cert.eventDescription,
          eventDate: cert.eventDate,
          role: cert.role,
          customText: cert.customText,
          templateKey: cert.templateKey || getSelectedCertFormat(),
          certificateId: cert.id,
          verifyBaseUrl: getLiveVerifyBaseUrl()
        });

        // Generate attachment data
        let attachmentBase64 = '';
        let attachmentFilename = '';
        const safeName = attendeeName.replace(/[^a-zA-Z0-9_-]/g, '_');

        if (attachFormat === 'pdf' && window.jspdf && window.jspdf.jsPDF) {
          const { jsPDF } = window.jspdf;
          const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
          const imgData = result.canvas.toDataURL('image/png');
          pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
          const pdfDataUri = pdf.output('datauristring');
          attachmentBase64 = pdfDataUri.split(',')[1];
          attachmentFilename = `${safeName}_${cert.id}.pdf`;
        } else {
          attachmentBase64 = result.dataUrl.split(',')[1];
          attachmentFilename = `${safeName}_${cert.id}.png`;
        }

        // Replace template tags
        const verifyUrl = `${getLiveVerifyBaseUrl()}/verify.html?id=${encodeURIComponent(cert.id)}`;
        const personalizedSubject = rawSubject
          .replace(/{{name}}/g, attendeeName)
          .replace(/{{event}}/g, ev.title)
          .replace(/{{role}}/g, cert.role || 'participant')
          .replace(/{{cert_id}}/g, cert.id)
          .replace(/{{date}}/g, cert.eventDate || ev.dateDisplay);

        const personalizedBody = rawBody
          .replace(/{{name}}/g, attendeeName)
          .replace(/{{event}}/g, ev.title)
          .replace(/{{role}}/g, cert.role || 'participant')
          .replace(/{{cert_id}}/g, cert.id)
          .replace(/{{verify_url}}/g, verifyUrl)
          .replace(/{{date}}/g, cert.eventDate || ev.dateDisplay);

        // POST to backend SMTP API
        const resp = await fetch('/api/send-certificate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender_email: 'aws.sbg.skit@gmail.com',
            app_password: appPassword,
            recipient_email: reg.email,
            recipient_name: attendeeName,
            subject: personalizedSubject,
            body: personalizedBody,
            attachment_base64: attachmentBase64,
            attachment_filename: attachmentFilename
          })
        });

        const resData = await resp.json();

        if (resData.success) {
          successCount++;
          await service.updateCertificateStatus(cert.id, 'sent');
          cert.status = 'sent';

          if (certEmailStatusLog) {
            const line = document.createElement('div');
            line.style.color = '#34d399';
            line.style.padding = '2px 0';
            line.textContent = `✓ [SENT FROM GMAIL] ${attendeeName} <${reg.email}> • Attachment: ${attachmentFilename}`;
            certEmailStatusLog.appendChild(line);
            certEmailStatusLog.scrollTop = certEmailStatusLog.scrollHeight;
          }
        } else {
          failCount++;
          if (certEmailStatusLog) {
            const line = document.createElement('div');
            line.style.color = '#f87171';
            line.style.padding = '2px 0';
            line.textContent = `✕ [FAILED] ${attendeeName} <${reg.email}>: ${resData.error || 'Unknown error'}`;
            certEmailStatusLog.appendChild(line);
            certEmailStatusLog.scrollTop = certEmailStatusLog.scrollHeight;
          }
        }
      } catch (sendErr) {
        failCount++;
        if (certEmailStatusLog) {
          const line = document.createElement('div');
          line.style.color = '#f87171';
          line.style.padding = '2px 0';
          line.textContent = `✕ [NETWORK ERROR] ${attendeeName} <${reg.email}>: ${sendErr.message}`;
          certEmailStatusLog.appendChild(line);
          certEmailStatusLog.scrollTop = certEmailStatusLog.scrollHeight;
        }
      }
    }

    if (certEmailProgressLabel) {
      certEmailProgressLabel.textContent = `Finished! ${successCount} sent successfully from aws.sbg.skit@gmail.com${failCount > 0 ? `, ${failCount} failed` : ''}.`;
    }
    renderCertificatesTable();
    showToast(`Bulk email finished: ${successCount} sent from aws.sbg.skit@gmail.com!`);

    if (certEmailDispatchBtn) {
      certEmailDispatchBtn.disabled = false;
      certEmailDispatchBtn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
        <span>Send All from aws.sbg.skit@gmail.com</span>
      `;
    }
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

    // Certificates handlers
    if (certEventFilter) certEventFilter.addEventListener('change', onCertEventChanged);
    if (formatCard1) formatCard1.addEventListener('click', () => setSelectedCertFormat('format1'));
    if (formatCard2) formatCard2.addEventListener('click', () => setSelectedCertFormat('format2'));
    if (certRoleSelect) {
      certRoleSelect.addEventListener('change', () => {
        const isCustom = certRoleSelect.value === 'custom';
        if (certCustomTextGroup) certCustomTextGroup.style.display = isCustom ? 'block' : 'none';
        if (certDescGroup) certDescGroup.style.display = isCustom ? 'none' : 'block';
      });
    }

    if (btnPreviewSelectedCert) btnPreviewSelectedCert.addEventListener('click', previewFirstAttendee);
    if (btnBulkGenerateCerts) btnBulkGenerateCerts.addEventListener('click', handleBulkGenerateCerts);
    if (btnBulkDownloadZip) btnBulkDownloadZip.addEventListener('click', handleBulkDownloadZip);
    if (btnBulkEmailCerts) btnBulkEmailCerts.addEventListener('click', openBulkEmailModal);
    if (certDescInput) certDescInput.addEventListener('input', updateCertDescCharCount);
    if (uploadExcelInput) uploadExcelInput.addEventListener('change', handleExcelUpload);
    if (btnTestSmtpConnection) btnTestSmtpConnection.addEventListener('click', handleTestSmtpConnection);

    if (selectAllCertsCheckbox) {
      selectAllCertsCheckbox.addEventListener('change', () => {
        const checked = selectAllCertsCheckbox.checked;
        document.querySelectorAll('.cert-row-checkbox').forEach(cb => cb.checked = checked);
      });
    }

    // Preview Modal handlers
    if (closeCertPreviewModalBtn) closeCertPreviewModalBtn.addEventListener('click', closeCertPreviewModal);
    if (certPreviewModalOverlay) {
      certPreviewModalOverlay.addEventListener('click', (e) => {
        if (e.target === certPreviewModalOverlay) closeCertPreviewModal();
      });
    }
    if (certPreviewCopyLinkBtn) {
      certPreviewCopyLinkBtn.addEventListener('click', async () => {
        if (currentPreviewCertId) {
          const url = `${getLiveVerifyBaseUrl()}/verify.html?id=${encodeURIComponent(currentPreviewCertId)}`;
          await navigator.clipboard.writeText(url);
          showToast('Live Verification URL copied to clipboard!');
        }
      });
    }
    if (certPreviewDownloadPngBtn) {
      certPreviewDownloadPngBtn.addEventListener('click', () => {
        if (currentPreviewCanvas) {
          window.AwsCertificateEngine.downloadPng(currentPreviewCanvas, `Certificate_${currentPreviewCertId || 'AWS-SBG'}.png`);
          showToast('PNG downloaded!');
        }
      });
    }
    if (certPreviewDownloadPdfBtn) {
      certPreviewDownloadPdfBtn.addEventListener('click', () => {
        if (currentPreviewCanvas) {
          window.AwsCertificateEngine.downloadPdf(currentPreviewCanvas, `Certificate_${currentPreviewCertId || 'AWS-SBG'}.pdf`);
          showToast('A4 PDF downloaded!');
        }
      });
    }

    // Bulk Email Modal handlers
    if (closeCertEmailModalBtn) closeCertEmailModalBtn.addEventListener('click', closeBulkEmailModal);
    if (certEmailModalOverlay) {
      certEmailModalOverlay.addEventListener('click', (e) => {
        if (e.target === certEmailModalOverlay) closeBulkEmailModal();
      });
    }
    if (certEmailCopyLinksBatchBtn) certEmailCopyLinksBatchBtn.addEventListener('click', handleCopyCertLinksCsv);
    if (certEmailMailtoBtn) certEmailMailtoBtn.addEventListener('click', handleBulkEmailMailto);
    if (certEmailDispatchBtn) certEmailDispatchBtn.addEventListener('click', handleBulkEmailDispatch);
  }

  // Public API for inline onclick handlers
  window.AwsAdminApp = {
    viewEventRegistrations,
    toggleReg,
    openEditModal,
    confirmDeleteEvent,
    confirmDeleteRegistration,
    openEditChampionModal,
    confirmDeleteChampion,
    previewCert,
    downloadCertPng,
    downloadCertPdf,
    emailSingleCert
  };

  // Run on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

