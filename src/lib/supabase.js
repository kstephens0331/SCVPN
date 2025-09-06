import { createClient } from "@supabase/supabase-js";

const url  = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Keep a single client across HMR and page loads
export const supabase =
  globalThis.__sb__ ||
  (globalThis.__sb__ = createClient(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true, // <-- THIS fixes the “sent to login” after signup/checkout
    },
  }));
