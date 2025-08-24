import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function RequireAuth({ children }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const loc = useLocation();
  useEffect(()=>{
    supabase.auth.getUser().then(({data})=>{
      setUser(data?.user || null);
      setReady(true);
    });
  },[]);
  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace state={{ from: loc }} />;
  return children;
}
