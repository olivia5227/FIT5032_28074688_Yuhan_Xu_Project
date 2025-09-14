// Security utilities for input sanitization and validation
// These functions provide client-side security measures to prevent XSS and validate inputs

/**
 * Sanitize HTML content by escaping potentially dangerous characters
 * @param {string} input - The input string to sanitize
 * @returns {string} - The sanitized string
 */
export function sanitizeHTML(input) {
  if (typeof input !== 'string') return '';

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize text input by removing/escaping potentially harmful characters
 * @param {string} input - The input string to sanitize
 * @returns {string} - The sanitized string
 */
export function sanitizeTextInput(input) {
  if (typeof input !== 'string') return '';

  // Remove null bytes, control characters (except newline, tab, carriage return)
  // and other potentially harmful characters
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Remove iframe tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
    .trim();
}

/**
 * Validate email format with enhanced security checks
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;

  // Basic format validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Additional security checks
  if (email.length > 254) return false; // Email too long
  if (email.includes('..')) return false; // Double dots not allowed
  if (email.startsWith('.') || email.endsWith('.')) return false;

  return emailRegex.test(email);
}

/**
 * Validate and sanitize URL
 * @param {string} url - The URL to validate and sanitize
 * @returns {string|null} - The sanitized URL or null if invalid
 */
export function sanitizeURL(url) {
  if (!url || typeof url !== 'string') return null;

  try {
    const urlObj = new URL(url);

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return null;
    }

    // Remove any fragments that might contain XSS
    urlObj.hash = '';

    return urlObj.toString();
  } catch {
    return null;
  }
}

/**
 * Validate phone number format (Australian)
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - Whether the phone number is valid
 */
export function isValidAustralianPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;

  const cleanPhone = phone.replace(/\s/g, '');
  const australianPhoneRegex = /^(\+61|0)[2-9]\d{8}$/;

  return australianPhoneRegex.test(cleanPhone);
}

/**
 * Validate password strength
 * @param {string} password - The password to validate
 * @returns {object} - Validation result with isValid boolean and errors array
 */
export function validatePasswordStrength(password) {
  const errors = [];

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    errors.push('Password must not exceed 128 characters');
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Check for common weak patterns
  const weakPatterns = [
    /(.)\1{3,}/, // Same character repeated 4+ times
    /123456|password|qwerty|abc123/i, // Common weak passwords
  ];

  for (const pattern of weakPatterns) {
    if (pattern.test(password)) {
      errors.push('Password contains common weak patterns');
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Rate limiting helper for preventing brute force attacks
 * @param {string} key - Unique key for the action (e.g., 'login:user@example.com')
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {object} - Rate limit status
 */
export function checkRateLimit(key, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const rateLimitKey = `rateLimit:${key}`;

  // Get existing attempts from localStorage
  const storedData = localStorage.getItem(rateLimitKey);
  let attempts = [];

  if (storedData) {
    try {
      attempts = JSON.parse(storedData).filter(timestamp => now - timestamp < windowMs);
    } catch {
      attempts = [];
    }
  }

  const isAllowed = attempts.length < maxAttempts;
  const remainingAttempts = Math.max(0, maxAttempts - attempts.length);
  const resetTime = attempts.length > 0 ? Math.min(...attempts) + windowMs : now;

  return {
    isAllowed,
    remainingAttempts,
    resetTime,
    addAttempt: () => {
      attempts.push(now);
      localStorage.setItem(rateLimitKey, JSON.stringify(attempts));
    }
  };
}

/**
 * Generate a cryptographically secure random string
 * @param {number} length - Length of the string to generate
 * @returns {string} - Random string
 */
export function generateSecureToken(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  if (crypto && crypto.getRandomValues) {
    const randomArray = new Uint8Array(length);
    crypto.getRandomValues(randomArray);

    for (let i = 0; i < length; i++) {
      result += chars[randomArray[i] % chars.length];
    }
  } else {
    // Fallback for environments without crypto.getRandomValues
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }

  return result;
}