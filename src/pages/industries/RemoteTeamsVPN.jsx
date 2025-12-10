import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Lock, Laptop, Server, Users, Clock, CheckCircle, ArrowRight, Globe, Wifi } from "lucide-react";

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
    title: "Zero-Trust Security",
    description: "Every device and user is verified before accessing company resources. No implicit trust, regardless of network location."
  },
  {
    icon: Wifi,
    title: "Public WiFi Protection",
    description: "Employees work safely from coffee shops, airports, and hotels. Encrypted connections prevent eavesdropping and man-in-the-middle attacks."
  },
  {
    icon: Server,
    title: "Secure Cloud Access",
    description: "Connect remote workers to AWS, Azure, Google Cloud, and on-premise resources through encrypted tunnels."
  },
  {
    icon: Laptop,
    title: "BYOD Support",
    description: "Secure bring-your-own-device policies with per-device VPN profiles. Works on Windows, Mac, iOS, Android, and Linux."
  },
  {
    icon: Users,
    title: "Team Management",
    description: "Centralized dashboard to onboard/offboard employees, manage device access, and monitor team connectivity."
  },
  {
    icon: Globe,
    title: "Global Performance",
    description: "Servers in North America, Europe, and Asia ensure fast connections for distributed teams worldwide."
  }
];

const useCases = [
  "Work-from-home employee security",
  "Secure access to company resources",
  "Video conferencing privacy",
  "Cloud application access (SaaS)",
  "International team connectivity",
  "Contractor and vendor access",
  "Company-wide device management",
  "Remote IT administration"
];

const benefits = [
  { title: "Productivity", desc: "Fast connections don't slow down your team" },
  { title: "Security", desc: "Enterprise-grade protection everywhere" },
  { title: "Simplicity", desc: "One-click connect, zero IT overhead" },
  { title: "Scalability", desc: "Add team members in seconds" }
];

export default function RemoteTeamsVPN() {
  return (
    <>
      <Helmet>
        <title>VPN for Remote Teams & Work From Home | Business Remote Access | SACVPN</title>
        <meta
          name="description"
          content="Secure VPN for remote teams and distributed workforces. Zero-trust security, public WiFi protection, and easy team management for work-from-home employees."
        />
        <meta
          name="keywords"
          content="remote team VPN, work from home VPN, remote work security, distributed team VPN, remote access VPN, business VPN, team VPN management, WFH security"
        />
        <link rel="canonical" href="https://www.sacvpn.com/industries/remote-teams" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Remote Teams VPN Service",
            "name": "SACVPN Remote Teams VPN Solutions",
            "description": "Secure VPN service for remote teams and distributed workforces, enabling secure work from anywhere.",
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
              "audienceType": "Businesses with Remote Workers"
            }
          })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-brand-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-6"
              >
                <Globe className="w-4 h-4" />
                <span>Remote Work</span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 mb-6"
              >
                Secure VPN for{" "}
                <span className="text-gradient-purple">Remote Teams</span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-lg md:text-xl text-gray-600 mb-8"
              >
                Empower your distributed workforce with enterprise-grade security.
                Zero-trust architecture, public WiFi protection, and simple team
                management for modern businesses.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold shadow-lg shadow-purple-500/25 hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
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
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Team Security</h3>
                    <p className="text-purple-100">Work anywhere, securely</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {["Zero-trust architecture", "One-click connect", "Cross-platform support", "Centralized management"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-white">
                      <CheckCircle className="w-5 h-5 text-purple-200" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
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
              Why Remote Teams Choose SACVPN
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Security that enables productivity, not slows it down
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {benefits.map((point, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl p-6 border border-purple-100"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center mb-4">
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
              Built for Distributed Workforces
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Enterprise-grade VPN features that modern remote teams need
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
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center mb-6">
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
                Remote Work Use Cases
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-lg text-gray-600 mb-8"
              >
                From home offices to coffee shops, SACVPN keeps your team connected and secure.
              </motion.p>
              <motion.div
                variants={fadeInUp}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {useCases.map((useCase, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
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
              <h3 className="text-2xl font-bold text-white mb-6">Get Started in Minutes</h3>
              <div className="space-y-4">
                {[
                  "1. Sign up and create your team",
                  "2. Invite team members via email",
                  "3. Employees install and connect",
                  "4. Manage access from your dashboard",
                  "5. Monitor team connectivity"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-300">
                    <ArrowRight className="w-5 h-5 text-purple-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-purple-800 relative overflow-hidden">
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
              Secure Your Remote Workforce
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-purple-100 max-w-2xl mx-auto mb-8"
            >
              Join thousands of businesses who trust SACVPN for remote team security.
              Start your 14-day free trial.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-purple-600 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
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
