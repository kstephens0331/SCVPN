import { useEffect, useState } from "react";
import { apiJson } from "../../lib/api";
export default function PersonalAccount(){
  const [profile, setProfile] = useState({ full_name: "", avatar_url: "" });
  const [msg, setMsg] = useState("");
  useEffect(()=>{ (async()=>{
    try {
      const data = await apiJson("/api/user/profile");
      setProfile(data || { full_name: "", avatar_url: "" });
    } catch (e) {
      console.error("Failed to load profile:", e);
    }
  })(); },[]);
  async function save(){
    try {
      await apiJson("/api/user/profile", { method: "PUT", body: JSON.stringify(profile) });
      setMsg("Saved");
    } catch (e) {
      setMsg(e.message || "Error");
    }
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
