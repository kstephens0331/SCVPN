// src/pages/PostCheckout.jsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { PLANS } from "../lib/pricing.js";

export default function PostCheckout() {
  const nav = useNavigate();
  const loc = useLocation();

  const [loading, setLoading]   = useState(true);
  const [email, setEmail]       = useState("");
  const [plan, setPlan]         = useState("");          // e.g. "personal", "gaming", "business10"
  const [atype, setAtype]       = useState("personal");  // "personal" | "business"
  const [qty, setQty]           = useState(1);
  const [password, setPassword] = useState("");

  // ✅ define query params first, then use them
 const qs = new URLSearchParams(loc.search);
 const sessionId = qs.get("sid") || qs.get("session_id");

  // Map plan code → display name (from PLANS)
  const planName =
    plan === "personal"    ? PLANS.personal.name :
    plan === "gaming"      ? PLANS.gaming.name :
    plan === "business10"  ? PLANS.business10.name :
    plan === "business50"  ? PLANS.business50.name :
    plan === "business250" ? PLANS.business250.name :
    "unknown";

  useEffect(() => {
  (async () => {
    try {
      if (!sessionId) { setLoading(false); return; }

      const api = import.meta.env.VITE_API_URL || "https://scvpn-production.up.railway.app";
      const res = await fetch(`${api}/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`);
      const out = await res.json();

      if (res.ok) {
        setEmail(out.email || "");
        setPlan(out.plan_code || "");
        setAtype(out.account_type || "personal");
        setQty(Number(out.quantity || 1));
      } else {
        console.error("[post-checkout] verify failed:", out);
        alert(out.error || "Unable to verify checkout.");
      }
    } catch (e) {
      console.error("[post-checkout] verify error:", e);
      alert("Error verifying checkout.");
    } finally {
      setLoading(false);
    }
  })();
}, [sessionId]);

  const handleRegister = async (e) => {
  e.preventDefault();
  if (!email || !password) { alert("Please enter a password."); return; }

  // Try sign up
  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
  });

  if (signUpError) {
    // If account exists, sign in instead
    if (/registered|exists|already/i.test(signUpError.message || "")) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) { alert(signInError.message || "Sign in failed"); return; }
    } else {
      console.error("[signup] error", signUpError);
      alert(signUpError.message || "Sign up failed");
      return;
    }
  }

 const api = import.meta.env.VITE_API_URL || "https://scvpn-production.up.railway.app";
const claimRes = await fetch(`${api}/api/checkout/claim`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    session_id: sessionId,
    email,
    plan_code: plan,        // your state variable from verify
    account_type: atype,    // "personal" | "business"
    quantity: qty
  }),
});
const claimOut = await claimRes.json().catch(() => ({}));
if (!claimRes.ok) {
  alert(claimOut.error || `Claim failed (status ${claimRes.status})`);
  return;
}

  nav(atype === "business" ? "/app/business/devices" : "/app/personal/devices");
};

  if (loading) return <div className="p-6">Finalizing your purchase…</div>;

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Create your account</h1>

      <div className="text-sm text-gray-600">
        Plan: <b>{planName}</b> {atype === "business" ? `(seats: ${qty})` : null}
      </div>

      <form onSubmit={handleRegister} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            readOnly={!!email}                         // will be read-only if Stripe provided it
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button className="w-full rounded px-4 py-2 bg-black text-white">
          Create account
        </button>
      </form>
    </div>
  );
}
