import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { useAuth } from "../store/auth"

export default function Login(){
  const nav = useNavigate()
  const loc = useLocation()
  const { refresh } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)

  async function onSubmit(e){
    e.preventDefault()
    setErr("")
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setErr(error.message); return }
    await refresh()
    // Respect ?next=, otherwise choose a role-based default
    const params = new URLSearchParams(loc.search);
    const next = params.get("next");

    // fetch role
    const { data: { user } } = await supabase.auth.getUser();
    let role = "client";
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (data?.role) role = data.role;
    }
    const roleToDefault = (r) =>
      r === "admin" ? "/admin" :
      r === "business" ? "/app/business/overview" :
      "/app/personal/overview";

    const to = (next && next.startsWith("/")) ? next : roleToDefault(role);
    nav(to, { replace: true });
  }

  return (
    // FIX: full-screen fixed overlay, centers content no matter what parent does
    <div className="fixed inset-0 z-[9999] w-screen h-screen bg-black text-lime-400 flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 text-center">Sign in</h1>
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
            {loading ? "Signing in" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  )
}




