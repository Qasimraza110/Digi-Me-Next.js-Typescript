# DigiMe API Testing Guide with Postman

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most routes require a JWT token. Include it in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 1. HEALTH CHECK ROUTES

### 1.1 Server Health Check
- **Method**: `GET`
- **URL**: `http://localhost:5000/health`
- **Headers**: None
- **Body**: None
- **Expected Response**: 
```json
{
  "status": "ok",
  "env": "development",
  "db": "configured"
}
```

### 1.2 Database Health Check
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/health/db`
- **Headers**: None
- **Body**: None
- **Expected Response**: 
```json
{
  "db": "connected"
}
```

---

## 2. AUTHENTICATION ROUTES (`/api/auth`)

### 2.1 User Registration
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/register`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (JSON):
```json
{
  "username": "testuser123",
  "email": "test@example.com",
  "password": "TestPassword123!"
}
```
- **Expected Response** (201):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id_here",
    "email": "test@example.com",
    "username": "testuser123"
  },
  "passwordStrength": "strong"
}
```

### 2.2 User Login
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/login`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (JSON):
```json
{
  "email": "test@example.com",
  "password": "TestPassword123!"
}
```
- **Expected Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id_here",
    "email": "test@example.com",
    "username": "testuser123"
  }
}
```

### 2.3 Forgot Password
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/password/forgot`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (JSON):
```json
{
  "email": "test@example.com"
}
```
- **Expected Response** (200):
```json
{
  "message": "If account exists, email sent"
}
```

### 2.4 Reset Password
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/password/reset`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (JSON):
```json
{
  "token": "reset_token_from_email",
  "password": "NewPassword123!"
}
```
- **Expected Response** (200):
```json
{
  "message": "Password updated successfully",
  "passwordStrength": "strong"
}
```

### 2.5 Google Login
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/google`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (JSON):
```json
{
  "idToken": "google_id_token_here"
}
```
- **Expected Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id_here",
    "email": "user@gmail.com",
    "username": null
  }
}
```

---

## 3. PROFILE ROUTES (`/api/profile`)

### 3.1 Get My Profile (Protected)
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/profile/me`
- **Headers**: 
  ```
  Authorization: Bearer YOUR_JWT_TOKEN
  ```
- **Body**: None
- **Expected Response** (200):
```json
{
  "id": "user_id_here",
  "email": "test@example.com",
  "username": "testuser123",
  "bio": "",
  "phone": "",
  "avatarUrl": "",
  "socialLinks": {},
  "businessLinks": []
}
```

### 3.2 Update My Profile (Protected)
- **Method**: `PUT`
- **URL**: `http://localhost:5000/api/profile/me`
- **Headers**: 
  ```
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json
  ```
- **Body** (JSON):
```json
{
  "username": "newusername",
  "bio": "This is my updated bio",
  "phone": "+1234567890",
  "socialLinks": {
    "facebook": "https://facebook.com/username",
    "instagram": "https://instagram.com/username",
    "linkedin": "https://linkedin.com/in/username",
    "whatsapp": "+1234567890",
    "website": "https://mywebsite.com"
  },
  "businessLinks": ["https://business1.com", "https://business2.com"]
}
```
- **Expected Response** (200):
```json
{
  "id": "user_id_here",
  "email": "test@example.com",
  "username": "newusername",
  "bio": "This is my updated bio",
  "phone": "+1234567890",
  "avatarUrl": "",
  "socialLinks": {
    "facebook": "https://facebook.com/username",
    "instagram": "https://instagram.com/username",
    "linkedin": "https://linkedin.com/in/username",
    "whatsapp": "+1234567890",
    "website": "https://mywebsite.com"
  },
  "businessLinks": ["https://business1.com", "https://business2.com"]
}
```

### 3.3 Update Profile with Avatar (Protected)
- **Method**: `PUT`
- **URL**: `http://localhost:5000/api/profile/me`
- **Headers**: 
  ```
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: multipart/form-data
  ```
- **Body** (Form Data):
  - `avatar`: [Select File] (image file)
  - `username`: `newusername`
  - `bio`: `Updated bio with avatar`

### 3.4 Delete My Profile (Protected)
- **Method**: `DELETE`
- **URL**: `http://localhost:5000/api/profile/me`
- **Headers**: 
  ```
  Authorization: Bearer YOUR_JWT_TOKEN
  ```
- **Body**: None
- **Expected Response** (200):
```json
{
  "message": "Account deleted"
}
```

### 3.5 Get Public Profile by Username
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/profile/public/username/testuser123`
- **Headers**: None
- **Body**: None
- **Expected Response** (200):
```json
{
  "id": "user_id_here",
  "username": "testuser123",
  "bio": "This is my bio",
  "phone": "+1234567890",
  "avatarUrl": "/uploads/avatar.jpg",
  "socialLinks": {
    "facebook": "https://facebook.com/username",
    "instagram": "https://instagram.com/username"
  },
  "businessLinks": ["https://business1.com"],
  "qrCodeUrl": "/uploads/qr_code.png"
}
```

### 3.6 Get Public Profile by ID
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/profile/public/id/USER_ID_HERE`
- **Headers**: None
- **Body**: None
- **Expected Response**: Same as above

