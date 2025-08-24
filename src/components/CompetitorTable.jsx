import { COMPETITORS, SACVPN_ADVANTAGES } from "../data/competitors.js";

export default function CompetitorTable(){
  return (
    <section className="container-xl py-16">
      <h2 className="text-3xl font-bold">SACVPN vs the majors</h2>
      <p className="text-gray-700 mt-2">Here’s how SACVPN compares to the top 6 VPN providers:</p>
      
      {/* Pricing comparison */}
      <div className="overflow-x-auto mt-8">
        <table className="min-w-full border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="text-left bg-gray-50">
              <th className="px-4 py-2">Provider</th>
              <th className="px-4 py-2">Monthly Price</th>
              <th className="px-4 py-2">Device Limit</th>
              <th className="px-4 py-2">No-logs Policy</th>
              <th className="px-4 py-2">Gaming Optimization</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white shadow-sm">
              <td className="px-4 py-3 font-semibold text-primary">{SACVPN_ADVANTAGES.name}</td>
              <td className="px-4 py-3 text-primary">{SACVPN_ADVANTAGES.price.personal}, {SACVPN_ADVANTAGES.price.gaming}, {SACVPN_ADVANTAGES.price.business}</td>
              <td className="px-4 py-3 text-primary">Unlimited (Personal/Gaming), Business quotas</td>
              <td className="px-4 py-3">{SACVPN_ADVANTAGES.logs}</td>
              <td className="px-4 py-3">{SACVPN_ADVANTAGES.gaming}</td>
            </tr>
            {COMPETITORS.map((c,i)=>(
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

      <p className="text-xs text-gray-500 mt-3">Competitor data based on publicly available pricing as of 2025. Promotions/discounts may apply.</p>
    </section>
  );
}
