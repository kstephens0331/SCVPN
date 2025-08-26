// components/AdminRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabase";

/**
 * Allows access only if the signed-in user's email is in public.admin_emails.
 * Falls back to /app/personal/overview if not allowed.
 */
export default function AdminRoute({ children }) {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;

      if (!session?.user?.email) {
        setAllowed(false);
        return;
      }

      // Fast existence check against admin_emails (works even if profiles has no role column)
      const { count, error } = await supabase
        .from("admin_emails")
        .select("email", { count: "exact", head: true })
        .eq("email", session.user.email);

      if (error) {
        console.error("Admin check failed:", error);
        setAllowed(false);
      } else {
        setAllowed((count ?? 0) > 0);
      }
    };

    run();
    return () => { active = false; };
  }, []);

  if (allowed === null) return null; // or a spinner
  if (!allowed) return <Navigate to="/app/personal/overview" replace />;
  return children;
}
