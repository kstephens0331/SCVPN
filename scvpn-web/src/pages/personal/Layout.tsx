import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
export default function PersonalLayout(){
  const nav = useNavigate();
  const link = ({isActive})=>"px-1 pb-3 border-b-2 " + (isActive?"border-lime-400 text-lime-400":"border-transparent text-gray-400 hover:text-lime-300 hover:border-lime-300");
  async function signOut(){ await supabase.auth.signOut(); nav("/",{replace:true}); }
  return (
    <div className="min-h-screen bg-black text-lime-400 flex flex-col">
      <nav className="bg-black border-b border-gray-800">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between h-12">
          <div className="flex gap-6">
            <NavLink to="/app/personal/overview" className={link}>Overview</NavLink>
            <NavLink to="/app/personal/devices"  className={link}>Devices</NavLink>
            <NavLink to="/app/personal/account"  className={link}>Account</NavLink>
            <NavLink to="/app/personal/billing"  className={link}>Billing</NavLink>
          </div>
          <button onClick={signOut} className="rounded px-3 py-1 bg-lime-400 text-black font-semibold">Sign out</button>
        </div>
      </nav>
      <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-6"><Outlet/></main>
    </div>
  );
}
