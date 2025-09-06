import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";

const PLATFORMS = ["ios","android","macos","windows","linux","router","other"];

export default function Business(){
  const [orgs, setOrgs] = useState([]);
  const [orgId, setOrgId] = useState("");
  const [rows, setRows] = useState([]);
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("linux");
  const [err, setErr] = useState("");

  useEffect(()=>{
    supabase.from("org_members").select("organizations!inner(id,name)")
      .then(({data,error})=>{
        if (error) { setErr(error.message); return; }
        const os = (data||[]).map(m=>m.organizations);
        setOrgs(os); if (os[0]) setOrgId(os[0].id);
      });
  },[]);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("devices").select("id,name,platform,is_active").eq("org_id", orgId).order("created_at",{ascending:false});
    if (error) setErr(error.message); else setRows(data||[]);
  }, [orgId]);

  useEffect(()=>{ if (orgId) load(); },[orgId, load]);

  async function addDevice(){
    const { error } = await supabase.from("devices").insert({ org_id: orgId, name, platform, is_active: true });
    if (error) setErr(error.message); else { setName(""); setPlatform("linux"); load(); }
  }

  async function toggle(id, isActive){
    const { error } = await supabase.from("devices").update({ is_active: !isActive }).eq("id", id);
    if (error) setErr(error.message); else load();
  }

  return (
    <div className="p-6 text-lime-400">
      <h1 className="text-2xl font-bold mb-4">Business Dashboard</h1>

      <div className="rounded-2xl bg-gray-900 ring-1 ring-gray-800 p-4 mb-6">
        <div className="font-semibold mb-2">Organization</div>
        <select value={orgId} onChange={e=>setOrgId(e.target.value)} className="rounded px-3 py-2 bg-black/40 ring-1 ring-gray-800">
          {orgs.map(o=> <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </div>

      <div className="rounded-2xl bg-gray-900 ring-1 ring-gray-800 p-4 mb-6">
        <div className="font-semibold mb-2">Add Device</div>
        <div className="flex gap-2 flex-wrap">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Device name" className="rounded px-3 py-2 bg-black/40 ring-1 ring-gray-800"/>
          <select value={platform} onChange={e=>setPlatform(e.target.value)} className="rounded px-3 py-2 bg-black/40 ring-1 ring-gray-800">
            {PLATFORMS.map(p=> <option key={p} value={p}>{p}</option>)}
          </select>
          <button onClick={addDevice} disabled={!name || !orgId} className="rounded px-4 py-2 bg-lime-400 text-black font-semibold disabled:opacity-50">Add</button>
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
