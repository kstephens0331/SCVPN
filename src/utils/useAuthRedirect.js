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
  console.log("[getRole] Fetching user...");
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  console.log("[getRole] User:", user?.email, "error:", userError);
  if (!user) return null;
  // profiles(id uuid PK, role text)
  console.log("[getRole] Querying profiles for user:", user.id);
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  console.log("[getRole] Profile data:", data, "error:", error);
  if (error) {
    console.error("[getRole] Error fetching profile:", error);
    return null;
  }
  const role = data?.role || "client";
  console.log("[getRole] Returning role:", role);
  return role;
}

export default function useAuthRedirect() {
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    let mounted = true;

    (async () => {
      console.log("[useAuthRedirect] Checking session on path:", loc.pathname);
      const { data: { session } } = await supabase.auth.getSession();
      console.log("[useAuthRedirect] Session exists:", !!session, "user:", session?.user?.email);
      if (!mounted || !session) return;

      // Only hop away from public pages
      if (PUBLIC_PATHS.has(loc.pathname)) {
        console.log("[useAuthRedirect] On public path, checking for redirect...");
        const next = new URLSearchParams(loc.search).get("next");
        const role = await getRole();
        console.log("[useAuthRedirect] Role:", role);
        const fallback = roleToDefault(role);
        const target = (next && next.startsWith("/")) ? next : fallback;
        console.log("[useAuthRedirect] Target:", target, "Current:", loc.pathname);
        if (target && target !== loc.pathname) {
          console.log("[useAuthRedirect] Navigating to:", target);
          nav(target, { replace: true });
        }
      } else {
        console.log("[useAuthRedirect] Not on public path, no redirect needed");
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (evt, sess) => {
      console.log("[useAuthRedirect] Auth state changed:", evt, "has session:", !!sess);
      console.log("[useAuthRedirect] Current pathname:", loc.pathname, "is public?", PUBLIC_PATHS.has(loc.pathname));
      if (!sess) return;
      if (PUBLIC_PATHS.has(loc.pathname)) {
        console.log("[useAuthRedirect] On public path, fetching role...");
        const next = new URLSearchParams(loc.search).get("next");
        const role = await getRole();
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
