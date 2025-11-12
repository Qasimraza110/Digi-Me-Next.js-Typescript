/**
 * Validation utilities for user input
 */

/**
 * Validates username format and rules
 * @param {string} username - The username to validate
 * @returns {Object} - { isValid: boolean, message: string }
 */
function validateUsername(username) {
  if (!username) {
    return { isValid: true, message: '' }; // Username is optional
  }

  const usernameStr = String(username).trim();

  // Length validation
  if (usernameStr.length < 3) {
    return { isValid: false, message: 'Username must be at least 3 characters long' };
  }
  if (usernameStr.length > 20) {
    return { isValid: false, message: 'Username must be no more than 20 characters long' };
  }

  // Format validation: letters, numbers, spaces, underscores
  const usernameRegex = /^[a-zA-Z0-9_ ]+$/;
  if (!usernameRegex.test(usernameStr)) {
    return { isValid: false, message: 'Username can only contain letters, numbers, spaces, and underscores' };
  }

  // Cannot start or end with space or underscore
  if (usernameStr.startsWith('_') || usernameStr.startsWith(' ')) {
    return { isValid: false, message: 'Username cannot start with a space or underscore' };
  }
  if (usernameStr.endsWith('_') || usernameStr.endsWith(' ')) {
    return { isValid: false, message: 'Username cannot end with a space or underscore' };
  }

  // Cannot have consecutive spaces or underscores
  if (usernameStr.includes('__') || usernameStr.includes('  ')) {
    return { isValid: false, message: 'Username cannot contain consecutive underscores or spaces' };
  }

  return { isValid: true, message: '' };
}


/**
 * Validates password strength and requirements
 * @param {string} password - The password to validate
 * @returns {Object} - { isValid: boolean, message: string, strength: string }
 */
function validatePassword(password) {
  if (!password) {
    return { isValid: false, message: 'Password is required', strength: 'weak' };
  }

  const passwordStr = String(password);

  // Length validation
  if (passwordStr.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long', strength: 'weak' };
  }
  if (passwordStr.length > 128) {
    return { isValid: false, message: 'Password must be no more than 128 characters long', strength: 'weak' };
  }

  // Character type validation
  const hasUpperCase = /[A-Z]/.test(passwordStr);
  const hasLowerCase = /[a-z]/.test(passwordStr);
  const hasNumbers = /\d/.test(passwordStr);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordStr);

  if (!hasUpperCase) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter', strength: 'weak' };
  }
  if (!hasLowerCase) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter', strength: 'weak' };
  }
  if (!hasNumbers) {
    return { isValid: false, message: 'Password must contain at least one number', strength: 'weak' };
  }
  if (!hasSpecialChar) {
    return { isValid: false, message: 'Password must contain at least one special character', strength: 'weak' };
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password', '123456', 'password123', 'admin', 'qwerty', 'letmein', 
    'welcome', 'monkey', '1234567890', 'abc123', 'password1', 'admin123',
    'root', 'toor', 'guest', 'user', 'test', 'demo'
  ];
  
  if (commonPasswords.includes(passwordStr.toLowerCase())) {
    return { isValid: false, message: 'Password is too common, please choose a stronger password', strength: 'weak' };
  }

  // Calculate password strength
  let strength = 'weak';
  let score = 0;

  // Length bonus
  if (passwordStr.length >= 12) score += 2;
  else if (passwordStr.length >= 10) score += 1;

  // Character variety bonus
  if (hasUpperCase && hasLowerCase) score += 1;
  if (hasNumbers) score += 1;
  if (hasSpecialChar) score += 1;

  // Additional complexity bonus
  if (passwordStr.length >= 16) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{2,}/.test(passwordStr)) score += 1;

  if (score >= 6) strength = 'strong';
  else if (score >= 4) strength = 'medium';
  else strength = 'weak';

  return { isValid: true, message: '', strength };
}

/**
 * Validates email format
 * @param {string} email - The email to validate
 * @returns {Object} - { isValid: boolean, message: string, normalized: string }
 */
function validateEmail(email) {
  if (!email) {
    return { isValid: false, message: 'Email is required', normalized: '' };
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

  if (!emailRegex.test(normalizedEmail)) {
    return { isValid: false, message: 'Invalid email format', normalized: '' };
  }

  return { isValid: true, message: '', normalized: normalizedEmail };
}

/**
 * Validates phone number format (basic validation)
 * @param {string} phone - The phone number to validate
 * @returns {Object} - { isValid: boolean, message: string }
 */
function validatePhone(phone) {
  if (!phone) {
    return { isValid: true, message: '' }; // Phone is optional
  }

  const phoneStr = String(phone).trim();
  
  // Remove common phone number formatting
  const cleanPhone = phoneStr.replace(/[\s\-\(\)\+]/g, '');
  
  // Check if it contains only digits and is reasonable length
  if (!/^\d+$/.test(cleanPhone)) {
    return { isValid: false, message: 'Phone number can only contain digits, spaces, hyphens, parentheses, and plus signs' };
  }

  if (cleanPhone.length < 7 || cleanPhone.length > 15) {
    return { isValid: false, message: 'Phone number must be between 7 and 15 digits long' };
  }

  return { isValid: true, message: '' };
}

/**
 * Validates bio length
 * @param {string} bio - The bio to validate
 * @returns {Object} - { isValid: boolean, message: string }
 */
function validateBio(bio) {
  if (!bio) {
    return { isValid: true, message: '' }; // Bio is optional
  }

  const bioStr = String(bio).trim();

  if (bioStr.length > 500) {
    return { isValid: false, message: 'Bio must be no more than 500 characters long' };
  }

  return { isValid: true, message: '' };
}

module.exports = {
  validateUsername,
  validatePassword,
  validateEmail,
  validatePhone,
  validateBio
};
