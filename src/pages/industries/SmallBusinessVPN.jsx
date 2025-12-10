import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Lock, Store, Server, Users, Clock, CheckCircle, ArrowRight, Building, DollarSign } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const features = [
  {
    icon: DollarSign,
    title: "Affordable Pricing",
    description: "Enterprise-grade security at small business prices. No hidden fees, no per-user licensing complexity. Simple, predictable costs."
  },
  {
    icon: Lock,
    title: "Easy Setup",
    description: "No IT department needed. Set up VPN protection for your entire team in under 10 minutes with our guided onboarding."
  },
  {
    icon: Server,
    title: "Protect Business Data",
    description: "Secure customer data, financial records, and business communications with military-grade encryption."
  },
  {
    icon: Shield,
    title: "Cyber Insurance Ready",
    description: "Meet cyber insurance requirements for network security. SACVPN provides documentation for policy compliance."
  },
  {
    icon: Users,
    title: "Grow With You",
    description: "Start with what you need, scale as you grow. Add devices instantly without contract renegotiation."
  },
  {
    icon: Store,
    title: "Multi-Location Support",
    description: "Connect multiple store locations, warehouses, or offices with secure site-to-site VPN tunnels."
  }
];

const useCases = [
  "Secure point-of-sale (POS) systems",
  "Remote employee access",
  "Customer data protection",
  "Business email security",
  "Cloud accounting access",
  "Inventory management systems",
  "Multi-location connectivity",
  "Vendor and supplier portals"
];

const whyChoose = [
  { title: "No IT Required", desc: "Set up in minutes, not days" },
  { title: "Predictable Cost", desc: "Simple per-device pricing" },
  { title: "U.S. Support", desc: "Real help when you need it" },
  { title: "Risk-Free Trial", desc: "14 days free, no card required" }
];

export default function SmallBusinessVPN() {
  return (
    <>
      <Helmet>
        <title>VPN for Small Business | Affordable Business VPN Security | SACVPN</title>
        <meta
          name="description"
          content="Affordable VPN security for small businesses. Easy setup, no IT required. Protect customer data, secure remote workers, and meet cyber insurance requirements."
        />
        <meta
          name="keywords"
          content="small business VPN, affordable business VPN, SMB VPN, business network security, small company VPN, startup VPN, retail VPN, POS security"
        />
        <link rel="canonical" href="https://www.sacvpn.com/industries/small-business" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Small Business VPN Service",
            "name": "SACVPN Small Business VPN Solutions",
            "description": "Affordable, easy-to-use VPN service designed for small businesses and startups.",
            "provider": {
              "@type": "Organization",
              "name": "SACVPN"
            },
            "areaServed": {
              "@type": "Country",
              "name": "United States"
            },
            "audience": {
              "@type": "Audience",
              "audienceType": "Small Businesses and Startups"
            }
          })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-brand-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />

        <div className="container-xl relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <motion.div
                variants={fadeInUp}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-6"
              >
                <Building className="w-4 h-4" />
                <span>Small Business</span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 mb-6"
              >
                VPN Security for{" "}
                <span className="text-gradient-orange">Small Business</span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-lg md:text-xl text-gray-600 mb-8"
              >
                Enterprise-grade protection at prices small businesses can afford.
                No IT department needed, no complex setup. Just security that works.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold shadow-lg shadow-orange-500/25 hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                >
                  <Clock className="w-5 h-5" />
                  Start Free Trial
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all"
                >
                  Request Demo
                </Link>
              </motion.div>

              <motion.p
                variants={fadeInUp}
                className="mt-6 text-sm text-gray-500"
              >
                Starting at $6/device/month. No contracts, cancel anytime.
              </motion.p>
            </div>

            <motion.div
              variants={fadeInUp}
              className="relative"
            >
              <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Store className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Small Business Ready</h3>
                    <p className="text-orange-100">Security made simple</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {["No IT expertise required", "10-minute setup", "Unlimited devices option", "24/7 U.S. support"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-white">
                      <CheckCircle className="w-5 h-5 text-orange-200" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Section */}
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
              Built for Businesses Like Yours
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              We understand small business needs - simple, affordable, effective
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {whyChoose.map((point, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="bg-gradient-to-br from-gray-50 to-orange-50 rounded-2xl p-6 border border-orange-100"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{point.title}</h3>
                <p className="text-gray-600 text-sm">{point.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
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
              Everything Your Business Needs
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Big business security features without the big business complexity
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-white">
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
                className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-6"
              >
                Small Business Use Cases
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-lg text-gray-600 mb-8"
              >
                From retail stores to professional services, SACVPN protects businesses of all types.
              </motion.p>
              <motion.div
                variants={fadeInUp}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {useCases.map((useCase, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{useCase}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Simple, Transparent Pricing</h3>
              <div className="space-y-4">
                {[
                  "Personal Plan: Unlimited devices for individuals",
                  "Business 10: Perfect for teams of 1-10",
                  "Business 50: Growing businesses",
                  "Enterprise: Custom solutions for larger teams",
                  "All plans include 14-day free trial"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-300">
                    <ArrowRight className="w-5 h-5 text-orange-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 mt-6 text-orange-400 font-semibold hover:text-orange-300"
              >
                View all pricing options <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-gray-50">
        <div className="container-xl text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Trusted by Small Businesses
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
              Join thousands of small businesses protecting their operations with SACVPN
            </p>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="text-4xl font-bold text-orange-500 mb-2">60s</div>
                <div className="text-gray-600">Average setup time</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="text-4xl font-bold text-orange-500 mb-2">99.9%</div>
                <div className="text-gray-600">Uptime guarantee</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="text-4xl font-bold text-orange-500 mb-2">24/7</div>
                <div className="text-gray-600">U.S.-based support</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-orange-700 relative overflow-hidden">
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
              Protect Your Business Today
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-orange-100 max-w-2xl mx-auto mb-8"
            >
              Join thousands of small businesses who trust SACVPN for affordable, reliable security.
              Start your 14-day free trial - no credit card required.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-orange-600 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                <Clock className="w-5 h-5" />
                Start Free Trial
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-white/30 text-white font-bold hover:bg-white/10 transition-all"
              >
                Contact Sales
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
