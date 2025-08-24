import { COMP_TABLE } from "../data/comparison.js";
export default function Comparison(){
  return (
    <section className="container-xl py-16">
      <h2 className="text-3xl font-bold">SACVPN vs typical competitors</h2>
      <p className="text-gray-700 mt-2">Clear, simple pricing and features you actually use.</p>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-sm text-gray-600">
              <th className="px-4 py-2">Plan / Feature</th>
              <th className="px-4 py-2">SACVPN</th>
              <th className="px-4 py-2">Competitors</th>
            </tr>
          </thead>
          <tbody>
            {COMP_TABLE.map((row, i)=>(
              <tr key={i} className="bg-white rounded-xl shadow-sm">
                <td className="px-4 py-3 font-medium">{row.feature}</td>
                <td className="px-4 py-3 text-primary font-semibold">{row.sacvpn}</td>
                <td className="px-4 py-3 text-gray-800">{row.competitors}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 mt-3">Competitor ranges are typical market pricing and may vary by provider and promotion.</p>
    </section>
  );
}
