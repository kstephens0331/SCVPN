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

      if (session?.user?.id) {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", session.user.id)
          .single();
        if (!mounted) return;
        if (!error) setRole(data?.role ?? null);
      }
      setLoading(false);
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
      if (!s?.user?.id) {
        setRole(null);
      } else {
        // refresh role on sign-in
        supabase.from("profiles").select("role")
          .eq("user_id", s.user.id).single()
          .then(({ data, error }) => {
            if (!error) setRole(data?.role ?? null);
          });
      }
    });

    return () => { mounted = false; sub.subscription?.unsubscribe(); };
  }, []);

  return useMemo(() => ({ session, role, loading }), [session, role, loading]);
}
