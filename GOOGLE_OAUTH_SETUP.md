# Google OAuth Setup Guide

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Google+ API**
4. Go to **Credentials**
5. Create **OAuth 2.0 Client ID** for Web Application
6. Add authorized redirect URIs:
   - `http://localhost:5173` (development)
   - `http://localhost:3000` (production)
   - `http://localhost:3001` (backend)

7. Copy your **Client ID**

## Step 2: Update Environment Variables

In `.env` file:
```
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

In `server/.env`:
```
GOOGLE_CLIENT_ID=your_google_client_id_here
```

## Step 3: Install Dependencies

### Frontend:
```powershell
npm install @react-oauth/google
```

### Backend (already included):
```powershell
npm install axios  # for making HTTP requests to verify tokens
```

## Step 4: Usage

The Google Sign-in is available on the login page.
When user clicks "Sign in with Google":
1. Google popup opens
2. User authenticates
3. Token is sent to backend for verification
4. Backend verifies token with Google
5. User is logged in if verified
6. User account is created if it doesn't exist

## How It Works

1. **Frontend**: Uses `@react-oauth/google` to get OAuth token
2. **Backend**: Verifies token with Google API endpoint
3. **Database**: Creates/updates user account
4. **Session**: User is logged in with verified credentials

## Testing

Default test users still work:
- farmer@example.com / password123
- admin@example.com / admin123

Alternatively, use any Google account to sign in.
