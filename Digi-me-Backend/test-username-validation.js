/**
 * Quick test to verify username validation is working
 */

const { validateUsername } = require('./src/utils/validation');

console.log('Testing username validation...\n');

// Test cases that should FAIL
const invalidUsernames = [
  '',           // Empty
  'a',          // Too short (1 char)
  'aa',         // Too short (2 chars)
  'ab',         // Too short (2 chars)
  '_user',      // Starts with underscore
  'user_',      // Ends with underscore
  'user__name', // Consecutive underscores
  'user@name',  // Invalid character
  'user name',  // Space
  'a'.repeat(21) // Too long (21 chars)
];

// Test cases that should PASS
const validUsernames = [
  'abc',        // Minimum length (3 chars)
  'user',       // Normal username
  'user123',    // With numbers
  'user_name',  // With underscore
  'test_user_1', // Multiple underscores (not consecutive)
  'a'.repeat(20) // Maximum length (20 chars)
];

console.log('=== INVALID USERNAMES (should fail) ===');
invalidUsernames.forEach(username => {
  const result = validateUsername(username);
  const status = result.isValid ? '❌ PASSED (should have failed)' : '✅ FAILED (correct)';
  console.log(`"${username}" -> ${status}: ${result.message || 'No message'}`);
});

console.log('\n=== VALID USERNAMES (should pass) ===');
validUsernames.forEach(username => {
  const result = validateUsername(username);
  const status = result.isValid ? '✅ PASSED (correct)' : '❌ FAILED (should have passed)';
  console.log(`"${username}" -> ${status}: ${result.message || 'No message'}`);
});

console.log('\n=== Test Complete ===');
