import { Navigate, Outlet } from "react-router-dom";
import { useSessionRole } from "../lib/useSessionRole";

export function RequireAuth() {
  const { session, loading } = useSessionRole();
  if (loading) return null; // or a spinner
  return session ? <Outlet /> : <Navigate to="/login" replace />;
}

export function AdminOnly() {
  const { role, loading } = useSessionRole();
  if (loading) return null;
  return role === "admin" ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
