/**
 * AWS SBG SKIT - Server-side Security & Validation Utility
 * Zero-dependency, Node.js native security module for Vercel Serverless Functions.
 */

const crypto = require('crypto');

// In-memory rate limiting cache (per serverless instance)
const rateLimitMap = new Map();

/**
 * Basic rate limiting helper (sliding window)
 * @param {string} ip - Client IP address
 * @param {string} action - Identifier for the action (e.g. 'login', 'register')
 * @param {number} maxAttempts - Allowed attempts within window
 * @param {number} windowMs - Window duration in milliseconds
 * @returns {boolean} true if allowed, false if rate limited
 */
function checkRateLimit(ip, action = 'default', maxAttempts = 10, windowMs = 60000) {
  const key = `${ip}:${action}`;
  const now = Date.now();
  const entry = rateLimitMap.get(key) || { count: 0, resetTime: now + windowMs };

  if (now > entry.resetTime) {
    entry.count = 1;
    entry.resetTime = now + windowMs;
    rateLimitMap.set(key, entry);
    return true;
  }

  entry.count += 1;
  rateLimitMap.set(key, entry);

  return entry.count <= maxAttempts;
}

/**
 * Sanitize string by trimming and removing dangerous HTML/script tags
 */
function sanitizeString(str, maxLength = 1000) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove <script> tags
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .substring(0, maxLength);
}

/**
 * Validate Student Registration Payload
 */
function validateRegistration(data) {
  const errors = [];
  const sanitized = {};

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Invalid request payload.'], sanitized: {} };
  }

  // 1. Full Name
  const fullName = sanitizeString(data.fullName, 80);
  if (!fullName) {
    errors.push('Full Name is required.');
  } else if (fullName.length < 2) {
    errors.push('Full Name must be at least 2 characters long.');
  } else if (!/^[a-zA-Z\s\.\-']{2,80}$/.test(fullName)) {
    errors.push('Full Name can only contain letters, spaces, hyphens, and dots.');
  }
  sanitized.fullName = fullName;

  // 2. Email Address
  const email = (data.email || '').trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!email) {
    errors.push('College Email is required.');
  } else if (email.length > 120) {
    errors.push('Email address is too long.');
  } else if (!emailRegex.test(email)) {
    errors.push('Please provide a valid email address.');
  }
  sanitized.email = email;

  // 3. Mobile / WhatsApp Number (When provided)
  if (data.phone) {
    const phone = (data.phone || '').trim().replace(/[\s\-\+]/g, '');
    const cleanPhone = phone.startsWith('91') && phone.length === 12 ? phone.substring(2) : phone;
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.push('Mobile number must be a valid 10-digit Indian number starting with 6, 7, 8, or 9.');
    }
    sanitized.phone = cleanPhone;
  } else {
    sanitized.phone = '';
  }

  // 4. Branch / Department
  const allowedBranches = [
    'Computer Science & Engineering (CSE)',
    'Information Technology (IT)',
    'Computer Science (AI)',
    'Computer Science (DS)',
    'Computer Science (IoT)',
    'Electronics & Communication (ECE)',
    'Electrical Engineering (EE)',
    'Mechanical Engineering (ME)',
    'Civil Engineering (CE)',
    'CSE', 'IT', 'CS-AI', 'CS-DS', 'CS-IoT', 'ECE', 'EE', 'ME', 'Civil', 'Other'
  ];
  if (data.branch) {
    const branch = sanitizeString(data.branch, 80);
    if (!allowedBranches.some(b => b.toLowerCase() === branch.toLowerCase())) {
      errors.push('Invalid Branch selection.');
    }
    sanitized.branch = branch;
  } else {
    sanitized.branch = 'CSE';
  }

  // 5. Year of Study
  const allowedYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  if (data.year) {
    const year = sanitizeString(data.year, 20);
    if (!allowedYears.includes(year)) {
      errors.push('Year must be one of: 1st Year, 2nd Year, 3rd Year, or 4th Year.');
    }
    sanitized.year = year;
  } else {
    sanitized.year = '1st Year';
  }

  // 6. Roll Number
  if (data.rollNumber) {
    const rollNumber = (data.rollNumber || '').trim().toUpperCase();
    if (!/^[A-Z0-9\/\-]{4,25}$/.test(rollNumber)) {
      errors.push('Roll Number can only contain alphanumeric characters, hyphens, and slashes (4-25 chars).');
    }
    sanitized.rollNumber = rollNumber;
  } else {
    sanitized.rollNumber = '';
  }

  // 7. Event ID
  const eventId = sanitizeString(data.eventId, 64);
  if (!eventId) {
    errors.push('Event ID is required.');
  }
  sanitized.eventId = eventId;

  // 8. Optional Query / Note
  sanitized.query = sanitizeString(data.query, 1000);

  // 9. Custom Question & Answer (Optional)
  sanitized.customQuestion = sanitizeString(data.customQuestion, 200);
  sanitized.customAnswer = sanitizeString(data.customAnswer, 500);
  const query = sanitizeString(data.query, 500);
  sanitized.query = query;

  return {
    valid: errors.length === 0,
    errors,
    sanitized
  };
}

/**
 * Validate Admin Login Credentials
 */
function validateLogin(data) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Invalid request payload.'] };
  }

  const username = (data.username || '').trim().toLowerCase();
  const password = data.password || '';

  if (!username) {
    errors.push('Username is required.');
  } else if (!/^[a-z0-9_\-\.]{3,30}$/.test(username)) {
    errors.push('Username must be 3-30 characters (letters, numbers, underscore, hyphen).');
  }

  if (!password) {
    errors.push('Password is required.');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: { username, password }
  };
}

