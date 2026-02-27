// src/lib/supabase.js — Drop-in replacement that exports our custom auth client
// This preserves `supabase.auth.*` calls across all existing files.
import { auth } from "./auth.js";

export const supabase = { auth };
