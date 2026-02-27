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
      // Profile data is included in the JWT/session — no DB query needed
      profile = {
        id: user.id,
        email: user.email,
        full_name: user.full_name || user.user_metadata?.full_name || null,
        account_type: user.account_type || "personal",
      }
    }
    const isAdmin = !!user?.is_admin
    set({ session: session ?? null, user, profile, isAdmin, loading: false })
  },
  async signOut(){ await supabase.auth.signOut(); set({ session:null, user:null, profile:null, isAdmin:false }) }
}))
// boot
import.meta.hot || (async()=>{ await (await import("./auth_boot.js")).default() })()
