import { useEffect, useRef } from "react";
import { useAuth, useGoogleLogin } from "@/hooks/useAuth";

declare global {
  interface Window {
    google?: any;
  }
}

export const GoogleOneTap = () => {
  const { isAuthenticated } = useAuth();
  const { mutate: googleLoginMutate } = useGoogleLogin();
  const initializedRef = useRef(false);

  const clientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    "851412910623-cqq5dj652m3qmu71c56ak4626rop4jka.apps.googleusercontent.com";

  useEffect(() => {
    if (isAuthenticated) return;

    // Reset Google's internal cooldown cookie
    try {
      document.cookie = "g_state=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT";
      document.cookie = `g_state=;path=/;domain=${window.location.hostname};expires=Thu, 01 Jan 1970 00:00:01 GMT`;
    } catch (e) {}

    const handleCredentialResponse = (response: any) => {
      try {
        if (!response.credential) return;
        const base64Url = response.credential.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const payload = JSON.parse(jsonPayload);

        googleLoginMutate({
          google_id: payload.sub,
          google_email: payload.email,
          email: payload.email,
          name: payload.name,
          profile_photo: payload.picture,
        });
      } catch (err) {
        console.error("Google One Tap decoding error:", err);
      }
    };

    const tryInitOneTap = () => {
      if (!window.google?.accounts?.id || initializedRef.current) return;

      try {
        window.google.accounts.id.cancel();
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: false,
          context: "signin",
          itp_support: true,
          use_fedcm_for_prompt: true,
        });

        window.google.accounts.id.prompt();
        initializedRef.current = true;
      } catch (e) {
        console.warn("Google One Tap initialization error:", e);
      }
    };

    if (window.google?.accounts?.id) {
      tryInitOneTap();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          tryInitOneTap();
          clearInterval(interval);
        }
      }, 200);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, clientId, googleLoginMutate]);

  // Only the native Google prompt appears, no white fallback card
  return null;
};