/**
 * Validate Event Creation / Update Payload
 */
function validateEvent(data) {
  const errors = [];
  const sanitized = {};

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Invalid event payload.'], sanitized: {} };
  }

  // 1. Title
  const title = sanitizeString(data.title, 120);
  if (!title || title.length < 3) {
    errors.push('Event title must be between 3 and 120 characters.');
  }
  sanitized.title = title;

  // 2. Category
  const allowedCategories = ['Workshop', 'Hackathon', 'Certification', 'Cloud Quest', 'Watch Party', 'Session', 'Orientation', 'Community Day', 'Tech Talk'];
  const category = sanitizeString(data.category, 40) || 'Workshop';
  if (!allowedCategories.includes(category)) {
    errors.push('Invalid event category selected.');
  }
  sanitized.category = category;

  // 3. Status
  const allowedStatuses = ['open', 'upcoming', 'done'];
  const status = (data.status || 'open').toLowerCase();
  if (!allowedStatuses.includes(status)) {
    errors.push("Event status must be 'open', 'upcoming', or 'done'.");
  }
  sanitized.status = status;

  // 4. Display Date
  const dateDisplay = sanitizeString(data.dateDisplay, 60);
  if (!dateDisplay || dateDisplay.length < 3) {
    errors.push('Display Date is required (e.g. 18th Dec, 2026).');
  }
  sanitized.dateDisplay = dateDisplay;

  // 5. Date ISO
  const dateISO = (data.dateISO || '').trim();
  if (dateISO && !/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) {
    errors.push('Date ISO must follow YYYY-MM-DD format.');
  }
  sanitized.dateISO = dateISO || new Date().toISOString().split('T')[0];

  // 6. Venue
  const venue = sanitizeString(data.venue, 120) || 'SKIT Campus, Jaipur';
  sanitized.venue = venue;

  // 7. Capacity
  const capacity = parseInt(data.capacity, 10);
  if (isNaN(capacity) || capacity < 5 || capacity > 5000) {
    errors.push('Capacity must be a number between 5 and 5000 seats.');
  }
  sanitized.capacity = isNaN(capacity) ? 100 : capacity;

  // 8. Description
  const description = sanitizeString(data.description, 2000);
  sanitized.description = description;

  // 9. Goodies / Perks
  sanitized.goodies = sanitizeString(data.goodies, 100) || '🎁 Goodies Included';

  // 10. URLs (prevent javascript: or data: URIs)
  const validateUrl = (urlStr) => {
    if (!urlStr) return '';
    const clean = urlStr.trim();
    if (!/^https?:\/\//i.test(clean)) {
      errors.push('URL must start with http:// or https://');
      return '';
    }
    return clean;
  };

  sanitized.photosUrl = validateUrl(data.photosUrl);
  sanitized.feedbackUrl = validateUrl(data.feedbackUrl);
  sanitized.bannerUrl = validateUrl(data.bannerUrl);

  // 11. Registration Type (Native vs External Google Form)
  const regType = (data.registrationType || 'native').toLowerCase();
  sanitized.registrationType = regType === 'external' ? 'external' : 'native';

  if (sanitized.registrationType === 'external') {
    const extUrl = (data.externalRegistrationUrl || '').trim();
    if (!extUrl) {
      errors.push('External registration URL is required when hosting on Google Forms/external link.');
    } else if (!/^https?:\/\//i.test(extUrl)) {
      errors.push('External registration URL must start with http:// or https://');
    }
    sanitized.externalRegistrationUrl = extUrl;
  } else {
    sanitized.externalRegistrationUrl = '';
  }

  sanitized.registrationOpen = status === 'open';
  sanitized.registrationFields = data.registrationFields || null;
  if (data.id) sanitized.id = sanitizeString(data.id, 64);

  return {
    valid: errors.length === 0,
    errors,
    sanitized
  };
}

/**
 * Cryptographically Secure Token Generation (HMAC-SHA256)
 */
const SECRET_KEY = process.env.ADMIN_SESSION_SECRET || 'aws-sbg-skit-super-secret-salt-2026-key';

function createSessionToken(username) {
  const timestamp = Date.now();
  const payload = `${username}:${timestamp}`;
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64');
}

function verifySessionToken(token, maxAgeMs = 24 * 60 * 60 * 1000) {
  if (!token || typeof token !== 'string') return { valid: false };

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [username, timestampStr, signature] = decoded.split(':');
    const timestamp = parseInt(timestampStr, 10);

    if (!username || !timestamp || !signature) return { valid: false };

    // Check expiration
    if (Date.now() - timestamp > maxAgeMs) {
      return { valid: false, expired: true };
    }

    // Verify HMAC signature in constant time
    const expectedPayload = `${username}:${timestamp}`;
    const expectedSig = crypto.createHmac('sha256', SECRET_KEY).update(expectedPayload).digest('hex');

    const expectedBuf = Buffer.from(expectedSig);
    const providedBuf = Buffer.from(signature);

    if (expectedBuf.length !== providedBuf.length || !crypto.timingSafeEqual(expectedBuf, providedBuf)) {
      return { valid: false };
    }

    return { valid: true, username };
  } catch (err) {
    return { valid: false };
  }
}

module.exports = {
  checkRateLimit,
  sanitizeString,
  validateRegistration,
  validateLogin,
  validateEvent,
  createSessionToken,
  verifySessionToken
};

