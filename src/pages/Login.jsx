import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { supabase } from "../lib/supabase"

export default function Login(){
  const nav = useNavigate()
  const loc = useLocation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)
  
  // Check for messages from auth callback
  const params = new URLSearchParams(loc.search);
  const message = params.get("message");
  const showVerificationMessage = message === "verification_expired";
  const showSessionTimeout = message === "session_timeout";

  async function onSubmit(e){
    e.preventDefault()
    setErr("")
    setLoading(true)
    console.log("[Login] Attempting sign in for:", email);

    try {
      // Set a timeout for the sign in attempt
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Sign in timed out. Please try again.")), 15000)
      );

      const signInPromise = supabase.auth.signInWithPassword({ email, password });

      const { data, error } = await Promise.race([signInPromise, timeoutPromise]);

      if (error) {
        console.error("[Login] Sign in error:", error);
        setErr(error.message);
        setLoading(false)
        return
      }

      if (!data?.session) {
        console.error("[Login] No session returned");
        setErr("Sign in failed. Please check your credentials.");
        setLoading(false);
        return;
      }

      console.log("[Login] Sign in successful, session created");

      // Get user from session directly (faster than another API call)
      const user = data.session.user;

      if (!user) {
        setErr("Failed to get user data");
        setLoading(false);
        return;
      }

      console.log("[Login] User:", user.email);

      // Get role from profiles table with timeout
      const profilePromise = supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      const profileTimeout = new Promise((resolve) =>
        setTimeout(() => resolve({ data: null, error: null }), 5000)
      );

      const { data: profileData } = await Promise.race([profilePromise, profileTimeout]);

      const role = profileData?.role || "client";
      console.log("[Login] Role:", role);

      // Determine redirect target
      const next = new URLSearchParams(loc.search).get("next");

      const roleToDefault = (r) =>
        r === "admin" ? "/admin" :
        r === "business" ? "/app/business/overview" :
        "/app/personal/overview";

      const target = (next && next.startsWith("/")) ? next : roleToDefault(role);

      console.log("[Login] Navigating to:", target);
      nav(target, { replace: true });

    } catch (err) {
      console.error("[Login] Unexpected error:", err);
      setErr(err.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] w-screen h-screen bg-black text-lime-400 flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 text-center">Sign in</h1>
        
        {showVerificationMessage && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-4 mb-4">
            <p className="text-yellow-400 text-sm">
              Your email verification link has expired. Please sign in to request a new verification email.
            </p>
          </div>
        )}

        {showSessionTimeout && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-md p-4 mb-4">
            <p className="text-orange-400 text-sm">
              Your session has expired due to inactivity. Please sign in again.
            </p>
          </div>
        )}
        
        <form onSubmit={onSubmit} className="grid gap-4">
          <input
            type="email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-md bg-[#111] text-lime-400 placeholder-lime-500/60 border border-lime-500/30 focus:outline-none focus:ring-2 focus:ring-lime-400 px-3 py-2"
            required
          />
          <input
            type="password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-md bg-[#111] text-lime-400 placeholder-lime-500/60 border border-lime-500/30 focus:outline-none focus:ring-2 focus:ring-lime-400 px-3 py-2"
            required
          />
          {err && <div className="text-red-500 text-sm">{err}</div>}
          <button
            disabled={loading}
            className="rounded-md bg-lime-400 text-black font-semibold px-3 py-2 hover:bg-lime-300 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  )
}
