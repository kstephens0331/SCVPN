import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const PLATFORMS = ["ios","android","macos","windows","linux","router","other"];

export default function Personal(){
  const [rows, setRows] = useState([]);
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("android");
  const [err, setErr] = useState("");

  async function load(){
    const { data, error } = await supabase.from("devices").select("id,name,platform,is_active").order("created_at",{ascending:false});
    if (error) setErr(error.message); else setRows(data||[]);
  }
  useEffect(()=>{ load(); },[]);

  async function addDevice(){
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("devices").insert({ user_id: user.id, name, platform, is_active: true });
    if (error) setErr(error.message); else { setName(""); setPlatform("android"); load(); }
  }

  async function toggle(id, isActive){
    const { error } = await supabase.from("devices").update({ is_active: !isActive }).eq("id", id);
    if (error) setErr(error.message); else load();
  }

  return (
    <div className="p-6 text-lime-400">
      <h1 className="text-2xl font-bold mb-4">Personal Dashboard</h1>

      <div className="rounded-2xl bg-gray-900 ring-1 ring-gray-800 p-4 mb-6">
        <div className="font-semibold mb-2">Add Device</div>
        <div className="flex gap-2 flex-wrap">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Device name" className="rounded px-3 py-2 bg-black/40 ring-1 ring-gray-800"/>
          <select value={platform} onChange={e=>setPlatform(e.target.value)} className="rounded px-3 py-2 bg-black/40 ring-1 ring-gray-800">
            {PLATFORMS.map(p=> <option key={p} value={p}>{p}</option>)}
          </select>
          <button onClick={addDevice} disabled={!name} className="rounded px-4 py-2 bg-lime-400 text-black font-semibold disabled:opacity-50">Add</button>
        </div>
        {err && <div className="text-red-400 text-sm mt-2">{err}</div>}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-800 text-lime-400/90">
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">Platform</th>
              <th className="py-2 pr-3">Active</th>
              <th className="py-2 pr-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(d=>(
              <tr key={d.id} className="border-b border-gray-800">
                <td className="py-2 pr-3">{d.name}</td>
                <td className="py-2 pr-3">{d.platform}</td>
                <td className="py-2 pr-3">{d.is_active ? "Yes" : "No"}</td>
                <td className="py-2 pr-3">
                  <button className="underline" onClick={()=>toggle(d.id, d.is_active)}>
                    {d.is_active ? "Suspend" : "Activate"}
                  </button>
                  {" "}|{" "}
                  <a className="underline" href={"/api/device/"+d.id+"/config"} target="_blank" rel="noreferrer">Config</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
