import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Lock, FileCheck, Server, Users, Clock, CheckCircle, ArrowRight, Building2, Activity } from "lucide-react";

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
    title: "HIPAA-Compliant Encryption",
    description: "WireGuard's ChaCha20 encryption exceeds HIPAA technical safeguard requirements for protecting electronic Protected Health Information (ePHI)."
  },
  {
    icon: FileCheck,
    title: "Audit-Ready Logging",
    description: "Centralized device management with audit trails for compliance reporting. Track who accessed what, when - without storing patient data."
  },
  {
    icon: Server,
    title: "Secure Remote Access",
    description: "Enable clinicians, nurses, and staff to securely access EHR systems, patient records, and medical applications from any location."
  },
  {
    icon: Shield,
    title: "Zero-Trust Architecture",
    description: "Every device is authenticated before network access. Protect against unauthorized access to sensitive healthcare systems."
  },
  {
    icon: Users,
    title: "Multi-Site Connectivity",
    description: "Connect hospitals, clinics, labs, and remote offices with encrypted site-to-site VPN tunnels."
  },
  {
    icon: Activity,
    title: "24/7 Uptime Monitoring",
    description: "Critical healthcare operations require always-on connectivity. Real-time monitoring ensures your VPN never goes down."
  }
];

const useCases = [
  "Telehealth & remote patient consultations",
  "EHR/EMR remote access for clinicians",
  "Medical imaging transfer between facilities",
  "Lab result sharing across locations",
  "Remote work for administrative staff",
  "HIPAA-compliant email and messaging",
  "Insurance claim processing",
  "Patient portal backend security"
];

const compliancePoints = [
  { title: "Access Control", desc: "Device-level authentication and authorization" },
  { title: "Audit Controls", desc: "Activity logging for compliance audits" },
  { title: "Integrity Controls", desc: "Data encryption in transit" },
  { title: "Transmission Security", desc: "End-to-end encrypted connections" }
];

export default function HealthcareVPN() {
  return (
    <>
      <Helmet>
        <title>HIPAA Compliant VPN for Healthcare | Medical VPN Security | SACVPN</title>
        <meta
          name="description"
          content="Secure VPN solution for healthcare organizations. HIPAA-compliant encryption, EHR remote access, telehealth security, and multi-site connectivity for hospitals and clinics."
        />
        <meta
          name="keywords"
          content="HIPAA VPN, healthcare VPN, medical VPN, hospital VPN, clinic VPN, EHR VPN, telehealth security, healthcare cybersecurity, HIPAA compliant, ePHI protection"
        />
        <link rel="canonical" href="https://www.sacvpn.com/industries/healthcare" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Healthcare VPN Service",
            "name": "SACVPN Healthcare VPN Solutions",
            "description": "HIPAA-compliant VPN service for healthcare organizations including hospitals, clinics, and medical practices.",
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
              "audienceType": "Healthcare Organizations"
            }
          })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-brand-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-6"
              >
                <Shield className="w-4 h-4" />
                <span>HIPAA Compliant</span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 mb-6"
              >
                Secure VPN for{" "}
                <span className="text-gradient-emerald">Healthcare</span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-lg md:text-xl text-gray-600 mb-8"
              >
                Protect patient data and enable secure remote access for your healthcare organization.
                HIPAA-compliant encryption, telehealth security, and multi-site connectivity built for
                hospitals, clinics, and medical practices.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/25 hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
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
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Healthcare Security</h3>
                    <p className="text-emerald-100">Enterprise-grade protection</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {["256-bit AES encryption", "HIPAA BAA available", "SOC 2 Type II compliant", "Zero-knowledge architecture"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-white">
                      <CheckCircle className="w-5 h-5 text-emerald-200" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* HIPAA Compliance Section */}
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
              HIPAA Technical Safeguards
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              SACVPN meets the technical safeguard requirements under the HIPAA Security Rule
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {compliancePoints.map((point, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-2xl p-6 border border-emerald-100"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center mb-4">
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
              Built for Healthcare Security
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Enterprise-grade VPN features designed specifically for healthcare compliance and operations
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
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-6">
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
                Healthcare Use Cases
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-lg text-gray-600 mb-8"
              >
                From telehealth to EHR access, SACVPN secures every aspect of your healthcare IT infrastructure.
              </motion.p>
              <motion.div
                variants={fadeInUp}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {useCases.map((useCase, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
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
              <h3 className="text-2xl font-bold text-white mb-6">Why Healthcare Organizations Choose SACVPN</h3>
              <div className="space-y-4">
                {[
                  "Deploy in minutes, not weeks",
                  "No hardware to install or maintain",
                  "Per-device pricing scales with your organization",
                  "Dedicated account manager for Enterprise plans",
                  "Business Associate Agreement (BAA) available"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-300">
                    <ArrowRight className="w-5 h-5 text-emerald-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 to-emerald-800 relative overflow-hidden">
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
              Protect Your Patients' Data Today
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-emerald-100 max-w-2xl mx-auto mb-8"
            >
              Join healthcare organizations across the country who trust SACVPN for HIPAA-compliant security.
              Start your 14-day free trial.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-emerald-600 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
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
