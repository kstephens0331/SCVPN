import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { supabase } from "../../lib/supabase"

export default function AdminLayout(){
  const nav = useNavigate()
  const linkCls = ({isActive}) =>
    "px-1 pb-3 border-b-2 transition-colors " +
    (isActive ? "border-lime-400 text-lime-400"
              : "border-transparent text-gray-400 hover:text-lime-300 hover:border-lime-300")

  async function signOut(){
    console.log("[AdminLayout] Signing out...");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("[AdminLayout] Sign out error:", error);
    } else {
      console.log("[AdminLayout] Sign out successful, navigating to home");
      nav("/", { replace:true });
    }
  }

  return (
    <div className="min-h-screen w-screen bg-black text-lime-400 flex flex-col overflow-x-hidden">
      <nav className="bg-black border-b border-gray-800">
        <div className="admin-container px-6">
          <div className="flex items-center justify-between py-3">
            <div className="flex gap-8">
              <NavLink to="/admin/overview"  className={linkCls}>Overview</NavLink>
              <NavLink to="/admin/accounts"  className={linkCls}>Accounts</NavLink>
              <NavLink to="/admin/devices"   className={linkCls}>Devices</NavLink>
              <NavLink to="/admin/telemetry" className={linkCls}>Telemetry</NavLink>
              <NavLink to="/admin/servers"   className={linkCls}>Servers</NavLink>
              <NavLink to="/admin/analytics" className={linkCls}>Analytics</NavLink>
            </div>
            <div className="flex items-center gap-4">
              <a href="/" className="text-sm text-lime-300 hover:text-lime-200 underline">View Site</a>
              <button onClick={signOut} className="text-sm rounded px-3 py-1 bg-lime-400 text-black font-semibold hover:bg-lime-300">Sign out</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-screen flex justify-center px-6">
        <div className="admin-container py-6">
          <Outlet/>
        </div>
      </main>
    </div>
  )
}
