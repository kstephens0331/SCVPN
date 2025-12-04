import { motion } from "framer-motion";
import { COMPETITORS, FEATURES } from "../data/faqComparison.js";

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
  viewport: { once: true, amount: 0.1 },
});

// Check and X icons for visual clarity
const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-500 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5 text-red-400 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Format cell content with icons
function formatCell(value) {
  if (!value) return value;
  const str = String(value);
  if (str.startsWith("✅")) {
    return (
      <span className="flex items-center gap-1.5">
        <CheckIcon />
        <span>{str.replace("✅", "").trim()}</span>
      </span>
    );
  }
  if (str.startsWith("❌")) {
    return (
      <span className="flex items-center gap-1.5 text-gray-500">
        <XIcon />
        <span>{str.replace("❌", "").trim()}</span>
      </span>
    );
  }
  return str;
}

export default function FAQComparison() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container-xl">
        {/* Section Header */}
        <motion.div className="text-center mb-12" {...fadeIn(0)}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            Comparison
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            How SACVPN Compares
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            See how we stack up against the competition. Real features, real pricing, no hidden surprises.
          </p>
        </motion.div>

        {/* Table A: Competitor Overview */}
        <motion.div {...fadeIn(0.1)}>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Competitor Overview
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Provider</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Monthly Price</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Devices</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Logs Policy</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Gaming Optimization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* SACVPN Row - Highlighted */}
                  <tr className="bg-gradient-to-r from-primary/5 to-secondary/5 hover:from-primary/10 hover:to-secondary/10 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-primary flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">S</span>
                        SACVPN
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-green-600">$9.99/mo</td>
                    <td className="px-6 py-4 font-semibold text-primary">Unlimited</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <CheckIcon /> Strict no-logs
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <CheckIcon /> Dedicated gaming routes
                      </span>
                    </td>
                  </tr>
                  {(COMPETITORS ?? []).map((c, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-800">{c.name}</td>
                      <td className="px-6 py-4 text-gray-600">{c.price}</td>
                      <td className="px-6 py-4 text-gray-600">{c.devices}</td>
                      <td className="px-6 py-4 text-gray-600">{c.logs}</td>
                      <td className="px-6 py-4 text-gray-500">{c.gaming}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* SACVPN Advantage Banner */}
        <motion.div
          className="my-12 relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-secondary p-8 shadow-xl"
          {...fadeIn(0.15)}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              The SACVPN Advantage
            </h3>
            <div className="grid sm:grid-cols-3 gap-6 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-3xl font-bold text-white">$9.99</div>
                <div className="text-white/80 text-sm mt-1">Personal Plan/mo</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-3xl font-bold text-white">Unlimited</div>
                <div className="text-white/80 text-sm mt-1">Devices Included</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-3xl font-bold text-white">8-20ms</div>
                <div className="text-white/80 text-sm mt-1">Typical Latency</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Table B: Feature Comparison */}
        <motion.div {...fadeIn(0.2)}>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-secondary px-6 py-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Feature-by-Feature Comparison
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left font-semibold text-gray-700 min-w-[200px]">Feature</th>
                    <th className="px-4 py-4 text-center font-bold text-primary bg-primary/5 min-w-[140px]">
                      <span className="flex items-center justify-center gap-1">
                        <span className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">S</span>
                        SACVPN
                      </span>
                    </th>
                    <th className="px-4 py-4 text-center font-medium text-gray-600 min-w-[120px]">ExpressVPN</th>
                    <th className="px-4 py-4 text-center font-medium text-gray-600 min-w-[120px]">NordVPN</th>
                    <th className="px-4 py-4 text-center font-medium text-gray-600 min-w-[120px]">Surfshark</th>
                    <th className="px-4 py-4 text-center font-medium text-gray-600 min-w-[120px]">ProtonVPN</th>
                    <th className="px-4 py-4 text-center font-medium text-gray-600 min-w-[120px]">CyberGhost</th>
                    <th className="px-4 py-4 text-center font-medium text-gray-600 min-w-[120px]">PIA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(FEATURES ?? []).map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-800">{row.feature}</td>
                      <td className="px-4 py-4 text-center bg-primary/5 font-semibold text-primary">
                        {formatCell(row.sacvpn)}
                      </td>
                      <td className="px-4 py-4 text-center text-gray-600">{formatCell(row.express)}</td>
                      <td className="px-4 py-4 text-center text-gray-600">{formatCell(row.nord)}</td>
                      <td className="px-4 py-4 text-center text-gray-600">{formatCell(row.surfshark)}</td>
                      <td className="px-4 py-4 text-center text-gray-600">{formatCell(row.proton)}</td>
                      <td className="px-4 py-4 text-center text-gray-600">{formatCell(row.cyberghost)}</td>
                      <td className="px-4 py-4 text-center text-gray-600">{formatCell(row.pia)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500 flex items-start gap-2">
                <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  Speed and latency values are typical benchmark averages and will vary based on ISP, device, distance to server,
                  peering, and network conditions. We cannot guarantee specific results.
                </span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div className="mt-12 text-center" {...fadeIn(0.25)}>
          <a
            href="/pricing"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transform hover:-translate-y-0.5 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Start Your 14-Day Free Trial
          </a>
          <p className="mt-3 text-sm text-gray-500">No credit card required. 30-day money-back guarantee.</p>
        </motion.div>
      </div>
    </section>
  );
}
