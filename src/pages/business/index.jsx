import { useEffect, useState, useCallback } from "react";
import { apiJson } from "../../lib/api";

const PLATFORMS = ["ios","android","macos","windows","linux","router","other"];

export default function Business(){
  const [orgs, setOrgs] = useState([]);
  const [orgId, setOrgId] = useState("");
  const [rows, setRows] = useState([]);
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("linux");
  const [err, setErr] = useState("");

  useEffect(()=>{
    apiJson("/api/user/organizations")
      .then((data)=>{
        const os = data.organizations || [];
        setOrgs(os); if (os[0]) setOrgId(os[0].id);
      })
      .catch((e)=>{ setErr(e.message); });
  },[]);

  const load = useCallback(async () => {
    try {
      const data = await apiJson(`/api/user/org/${orgId}/devices`);
      setRows(data.devices || []);
    } catch (e) { setErr(e.message); }
  }, [orgId]);

  useEffect(()=>{ if (orgId) load(); },[orgId, load]);

  async function addDevice(){
    try {
      await apiJson("/api/user/devices", { method: "POST", body: JSON.stringify({ org_id: orgId, name, platform }) });
      setName(""); setPlatform("linux"); load();
    } catch (e) { setErr(e.message); }
  }

  async function toggle(id, isActive){
    try {
      await apiJson(`/api/user/devices/${id}`, { method: "PUT", body: JSON.stringify({ is_active: !isActive }) });
      load();
    } catch (e) { setErr(e.message); }
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
