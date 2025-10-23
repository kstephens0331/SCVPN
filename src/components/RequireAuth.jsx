// src/components/RequireAuth.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useSessionRole } from "../lib/useSessionRole";
import { useEffect, useState } from "react";

export default function RequireAuth({ children }) {
  const { session, role, loading } = useSessionRole();
  const loc = useLocation();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Timeout after 5 seconds of loading to prevent infinite loading
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        console.error("[RequireAuth] Loading timeout - forcing through");
        setLoadingTimeout(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Show loading spinner for max 5 seconds
  if (loading && !loadingTimeout) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-lime-400 text-xl">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return <Navigate to="/login" state={{ from: loc }} replace />;
  }

  // smart routing when landing on generic areas
  if (loc.pathname === "/admin" && role !== "admin") {
    // not admin; kick to personal/business overview
    return <Navigate to="/app/personal/overview" replace />;
  }

  return children;
}
