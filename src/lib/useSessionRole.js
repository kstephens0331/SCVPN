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
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(session);

      // resolve role if we're logged in
      if (session?.user) {
        const uid = session.user.id;
        const email = session.user.email;

        // primary source: profiles.role where id = auth.users.id
        const { data: p } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", uid)
          .maybeSingle(); // Use maybeSingle() instead of single() to avoid error if profile doesn't exist

        let r = p?.role ?? null;

        // fallback: treat as admin if listed in admin_emails (or your “authorization” table)
        if (!r && email) {
          const { data: adminRow } = await supabase
            .from("admin_emails")
            .select("email,is_admin,role")
            .eq("email", email)
            .maybeSingle();

          if (adminRow?.is_admin || adminRow?.role === "admin") r = "admin";
        }

        setRole(r);
      }

      setLoading(false);
    };

    init();

    // live auth changes
    const { data: sub } = supabase.auth.onAuthStateChange(async (_evt, s) => {
      setSession(s);
      if (s?.user) {
        const { data: p } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", s.user.id)
          .maybeSingle(); // Use maybeSingle() instead of single() to avoid error if profile doesn't exist
        let r = p?.role ?? null;

        if (!r && s.user.email) {
          const { data: adminRow } = await supabase
            .from("admin_emails")
            .select("email,is_admin,role")
            .eq("email", s.user.email)
            .maybeSingle();
          if (adminRow?.is_admin || adminRow?.role === "admin") r = "admin";
        }

        setRole(r);
      } else {
        setRole(null);
      }
    });

    return () => sub.subscription?.unsubscribe();
  }, []);

  return useMemo(() => ({ session, role, loading }), [session, role, loading]);
}
