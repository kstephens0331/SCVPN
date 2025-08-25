import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

// NOTE: call Edge Function via full Supabase URL (no proxy needed)
async function adminAction(action, deviceId){
  const { data: { user } } = await supabase.auth.getUser()
  const url = `${import.meta.env.VITE_API_URL}/api/admin-device`
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-email": user.email },
    body: JSON.stringify({ action, deviceId })
  })
  if(!res.ok) throw new Error("Action failed")
}

export default function Devices(){
  const [rows, setRows] = useState([])
  const load = ()=> supabase.from("devices").select("id,name,platform,is_active,user_id,org_id").then(({data})=>setRows(data||[]))
  useEffect(()=>{ load() },[])
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2 pr-3">Name</th>
            <th className="py-2 pr-3">Platform</th>
            <th className="py-2 pr-3">Active</th>
            <th className="py-2 pr-3">User/Org</th>
            <th className="py-2 pr-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(d=> (
            <tr key={d.id} className="border-b">
              <td className="py-2 pr-3">{d.name}</td>
              <td className="py-2 pr-3">{d.platform}</td>
              <td className="py-2 pr-3">{d.is_active?'Yes':'No'}</td>
              <td className="py-2 pr-3">{d.org_id?`Org:${d.org_id}`:`User:${d.user_id}`}</td>
              <td className="py-2 pr-3 flex gap-2">
                <button className="underline" onClick={async()=>{ await adminAction("activate", d.id); load() }}>Activate</button>
                <button className="underline" onClick={async()=>{ await adminAction("suspend", d.id); load() }}>Suspend</button>
                <button className="underline" onClick={async()=>{ await adminAction("revoke_keys", d.id); load() }}>Revoke Keys</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
