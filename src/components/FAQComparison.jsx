import { COMPETITORS, FEATURES } from "../data/faqComparison.js";

export default function FAQComparison(){
  return (
    <section className="container-xl py-16">
      <h2 className="text-2xl font-bold">How SACVPN compares</h2>

      {/* Table A: Competitor overview */}
      <div className="overflow-x-auto mt-6">
        <table className="min-w-full border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-2">Provider</th>
              <th className="px-4 py-2">Monthly Price</th>
              <th className="px-4 py-2">Devices</th>
              <th className="px-4 py-2">Logs Policy</th>
              <th className="px-4 py-2">Gaming Optimization</th>
            </tr>
          </thead>
          <tbody>
            {(COMPETITORS ?? []).map((c,i)=>(
              <tr key={i} className="bg-white shadow-sm">
                <td className="px-4 py-3 font-semibold">{c.name}</td>
                <td className="px-4 py-3">{c.price}</td>
                <td className="px-4 py-3">{c.devices}</td>
                <td className="px-4 py-3">{c.logs}</td>
                <td className="px-4 py-3">{c.gaming}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table B: SACVPN advantage */}
      <div className="overflow-x-auto mt-12">
        <table className="min-w-full border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-2">Feature</th>
              <th className="px-4 py-2 text-primary">SACVPN</th>
              <th className="px-4 py-2">ExpressVPN</th>
              <th className="px-4 py-2">NordVPN</th>
              <th className="px-4 py-2">Surfshark</th>
              <th className="px-4 py-2">ProtonVPN</th>
              <th className="px-4 py-2">CyberGhost</th>
              <th className="px-4 py-2">PIA</th>
            </tr>
          </thead>
          <tbody>
            {(FEATURES ?? []).map((row,i)=>(
              <tr key={i} className="bg-white shadow-sm">
                <td className="px-4 py-3 font-medium">{row.feature}</td>
                <td className="px-4 py-3 font-semibold text-primary">{row.sacvpn}</td>
                <td className="px-4 py-3">{row.express}</td>
                <td className="px-4 py-3">{row.nord}</td>
                <td className="px-4 py-3">{row.surfshark}</td>
                <td className="px-4 py-3">{row.proton}</td>
                <td className="px-4 py-3">{row.cyberghost}</td>
                <td className="px-4 py-3">{row.pia}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-gray-600 mt-3">
  *Speed and latency values are typical benchmark averages and will vary based on ISP, device, distance to server,
  peering, and network conditions. We cannot guarantee specific results.*
</p>
      </div>
    </section>
  );
}
