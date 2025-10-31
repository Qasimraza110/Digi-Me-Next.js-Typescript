# DigiMe Authentication Setup Test

## Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd Digi-me-Backend
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start the backend server:
   ```bash
   npm start
   ```
   The server should start on port 3001 (or the port specified in your .env file).

## Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd digi-me-frontend
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The frontend should start on port 3000.

## Testing the Authentication Flow

### 1. Test Registration
- Navigate to `http://localhost:3000/register`
- Fill in the registration form with:
  - Username
  - Email address
  - Password
- Click "Register Now"
- You should be redirected to the profile page upon successful registration

### 2. Test Login
- Navigate to `http://localhost:3000/login`
- Fill in the login form with:
  - Email address (same as used for registration)
  - Password
- Click "Login"
- You should be redirected to the profile page upon successful login

### 3. Test Forgot Password
- Navigate to `http://localhost:3000/forgot`
- Enter your email address
- Click "Send Reset Link"
- Check your email for the reset link (if email is configured)

### 4. Test Profile Page
- After successful login, you should see your profile page with:
  - Your username and email
  - Account creation date
  - Status as "Active"
  - Logout button

## Features Implemented

### UI Components
- ✅ Login page with exact UI matching the design
- ✅ Register page with exact UI matching the design
- ✅ Forgot password page
- ✅ Profile page
- ✅ Responsive design for both desktop and mobile
- ✅ Background with people collage (merge.svg)
- ✅ DigiMe logo (group.svg)
- ✅ Purple to pink gradient buttons
- ✅ Google login button integration

### Backend Integration
- ✅ User registration API
- ✅ User login API
- ✅ Password reset API
- ✅ Google OAuth integration
- ✅ Profile management API
- ✅ JWT token authentication

### Authentication Flow
- ✅ Automatic redirect to login if not authenticated
- ✅ Automatic redirect to profile if already authenticated
- ✅ Token-based authentication
- ✅ Protected routes
- ✅ Logout functionality

## API Endpoints Used
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/password/forgot` - Password reset request
- `POST /api/auth/google` - Google OAuth login
- `GET /api/profile` - Get user profile (requires authentication)

## Notes
- The UI exactly matches the provided design with dark background, people collage, and frosted glass effect
- All forms are properly validated
- Error handling is implemented for failed requests
- The application is fully responsive for both desktop and mobile devices
- Google OAuth is integrated but requires proper Google Client ID configuration in the backend .env file
