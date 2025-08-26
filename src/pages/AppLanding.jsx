import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AppLanding() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login", { replace: true }); return; }

   // 1) Admin by allow-list table (admin_emails)
   const { data: adminRow } = await supabase
      .from("admin_emails")
      .select("email")
      .eq("email", user.email?.toLowerCase() || "")
     .maybeSingle();
      if (adminRow) { navigate("/admin/overview", { replace: true }); return; }

      // get account_type from profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.account_type === "admin") {
        navigate("/admin/overview", { replace: true }); return;
      }

      // treat business account_type OR any org membership as business
      if (profile?.account_type === "business") {
        navigate("/app/business/devices", { replace: true }); return;
      }

      const { data: m } = await supabase
        .from("org_members")
        .select("org_id", { head: false, count: "exact" })
        .eq("user_id", user.id)
        .limit(1);

      if (m && m.length > 0) {
        navigate("/app/business/devices", { replace: true }); return;
      }

      // default: personal
      navigate("/app/personal/devices", { replace: true });
    })();
  }, [navigate]);

  return null; // nothing to render
}
