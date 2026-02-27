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

function getRole(user) {
  if (!user) return "client";
  if (user.is_admin) return "admin";
  return user.role || "client";
}

export default function useAuthRedirect() {
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    let mounted = true;
    let hasRedirected = false;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted || !session || hasRedirected) return;

      if (PUBLIC_PATHS.has(loc.pathname)) {
        const next = new URLSearchParams(loc.search).get("next");
        const role = getRole(session.user);
        const fallback = roleToDefault(role);
        const target = (next && next.startsWith("/")) ? next : fallback;
        if (target && target !== loc.pathname) {
          hasRedirected = true;
          nav(target, { replace: true });
        }
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((evt, sess) => {
      if (!sess || !sess.user || hasRedirected) return;
      if (evt !== "SIGNED_IN") return;

      if (PUBLIC_PATHS.has(loc.pathname)) {
        hasRedirected = true;
        const next = new URLSearchParams(loc.search).get("next");
        const role = getRole(sess.user);
        const fallback = roleToDefault(role);
        const target = (next && next.startsWith("/")) ? next : fallback;
        nav(target, { replace: true });
      }
    });

    return () => { mounted = false; sub.subscription?.unsubscribe(); };
  }, [nav, loc.pathname, loc.search]);
}
