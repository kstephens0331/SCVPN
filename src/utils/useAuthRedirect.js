// src/utils/useAuthRedirect.js
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

const PUBLIC_PATHS = new Set([
  "/", "/pricing", "/faq", "/contact", "/login", "/about", "/post-checkout", "/app", "/auth/callback", "/terms", "/privacy"
]);

const roleToDefault = (role) => {
  if (role === "admin") return "/admin";
  if (role === "business") return "/app/business/overview";
  return "/app/personal/overview";
};

async function getRole(userId, userEmail) {
  if (!userId) {
    console.log("[getRole] No userId provided, returning default");
    return "client";
  }

  console.log("[getRole] Querying profiles for user:", userId);

  try {
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((resolve) =>
      setTimeout(() => {
        console.log("[getRole] Query timed out, using default role");
        resolve({ data: null, error: null, timedOut: true });
      }, 3000)
    );

    const queryPromise = supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle()
      .then(result => ({ ...result, timedOut: false }));

    const result = await Promise.race([queryPromise, timeoutPromise]);

    console.log("[getRole] Profile data:", result.data, "error:", result.error, "timedOut:", result.timedOut);

    if (result.error || result.timedOut || !result.data) {
      // Fallback: check if admin email
      if (userEmail && (userEmail === "info@stephenscode.dev" || userEmail.endsWith("@sacvpn.com"))) {
        console.log("[getRole] Profile query failed, but email matches admin pattern");
        return "admin";
      }
      console.error("[getRole] Error or timeout fetching profile, using default");
      return "client";
    }

    const role = result.data?.role || "client";
    console.log("[getRole] Returning role:", role);
    return role;
  } catch (err) {
    console.error("[getRole] Unexpected error:", err);
    // Fallback: check if admin email
    if (userEmail && (userEmail === "info@stephenscode.dev" || userEmail.endsWith("@sacvpn.com"))) {
      return "admin";
    }
    return "client";
  }
}

export default function useAuthRedirect() {
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    let mounted = true;
    let hasRedirected = false; // Prevent multiple redirects

    (async () => {
      console.log("[useAuthRedirect] Checking session on path:", loc.pathname);
      const { data: { session } } = await supabase.auth.getSession();
      console.log("[useAuthRedirect] Session exists:", !!session, "user:", session?.user?.email);
      if (!mounted || !session || hasRedirected) return;

      // Only hop away from public pages
      if (PUBLIC_PATHS.has(loc.pathname)) {
        console.log("[useAuthRedirect] On public path, checking for redirect...");
        const next = new URLSearchParams(loc.search).get("next");
        // Use userId and email from session to avoid extra getUser() call
        const role = await getRole(session.user?.id, session.user?.email);
        console.log("[useAuthRedirect] Role:", role);
        const fallback = roleToDefault(role);
        const target = (next && next.startsWith("/")) ? next : fallback;
        console.log("[useAuthRedirect] Target:", target, "Current:", loc.pathname);
        if (target && target !== loc.pathname) {
          console.log("[useAuthRedirect] Navigating to:", target);
          hasRedirected = true;
          nav(target, { replace: true });
        }
      } else {
        console.log("[useAuthRedirect] Not on public path, no redirect needed");
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (evt, sess) => {
      console.log("[useAuthRedirect] Auth state changed:", evt, "has session:", !!sess, "user:", sess?.user?.id);
      console.log("[useAuthRedirect] Current pathname:", loc.pathname, "is public?", PUBLIC_PATHS.has(loc.pathname));

      // Only handle SIGNED_IN events with valid user, and prevent duplicate redirects
      if (!sess || !sess.user || hasRedirected) return;
      if (evt !== "SIGNED_IN") return;

      if (PUBLIC_PATHS.has(loc.pathname)) {
        console.log("[useAuthRedirect] On public path, fetching role for user:", sess.user.id);
        hasRedirected = true; // Set early to prevent race conditions
        const next = new URLSearchParams(loc.search).get("next");
        // Use userId and email from session to avoid extra getUser() call
        const role = await getRole(sess.user.id, sess.user.email);
        console.log("[useAuthRedirect] Got role:", role);
        const fallback = roleToDefault(role);
        const target = (next && next.startsWith("/")) ? next : fallback;
        console.log("[useAuthRedirect] Auth change - navigating to:", target);
        nav(target, { replace: true });
      } else {
        console.log("[useAuthRedirect] Not on public path, skipping redirect");
      }
    });

    return () => { mounted = false; sub.subscription?.unsubscribe(); };
  }, [nav, loc.pathname, loc.search]);
}
