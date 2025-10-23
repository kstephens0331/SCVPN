// src/components/RequireAuth.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useSessionRole } from "../lib/useSessionRole";

export default function RequireAuth({ children }) {
  const { session, role, loading } = useSessionRole();
  const loc = useLocation();

  // Show loading spinner instead of null to prevent white screen
  if (loading) {
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
