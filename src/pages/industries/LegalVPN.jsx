import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Lock, FileText, Server, Users, Clock, CheckCircle, ArrowRight, Scale, Briefcase } from "lucide-react";

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
    title: "Client Confidentiality",
    description: "Military-grade encryption protects attorney-client privileged communications from interception and unauthorized access."
  },
  {
    icon: FileText,
    title: "Secure Document Access",
    description: "Access case files, contracts, and sensitive legal documents securely from court, home, or client locations."
  },
  {
    icon: Server,
    title: "Multi-Office Connectivity",
    description: "Connect branch offices, remote attorneys, and co-counsel with encrypted site-to-site VPN tunnels."
  },
  {
    icon: Shield,
    title: "ABA Compliance",
    description: "Meet American Bar Association cybersecurity guidelines and state bar ethics requirements for protecting client data."
  },
  {
    icon: Users,
    title: "Team Management",
    description: "Centralized dashboard for managing associate, partner, and staff VPN access with role-based permissions."
  },
  {
    icon: Briefcase,
    title: "eDiscovery Security",
    description: "Secure transfer of discovery materials and maintain chain of custody for electronically stored information."
  }
];

const useCases = [
  "Remote court appearances and depositions",
  "Secure access to case management systems",
  "Client document portal security",
  "Multi-office firm connectivity",
  "Remote work for attorneys and staff",
  "Secure email and messaging",
  "eDiscovery document transfer",
  "Public WiFi protection at courts"
];

const ethicsRequirements = [
  { title: "Competence", desc: "Reasonable security measures for client data" },
  { title: "Confidentiality", desc: "Prevent unauthorized access to communications" },
  { title: "Supervision", desc: "Monitor and manage firm-wide access" },
  { title: "Communication", desc: "Secure channels for client communications" }
];

export default function LegalVPN() {
  return (
    <>
      <Helmet>
        <title>VPN for Law Firms & Legal Practices | Attorney VPN Security | SACVPN</title>
        <meta
          name="description"
          content="Secure VPN for law firms and legal practices. Protect attorney-client privilege, secure document access, ABA compliant encryption for solo practitioners to large firms."
        />
        <meta
          name="keywords"
          content="law firm VPN, attorney VPN, legal VPN, lawyer cybersecurity, ABA compliance VPN, legal document security, attorney-client privilege, legal practice security"
        />
        <link rel="canonical" href="https://www.sacvpn.com/industries/legal" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Legal Industry VPN Service",
            "name": "SACVPN Legal VPN Solutions",
            "description": "Secure VPN service for law firms and legal practices, protecting attorney-client privileged communications.",
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
              "audienceType": "Law Firms and Legal Practices"
            }
          })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-brand-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-slate-500/10 rounded-full blur-3xl" />
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-medium mb-6"
              >
                <Scale className="w-4 h-4" />
                <span>Legal Industry</span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 mb-6"
              >
                Secure VPN for{" "}
                <span className="text-gradient-slate">Law Firms</span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-lg md:text-xl text-gray-600 mb-8"
              >
                Protect attorney-client privilege and secure sensitive legal documents.
                Enterprise-grade encryption for solo practitioners, boutique firms, and
                large legal practices.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 text-white font-bold shadow-lg shadow-slate-500/25 hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
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
              <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Scale className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Legal Security</h3>
                    <p className="text-slate-300">Privileged communications protected</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {["256-bit encryption", "ABA ethics compliant", "No activity logs", "U.S.-based support"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-white">
                      <CheckCircle className="w-5 h-5 text-slate-300" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Ethics Compliance Section */}
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
              Meet ABA Cybersecurity Guidelines
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              SACVPN helps your firm comply with ABA Model Rules and state bar ethics requirements
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {ethicsRequirements.map((point, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-slate-100"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center mb-4">
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
              Built for Legal Practice Security
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Enterprise-grade VPN features designed for the unique needs of legal professionals
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
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center mb-6">
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
                Legal Practice Use Cases
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-lg text-gray-600 mb-8"
              >
                From courtroom to corner office, SACVPN secures every aspect of your legal practice.
              </motion.p>
              <motion.div
                variants={fadeInUp}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {useCases.map((useCase, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
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
              <h3 className="text-2xl font-bold text-white mb-6">Why Law Firms Choose SACVPN</h3>
              <div className="space-y-4">
                {[
                  "Simple setup - no IT department required",
                  "Works on all devices (Windows, Mac, iOS, Android)",
                  "Per-attorney or per-device pricing",
                  "24/7 U.S.-based support",
                  "No activity logs - true confidentiality"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-300">
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-700 to-slate-900 relative overflow-hidden">
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
              Protect Your Clients' Confidentiality
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-slate-300 max-w-2xl mx-auto mb-8"
            >
              Join hundreds of law firms who trust SACVPN for secure communications.
              Start your 14-day free trial.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-slate-700 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
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
