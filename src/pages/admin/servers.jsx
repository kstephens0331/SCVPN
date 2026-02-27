// src/pages/admin/servers.jsx
import { useEffect, useState } from "react"
import { apiJson } from "../../lib/api"

function copy(text){ navigator.clipboard?.writeText(text) }

export default function Servers(){
  const [hosts, setHosts] = useState([])
  const [metrics, setMetrics] = useState({}) // host_id -> latest snapshot

  useEffect(()=>{
    async function load() {
      try {
        const data = await apiJson("/api/admin/servers");
        setHosts(data.hosts || []);
        setMetrics(data.metrics || {});
      } catch (e) {
        console.error("Failed to load servers:", e);
      }
    }
    load();
  },[])

  return (
    <div className="space-y-4">
      <h2 className="text-lime-400 text-xl font-semibold">Servers</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {hosts.map(h=>{
          const m = metrics[h.id]
          const ssh = `ssh ${h.ssh_user||"root"}@${h.ip}${h.ssh_port?` -p ${h.ssh_port}`:""}`
          return (
            <div key={h.id} className="rounded-2xl border bg-gray-900 p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="text-lime-400 font-medium">{h.name}</div>
                <button onClick={()=>copy(ssh)} className="text-xs text-indigo-300 hover:text-indigo-200 underline">Copy SSH</button>
              </div>
              <div className="text-zinc-400 text-sm">{h.ip}</div>
              {m ? (
                <dl className="grid grid-cols-2 gap-3 mt-3 text-sm">
                  <div><dt className="text-gray-400">CPU</dt><dd className="text-lime-400">{m.cpu?.toFixed(1)}%</dd></div>
                  <div><dt className="text-gray-400">Load</dt><dd className="text-lime-400">{m.load1?.toFixed(2)} / {m.load5?.toFixed(2)} / {m.load15?.toFixed(2)}</dd></div>
                  <div><dt className="text-gray-400">Memory</dt><dd className="text-lime-400">{((m.mem_used/m.mem_total)*100).toFixed(0)}%</dd></div>
                  <div><dt className="text-gray-400">Disk</dt><dd className="text-lime-400">{((m.disk_used/m.disk_total)*100).toFixed(0)}%</dd></div>
                </dl>
              ) : <div className="text-gray-400 text-sm mt-3">No recent metrics.</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
