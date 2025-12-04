import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthRequest {
  email: string;
  password: string;
  device_info?: {
    name: string;
    type: string;
    os_version: string;
    client_version: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: AuthRequest = await req.json();
    const { email, password, device_info } = body;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SCVPN_SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE = Deno.env.get("SCVPN_SERVICE_ROLE_JWT")!;

    // Create anonymous client for login
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Attempt login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: authError.message || "Invalid credentials" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!authData.user || !authData.session) {
      return new Response(
        JSON.stringify({ error: "Authentication failed" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Use service role for subscription check
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

    // Get user profile and subscription info
    const { data: profile } = await adminClient
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", authData.user.id)
      .single();

    const { data: subscription } = await adminClient
      .from("subscriptions")
      .select(`
        id,
        status,
        plan_code,
        device_limit,
        current_period_end,
        plans (
          name,
          features
        )
      `)
      .eq("user_id", authData.user.id)
      .eq("status", "active")
      .single();

    // Count active devices
    const { count: deviceCount } = await adminClient
      .from("devices")
      .select("*", { count: "exact", head: true })
      .eq("user_id", authData.user.id)
      .eq("is_active", true);

    // Check if user is in trial or has active subscription
    const hasAccess = subscription || await checkTrialStatus(adminClient, authData.user.id);

    if (!hasAccess) {
      return new Response(
        JSON.stringify({
          error: "No active subscription",
          needs_subscription: true,
          subscribe_url: "https://www.sacvpn.com/pricing"
        }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Log device login
    if (device_info) {
      await adminClient
        .from("device_logins")
        .insert({
          user_id: authData.user.id,
          device_name: device_info.name,
          device_type: device_info.type,
          os_version: device_info.os_version,
          client_version: device_info.client_version,
          ip_address: req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
          logged_in_at: new Date().toISOString()
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          full_name: profile?.full_name || null,
          avatar_url: profile?.avatar_url || null
        },
        session: {
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
          expires_at: authData.session.expires_at,
          expires_in: authData.session.expires_in
        },
        subscription: subscription ? {
          plan_name: subscription.plans?.name || subscription.plan_code,
          status: subscription.status,
          device_limit: subscription.device_limit || 5,
          devices_used: deviceCount || 0,
          expires_at: subscription.current_period_end,
          features: subscription.plans?.features || []
        } : {
          plan_name: "Trial",
          status: "trial",
          device_limit: 3,
          devices_used: deviceCount || 0,
          expires_at: null,
          features: ["basic_vpn", "standard_servers"]
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

// Check if user is in free trial period
async function checkTrialStatus(supabase: any, userId: string): Promise<boolean> {
  const { data: user } = await supabase
    .from("profiles")
    .select("trial_ends_at, created_at")
    .eq("id", userId)
    .single();

  if (!user) return false;

  // If trial_ends_at is set, check if still valid
  if (user.trial_ends_at) {
    return new Date(user.trial_ends_at) > new Date();
  }

  // Default 14-day trial from account creation
  if (user.created_at) {
    const createdAt = new Date(user.created_at);
    const trialEnd = new Date(createdAt.getTime() + 14 * 24 * 60 * 60 * 1000);
    return trialEnd > new Date();
  }

  return false;
}
