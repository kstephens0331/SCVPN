// src/useSessionRole.js — Session role from JWT (no DB query needed)
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

        if (session?.user) {
          // Role is embedded in the JWT/session — no DB query needed
          const r = session.user.is_admin ? "admin" : (session.user.role || "client");
          setRole(r);
        } else {
          setRole(null);
        }

        setLoading(false);
      } catch (error) {
        console.error("[useSessionRole] Init error:", error);
        setLoading(false);
      }
    };

    init();

    // Live auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      try {
        setSession(s);
        if (s?.user) {
          const r = s.user.is_admin ? "admin" : (s.user.role || "client");
          setRole(r);
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error("[useSessionRole] Auth state change error:", error);
      }
    });

    return () => {
      mounted = false;
      sub.subscription?.unsubscribe();
    };
  }, []);

  return useMemo(() => ({ session, role, loading }), [session, role, loading]);
}
