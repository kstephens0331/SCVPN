import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
export default function Accounts(){
  const [users, setUsers] = useState([])
  const [orgs, setOrgs] = useState([])
  useEffect(()=>{
    supabase.from("profiles").select("id,email,full_name,account_type").then(({data})=>setUsers(data||[]))
    supabase.from("organizations").select("id,name,plan,is_active").then(({data})=>setOrgs(data||[]))
  },[])
  return (
    <div className="grid gap-8">
      <section>
        <h3 className="font-semibold mb-2">Users</h3>
        <Table cols={["Email","Name","Type"]} rows={(users ?? []).map(u=>[u.email,u.full_name,u.account_type])}/>
      </section>
      <section>
        <h3 className="font-semibold mb-2">Organizations</h3>
        <Table cols={["Name","Plan","Status"]} rows={(orgs ?? []).map(o=>[o.name,o.plan,o.is_active?'Active':'Suspended'])}/>
      </section>
    </div>
  )
}
function Table({ cols, rows }){
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead><tr className="text-left border-b">{(cols ?? []).map(c=> <th key={c} className="py-2 pr-3">{c}</th>)}</tr></thead>
        <tbody>{(rows ?? []).map((r,i)=>
          <tr key={i} className="border-b">{(r ?? []).map((c,j)=> <td key={j} className="py-2 pr-3">{c}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  )
}
