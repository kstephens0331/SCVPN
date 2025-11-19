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

          let r = null;

          // primary source: profiles.role where id = auth.users.id
          try {
            const timeoutPromise = new Promise((resolve) =>
              setTimeout(() => resolve({ data: null, error: null }), 3000)
            );

            const queryPromise = supabase
              .from("profiles")
              .select("role")
              .eq("id", uid)
              .maybeSingle();

            const { data: p, error: profileError } = await Promise.race([queryPromise, timeoutPromise]);

            if (profileError) {
              console.error("[useSessionRole] Profile query error:", profileError);
            }

            r = p?.role ?? null;
            console.log("[useSessionRole] Profile role:", r);
          } catch (err) {
            console.error("[useSessionRole] Profile query failed:", err);
          }

          // fallback: check email for admin
          if (!r && email) {
            // Quick email check fallback
            if (email === "info@stephenscode.dev" || email.endsWith("@sacvpn.com")) {
              r = "admin";
              console.log("[useSessionRole] Admin detected by email fallback");
            }
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
          let r = null;

          // Query profile with timeout
          try {
            const timeoutPromise = new Promise((resolve) =>
              setTimeout(() => resolve({ data: null, error: null }), 3000)
            );

            const queryPromise = supabase
              .from("profiles")
              .select("role")
              .eq("id", s.user.id)
              .maybeSingle();

            const { data: p, error: profileError } = await Promise.race([queryPromise, timeoutPromise]);

            if (profileError) {
              console.error("[useSessionRole] Auth change profile error:", profileError);
            }

            r = p?.role ?? null;
          } catch (err) {
            console.error("[useSessionRole] Auth change profile query failed:", err);
          }

          // Fallback: check email for admin
          if (!r && s.user.email) {
            if (s.user.email === "info@stephenscode.dev" || s.user.email.endsWith("@sacvpn.com")) {
              r = "admin";
            }
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
