// components/AdminRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

/**
 * Allows access only if the signed-in user's email is in public.admin_emails.
 * Falls back to /app/personal/overview if not allowed.
 */
export default function AdminRoute({ children }) {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      console.log("[AdminRoute] Starting admin check...");
      const { data: { session } } = await supabase.auth.getSession();
      console.log("[AdminRoute] Session:", session?.user?.email);
      if (!active) return;

      if (!session?.user?.email) {
        console.log("[AdminRoute] No session/email, denying access");
        setAllowed(false);
        return;
      }

      // Fast existence check against admin_emails (works even if profiles has no role column)
      const { count, error } = await supabase
        .from("admin_emails")
        .select("email", { count: "exact", head: true })
        .eq("email", session.user.email);

      console.log("[AdminRoute] Admin check result - count:", count, "error:", error);

      if (error) {
        console.error("Admin check failed:", error);
        setAllowed(false);
      } else {
        const isAllowed = (count ?? 0) > 0;
        console.log("[AdminRoute] Setting allowed:", isAllowed);
        setAllowed(isAllowed);
      }
    };

    run();
    return () => { active = false; };
  }, []);

  if (allowed === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-lime-400 text-xl">Checking admin access...</div>
      </div>
    );
  }
  if (!allowed) return <Navigate to="/app/personal/overview" replace />;
  return children;
}
