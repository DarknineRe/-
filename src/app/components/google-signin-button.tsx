import { useAuth } from "../context/auth-context";
import { toast } from "sonner";

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

/**
 * Google Sign-In Button Component
 * Requires: npm install @react-oauth/google
 * 
 * Usage:
 * 1. Wrap your app with GoogleOAuthProvider
 * 2. Use this component
 * 
 * Example in main.tsx:
 * import { GoogleOAuthProvider } from '@react-oauth/google';
 * 
 * <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
 *   <App />
 * </GoogleOAuthProvider>
 */
export function GoogleSignInButton({
  onSuccess,
  loading = false,
  disabled = false,
}: GoogleSignInButtonProps) {
  const { loginWithGoogle } = useAuth();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      // credentialResponse.credential contains the JWT token
      const token = credentialResponse.credential;
      
      if (!token) {
        toast.error("Failed to get Google token");
        return;
      }

      await loginWithGoogle(token);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Google sign-in failed");
      console.error("Google sign-in error:", error);
    }
  };

  const handleError = () => {
    toast.error("Google sign-in failed");
  };

  // Check if Google library is loaded
  if (typeof window !== "undefined" && !window.google?.accounts?.id) {
    return (
      <div className="w-full p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 text-sm">
          Google Sign-in not configured. Please install @react-oauth/google and add GoogleOAuthProvider to your app.
          <br />
          <code className="text-xs">npm install @react-oauth/google</code>
        </p>
      </div>
    );
  }

  return (
    <div
      id="google-signin-button"
      className="w-full flex justify-center"
      style={{ opacity: loading || disabled ? 0.6 : 1 }}
    />
  );
}

/**
 * Initialize Google Sign-In
 * Call this in your login page after component mounts
 */
export function initGoogleSignIn(
  elementId: string,
  onSuccess: (credentialResponse: any) => void,
  onError: () => void
) {
  if (typeof window !== "undefined" && window.google?.accounts?.id) {
    window.google.accounts.id.renderButton(
      document.getElementById(elementId),
      {
        theme: "outline",
        size: "large",
        width: "100%",
        text: "signin_with",
        locale: "th", // Thai language
      }
    );

    window.google.accounts.id.callback = onSuccess;
  }
}
