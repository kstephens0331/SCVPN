import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../store/auth";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("processing");
  const [error, setError] = useState("");
  const nav = useNavigate();
  const { refresh } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for error parameters first
        const errorCode = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");
        
        if (errorCode) {
          if (errorCode === "access_denied" && errorDescription?.includes("expired")) {
            setError("Your email verification link has expired. Please request a new one.");
            setStatus("error");
            return;
          }
          
          setError(errorDescription || `Authentication error: ${errorCode}`);
          setStatus("error");
          return;
        }

        // Handle the auth session from URL fragments
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setError("Failed to verify email. Please try again or request a new verification link.");
          setStatus("error");
          return;
        }

        if (data?.session) {
          // Success - user is authenticated
          await refresh();
          
          // Get user role and redirect appropriately
          const { data: { user } } = await supabase.auth.getUser();
          let role = "client";
          
          if (user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", user.id)
              .maybeSingle();
            
            if (profile?.role) role = profile.role;
          }
          
          // Determine redirect destination
          const roleToDefault = (r) =>
            r === "admin" ? "/admin" :
            r === "business" ? "/app/business/overview" :
            "/app/personal/overview";
            
          const target = roleToDefault(role);
          setStatus("success");
          
          setTimeout(() => {
            nav(target, { replace: true });
          }, 1500);
          
        } else {
          setError("No session found. Your verification link may have expired.");
          setStatus("error");
        }
        
      } catch (err) {
        console.error("Auth callback error:", err);
        setError("An unexpected error occurred during verification.");
        setStatus("error");
      }
    };

    handleCallback();
  }, [searchParams, nav, refresh]);

  const requestNewVerification = async () => {
    // You'll need to implement this based on how your signup works
    // For now, redirect to login with a message
    nav("/login?message=verification_expired", { replace: true });
  };

  return (
    <div className="fixed inset-0 z-[9999] w-screen h-screen bg-black text-lime-400 flex items-center justify-center">
      <div className="w-full max-w-md px-6 text-center">
        {status === "processing" && (
          <>
            <div className="animate-spin w-12 h-12 border-4 border-lime-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold mb-2">Verifying your email...</h1>
            <p className="text-lime-400/80">Please wait while we complete your verification.</p>
          </>
        )}
        
        {status === "success" && (
          <>
            <div className="w-12 h-12 bg-lime-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-lime-400">Email verified!</h1>
            <p className="text-lime-400/80">Redirecting you to your dashboard...</p>
          </>
        )}
        
        {status === "error" && (
          <>
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-red-400">Verification failed</h1>
            <p className="text-red-400/80 mb-4">{error}</p>
            
            <div className="space-y-2">
              <button
                onClick={requestNewVerification}
                className="w-full rounded-md bg-lime-400 text-black font-semibold px-4 py-2 hover:bg-lime-300"
              >
                Get new verification link
              </button>
              <button
                onClick={() => nav("/login", { replace: true })}
                className="w-full rounded-md border border-lime-400 text-lime-400 font-semibold px-4 py-2 hover:bg-lime-400/10"
              >
                Back to login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}