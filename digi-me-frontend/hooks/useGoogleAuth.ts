"use client";

import { useEffect, useRef, useState } from "react";

interface GoogleAuthConfig {
  clientId: string;
  onSuccess: (credential: string) => void;
  onError?: (error: unknown) => void;
}

export const useGoogleAuth = ({
  clientId,
  onSuccess,
  onError,
}: GoogleAuthConfig) => {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  // ✅ Proper Client ID validation (no unnecessary checks)
  const isValidClientId =
    typeof clientId === "string" &&
    clientId.trim().length > 0 &&
    !clientId.includes("your-google-client-id");

  // ✅ Load Google script dynamically
  useEffect(() => {
    if (!isValidClientId) {
      console.error(
        "❌ Invalid Google OAuth Client ID. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your environment variables."
      );
      onError?.("Invalid Google OAuth Client ID");
      return;
    }

    // Load the Google Identity script only once
    if (!window.google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;

      script.onload = () => {
        setIsGoogleLoaded(true);
      };

      script.onerror = () => {
        console.error("❌ Failed to load Google OAuth script");
        onError?.("Failed to load Google OAuth script");
      };

      document.head.appendChild(script);
    } else {
      setIsGoogleLoaded(true);
    }
  }, [isValidClientId, onError]);

  // ✅ Initialize Google ID client
  useEffect(() => {
    if (isGoogleLoaded && !isInitialized && isValidClientId && window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            if (response.credential) {
              onSuccess(response.credential);
            } else {
              onError?.("No credential returned from Google");
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        setIsInitialized(true);
      } catch (error) {
        console.error("❌ Google Auth initialization error:", error);
        onError?.(error);
      }
    }
  }, [isGoogleLoaded, isInitialized, isValidClientId, clientId, onSuccess, onError]);

  // ✅ Click handler to trigger Google sign-in prompt
  const handleGoogleClick = () => {
    if (isInitialized && window.google && isValidClientId) {
      try {
        window.google.accounts.id.prompt();
      } catch (error) {
        console.error("❌ Google OAuth prompt error:", error);
        onError?.(error);
      }
    } else {
      alert("Google OAuth is not properly configured. Please contact support.");
    }
  };

  return {
    buttonRef,
    isGoogleLoaded,
    isInitialized,
    handleGoogleClick,
    isValidClientId,
  };
};
