// components/AdminRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

/**
 * Allows access only if the signed-in user is an admin (from JWT).
 * Falls back to /app/personal/overview if not allowed.
 */
export default function AdminRoute({ children }) {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;

      if (!session?.user) {
        setAllowed(false);
        return;
      }

      // Admin flag is embedded in the JWT — no DB query needed
      setAllowed(!!session.user.is_admin);
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
