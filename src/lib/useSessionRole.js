// src/useSessionRole.js
import { useEffect, useState, useMemo } from "react";
import { supabase } from "./supabase";

export function useSessionRole() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        console.log("[useSessionRole] Starting init...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("[useSessionRole] Session error:", sessionError);
        }

        console.log("[useSessionRole] Session:", session?.user?.email || "none");

        if (!mounted) {
          console.log("[useSessionRole] Component unmounted, aborting");
          return;
        }

        setSession(session);

        // resolve role if we're logged in
        if (session?.user) {
          const uid = session.user.id;
          const email = session.user.email;

          // primary source: profiles.role where id = auth.users.id
          const { data: p, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", uid)
            .maybeSingle(); // Use maybeSingle() instead of single() to avoid error if profile doesn't exist

          if (profileError) {
            console.error("[useSessionRole] Profile query error:", profileError);
          }

          let r = p?.role ?? null;
          console.log("[useSessionRole] Profile role:", r);

          // fallback: treat as admin if listed in admin_emails (or your "authorization" table)
          if (!r && email) {
            const { data: adminRow, error: adminError } = await supabase
              .from("admin_emails")
              .select("email,is_admin,role")
              .eq("email", email)
              .maybeSingle();

            if (adminError) {
              console.error("[useSessionRole] Admin query error:", adminError);
            }

            if (adminRow?.is_admin || adminRow?.role === "admin") r = "admin";
            console.log("[useSessionRole] Admin check result:", r);
          }

          // Default to 'client' if no role found
          const finalRole = r || 'client';
          console.log("[useSessionRole] Final role:", finalRole);
          setRole(finalRole);
        } else {
          console.log("[useSessionRole] No session found");
          setRole(null);
        }

        console.log("[useSessionRole] Init complete, setting loading=false");
        setLoading(false);
      } catch (error) {
        console.error("[useSessionRole] Init error:", error);
        setLoading(false); // CRITICAL: Always stop loading even on error
      }
    };

    init();

    // live auth changes
    const { data: sub } = supabase.auth.onAuthStateChange(async (_evt, s) => {
      try {
        setSession(s);
        if (s?.user) {
          const { data: p, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", s.user.id)
            .maybeSingle(); // Use maybeSingle() instead of single() to avoid error if profile doesn't exist

          if (profileError) {
            console.error("[useSessionRole] Auth change profile error:", profileError);
          }

          let r = p?.role ?? null;

          if (!r && s.user.email) {
            const { data: adminRow, error: adminError } = await supabase
              .from("admin_emails")
              .select("email,is_admin,role")
              .eq("email", s.user.email)
              .maybeSingle();

            if (adminError) {
              console.error("[useSessionRole] Auth change admin error:", adminError);
            }

            if (adminRow?.is_admin || adminRow?.role === "admin") r = "admin";
          }

          setRole(r || 'client');
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error("[useSessionRole] Auth state change error:", error);
        // Don't block auth state changes on errors
      }
    });

    return () => sub.subscription?.unsubscribe();
  }, []);

  return useMemo(() => ({ session, role, loading }), [session, role, loading]);
}
