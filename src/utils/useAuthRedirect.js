// src/utils/useAuthRedirect.js
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

const PUBLIC_PATHS = new Set([
  "/", "/pricing", "/faq", "/contact", "/login", "/about", "/post-checkout", "/app", "/auth/callback"
]);

const roleToDefault = (role) => {
  if (role === "admin") return "/admin";
  if (role === "business") return "/app/business/overview";
  return "/app/personal/overview";
};

async function getRole() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  // profiles(id uuid PK, role text)
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (error) return null;
  return data?.role || "client";
}

export default function useAuthRedirect() {
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted || !session) return;

      // Only hop away from public pages
      if (PUBLIC_PATHS.has(loc.pathname)) {
        const next = new URLSearchParams(loc.search).get("next");
        const role = await getRole();
        const fallback = roleToDefault(role);
        const target = (next && next.startsWith("/")) ? next : fallback;
        if (target && target !== loc.pathname) {
          nav(target, { replace: true });
        }
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (evt, sess) => {
      if (!sess) return;
      if (PUBLIC_PATHS.has(loc.pathname)) {
        const next = new URLSearchParams(loc.search).get("next");
        const role = await getRole();
        const fallback = roleToDefault(role);
        const target = (next && next.startsWith("/")) ? next : fallback;
        nav(target, { replace: true });
      }
    });

    return () => { mounted = false; sub.subscription?.unsubscribe(); };
  }, [nav, loc.pathname, loc.search]);
}
