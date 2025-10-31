/**
 * Test file to demonstrate validation functionality
 * Run with: node test-validation.js
 */

const { validateUsername, validatePassword, validateEmail, validatePhone, validateBio } = require('./src/utils/validation');

console.log('=== Username Validation Tests ===');
const usernameTests = [
  'validuser',      // Valid
  'user123',        // Valid
  'user_name',      // Valid
  'ab',             // Too short
  'a'.repeat(21),   // Too long
  'user@name',      // Invalid character
  '_username',      // Starts with underscore
  'username_',      // Ends with underscore
  'user__name',     // Consecutive underscores
  '',               // Empty (valid - optional)
];

usernameTests.forEach(username => {
  const result = validateUsername(username);
  console.log(`"${username}" -> ${result.isValid ? 'VALID' : 'INVALID'}: ${result.message || 'OK'}`);
});

console.log('\n=== Password Validation Tests ===');
const passwordTests = [
  'ValidPass123!',     // Valid strong
  'Password123!',       // Valid strong
  'MyStr0ng!Pass',      // Valid strong
  'short',              // Too short
  'nouppercase123!',    // No uppercase
  'NOLOWERCASE123!',    // No lowercase
  'NoNumbers!',         // No numbers
  'NoSpecial123',       // No special chars
  'password',           // Common password
  '123456',             // Common password
  '',                   // Empty
];

passwordTests.forEach(password => {
  const result = validatePassword(password);
  console.log(`"${password}" -> ${result.isValid ? 'VALID' : 'INVALID'} (${result.strength}): ${result.message || 'OK'}`);
});

console.log('\n=== Email Validation Tests ===');
const emailTests = [
  'user@example.com',   // Valid
  'test.email@domain.org', // Valid
  'invalid-email',      // Invalid
  'user@',              // Invalid
  '@domain.com',        // Invalid
  '',                   // Empty
];

emailTests.forEach(email => {
  const result = validateEmail(email);
  console.log(`"${email}" -> ${result.isValid ? 'VALID' : 'INVALID'}: ${result.message || 'OK'}`);
});

console.log('\n=== Phone Validation Tests ===');
const phoneTests = [
  '1234567890',         // Valid
  '+1 (555) 123-4567', // Valid with formatting
  '555-123-4567',      // Valid with hyphens
  '123',               // Too short
  '123456789012345678', // Too long
  'abc123',            // Invalid characters
  '',                  // Empty (valid - optional)
];

phoneTests.forEach(phone => {
  const result = validatePhone(phone);
  console.log(`"${phone}" -> ${result.isValid ? 'VALID' : 'INVALID'}: ${result.message || 'OK'}`);
});

console.log('\n=== Bio Validation Tests ===');
const bioTests = [
  'This is a short bio',                    // Valid
  'A'.repeat(500),                          // Valid (max length)
  'A'.repeat(501),                          // Too long
  '',                                       // Empty (valid - optional)
];

bioTests.forEach(bio => {
  const result = validateBio(bio);
  console.log(`"${bio.substring(0, 20)}${bio.length > 20 ? '...' : ''}" -> ${result.isValid ? 'VALID' : 'INVALID'}: ${result.message || 'OK'}`);
});

console.log('\n=== Validation Complete ===');
