import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
export default function PersonalAccount(){
  const [profile, setProfile] = useState({ full_name: "", avatar_url: "" });
  const [msg, setMsg] = useState("");
  useEffect(()=>{ (async()=>{
    const { data:{ user } } = await supabase.auth.getUser();
    const { data } = await supabase.from("profiles").select("full_name,avatar_url").eq("id", user.id).maybeSingle();
    setProfile(data || { full_name:"", avatar_url:"" });
  })(); },[]);
  async function save(){
    const { data:{ user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("profiles").update(profile).eq("id", user.id);
    setMsg(error? error.message : "Saved");
    setTimeout(()=>setMsg(""), 2000);
  }
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-lime-400">Account</h2>
      <div className="rounded-2xl bg-gray-900 ring-1 ring-gray-800 p-5 grid gap-3 max-w-xl">
        <label className="text-sm">Full name</label>
        <input value={profile.full_name||""} onChange={e=>setProfile({...profile, full_name:e.target.value})} className="rounded px-3 py-2 bg-black/40 ring-1 ring-gray-800"/>
        <label className="text-sm">Avatar URL</label>
        <input value={profile.avatar_url||""} onChange={e=>setProfile({...profile, avatar_url:e.target.value})} className="rounded px-3 py-2 bg-black/40 ring-1 ring-gray-800"/>
        <button onClick={save} className="rounded px-4 py-2 bg-lime-400 text-black font-semibold w-fit">Save</button>
        {msg && <div className="text-lime-300 text-sm">{msg}</div>}
      </div>
    </div>
  );
}