### 3.7 Search Profiles
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/profile/search?q=test`
- **Headers**: None
- **Body**: None
- **Expected Response** (200):
```json
{
  "query": "test",
  "count": 2,
  "results": [
    {
      "id": "user_id_1",
      "username": "testuser123",
      "bio": "Test user bio",
      "phone": "+1234567890",
      "avatarUrl": "/uploads/avatar1.jpg",
      "socialLinks": {},
      "businessLinks": [],
      "qrCodeUrl": "/uploads/qr1.png"
    },
    {
      "id": "user_id_2",
      "username": "testuser456",
      "bio": "Another test user",
      "phone": "",
      "avatarUrl": "",
      "socialLinks": {},
      "businessLinks": [],
      "qrCodeUrl": ""
    }
  ]
}
```

---

## 4. QR CODE ROUTES (`/api/qr`)

### 4.1 Generate My QR Code (Protected)
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/qr/me`
- **Headers**: 
  ```
  Authorization: Bearer YOUR_JWT_TOKEN
  ```
- **Body**: None
- **Expected Response** (200):
```json
{
  "qrCodeUrl": "/uploads/qr_code_1234567890.png",
  "message": "QR code generated successfully"
}
```

### 4.2 Scan QR Code
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/qr/scan`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (JSON):
```json
{
  "qrData": "user_profile_data_or_url"
}
```
- **Expected Response** (200):
```json
{
  "profile": {
    "id": "user_id_here",
    "username": "testuser123",
    "bio": "User bio",
    "avatarUrl": "/uploads/avatar.jpg"
  },
  "message": "QR code scanned successfully"
}
```

---

## 5. SAVED PROFILES ROUTES (`/api/saved`)

### 5.1 Get Saved Profiles (Protected)
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/saved`
- **Headers**: 
  ```
  Authorization: Bearer YOUR_JWT_TOKEN
  ```
- **Body**: None
- **Expected Response** (200):
```json
[
  {
    "id": "saved_user_id_1",
    "username": "saveduser1",
    "avatarUrl": "/uploads/avatar1.jpg",
    "bio": "Saved user bio"
  },
  {
    "id": "saved_user_id_2",
    "username": "saveduser2",
    "avatarUrl": "",
    "bio": "Another saved user"
  }
]
```

### 5.2 Save a Profile (Protected)
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/saved`
- **Headers**: 
  ```
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json
  ```
- **Body** (JSON):
```json
{
  "targetUserId": "user_id_to_save"
}
```
- **Expected Response** (200):
```json
{
  "message": "Saved"
}
```

### 5.3 Remove Saved Profile (Protected)
- **Method**: `DELETE`
- **URL**: `http://localhost:5000/api/saved`
- **Headers**: 
  ```
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json
  ```
- **Body** (JSON):
```json
{
  "targetUserId": "user_id_to_remove"
}
```
- **Expected Response** (200):
```json
{
  "message": "Removed"
}
```

---

## 6. VALIDATION TESTING

### 6.1 Test Username Validation
Try these invalid usernames in registration:

**Too Short:**
```json
{
  "username": "a",
  "email": "test@example.com",
  "password": "TestPassword123!"
}
```
**Expected Error**: `Username must be at least 3 characters long`

**Too Long:**
```json
{
  "username": "thisusernameistoolong",
  "email": "test@example.com",
  "password": "TestPassword123!"
}
```
**Expected Error**: `Username must be no more than 20 characters long`

**Invalid Characters:**
```json
{
  "username": "user@name",
  "email": "test@example.com",
  "password": "TestPassword123!"
}
```
**Expected Error**: `Username can only contain letters, numbers, and underscores`

### 6.2 Test Password Validation
Try these invalid passwords:

**Too Short:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "short"
}
```
**Expected Error**: `Password must be at least 8 characters long`

**Missing Uppercase:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "testpassword123!"
}
```
**Expected Error**: `Password must contain at least one uppercase letter`

**Missing Special Character:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "TestPassword123"
}
```
**Expected Error**: `Password must contain at least one special character`

---

## 7. ERROR RESPONSES

### Common Error Codes:
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **404**: Not Found (user/profile not found)
- **409**: Conflict (email/username already exists)
- **500**: Internal Server Error

### Example Error Response:
```json
{
  "message": "Username must be at least 3 characters long"
}
```

---

## 8. POSTMAN COLLECTION SETUP

### Environment Variables:
Create a Postman environment with these variables:
- `base_url`: `http://localhost:5000`
- `api_url`: `http://localhost:5000/api`
- `token`: `{{jwt_token}}` (set this after login)

### Pre-request Scripts:
For protected routes, add this pre-request script:
```javascript
pm.request.headers.add({
    key: 'Authorization',
    value: 'Bearer ' + pm.environment.get('token')
});
```

### Test Scripts:
Add this to login/register requests to save the token:
```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
    const response = pm.response.json();
    if (response.token) {
        pm.environment.set('token', response.token);
    }
}
```

---

## 9. TESTING WORKFLOW

1. **Start Backend**: `cd Digi-me-Backend && npm start`
2. **Test Health**: GET `/health`
3. **Register User**: POST `/api/auth/register`
4. **Login**: POST `/api/auth/login`
5. **Get Profile**: GET `/api/profile/me`
6. **Update Profile**: PUT `/api/profile/me`
7. **Search Profiles**: GET `/api/profile/search?q=test`
8. **Generate QR**: GET `/api/qr/me`
9. **Save Profile**: POST `/api/saved`
10. **Get Saved**: GET `/api/saved`

This comprehensive guide covers all your API routes with proper request/response examples for testing in Postman!
