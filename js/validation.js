/**
 * AWS SBG SKIT - Unified Client-side Form Validation & Security Module
 */

(function (window) {
  'use strict';

  const Validation = {
    // Sanitization: Escape HTML and prevent XSS
    escapeHTML(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },

    stripTags(str) {
      if (!str) return '';
      return String(str).replace(/<[^>]+>/g, '').trim();
    },

    // Validators
    validateName(name) {
      const clean = (name || '').trim();
      if (!clean) return { valid: false, message: 'Full name is required.' };
      if (clean.length < 2) return { valid: false, message: 'Name must be at least 2 characters.' };
      if (clean.length > 80) return { valid: false, message: 'Name cannot exceed 80 characters.' };
      if (!/^[a-zA-Z\s\.\-']{2,80}$/.test(clean)) {
        return { valid: false, message: 'Name should contain only letters, spaces, hyphens, and dots.' };
      }
      return { valid: true, value: clean };
    },

    validateEmail(email) {
      const clean = (email || '').trim().toLowerCase();
      if (!clean) return { valid: false, message: 'Email address is required.' };
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
      if (!emailRegex.test(clean)) {
        return { valid: false, message: 'Please enter a valid email address (e.g. name@skit.ac.in).' };
      }
      return { valid: true, value: clean };
    },

    validatePhone(phone) {
      const raw = (phone || '').trim().replace(/[\s\-\+]/g, '');
      const clean = raw.startsWith('91') && raw.length === 12 ? raw.substring(2) : raw;
      if (!clean) return { valid: false, message: '10-digit WhatsApp/mobile number is required.' };
      if (!/^\d+$/.test(clean)) return { valid: false, message: 'Mobile number can only contain digits.' };
      if (clean.length !== 10) return { valid: false, message: 'Please enter exactly 10 digits.' };
      if (!/^[6-9]\d{9}$/.test(clean)) {
        return { valid: false, message: 'Must be a valid Indian mobile number starting with 6, 7, 8, or 9.' };
      }
      return { valid: true, value: clean };
    },

    validateRollNumber(roll) {
      const clean = (roll || '').trim().toUpperCase();
      if (!clean) return { valid: false, message: 'College / RTU roll number is required.' };
      if (clean.length < 4 || clean.length > 25) {
        return { valid: false, message: 'Roll number must be between 4 and 25 characters.' };
      }
      if (!/^[A-Z0-9\/\-]{4,25}$/.test(clean)) {
        return { valid: false, message: 'Only alphanumeric characters, slashes, and hyphens allowed.' };
      }
      return { valid: true, value: clean };
    },

    validateUsername(username) {
      const clean = (username || '').trim().toLowerCase();
      if (!clean) return { valid: false, message: 'Username is required.' };
      if (clean.length < 3 || clean.length > 30) {
        return { valid: false, message: 'Username must be between 3 and 30 characters.' };
      }
      if (!/^[a-z0-9_\-\.]{3,30}$/.test(clean)) {
        return { valid: false, message: 'Only letters, numbers, hyphens, and underscores allowed.' };
      }
      return { valid: true, value: clean };
    },

    validatePassword(password, minLength = 6) {
      if (!password) return { valid: false, message: 'Password is required.' };
      if (password.length < minLength) {
        return { valid: false, message: `Password must be at least ${minLength} characters.` };
      }
      return { valid: true, value: password };
    },

    validateEventTitle(title) {
      const clean = (title || '').trim();
      if (!clean) return { valid: false, message: 'Event title is required.' };
      if (clean.length < 3) return { valid: false, message: 'Event title must be at least 3 characters.' };
      if (clean.length > 120) return { valid: false, message: 'Event title cannot exceed 120 characters.' };
      return { valid: true, value: clean };
    },

    validateCapacity(capacity) {
      const num = parseInt(capacity, 10);
      if (isNaN(num) || num < 5 || num > 5000) {
        return { valid: false, message: 'Capacity must be between 5 and 5,000 seats.' };
      }
      return { valid: true, value: num };
    },

    // UI Feedback Helpers
    showFieldError(inputEl, message) {
      if (!inputEl) return;
      inputEl.classList.add('is-invalid');
      inputEl.classList.remove('is-valid');

      // Find or create error container
      let errorEl = inputEl.parentElement.querySelector('.field-error-msg');
      if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'field-error-msg';
        inputEl.parentElement.appendChild(errorEl);
      }
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    },

    clearFieldError(inputEl) {
      if (!inputEl) return;
      inputEl.classList.remove('is-invalid');
      inputEl.classList.add('is-valid');

      const errorEl = inputEl.parentElement.querySelector('.field-error-msg');
      if (errorEl) {
        errorEl.style.display = 'none';
        errorEl.textContent = '';
      }
    },

    resetField(inputEl) {
      if (!inputEl) return;
      inputEl.classList.remove('is-invalid', 'is-valid');
      const errorEl = inputEl.parentElement.querySelector('.field-error-msg');
      if (errorEl) {
        errorEl.style.display = 'none';
        errorEl.textContent = '';
      }
    }
  };

  window.AwsValidation = Validation;
})(window);

