import { create } from "zustand"
import { supabase } from "../lib/supabase"

export const useAuth = create((set) => ({
  session: null, user: null, profile: null, loading: true, isAdmin: false,
  async refresh(){
    set({ loading: true })
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user ?? null
    let profile = null
    if (user){
      const { data } = await supabase.from("profiles")
        .select("id,email,full_name,account_type").eq("id", user.id).maybeSingle()
      profile = data ?? null
    }
    const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || "")
      .split(",").map(s=>s.trim().toLowerCase()).filter(Boolean)
    const isAdmin = !!user?.email && adminEmails.includes(user.email.toLowerCase())
    set({ session: session ?? null, user, profile, isAdmin, loading: false })
  },
  async signOut(){ await supabase.auth.signOut(); set({ session:null, user:null, profile:null, isAdmin:false }) }
}))
// boot
import.meta.hot || (async()=>{ await (await import("./auth_boot.js")).default() })()
