// src/components/RequireAuth.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useSessionRole } from "../lib/useSessionRole";

export default function RequireAuth({ children }) {
  const { session, role, loading } = useSessionRole();
  const loc = useLocation();

  if (loading) return null; // or a spinner

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
