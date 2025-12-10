import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { Helmet } from "react-helmet-async";
import CheckItem from "../components/CheckItem.jsx";

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
  viewport: { once: true, amount: 0.2 },
});

export default function About(){
  return (
    <>
      <Helmet>
        <title>About SACVPN - Enterprise VPN Provider for Business Security</title>
        <meta name="description" content="SACVPN provides enterprise VPN solutions for businesses of all sizes. U.S.-based company offering HIPAA-compliant security, dedicated support, and WireGuard technology for healthcare, legal, and financial organizations." />
        <meta name="keywords" content="about SACVPN, enterprise VPN provider, business VPN company, corporate VPN solution, U.S. VPN provider, HIPAA compliant VPN company, managed VPN service" />
        <link rel="canonical" href="https://www.sacvpn.com/about" />
      </Helmet>

      <section className="container-xl py-16">
        {/* Hero */}
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-secondary font-semibold uppercase tracking-wide">About SACVPN</p>
          <h1 className="text-5xl font-bold text-primary mt-2">Why We Created SACVPN - Your Trusted VPN Service Provider</h1>
          <p className="mt-4 text-lg text-gray-700">
            SACVPN exists to make private, fast, and secure internet access available to everyone - individuals, gamers, and businesses.
            We are builders and network engineers who were tired of bloated VPNs, confusing pricing, and weak performance. So we designed
            a secure VPN service powered by WireGuard technology that is simple, honest, and engineered for maximum speed and privacy protection.
          </p>
        </motion.div>

      {/* Origin story */}
      <motion.div className="card p-8 mt-12" {...fadeIn(0.1)}>
        <h2 className="text-3xl font-semibold">Our story</h2>
        <p className="mt-4 text-gray-800">
          SACVPN started as a practical response to three problems we kept seeing: 1) everyday people have their data collected,
          profiled, and sold without meaningful consent; 2) many VPNs make bold promises but deliver inconsistent speeds,
          limits on devices, and dark patterns during checkout; 3) businesses want simple, predictable security for remote
          work without standing up full enterprise stacks. We believed there was room for a VPN that respected users and
          treated performance as a first-class requirement.
        </p>
        <p className="mt-4 text-gray-800">
          We chose WireGuard from day one. It is modern, minimal, and efficient. By building around WireGuard and avoiding
          legacy protocols unless absolutely required, we can keep latency low, throughput high, and configuration simple.
          The result is a service where setup is measured in seconds, not afternoons.
        </p>
      </motion.div>

      {/* What we are building */}
      <motion.div className="grid md:grid-cols-2 gap-8 mt-12" {...fadeIn(0.15)}>
        <div className="card p-8">
          <h3 className="text-2xl font-semibold">What we are building</h3>
          <ul className="mt-4 space-y-2 text-gray-800">
            <CheckItem>Personal and Gaming plans with unlimited devices so a whole household can be protected.</CheckItem>
            <CheckItem>Gaming-optimized routes that favor lower latency and stability during peak hours.</CheckItem>
            <CheckItem>Business tiers with clear device quotas and a simple management dashboard.</CheckItem>
            <CheckItem>One-click device setup: generate a config, scan a QR code, and you are online.</CheckItem>
            <CheckItem>No-logs policy enforced by design and process. We do not record browsing activity.</CheckItem>
            <CheckItem>Infrastructure that prioritizes speed, minimal overhead, and regular updates.</CheckItem>
          </ul>
        </div>
        <div className="card p-8">
          <h3 className="text-2xl font-semibold">The problem we are solving</h3>
          <ul className="mt-4 space-y-2 text-gray-800">
            <CheckItem>ISPs throttle or shape certain traffic. A VPN prevents easy classification and slows throttling.</CheckItem>
            <CheckItem>Public and shared networks expose devices to snooping and credential theft.</CheckItem>
            <CheckItem>Smart TVs, consoles, and IoT devices leak metadata that can be tied to a household.</CheckItem>
            <CheckItem>Remote work often mixes personal and business devices without a clean separation.</CheckItem>
            <CheckItem>Many VPNs add limits, upsells, and friction that discourage consistent protection.</CheckItem>
          </ul>
        </div>
      </motion.div>

      {/* Why people need a VPN */}
      <motion.div className="mt-12" {...fadeIn(0.2)}>
        <h2 className="text-3xl font-semibold">Why people need a VPN at home and in public</h2>
        <div className="grid md:grid-cols-2 gap-8 mt-6">
          <div className="card p-8">
            <h4 className="text-xl font-semibold">At home</h4>
            <ul className="mt-3 space-y-2 text-gray-800">
              <CheckItem>Prevent your ISP from collecting and selling your browsing patterns.</CheckItem>
              <CheckItem>Reduce throttling on streaming and cloud gaming during busy hours.</CheckItem>
              <CheckItem>Protect every device - phones, tablets, PCs, TVs, and IoT.</CheckItem>
              <CheckItem>Unlock additional streaming libraries when you travel.</CheckItem>
              <CheckItem>Mask your household IP to reduce targeted advertising.</CheckItem>
              <CheckItem>Keep financial activity private while shopping or banking.</CheckItem>
            </ul>
          </div>
          <div className="card p-8">
            <h4 className="text-xl font-semibold">On public networks</h4>
            <ul className="mt-3 space-y-2 text-gray-800">
              <CheckItem>Encrypt traffic on cafe, hotel, airplane, and campus Wi-Fi.</CheckItem>
              <CheckItem>Block trivial eavesdropping and credential interception.</CheckItem>
              <CheckItem>Prevent captive portals and intermediaries from profiling your activity.</CheckItem>
              <CheckItem>Maintain a consistent identity for apps that dislike IP changes.</CheckItem>
              <CheckItem>Connect faster with lightweight WireGuard even on slower links.</CheckItem>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* What makes SACVPN different */}
      <motion.div className="mt-12 card p-8" {...fadeIn(0.25)}>
        <h2 className="text-3xl font-semibold">What makes SACVPN different</h2>
        <p className="mt-4 text-gray-800">
          We focus on clarity and outcomes. Unlimited devices on Personal and Gaming plans means you do not have to pick which
          device deserves privacy. Our Business tiers translate directly to device quotas so owners can budget confidently.
          We publish realistic performance ranges and include a disclaimer: distance to server, ISP routing, peering, time of day,
          and local hardware all influence speed and latency. Our goal is to set expectations honestly and deliver above them.
        </p>
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div className="rounded-xl border border-black/10 p-5">
            <h4 className="font-semibold">Performance first</h4>
            <p className="text-gray-700 mt-2">WireGuard-only by default. Lower CPU overhead and stable throughput for streaming and gaming.</p>
          </div>
          <div className="rounded-xl border border-black/10 p-5">
            <h4 className="font-semibold">Simple setup</h4>
            <p className="text-gray-700 mt-2">Generate a device, scan a QR code, import the config. That is it.</p>
          </div>
          <div className="rounded-xl border border-black/10 p-5">
            <h4 className="font-semibold">Transparent pricing</h4>
            <p className="text-gray-700 mt-2">Personal $9.99/mo, Gaming $14.99/mo, Business $100 (10 devices), $450 (50), $800 (100). No hidden fees.</p>
          </div>
        </div>
      </motion.div>

      {/* Principles */}
      <motion.div className="mt-12 grid md:grid-cols-2 gap-8" {...fadeIn(0.3)}>
        <div className="card p-8">
          <h3 className="text-2xl font-semibold">Principles we operate by</h3>
          <ul className="mt-4 space-y-2 text-gray-800">
            <CheckItem>Privacy by default. We do not track browsing activity.</CheckItem>
            <CheckItem>Security by design. Minimal images, patched systems, strong keys.</CheckItem>
            <CheckItem>Clarity over hype. We prefer truthful ranges to unrealistic promises.</CheckItem>
            <CheckItem>Speed matters. A private connection should also be fast.</CheckItem>
            <CheckItem>Respect for users. No tricks in checkout or cancellation.</CheckItem>
            <CheckItem>Support that cares. Real people, practical answers.</CheckItem>
          </ul>
        </div>
        <div className="card p-8">
          <h3 className="text-2xl font-semibold">How businesses benefit</h3>
          <ul className="mt-4 space-y-2 text-gray-800">
            <CheckItem>Device quotas that map to budgets and headcount.</CheckItem>
            <CheckItem>Centralized device management and revocation.</CheckItem>
            <CheckItem>Team onboarding with QR instructions for each platform.</CheckItem>
            <CheckItem>Gaming routes can double as low-latency paths for real-time apps.</CheckItem>
            <CheckItem>Option to tailor routing and SLAs at higher tiers.</CheckItem>
          </ul>
        </div>
      </motion.div>

      {/* Security and performance */}
      <motion.div className="mt-12" {...fadeIn(0.35)}>
        <h2 className="text-3xl font-semibold">Security and performance, without the drama</h2>
        <p className="mt-4 text-gray-800">
          Security means both protecting data and avoiding complexity that leads to mistakes. We keep our stack lean,
          use modern cryptography, and audit changes before rollout. Performance means users do not notice they are on a VPN:
          video calls should be clear, games should feel responsive, and downloads should saturate your local link when possible.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <Stat label="Typical download" value="450-900 Mbps" />
          <Stat label="Typical upload" value="350-800 Mbps" />
          <Stat label="Latency to nearest region" value="8-20 ms" />
          <Stat label="Gaming route improvement" value="10-30% lower ping" />
        </div>
        <p className="text-xs text-gray-600 mt-3">
          Performance varies by distance to server, ISP routing and peering, device hardware, and network congestion. We cannot guarantee specific results.
        </p>
      </motion.div>

      {/* Roadmap */}
      <motion.div className="mt-12 card p-8" {...fadeIn(0.4)}>
        <h2 className="text-3xl font-semibold">Where we are going</h2>
        <p className="mt-4 text-gray-800">
          Our roadmap focuses on thoughtful growth: more regions where users need them, smarter routing, and better tooling for teams.
          We are expanding storage-backed device histories, adding usage insights for those who want them, and continuing to simplify
          the setup flow so first-time users succeed without help.
        </p>
        <ul className="mt-4 space-y-2 text-gray-800">
          <CheckItem>Additional regions with latency-aware routing.</CheckItem>
          <CheckItem>Team roles and audit logs for Business tiers.</CheckItem>
          <CheckItem>Self-service key rotation and quick device reissue.</CheckItem>
          <CheckItem>Optional advanced analytics surfaced in the dashboard.</CheckItem>
          <CheckItem>More educational content for everyday privacy at home.</CheckItem>
        </ul>
      </motion.div>

      {/* Support and contact */}
      <motion.div className="mt-12 grid md:grid-cols-2 gap-8" {...fadeIn(0.45)}>
        <div className="card p-8">
          <h3 className="text-2xl font-semibold">Support you can count on</h3>
          <p className="mt-2 text-gray-800">
            We offer 24/7 email support. Our team reads every ticket and focuses on practical resolution:
            getting you online, optimizing latency, and solving real problems quickly. Start with our 14-day free trial
            (no credit card required), plus a 30-day money-back guarantee so you can try SACVPN with complete confidence.
          </p>
        </div>
        <div className="card p-8">
          <h3 className="text-2xl font-semibold">Our promise</h3>
          <p className="mt-2 text-gray-800">
            We will continue to publish clear pricing, straightforward terms, and realistic performance ranges. We will never
            sell or rent your data. We will treat your time with respect: fast setup, fast responses, and honest communication.
          </p>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        className="mt-16 relative overflow-hidden rounded-3xl bg-gradient-to-r from-dark-900 via-dark-800 to-brand-950 p-10 shadow-2xl"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-cyan/20 rounded-full blur-3xl" />

        <div className="relative z-10 text-center">
          {/* Free Trial Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-bold mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            14-Day Free Trial - No Credit Card Required
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white">Your Privacy. Your Speed. Your Control.</h2>
          <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
            We built SACVPN for households, gamers, and businesses that want private, fast, and simple online protection on every device.
            With our WireGuard-powered VPN, strict no-logs policy, and transparent pricing, you get enterprise-grade security without the complexity.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start Free Trial
            </a>
            <a
              href="/pricing#business"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white/20 text-white font-bold hover:bg-white/10 transition-all duration-300"
            >
              View Business Plans
            </a>
          </div>
        </div>
      </motion.div>
    </section>
    </>
  );
}

/* Small stat tile used above */
function Stat({ label, value }){
  return (
    <div className="rounded-xl border border-black/10 p-4">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
