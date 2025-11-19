// src/utils/useAutoLogout.js
// Auto logout after 10 minutes of inactivity
import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

export default function useAutoLogout() {
  const nav = useNavigate();
  const timeoutRef = useRef(null);
  const isLoggedOutRef = useRef(false);

  const logout = useCallback(async () => {
    if (isLoggedOutRef.current) return;

    console.log("[AutoLogout] Logging out due to inactivity");
    isLoggedOutRef.current = true;

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("[AutoLogout] Error signing out:", error);
    }

    // Navigate to login with message
    nav("/login?message=session_timeout", { replace: true });
  }, [nav]);

  const resetTimer = useCallback(() => {
    // Don't reset if already logged out
    if (isLoggedOutRef.current) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(logout, INACTIVITY_TIMEOUT);
  }, [logout]);

  useEffect(() => {
    // Check if user is logged in before setting up auto-logout
    let mounted = true;

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session) {
        console.log("[AutoLogout] Session active, starting inactivity timer");
        isLoggedOutRef.current = false;

        // Events that count as activity
        const events = [
          "mousedown",
          "mousemove",
          "keydown",
          "scroll",
          "touchstart",
          "click",
          "focus"
        ];

        // Add event listeners
        events.forEach(event => {
          document.addEventListener(event, resetTimer, { passive: true });
        });

        // Start initial timer
        resetTimer();

        // Cleanup function
        return () => {
          events.forEach(event => {
            document.removeEventListener(event, resetTimer);
          });
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
        };
      }
    };

    const cleanup = checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        console.log("[AutoLogout] User signed in, starting inactivity timer");
        isLoggedOutRef.current = false;
        resetTimer();
      } else if (event === "SIGNED_OUT") {
        console.log("[AutoLogout] User signed out, clearing timer");
        isLoggedOutRef.current = true;
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
      if (typeof cleanup === "function") {
        cleanup();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resetTimer]);
}
