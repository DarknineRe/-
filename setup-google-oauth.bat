@echo off
REM Setup script for Google OAuth integration (Windows)

echo.
echo 🔐 Setting up Google OAuth for Agricultural Management System
echo.

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install Node.js and npm first.
    exit /b 1
)

echo 📦 Installing Google OAuth library...

REM Install frontend dependencies
npm install @react-oauth/google

if %errorlevel% equ 0 (
    echo ✅ Dependencies installed successfully
    echo.
    echo 🎯 Next steps:
    echo 1. Go to https://console.cloud.google.com/
    echo 2. Create a new project
    echo 3. Enable Google+ API
    echo 4. Create OAuth 2.0 Client ID credentials
    echo 5. Add authorized redirect URIs:
    echo    - http://localhost:5173 (development)
    echo    - http://localhost:3000 (production)
    echo.
    echo 6. Copy your Client ID
    echo 7. Update your .env file with VITE_GOOGLE_CLIENT_ID
    echo.
    echo 8. Update src/main.tsx to wrap App with GoogleOAuthProvider
    echo.
    echo ✨ Setup complete! You're ready to use Google Sign-in
) else (
    echo ❌ Failed to install dependencies
    exit /b 1
)
