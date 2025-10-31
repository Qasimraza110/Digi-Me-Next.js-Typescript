# Backend Validation Documentation

This document outlines the validation rules implemented in the DigiMe backend for user input validation.

## Overview

The validation system is centralized in `src/utils/validation.js` and provides comprehensive validation for all user input fields. The validation functions return objects with `isValid`, `message`, and additional metadata.

## Validation Rules

### Username Validation

**Rules:**
- **Length**: 3-20 characters
- **Characters**: Only letters (a-z, A-Z), numbers (0-9), and underscores (_)
- **Format**: Cannot start or end with underscore
- **Consecutive**: Cannot contain consecutive underscores (__)
- **Optional**: Username is optional during registration

**Valid Examples:**
- `john_doe`
- `user123`
- `myusername`
- `test_user_1`

**Invalid Examples:**
- `ab` (too short)
- `_username` (starts with underscore)
- `username_` (ends with underscore)
- `user__name` (consecutive underscores)
- `user@name` (invalid character)

### Password Validation

**Rules:**
- **Length**: 8-128 characters
- **Uppercase**: Must contain at least one uppercase letter (A-Z)
- **Lowercase**: Must contain at least one lowercase letter (a-z)
- **Numbers**: Must contain at least one number (0-9)
- **Special Characters**: Must contain at least one special character (!@#$%^&*()_+-=[]{}|;':",./<>?)
- **Common Passwords**: Rejects common weak passwords

**Password Strength Calculation:**
- **Weak**: Basic requirements met
- **Medium**: 4-5 strength points
- **Strong**: 6+ strength points

**Strength Points:**
- Length ≥ 12: +2 points
- Length ≥ 10: +1 point
- Has both upper and lowercase: +1 point
- Has numbers: +1 point
- Has special characters: +1 point
- Length ≥ 16: +1 point
- Multiple special characters: +1 point

**Valid Examples:**
- `MyPassword123!` (Strong)
- `SecurePass456@` (Strong)
- `Password123!` (Medium)

**Invalid Examples:**
- `password` (too common, no uppercase/numbers/special)
- `123456` (too common, no letters)
- `Password` (no numbers/special characters)
- `short` (too short)

### Email Validation

**Rules:**
- **Format**: Must match standard email regex pattern
- **Required**: Email is required for registration
- **Normalization**: Automatically trimmed and converted to lowercase

**Valid Examples:**
- `user@example.com`
- `test.email@domain.org`
- `user+tag@example.co.uk`

**Invalid Examples:**
- `invalid-email` (no @ symbol)
- `user@` (incomplete domain)
- `@domain.com` (no username)

### Phone Validation

**Rules:**
- **Length**: 7-15 digits (after removing formatting)
- **Characters**: Digits, spaces, hyphens, parentheses, plus signs allowed
- **Optional**: Phone number is optional

**Valid Examples:**
- `1234567890`
- `+1 (555) 123-4567`
- `555-123-4567`
- `(555) 123 4567`

**Invalid Examples:**
- `123` (too short)
- `abc123` (contains letters)
- `123456789012345678` (too long)

### Bio Validation

**Rules:**
- **Length**: Maximum 500 characters
- **Optional**: Bio is optional

**Valid Examples:**
- `This is my bio`
- `A`.repeat(500) (exactly 500 characters)

**Invalid Examples:**
- `A`.repeat(501) (too long)

## API Integration

### Registration Endpoint (`POST /api/auth/register`)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "MyPassword123!",
  "username": "john_doe" // optional
}
```

**Validation Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "john_doe"
  },
  "passwordStrength": "strong"
}
```

**Error Response:**
```json
{
  "message": "Password must contain at least one uppercase letter"
}
```

### Profile Update Endpoint (`PUT /api/profile`)

**Request Body:**
```json
{
  "username": "new_username",
  "bio": "Updated bio",
  "phone": "+1 (555) 123-4567"
}
```

**Validation**: Each field is validated individually if present in the request.

### Password Reset Endpoint (`POST /api/auth/reset-password`)

**Request Body:**
```json
{
  "token": "reset_token",
  "password": "NewPassword123!"
}
```

**Validation**: Uses the same password validation rules as registration.

## Database Schema Validation

The User model includes schema-level validation that complements the application-level validation:

```javascript
username: { 
  type: String, 
  unique: true, 
  sparse: true,
  minlength: [3, 'Username must be at least 3 characters long'],
  maxlength: [20, 'Username must be no more than 20 characters long'],
  match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
  validate: {
    validator: function(v) {
      if (!v) return true; // Allow empty username
      return !v.startsWith('_') && !v.endsWith('_') && !v.includes('__');
    },
    message: 'Username cannot start/end with underscore or contain consecutive underscores'
  }
}
```

## Testing

Run the validation tests with:
```bash
node test-validation.js
```

This will test all validation functions with various input scenarios and display the results.

## Security Considerations

1. **Password Strength**: Enforces strong password requirements to prevent brute force attacks
2. **Common Password Rejection**: Prevents use of easily guessable passwords
3. **Input Sanitization**: All inputs are trimmed and normalized
4. **SQL Injection Prevention**: Uses parameterized queries through Mongoose
5. **Rate Limiting**: Consider implementing rate limiting for authentication endpoints

## Error Handling

All validation errors return HTTP 400 status codes with descriptive error messages. The frontend should handle these errors and display them to users in a user-friendly manner.

## Future Enhancements

1. **Real-time Validation**: Implement client-side validation that mirrors server-side rules
2. **Password History**: Prevent reuse of recent passwords
3. **Account Lockout**: Implement temporary account lockout after failed login attempts
4. **Two-Factor Authentication**: Add 2FA support with proper validation
5. **Audit Logging**: Log validation failures for security monitoring
