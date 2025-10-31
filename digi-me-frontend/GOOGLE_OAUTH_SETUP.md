# Google OAuth Setup Guide

## Issue: "Something went wrong" Error

The Google Sign-In error occurs because the Google OAuth Client ID is not properly configured.

## Solution:

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized origins:
   - `http://localhost:3000` (for development)
   - Your production domain
7. Copy the Client ID

### 2. Set Environment Variable

Create a `.env.local` file in the `digi-me-frontend` directory:

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-actual-google-client-id-here
```

### 3. Backend Configuration

Make sure your backend `.env` file has the same Client ID:

```bash
GOOGLE_CLIENT_ID=your-actual-google-client-id-here
```

### 4. Restart Development Server

After setting the environment variables, restart your development server:

```bash
npm run dev
```

## Important Notes:

- The Client ID must be the same in both frontend and backend
- Make sure to add your domain to authorized origins in Google Console
- The error "Something went wrong" typically means the Client ID is invalid or not properly configured
