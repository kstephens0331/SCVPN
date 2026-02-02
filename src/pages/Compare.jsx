import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Zap, Check, X, Clock, ArrowRight, Award, DollarSign, Lock, Globe, Rocket } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const comparisonData = [
  {
    feature: "Protocol",
    sacvpn: "WireGuard",
    competitors: "OpenVPN/IKEv2",
    advantage: "3-4x faster than OpenVPN"
  },
  {
    feature: "Speed Loss",
    sacvpn: "5-10%",
    competitors: "30-50%",
    advantage: "Minimal impact on connection"
  },
  {
    feature: "Encryption",
    sacvpn: "ChaCha20-Poly1305",
    competitors: "AES-256",
    advantage: "Modern, faster on mobile"
  },
  {
    feature: "Connection Time",
    sacvpn: "<1 second",
    competitors: "5-15 seconds",
    advantage: "Instant reconnection"
  },
  {
    feature: "Code Base",
    sacvpn: "~4,000 lines",
    competitors: "~400,000+ lines",
    advantage: "Easier to audit, fewer bugs"
  },
  {
    feature: "Battery Impact",
    sacvpn: "Minimal",
    competitors: "Moderate-High",
    advantage: "Better for mobile devices"
  },
  {
    feature: "Logging Policy",
    sacvpn: "Zero logs",
    competitors: "Varies",
    advantage: "We never store activity"
  },
  {
    feature: "Business Features",
    sacvpn: "Included",
    competitors: "Extra cost",
    advantage: "Team management at no extra cost"
  }
];

const competitors = [
  {
    name: "NordVPN",
    price: "$12.99/mo",
    protocol: "OpenVPN/IKEv2",
    speed: "Moderate",
    logs: "Minimal logs"
  },
  {
    name: "ExpressVPN",
    price: "$12.95/mo",
    protocol: "Lightway (proprietary)",
    speed: "Good",
    logs: "No activity logs"
  },
  {
    name: "Surfshark",
    price: "$12.95/mo",
    protocol: "OpenVPN/WireGuard",
    speed: "Good",
    logs: "No logs"
  },
  {
    name: "CyberGhost",
    price: "$12.99/mo",
    protocol: "OpenVPN/WireGuard",
    speed: "Moderate",
    logs: "Some logs"
  }
];

const whyWireguard = [
  {
    title: "Built for Speed",
    description: "WireGuard is designed from the ground up to be lean and fast. It uses state-of-the-art cryptography and has a minimal codebase.",
    icon: Rocket
  },
  {
    title: "Security Auditable",
    description: "At ~4,000 lines of code vs 400,000+ for OpenVPN, WireGuard can be fully audited by security researchers.",
    icon: Shield
  },
  {
    title: "Modern Cryptography",
    description: "ChaCha20 for encryption, Curve25519 for key exchange, and BLAKE2s for hashing - all best-in-class algorithms.",
    icon: Lock
  },
  {
    title: "Instant Connections",
    description: "Reconnect in under a second. Perfect for mobile devices that switch between WiFi and cellular.",
    icon: Zap
  }
];

const sacvpnAdvantages = [
  "WireGuard-only provider (no legacy protocols)",
  "Business & personal plans with same features",
  "14-day free trial, no credit card",
  "US-based with strong privacy laws",
  "24/7 live support",
  "Simple, transparent pricing"
];

