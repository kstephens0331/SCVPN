import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { ChevronDown, HelpCircle, Shield, Zap, Users, CreditCard, Globe, Laptop, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import FAQComparison from "../components/FAQComparison.jsx";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// FAQ categories with icons
const faqCategories = [
  {
    id: "general",
    name: "General",
    icon: HelpCircle,
    color: "from-brand-500 to-brand-600",
  },
  {
    id: "privacy",
    name: "Privacy & Security",
    icon: Shield,
    color: "from-green-500 to-emerald-600",
  },
  {
    id: "performance",
    name: "Performance",
    icon: Zap,
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: "pricing",
    name: "Pricing & Billing",
    icon: CreditCard,
    color: "from-accent-purple to-accent-pink",
  },
  {
    id: "setup",
    name: "Setup & Devices",
    icon: Laptop,
    color: "from-accent-cyan to-blue-500",
  },
  {
    id: "features",
    name: "Features",
    icon: Globe,
    color: "from-red-500 to-pink-500",
  },
];

const faqs = [
  // General
  {
    category: "general",
    q: "What is SACVPN?",
    a: "SACVPN is a premium VPN service powered by the WireGuard protocol. We provide fast, secure, and private internet access for individuals, gamers, and businesses. Our service encrypts your internet traffic, masks your IP address, and protects your online privacy.",
  },
  {
    category: "general",
    q: "How many devices can I use?",
    a: "Personal and Gaming plans allow unlimited devices - protect your entire household with a single subscription. Business tiers include fixed quotas (10, 50, 250+ devices) based on your plan level.",
  },
  {
    category: "general",
    q: "What is the 14-day free trial?",
    a: "We offer a 14-day free trial so you can experience SACVPN risk-free. No credit card is required to start your trial. After 14 days, you can choose to subscribe to continue your protection.",
  },
  {
    category: "general",
    q: "How does the referral program work?",
    a: "Share your unique referral link with friends. When they sign up and stay subscribed for at least one month, you both receive a free month of SACVPN service. There's no limit to how many friends you can refer!",
  },

  // Privacy & Security
  {
    category: "privacy",
    q: "Do you keep logs of my activity?",
    a: "No. SACVPN enforces a strict no-logs policy. We never track, log, or store your browsing activity, DNS requests, IP addresses, or connection timestamps. Your privacy is our priority.",
  },
  {
    category: "privacy",
    q: "What encryption does SACVPN use?",
    a: "We use WireGuard's state-of-the-art encryption: ChaCha20 for symmetric encryption, Poly1305 for authentication, Curve25519 for key exchange, and BLAKE2s for hashing. This is considered the gold standard in VPN security.",
  },
  {
    category: "privacy",
    q: "What VPN protocol do you use?",
    a: "WireGuard only. It's faster, simpler, and more secure than older VPN protocols like OpenVPN or IKEv2. WireGuard has just 4,000 lines of code compared to OpenVPN's 400,000+, making it easier to audit and more secure.",
  },
  {
    category: "privacy",
    q: "Is SACVPN safe on public WiFi?",
    a: "Absolutely. SACVPN encrypts all your traffic, making it impossible for hackers on public WiFi networks to intercept your data. Whether you're at a coffee shop, airport, or hotel, your connection is secure.",
  },

  // Performance
  {
    category: "performance",
    q: "Will SACVPN slow down my internet?",
    a: "Our servers typically deliver 450-900 Mbps download and 8-20 ms latency to nearby regions. WireGuard's efficient design means minimal speed impact - most users won't notice any slowdown. Actual results depend on distance to server, ISP, and network conditions.",
  },
  {
    category: "performance",
    q: "Is SACVPN good for gaming?",
    a: "Yes! Our Gaming plan uses optimized routes to reduce latency and packet loss. Many gamers see 10-30% ping improvement. WireGuard's low overhead means minimal impact on your gaming performance, and our DDoS protection keeps you safe from attacks.",
  },
  {
    category: "performance",
    q: "Can I use SACVPN for streaming?",
    a: "Yes. We help unlock geo-restricted content and prevent ISP throttling while streaming. Our high-speed servers support 4K streaming without buffering. Access content from different regions with a single click.",
  },
  {
    category: "performance",
    q: "Where are your servers located?",
    a: "We deploy servers in North America, Europe, and Asia, strategically positioned near major internet exchange points for optimal routing. Additional regions are added based on user demand.",
  },

  // Pricing & Billing
  {
    category: "pricing",
    q: "Do you offer a free trial?",
    a: "Yes! We offer a 14-day free trial with no credit card required. Try SACVPN completely risk-free. After your trial, we also provide a 30-day money-back guarantee if you're unsatisfied.",
  },
  {
    category: "pricing",
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards (Visa, MasterCard, American Express, Discover) processed securely through Stripe. Additional payment methods including PayPal and cryptocurrency are coming soon.",
  },
  {
    category: "pricing",
    q: "How does Business pricing work?",
    a: "Business plans are priced by device quota: 10 devices, 50 devices, or 250+ devices. Admins can add/revoke devices and manage employee access from a centralized dashboard. Enterprise plans include custom SLAs and dedicated support.",
  },
  {
    category: "pricing",
    q: "Can I cancel anytime?",
    a: "Yes, you can cancel your subscription at any time from your dashboard. Your service continues until the end of your billing period. No cancellation fees, no hassles.",
  },
  {
    category: "pricing",
    q: "What's your refund policy?",
    a: "We offer a 30-day money-back guarantee for first-time subscribers. If you're not satisfied within the first 30 days after your trial ends, contact us for a full refund.",
  },

  // Setup & Devices
  {
    category: "setup",
    q: "How do I set up SACVPN?",
    a: "After creating a device in your dashboard, you'll receive a QR code and config file. Simply scan the QR code in the WireGuard app or import the config file. Setup takes less than 60 seconds on any platform.",
  },
  {
    category: "setup",
    q: "What devices are supported?",
    a: "SACVPN works on Windows, macOS, Linux, iOS, Android, and routers. Any device that supports WireGuard can use SACVPN. We provide step-by-step setup guides for each platform.",
  },
  {
    category: "setup",
    q: "Can I use SACVPN on my router?",
    a: "Yes! Router-level VPN protects all devices on your network, including smart TVs, gaming consoles, and IoT devices. We support routers running OpenWrt, pfSense, ASUS-WRT, and other WireGuard-compatible firmware.",
  },
  {
    category: "setup",
    q: "Do you offer support?",
    a: "Yes, we provide 24/7 customer support via email. Our team focuses on practical resolution: getting you online, optimizing performance, and solving issues quickly. Most inquiries are answered within hours.",
  },

  // Features
  {
    category: "features",
    q: "What makes SACVPN different from other VPNs?",
    a: "We focus on performance, simplicity, and honesty. WireGuard-only protocol for maximum speed, unlimited devices on personal plans, transparent pricing with no hidden fees, and a genuine no-logs policy enforced by design.",
  },
  {
    category: "features",
    q: "Does SACVPN have a kill switch?",
    a: "Yes, WireGuard includes a built-in kill switch functionality. If your VPN connection drops, your internet traffic is automatically blocked to prevent data leaks.",
  },
  {
    category: "features",
    q: "Can I use SACVPN for torrenting?",
    a: "Yes, P2P traffic is allowed on our network. Your activity is protected by our no-logs policy and encrypted connection. We recommend using designated P2P-optimized servers for best performance.",
  },
];

function FAQItem({ faq, isOpen, onClick }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="border border-gray-200 rounded-xl overflow-hidden hover:border-brand-200 transition-colors"
    >
      <button
        onClick={onClick}
        className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900">{faq.q}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform duration-300 flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
              {faq.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState("general");
  const [openFaq, setOpenFaq] = useState(null);

  const filteredFaqs = faqs.filter((faq) => faq.category === activeCategory);
  const activeCategoryInfo = faqCategories.find((c) => c.id === activeCategory);

  return (
    <>
      <Helmet>
        <title>VPN FAQ - Frequently Asked Questions | SACVPN</title>
        <meta
          name="description"
          content="Get answers to common questions about SACVPN. Learn about our WireGuard VPN service, no-logs policy, 14-day free trial, pricing, device setup, and more."
        />
        <meta
          name="keywords"
          content="VPN FAQ, SACVPN questions, WireGuard VPN help, VPN setup guide, VPN pricing questions, no-logs VPN, VPN free trial"
        />
        <link rel="canonical" href="https://www.sacvpn.com/faq" />
        {/* FAQPage Schema for Rich Snippets */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
              "@type": "Question",
              "name": faq.q,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a
              }
            }))
          })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-accent-purple/5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl" />

        <div className="container-xl relative z-10 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-6"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help Center</span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 max-w-4xl mx-auto"
            >
              Frequently Asked{" "}
              <span className="text-gradient">Questions</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Everything you need to know about SACVPN. Can't find what you're
              looking for?{" "}
              <Link to="/contact" className="text-brand-600 hover:text-brand-700 font-medium">
                Contact our support team
              </Link>
              .
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 bg-white">
        <div className="container-xl">
          {/* Category Tabs */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {faqCategories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              return (
                <motion.button
                  key={category.id}
                  variants={fadeInUp}
                  onClick={() => {
                    setActiveCategory(category.id);
                    setOpenFaq(null);
                  }}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
                    isActive
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </motion.button>
              );
            })}
          </motion.div>

          {/* Active Category Header */}
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${activeCategoryInfo?.color} mb-4`}
            >
              {activeCategoryInfo && (
                <activeCategoryInfo.icon className="w-8 h-8 text-white" />
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {activeCategoryInfo?.name}
            </h2>
          </motion.div>

          {/* FAQ List */}
          <motion.div
            key={activeCategory + "-list"}
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-3xl mx-auto space-y-4"
          >
            {filteredFaqs.map((faq, index) => (
              <FAQItem
                key={index}
                faq={faq}
                isOpen={openFaq === index}
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              />
            ))}
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            <Link
              to="/pricing"
              className="card p-6 text-center hover:shadow-xl transition-shadow group"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Start Free Trial</h3>
              <p className="text-gray-600 text-sm">
                Try SACVPN free for 14 days. No credit card required.
              </p>
            </Link>

            <Link
              to="/blog"
              className="card p-6 text-center hover:shadow-xl transition-shadow group"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Read Our Blog</h3>
              <p className="text-gray-600 text-sm">
                In-depth guides and tips for online privacy and security.
              </p>
            </Link>

            <Link
              to="/contact"
              className="card p-6 text-center hover:shadow-xl transition-shadow group"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-purple to-accent-pink flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Contact Support</h3>
              <p className="text-gray-600 text-sm">
                Get help from our team. We respond within hours.
              </p>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Competitor Comparison */}
      <FAQComparison />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-dark-900 via-dark-800 to-brand-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-30" />

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
              Ready to Protect Your Privacy?
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-300 max-w-2xl mx-auto mb-8"
            >
              Join thousands of users who trust SACVPN for their online security.
              Start your 14-day free trial today.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transform hover:-translate-y-0.5 transition-all duration-300"
              >
                <Clock className="w-5 h-5" />
                Start Free Trial
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-white/20 text-white font-bold hover:bg-white/10 transition-all duration-300"
              >
                Contact Us
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
