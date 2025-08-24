import { useEffect, useMemo, useState } from "react"
import { supabase } from "../../lib/supabase"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts"

function centsToUSD(c){ return (Number(c||0)/100).toLocaleString(undefined,{style:"currency",currency:"USD"}) }

function Kpi({ label, value }) {
  return (
    <div className="p-5 rounded-xl bg-gray-900 ring-1 ring-gray-800 shadow">
      <div className="text-lime-400/90 text-sm">{label}</div>
      <div className="text-2xl font-bold text-lime-400 mt-1">{value}</div>
    </div>
  )
}

// Simple heat cell for cohort retention
function HeatCell({ pct }){
  const intensity = Math.max(0.15, Math.min(1, (pct || 0)/100))
  return (
    <div className="h-8 rounded" style={{ background:`rgba(132,204,22,${intensity})` }}>
      <div className="text-black text-xs font-semibold text-center leading-8">{pct ? `${pct}%` : ""}</div>
    </div>
  )
}

export default function Analytics(){
  const [kpi, setKpi] = useState({
    revenueToday: 0, revenue7d: 0, revenue30d: 0, revenue60d: 0,
    revenueQ: 0, revenue6m: 0, revenue1y: 0, revenue2y: 0,
    newToday: 0, new7d: 0, new30d: 0, new60d: 0,
    canc7d: 0, canc30d: 0,
    mrr: 0, arr: 0, arpu30d: 0
  })
  const [revSeries, setRevSeries] = useState([])
  const [subsSeries, setSubsSeries] = useState([])
  const [revByPlan, setRevByPlan] = useState([])
  const [cohortRows, setCohortRows] = useState([])  // { cohort_month, month_offset, retention_pct }
  const [churn, setChurn] = useState([])
  const [funnel, setFunnel] = useState([])

  useEffect(()=>{
    async function load(){
      const rpc = (fn, args) => supabase.rpc(fn, args).then(r=>r.data ?? 0)

      const [
        revenueToday, revenue7d, revenue30d, revenue60d,
        revenueQ, revenue6m, revenue1y, revenue2y,
        newToday, new7d, new30d, new60d,
        canc7d, canc30d,
        mrr, arr, arpu30d
      ] = await Promise.all([
        rpc("revenue_window",{ days: 1 }),
        rpc("revenue_window",{ days: 7 }),
        rpc("revenue_window",{ days: 30 }),
        rpc("revenue_window",{ days: 60 }),
        rpc("revenue_window",{ days: 90 }),
        rpc("revenue_window",{ days: 182 }),
        rpc("revenue_window",{ days: 365 }),
        rpc("revenue_window",{ days: 730 }),
        rpc("new_subscriptions_window",{ days: 1 }),
        rpc("new_subscriptions_window",{ days: 7 }),
        rpc("new_subscriptions_window",{ days: 30 }),
        rpc("new_subscriptions_window",{ days: 60 }),
        rpc("cancels_window",{ days: 7 }),
        rpc("cancels_window",{ days: 30 }),
        rpc("mrr_total_cents"),
        rpc("arr_total_cents"),
        rpc("arpu_cents",{ days: 30 }),
      ])

      const since = new Date(Date.now() - 60*24*60*60*1000).toISOString().slice(0,10)
      const [{ data: revDaily }, { data: subsDaily }] = await Promise.all([
        supabase.from("revenue_daily_last_730").select("day,amount_cents").gte("day", since),
        supabase.from("subscriptions_daily_last_730").select("day,new_subs,cancels").gte("day", since)
      ])

      const { data: rbp } = await supabase.from("revenue_by_plan_last_12m").select("*")
      const { data: cohorts } = await supabase.from("cohort_retention_monthly").select("*")
      const { data: churnRows } = await supabase.from("churn_monthly_last_12m").select("*")
      const { data: funnelRows } = await supabase.from("funnel_last_60d").select("*")

      setKpi({
        revenueToday, revenue7d, revenue30d, revenue60d,
        revenueQ, revenue6m, revenue1y, revenue2y,
        newToday, new7d, new30d, new60d, canc7d, canc30d,
        mrr, arr, arpu30d
      })
      setRevSeries((revDaily||[]).map(r=>({ day: new Date(r.day).toLocaleDateString(), revenue: r.amount_cents })))
      setSubsSeries((subsDaily||[]).map(r=>({ day: new Date(r.day).toLocaleDateString(), new_subs: r.new_subs, cancels: r.cancels })))
      setRevByPlan(rbp||[])
      setCohortRows(cohorts||[])
      setChurn((churnRows||[]).map(r=>({ month: new Date(r.month_start).toLocaleDateString(undefined,{month:'short',year:'2-digit'}), churn: Number(r.churn_pct) })))
      setFunnel((funnelRows||[]).map(r=>({ day: new Date(r.day).toLocaleDateString(), visits:r.visits, signups:r.signups, paid:r.first_paid })))
    }
    load()
  },[])

  const totals = useMemo(()=>[
    { label:"Revenue Today", val:centsToUSD(kpi.revenueToday) },
    { label:"Revenue 7d",   val:centsToUSD(kpi.revenue7d)   },
    { label:"Revenue 30d",  val:centsToUSD(kpi.revenue30d)  },
    { label:"Revenue 60d",  val:centsToUSD(kpi.revenue60d)  },
    { label:"Quarter (90d)",val:centsToUSD(kpi.revenueQ)    },
    { label:"6 Months",     val:centsToUSD(kpi.revenue6m)   },
    { label:"1 Year",       val:centsToUSD(kpi.revenue1y)   },
    { label:"2 Years",      val:centsToUSD(kpi.revenue2y)   },
  ],[kpi])

  const subsCounters = useMemo(()=>[
    { label:"New Today", val:kpi.newToday },
    { label:"New 7d",    val:kpi.new7d    },
    { label:"New 30d",   val:kpi.new30d   },
    { label:"New 60d",   val:kpi.new60d   },
    { label:"Cancels 7d",val:kpi.canc7d   },
    { label:"Cancels 30d",val:kpi.canc30d },
  ],[kpi])

  // Transform revenue by plan into stacked series per month
  const revPlanStack = useMemo(()=>{
    const map = new Map()
    const plans = new Set()
    for(const r of revByPlan){
      const key = new Date(r.month_start).toLocaleDateString(undefined,{month:'short',year:'2-digit'})
      if(!map.has(key)) map.set(key,{ month:key })
      map.get(key)[r.plan_code || "unknown"] = r.amount_cents
      plans.add(r.plan_code || "unknown")
    }
    return { rows: Array.from(map.values()), keys: Array.from(plans.values()) }
  },[revByPlan])

  // Cohort grid: rows = cohorts, columns = month_offset 0..11
  const cohortGrid = useMemo(()=>{
    const byCohort = new Map()
    let minMonth = 0, maxMonth = 11
    for(const r of cohortRows){
      const rowKey = new Date(r.cohort_month).toLocaleDateString(undefined,{month:'short',year:'2-digit'})
      if(!byCohort.has(rowKey)) byCohort.set(rowKey, {})
      byCohort.get(rowKey)[r.month_offset] = r.retention_pct
    }
    return { rows: Array.from(byCohort.entries()), minMonth, maxMonth }
  },[cohortRows])

  return (
    <div className="space-y-8">
      {/* Top KPIs */}
      <div className="grid gap-4 lg:grid-cols-4 sm:grid-cols-2">
        {totals.map(t=> <Kpi key={t.label} label={t.label} value={t.val}/>)}
      </div>

      <div className="grid gap-4 lg:grid-cols-3 sm:grid-cols-1">
        {/* Recurring Metrics */}
        <div className="p-5 rounded-xl bg-gray-900 ring-1 ring-gray-800 shadow space-y-2">
          <div className="text-sm text-lime-400/90">MRR</div>
          <div className="text-3xl font-bold text-lime-400">{centsToUSD(kpi.mrr)}</div>
          <div className="text-sm text-lime-400/90 mt-3">ARR</div>
          <div className="text-3xl font-bold text-lime-400">{centsToUSD(kpi.arr)}</div>
          <div className="text-sm text-lime-400/90 mt-3">ARPU (30d)</div>
          <div className="text-2xl font-bold text-lime-400">{centsToUSD(kpi.arpu30d)}</div>
        </div>

        {/* New Subs / Cancels */}
        <div className="p-5 rounded-xl bg-gray-900 ring-1 ring-gray-800 shadow">
          <div className="text-lime-400 font-semibold mb-3">New Subs vs Cancels (last 60d)</div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subsSeries}>
                <XAxis dataKey="day" tick={{ fill:"#84cc16" }} />
                <YAxis tick={{ fill:"#84cc16" }} />
                <Tooltip contentStyle={{ background:"#000", border:"1px solid #84cc16", color:"#84cc16" }}/>
                <Bar dataKey="new_subs" fill="#84cc16" />
                <Bar dataKey="cancels"  fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue trend */}
        <div className="p-5 rounded-xl bg-gray-900 ring-1 ring-gray-800 shadow">
          <div className="text-lime-400 font-semibold mb-3">Revenue (last 60d)</div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revSeries}>
                <XAxis dataKey="day" tick={{ fill:"#84cc16" }} />
                <YAxis tick={{ fill:"#84cc16" }} />
                <Tooltip contentStyle={{ background:"#000", border:"1px solid #84cc16", color:"#84cc16" }}/>
                <Line type="monotone" dataKey="revenue" stroke="#84cc16" dot={false} strokeWidth={2}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Revenue by plan (stacked, last 12 months) */}
      <section className="p-5 rounded-xl bg-gray-900 ring-1 ring-gray-800 shadow">
        <div className="text-lime-400 font-semibold mb-3">Revenue by Plan (last 12 months)</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revPlanStack.rows}>
              <XAxis dataKey="month" tick={{ fill:"#84cc16" }} />
              <YAxis tick={{ fill:"#84cc16" }} />
              <Tooltip contentStyle={{ background:"#000", border:"1px solid #84cc16", color:"#84cc16" }}/>
              <Legend />
              {revPlanStack.keys.map((k, idx)=>(
                <Bar key={k} dataKey={k} stackId="a" fill="#84cc16" opacity={0.4 + (idx % 3)*0.2}/>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Churn (last 12m) */}
      <section className="p-5 rounded-xl bg-gray-900 ring-1 ring-gray-800 shadow">
        <div className="text-lime-400 font-semibold mb-3">Churn Rate (last 12 months)</div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={churn}>
              <XAxis dataKey="month" tick={{ fill:"#84cc16" }} />
              <YAxis tick={{ fill:"#84cc16" }} />
              <Tooltip contentStyle={{ background:"#000", border:"1px solid #84cc16", color:"#84cc16" }}/>
              <Line type="monotone" dataKey="churn" stroke="#84cc16" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Conversion funnel (last 60d) */}
      <section className="p-5 rounded-xl bg-gray-900 ring-1 ring-gray-800 shadow">
        <div className="text-lime-400 font-semibold mb-3">Conversion Funnel (last 60 days)</div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={funnel}>
              <XAxis dataKey="day" tick={{ fill:"#84cc16" }} />
              <YAxis tick={{ fill:"#84cc16" }} />
              <Tooltip contentStyle={{ background:"#000", border:"1px solid #84cc16", color:"#84cc16" }}/>
              <Line type="monotone" dataKey="visits"  stroke="#84cc16" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="signups" stroke="#22c55e" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="paid"    stroke="#a3e635" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-lime-400/80 mt-2">“Visits” will show once you insert rows into <code>web_traffic_daily</code>.</p>
      </section>

      {/* Cohort retention heatmap */}
      <section className="p-5 rounded-xl bg-gray-900 ring-1 ring-gray-800 shadow">
        <div className="text-lime-400 font-semibold mb-4">Cohort Retention (monthly, months +0..+11)</div>
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-13 gap-2">
              <div></div>
              {Array.from({length:12}).map((_,i)=><div key={i} className="text-xs text-lime-400 text-center">+{i}</div>)}
              {cohortGrid.rows.map(([label,row])=>(
                <div key={label} className="contents">
                  <div className="text-xs text-lime-400 flex items-center">{label}</div>
                  {Array.from({length:12}).map((_,i)=> <HeatCell key={i} pct={row[i]} />)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Subs counters */}
      <div className="grid gap-4 lg:grid-cols-3 sm:grid-cols-2">
        {subsCounters.map(s=> <Kpi key={s.label} label={s.label} value={s.val}/>)}
      </div>
    </div>
  )
}
