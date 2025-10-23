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
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
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
          }

          // Default to 'client' if no role found
          setRole(r || 'client');
        }

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
