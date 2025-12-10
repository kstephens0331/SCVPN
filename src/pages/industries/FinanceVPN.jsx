import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Lock, TrendingUp, Server, Users, Clock, CheckCircle, ArrowRight, Landmark, CreditCard } from "lucide-react";

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
    icon: Lock,
    title: "Bank-Grade Encryption",
    description: "256-bit ChaCha20 encryption protects financial transactions, client portfolios, and sensitive market data from interception."
  },
  {
    icon: TrendingUp,
    title: "Low-Latency Trading",
    description: "WireGuard's optimized protocol minimizes latency for real-time trading platforms, market data feeds, and financial applications."
  },
  {
    icon: Server,
    title: "Secure Branch Connectivity",
    description: "Connect bank branches, trading floors, and remote offices with encrypted site-to-site VPN tunnels."
  },
  {
    icon: Shield,
    title: "Regulatory Compliance",
    description: "Meet SEC, FINRA, SOX, and PCI-DSS requirements with enterprise-grade security controls and audit trails."
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description: "Granular permissions for traders, analysts, compliance officers, and support staff with centralized management."
  },
  {
    icon: CreditCard,
    title: "PCI-DSS Ready",
    description: "Secure cardholder data environments with encrypted connections that meet Payment Card Industry standards."
  }
];

const useCases = [
  "Remote trading and portfolio management",
  "Secure access to banking core systems",
  "Client financial data protection",
  "Multi-branch bank connectivity",
  "Remote work for financial advisors",
  "Secure wire transfer authorization",
  "Compliance audit trail access",
  "Mobile banking app security"
];

const complianceStandards = [
  { title: "SOX", desc: "Financial reporting security" },
  { title: "PCI-DSS", desc: "Cardholder data protection" },
  { title: "SEC/FINRA", desc: "Securities industry compliance" },
  { title: "GLBA", desc: "Customer information safeguards" }
];

export default function FinanceVPN() {
  return (
    <>
      <Helmet>
        <title>VPN for Financial Services | Banking & Trading VPN Security | SACVPN</title>
        <meta
          name="description"
          content="Secure VPN for banks, trading firms, and financial services. PCI-DSS compliant encryption, low-latency trading access, and regulatory compliance for financial institutions."
        />
        <meta
          name="keywords"
          content="financial VPN, banking VPN, trading VPN, financial services VPN, PCI DSS VPN, SOX compliance VPN, bank security, financial institution cybersecurity"
        />
        <link rel="canonical" href="https://www.sacvpn.com/industries/finance" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Financial Services VPN",
            "name": "SACVPN Financial Services VPN Solutions",
            "description": "Secure VPN service for banks, trading firms, and financial institutions with regulatory compliance support.",
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
              "audienceType": "Financial Services Organizations"
            }
          })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-brand-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6"
              >
                <Landmark className="w-4 h-4" />
                <span>Financial Services</span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 mb-6"
              >
                Secure VPN for{" "}
                <span className="text-gradient-blue">Finance</span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-lg md:text-xl text-gray-600 mb-8"
              >
                Protect financial transactions and client data with bank-grade encryption.
                PCI-DSS compliant, low-latency connections for banks, trading firms,
                and financial institutions.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold shadow-lg shadow-blue-500/25 hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
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
            </div>

            <motion.div
              variants={fadeInUp}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Landmark className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Financial Security</h3>
                    <p className="text-blue-100">Enterprise-grade protection</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {["256-bit encryption", "PCI-DSS compliant", "SOX audit ready", "Zero-trust architecture"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-white">
                      <CheckCircle className="w-5 h-5 text-blue-200" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Compliance Section */}
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
              Regulatory Compliance Support
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              SACVPN helps financial institutions meet regulatory requirements
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {complianceStandards.map((point, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-blue-100"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-4">
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
              Built for Financial Security
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Enterprise-grade VPN features designed for the unique demands of financial services
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
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center mb-6">
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
                Financial Services Use Cases
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-lg text-gray-600 mb-8"
              >
                From trading floors to remote advisors, SACVPN secures every aspect of your financial operations.
              </motion.p>
              <motion.div
                variants={fadeInUp}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {useCases.map((useCase, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
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
              <h3 className="text-2xl font-bold text-white mb-6">Why Financial Institutions Choose SACVPN</h3>
              <div className="space-y-4">
                {[
                  "Deploy globally in minutes",
                  "Low-latency optimized for trading",
                  "Scales from small firms to enterprises",
                  "Dedicated account management",
                  "SOC 2 Type II certified infrastructure"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-300">
                    <ArrowRight className="w-5 h-5 text-blue-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
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
              Secure Your Financial Operations
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-blue-100 max-w-2xl mx-auto mb-8"
            >
              Join financial institutions across the country who trust SACVPN for compliance-ready security.
              Start your 14-day free trial.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-blue-600 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
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
