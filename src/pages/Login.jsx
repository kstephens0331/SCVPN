import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Helmet } from "react-helmet-async";
import { Shield, Lock, Zap, ChevronRight, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check for messages from auth callback
  const params = new URLSearchParams(loc.search);
  const message = params.get("message");
  const showVerificationMessage = message === "verification_expired";
  const showSessionTimeout = message === "session_timeout";

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }

      // Success - useAuthRedirect will handle navigation via onAuthStateChange
    } catch (err) {
      setErr(err.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Sign In - SACVPN Dashboard</title>
        <meta name="description" content="Sign in to your SACVPN account to manage your VPN devices, view usage, and access your secure connection settings." />
        <link rel="canonical" href="https://www.sacvpn.com/login" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-brand-950 flex items-center justify-center px-4 py-12">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <img
                src="/sacvpn-logo.svg"
                alt="SACVPN"
                className="h-12 w-auto"
              />
              <span className="text-3xl font-display font-bold text-white">
                SACVPN
              </span>
            </Link>
            <p className="mt-2 text-gray-400">Sign in to your account</p>
          </div>

          {/* Login Card */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
            {/* Trust badges */}
            <div className="flex justify-center gap-4 mb-6">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Shield className="w-4 h-4 text-brand-400" />
                <span>No-Logs</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Lock className="w-4 h-4 text-green-400" />
                <span>Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Zap className="w-4 h-4 text-accent-cyan" />
                <span>WireGuard</span>
              </div>
            </div>

            {showVerificationMessage && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                <p className="text-yellow-400 text-sm">
                  Your email verification link has expired. Please sign in to request a new verification email.
                </p>
              </div>
            )}

            {showSessionTimeout && (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-6">
                <p className="text-orange-400 text-sm">
                  Your session has expired due to inactivity. Please sign in again.
                </p>
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {err && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <p className="text-red-400 text-sm">{err}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Forgot password link */}
            <div className="mt-6 text-center">
              <Link to="/forgot-password" className="text-sm text-gray-400 hover:text-brand-400 transition-colors">
                Forgot your password?
              </Link>
            </div>
          </div>

          {/* Sign up link */}
          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Don't have an account?{" "}
              <Link to="/pricing" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                Start your free trial
              </Link>
            </p>
          </div>

          {/* Footer trust info */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Protected by enterprise-grade encryption • 14-day free trial • No credit card required
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
