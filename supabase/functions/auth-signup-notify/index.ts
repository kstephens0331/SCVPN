/**
 * Auth Signup Notification Function
 * Triggers when a new user signs up and sends email notification to info@stephenscode.dev
 *
 * This function is called via Supabase Database Webhook on auth.users INSERT
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { sendSignupNotification } from "../_shared/email.ts";

Deno.serve(async (req) => {
  try {
    const { record } = await req.json();

    // Extract user data from the auth.users record
    const userId = record.id;
    const userEmail = record.email || "no-email@provided.com";
    const userName = record.raw_user_meta_data?.full_name ||
                     record.raw_user_meta_data?.name ||
                     record.raw_user_meta_data?.display_name;
    const signupMethod = record.raw_app_meta_data?.provider || "email";

    console.log("New user signup detected:", { userId, userEmail, signupMethod });

    // Send notification email
    const emailSent = await sendSignupNotification({
      userEmail,
      userName,
      userId,
      timestamp: new Date().toISOString(),
      signupMethod,
    });

    if (emailSent) {
      console.log("Signup notification email sent successfully");
      return new Response(
        JSON.stringify({ success: true, message: "Notification sent" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
      console.warn("Failed to send signup notification email");
      return new Response(
        JSON.stringify({ success: false, message: "Email failed but signup completed" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error in auth-signup-notify function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
