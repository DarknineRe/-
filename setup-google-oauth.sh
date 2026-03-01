#!/bin/bash
# Setup script for Google OAuth integration

echo "🔐 Setting up Google OAuth for Agricultural Management System"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

echo "📦 Installing dependencies..."
cd "$(dirname "$0")"

# Install frontend dependencies
npm install @react-oauth/google

if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

echo ""
echo "🎯 Next steps:"
echo "1. Go to https://console.cloud.google.com/"
echo "2. Create a new project"
echo "3. Enable Google+ API"
echo "4. Create OAuth 2.0 Client ID credentials"
echo "5. Add authorized redirect URIs:"
echo "   - http://localhost:5173 (development frontend)"
echo "   - http://localhost:3000 (production frontend)"
echo ""
echo "6. Copy your Client ID"
echo "7. Update vite.config.ts with VITE_GOOGLE_CLIENT_ID environment variable"
echo ""
echo "8. Update main.tsx to wrap App with GoogleOAuthProvider"
echo ""
echo "Example in main.tsx:"
echo "---"
echo "import { GoogleOAuthProvider } from '@react-oauth/google';"
echo ""
echo "ReactDOM.createRoot(document.getElementById('root')!).render("
echo "  <React.StrictMode>"
echo "    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>"
echo "      <App />"
echo "    </GoogleOAuthProvider>"
echo "  </React.StrictMode>,"
echo ");"
echo "---"
echo ""
echo "✨ Setup complete! You're ready to use Google Sign-in"
