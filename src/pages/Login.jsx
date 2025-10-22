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

  async function onSubmit(e){
    e.preventDefault()
    setErr("")
    setLoading(true)
    console.log("[Login] Attempting sign in for:", email);
    
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      console.error("[Login] Sign in error:", error);
      setErr(error.message);
      setLoading(false)
      return
    }
    
    console.log("[Login] Sign in successful, fetching user role...");
    
    // Fetch user and role to determine where to redirect
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setErr("Failed to get user data");
      setLoading(false);
      return;
    }
    
    console.log("[Login] User:", user.email);
    
    // Get role from profiles table
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    
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
