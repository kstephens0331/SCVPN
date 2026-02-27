import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { apiJson } from "../../lib/api"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

function StatCard({ label, value, to }) {
  return (
    <Link to={to} className="block p-5 rounded-2xl bg-gray-900 ring-1 ring-gray-800 hover:ring-lime-400 shadow-lg transition">
      <div className="text-lime-400/90 text-sm">{label}</div>
      <div className="text-3xl font-bold text-lime-400 mt-1">{value}</div>
    </Link>
  )
}

export default function Overview(){
  const [stats, setStats] = useState({ users:0, orgs:0, devices:0, activeDevices:0 })
  const [tel, setTel] = useState([])

  useEffect(()=>{
    async function load() {
      try {
        const stats = await apiJson("/api/admin/stats");
        setStats(stats);

        // Telemetry chart data can be added to the stats endpoint later
        // For now, set empty
        setTel([]);
      } catch (e) {
        console.error("Failed to load admin stats:", e);
      }
    }
    load();
  },[])

  const hourly = useMemo(()=>{
    const bucket = new Map()
    for (const r of tel) {
      const hour = new Date(r.ts); hour.setMinutes(0,0,0)
      const k = hour.toISOString()
      const prev = bucket.get(k) || { ts: hour, rx:0, tx:0 }
      prev.rx += Number(r.rx_bytes||0)
      prev.tx += Number(r.tx_bytes||0)
      bucket.set(k, prev)
    }
    return Array.from(bucket.values()).sort((a,b)=>a.ts-b.ts).map(x=>({ time:x.ts.toLocaleTimeString([], {hour:"2-digit"}), rx:x.rx, tx:x.tx }))
  },[tel])

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Users"          value={stats.users}        to="/admin/accounts" />
        <StatCard label="Organizations"  value={stats.orgs}         to="/admin/accounts" />
        <StatCard label="Devices"        value={stats.devices}      to="/admin/devices" />
        <StatCard label="Active Devices" value={stats.activeDevices}to="/admin/telemetry" />
      </div>

      <section className="rounded-2xl bg-gray-900 ring-1 ring-gray-800 p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lime-400 font-semibold">Traffic (last 24h)</h3>
          <div className="text-xs text-lime-400/80">bytes per hour</div>
        </div>
        <div className="h-44 mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourly}>
              <XAxis dataKey="time" tick={{ fill: "#84cc16" }} axisLine={{ stroke: "#84cc16" }} />
              <YAxis tick={{ fill: "#84cc16" }} axisLine={{ stroke: "#84cc16" }} />
              <Tooltip contentStyle={{ background:"#000", border:"1px solid #84cc16", color:"#84cc16" }}/>
              <Line type="monotone" dataKey="rx" stroke="#84cc16" dot={false} strokeWidth={2}/>
              <Line type="monotone" dataKey="tx" stroke="#84cc16" dot={false} strokeWidth={2} strokeDasharray="5 4"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl bg-gray-900 ring-1 ring-gray-800 p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lime-400 font-semibold">Servers</h3>
          <Link to="servers" className="text-sm text-lime-400 hover:text-lime-300 underline font-medium">Open Servers</Link>
        </div>
        <p className="text-lime-400/80 text-sm mt-1">Monitor VPS CPU, memory, disk, and jump into SSH fast.</p>
      </section>
    </div>
  )
}