export default function Compare() {
  return (
    <>
      <Helmet>
        <title>SACVPN vs Other VPNs | VPN Comparison 2025 | See How We Compare</title>
        <meta
          name="description"
          content="Compare SACVPN with NordVPN, ExpressVPN, Surfshark, and more. See why WireGuard VPN outperforms traditional VPN protocols in speed, security, and reliability."
        />
        <meta
          name="keywords"
          content="VPN comparison, SACVPN vs NordVPN, SACVPN vs ExpressVPN, WireGuard vs OpenVPN, best VPN 2025, fastest VPN, VPN speed comparison"
        />
        <link rel="canonical" href="https://www.sacvpn.com/compare" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "VPN Comparison - SACVPN vs Competitors",
            "description": "Detailed comparison of SACVPN with other VPN providers",
            "publisher": {
              "@type": "Organization",
              "name": "SACVPN"
            }
          })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-brand-900 to-gray-900" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="container-xl relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-300 text-sm font-medium mb-6"
            >
              <Award className="w-4 h-4" />
              <span>Honest VPN Comparison</span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6"
            >
              How SACVPN Compares to{" "}
              <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">Other VPNs</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-gray-300 mb-8"
            >
              We believe in transparency. Here's an honest look at how SACVPN stacks up against
              the competition - and why WireGuard changes everything.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Quick Comparison Table */}
      <section className="py-20 bg-white">
        <div className="container-xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4"
            >
              Feature-by-Feature Comparison
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-600"
            >
              See the technical differences that matter
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="overflow-x-auto"
          >
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-bold text-gray-900">Feature</th>
                  <th className="text-center py-4 px-4 font-bold text-brand-600 bg-brand-50 rounded-t-xl">SACVPN</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-600">Most VPNs</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-600 hidden lg:table-cell">Why It Matters</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, i) => (
                  <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
                    <td className="py-4 px-4 font-medium text-gray-900">{row.feature}</td>
                    <td className="py-4 px-4 text-center bg-brand-50/50">
                      <span className="inline-flex items-center gap-2 text-brand-700 font-semibold">
                        <Check className="w-4 h-4 text-green-500" />
                        {row.sacvpn}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-gray-600">{row.competitors}</td>
                    <td className="py-4 px-4 text-gray-500 text-sm hidden lg:table-cell">{row.advantage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* Why WireGuard Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4"
            >
              Why WireGuard Is the Future
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Most VPNs still use OpenVPN (from 2001). We use WireGuard - the modern protocol that's
              taking the industry by storm.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {whyWireguard.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Price Comparison */}
      <section className="py-20 bg-white">
        <div className="container-xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4"
            >
              Price Comparison
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-600"
            >
              Monthly pricing (most VPNs advertise annual rates to seem cheaper)
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-5 gap-6"
          >
            {/* SACVPN Card - Highlighted */}
            <motion.div
              variants={fadeInUp}
              className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl p-6 text-white shadow-xl ring-2 ring-brand-500 ring-offset-2"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl">SACVPN</h3>
                <span className="px-2 py-1 bg-white/20 rounded text-xs font-semibold">RECOMMENDED</span>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold">$9.99</span>
                <span className="text-brand-100">/mo</span>
              </div>
              <ul className="space-y-2 text-sm text-brand-100">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  WireGuard only
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  14-day free trial
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  No credit card
                </li>
              </ul>
            </motion.div>

            {/* Competitor Cards */}
            {competitors.map((comp, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="bg-gray-50 rounded-2xl p-6 border border-gray-200"
              >
                <h3 className="font-bold text-xl text-gray-900 mb-4">{comp.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-700">{comp.price}</span>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>{comp.protocol}</li>
                  <li>Speed: {comp.speed}</li>
                  <li>{comp.logs}</li>
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose SACVPN */}
      <section className="py-20 bg-gray-900">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.h2
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-display font-bold text-white mb-6"
              >
                The SACVPN Difference
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-lg text-gray-400 mb-8"
              >
                We're not trying to be everything to everyone. We focus on doing one thing exceptionally well:
                providing the fastest, most secure VPN using WireGuard technology.
              </motion.p>
              <motion.div
                variants={fadeInUp}
                className="space-y-4"
              >
                {sacvpnAdvantages.map((advantage, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-brand-400 flex-shrink-0" />
                    <span className="text-gray-300">{advantage}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-3xl p-8 border border-gray-700"
            >
              <div className="text-center mb-8">
                <DollarSign className="w-16 h-16 text-brand-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Try Before You Buy</h3>
                <p className="text-gray-400">14-day free trial, no credit card required</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between py-3 border-b border-gray-700">
                  <span className="text-gray-400">Personal Plan</span>
                  <span className="text-white font-semibold">$9.99/month</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-700">
                  <span className="text-gray-400">Business Plan</span>
                  <span className="text-white font-semibold">$7/user/month</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-400">Enterprise</span>
                  <span className="text-white font-semibold">Contact us</span>
                </div>
              </div>

              <Link
                to="/pricing"
                className="block w-full text-center px-8 py-4 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                View Full Pricing
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-xl max-w-4xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4"
            >
              Common Questions
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-6"
          >
            {[
              {
                q: "Is WireGuard really faster than OpenVPN?",
                a: "Yes. In independent tests, WireGuard consistently delivers 3-4x better throughput and significantly lower latency than OpenVPN. The lean codebase means less processing overhead."
              },
              {
                q: "Why don't other VPNs use WireGuard?",
                a: "Many are starting to offer it as an option, but their infrastructure was built around OpenVPN. SACVPN was built from day one around WireGuard, so every part of our system is optimized for it."
              },
              {
                q: "Can I try SACVPN without a credit card?",
                a: "Yes! We offer a full 14-day trial with no credit card required. Most competitors either require payment upfront or only offer a money-back guarantee (which many people forget to use)."
              },
              {
                q: "Is SACVPN good for streaming?",
                a: "Absolutely. Our fast speeds and global server network make us great for streaming. WireGuard's efficiency means less buffering and better video quality."
              }
            ].map((faq, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-6 shadow-md"
              >
                <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-brand-600 to-brand-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-20" />
        <div className="container-xl relative z-10 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-display font-bold text-white mb-6"
            >
              Ready to Experience the Difference?
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-brand-100 max-w-2xl mx-auto mb-8"
            >
              Try SACVPN free for 14 days. No credit card, no commitment.
              See why WireGuard is the future.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
              <Link
                to="/download"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-brand-600 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                <Clock className="w-5 h-5" />
                Start Free Trial
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-white/30 text-white font-bold hover:bg-white/10 transition-all"
              >
                View Pricing
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
