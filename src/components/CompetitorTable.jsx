import { motion } from "framer-motion";
import { COMPETITORS, SACVPN_ADVANTAGES } from "../data/competitors.js";

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
  viewport: { once: true, amount: 0.1 },
});

// Check icon for positive features
const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-500 inline-block flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

// Crown icon for SACVPN
const CrownIcon = () => (
  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z" />
  </svg>
);

export default function CompetitorTable() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container-xl">
        {/* Section Header */}
        <motion.div className="text-center mb-12" {...fadeIn(0)}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-4">
            VPN Showdown
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            SACVPN vs The Majors
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Here's how SACVPN compares to the top 6 VPN providers. Spoiler: we win on the features that matter most.
          </p>
        </motion.div>

        {/* Main Comparison Table */}
        <motion.div {...fadeIn(0.1)}>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-6 py-5">
              <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Complete Provider Comparison
              </h3>
              <p className="text-gray-400 text-sm mt-1">Monthly pricing, features, and capabilities at a glance</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Provider</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Monthly Price</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Device Limit</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">No-logs Policy</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Gaming Optimization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* SACVPN Row - Premium Highlight */}
                  <tr className="bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10 relative">
                    {/* Winner badge */}
                    <td className="px-6 py-5 relative">
                      <div className="absolute -top-3 left-4 flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full shadow-md">
                        <CrownIcon />
                        <span>BEST VALUE</span>
                      </div>
                      <span className="font-bold text-primary flex items-center gap-3 mt-2">
                        <span className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg">S</span>
                        <span className="text-lg">{SACVPN_ADVANTAGES.name}</span>
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="font-bold text-green-600 text-base">{SACVPN_ADVANTAGES.price.personal}</div>
                        <div className="text-sm text-gray-600">{SACVPN_ADVANTAGES.price.gaming}</div>
                        <div className="text-xs text-gray-500">{SACVPN_ADVANTAGES.price.business}</div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-2 font-bold text-primary">
                        <CheckIcon />
                        Unlimited (Personal/Gaming)
                      </span>
                      <div className="text-sm text-gray-500 mt-1">Business: 10-100 device tiers</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-2 text-green-600 font-semibold">
                        <CheckIcon />
                        {SACVPN_ADVANTAGES.logs}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-2 text-green-600 font-semibold">
                        <CheckIcon />
                        {SACVPN_ADVANTAGES.gaming}
                      </span>
                    </td>
                  </tr>

                  {/* Competitor Rows */}
                  {(COMPETITORS ?? []).map((c, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-800 flex items-center gap-3">
                          <span className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-semibold text-sm">
                            {c.name.charAt(0)}
                          </span>
                          {c.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">{c.price}</td>
                      <td className="px-6 py-4 text-gray-600">{c.devices}</td>
                      <td className="px-6 py-4 text-gray-600">{c.logs}</td>
                      <td className="px-6 py-4 text-gray-500">{c.gaming}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer disclaimer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500 flex items-start gap-2">
                <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  Competitor data based on publicly available pricing as of 2025. Promotional discounts may apply.
                  Always verify current pricing on provider websites.
                </span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Key Advantages Grid */}
        <motion.div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6" {...fadeIn(0.15)}>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-bold text-gray-900 text-lg">Best Price</h4>
            <p className="text-gray-600 text-sm mt-2">Starting at just $9.99/mo with unlimited devices included.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="font-bold text-gray-900 text-lg">Unlimited Devices</h4>
            <p className="text-gray-600 text-sm mt-2">Protect your entire household with one subscription.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-bold text-gray-900 text-lg">Gaming Optimized</h4>
            <p className="text-gray-600 text-sm mt-2">Dedicated low-latency routes for competitive gaming.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="font-bold text-gray-900 text-lg">Lightning Fast</h4>
            <p className="text-gray-600 text-sm mt-2">WireGuard-only for 450-900 Mbps speeds.</p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div className="mt-12 text-center" {...fadeIn(0.2)}>
          <a
            href="/pricing"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transform hover:-translate-y-0.5 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            See All Plans
          </a>
        </motion.div>
      </div>
    </section>
  );
}
