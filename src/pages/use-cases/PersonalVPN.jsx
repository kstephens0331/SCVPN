import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, EyeOff, Wifi, Globe, Clock, CheckCircle, ArrowRight, UserCheck, Ban, Fingerprint, ShieldCheck } from "lucide-react";

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
    icon: EyeOff,
    title: "Hide Your IP Address",
    description: "Your IP address reveals your location and can be used to track you. SACVPN masks your real IP so websites and apps can't identify you."
  },
  {
    icon: Lock,
    title: "Bank-Grade Encryption",
    description: "256-bit AES encryption protects everything you do online. Your passwords, messages, and browsing are completely private."
  },
  {
    icon: Wifi,
    title: "Public WiFi Security",
    description: "Coffee shops, airports, hotels - public WiFi is a hacker's playground. SACVPN encrypts your connection on any network."
  },
  {
    icon: Ban,
    title: "Block Trackers & Ads",
    description: "Stop advertisers from following you across the web. Our DNS-level blocking removes trackers before they load."
  },
  {
    icon: Fingerprint,
    title: "Prevent Fingerprinting",
    description: "Websites create unique profiles based on your device. A VPN is your first defense against browser fingerprinting."
  },
  {
    icon: Globe,
    title: "Access Content Anywhere",
    description: "Watch your favorite shows while traveling, access region-locked content, and browse without geographic restrictions."
  }
];

const threats = [
  {
    title: "ISP Monitoring",
    description: "Your internet provider sees every site you visit and can sell that data to advertisers.",
    icon: Eye
  },
  {
    title: "Public WiFi Hackers",
    description: "Hackers on public networks can intercept passwords, credit cards, and private messages.",
    icon: Wifi
  },
  {
    title: "Government Surveillance",
    description: "Mass surveillance programs collect data on millions of innocent people.",
    icon: Shield
  },
  {
    title: "Corporate Tracking",
    description: "Tech companies build profiles on you based on every click, search, and purchase.",
    icon: UserCheck
  }
];

const useCases = [
  "Secure online banking",
  "Private browsing",
  "Streaming while traveling",
  "Protect family devices",
  "Safe public WiFi use",
  "Block targeted ads",
  "Secure video calls",
  "Anonymous research"
];

const privacyCommitments = [
  { title: "No Logs", desc: "We never record what you browse" },
  { title: "No Selling Data", desc: "Your data is yours alone" },
  { title: "Kill Switch", desc: "Protection even if connection drops" },
  { title: "US-Based", desc: "Strong privacy laws protect you" }
];

export default function PersonalVPN() {
  return (
    <>
      <Helmet>
        <title>Personal VPN for Privacy | Protect Your Online Privacy | SACVPN</title>
        <meta
          name="description"
          content="Take back your online privacy. SACVPN hides your IP, encrypts your data, and blocks trackers. Secure your personal browsing on any device."
        />
        <meta
          name="keywords"
          content="personal VPN, privacy VPN, secure VPN, hide IP address, online privacy, VPN for privacy, anonymous browsing, private internet, encrypt connection, secure WiFi"
        />
        <link rel="canonical" href="https://www.sacvpn.com/personal" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Personal VPN Service",
            "name": "SACVPN Personal Privacy VPN",
            "description": "Personal VPN service for online privacy, secure browsing, and protection on any network.",
            "provider": {
              "@type": "Organization",
              "name": "SACVPN"
            },
            "areaServed": {
              "@type": "Country",
              "name": "Worldwide"
            },
            "audience": {
              "@type": "Audience",
              "audienceType": "Privacy-Conscious Individuals"
            }
          })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-green-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />

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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-6"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Personal Privacy</span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 mb-6"
              >
                Your Privacy Is{" "}
                <span className="text-gradient">Worth Protecting</span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-lg md:text-xl text-gray-600 mb-8"
              >
                Every website you visit, every search you make, every app you use - it's all being tracked.
                SACVPN puts you back in control with military-grade encryption and zero logging.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                <Link
                  to="/download"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold shadow-lg shadow-brand-500/25 hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                >
                  <Shield className="w-5 h-5" />
                  Protect My Privacy
                </Link>
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all"
                >
                  <Clock className="w-5 h-5" />
                  14-Day Free Trial
                </Link>
              </motion.div>
            </div>

            <motion.div
              variants={fadeInUp}
              className="relative"
            >
              <div className="bg-gradient-to-br from-brand-600 to-green-600 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Privacy Protected</h3>
                    <p className="text-brand-100">Your data, encrypted</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {["256-bit AES encryption", "Zero activity logs", "IP address hidden", "Tracker blocking", "Kill switch enabled"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-white">
                      <CheckCircle className="w-5 h-5 text-green-200" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Privacy Commitments */}
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
              Our Privacy Promise
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Privacy isn't just a feature - it's our entire mission
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {privacyCommitments.map((point, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="bg-gradient-to-br from-gray-50 to-brand-50 rounded-2xl p-6 border border-brand-100"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{point.title}</h3>
                <p className="text-gray-600 text-sm">{point.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Threats Section */}
      <section className="py-20 bg-gray-900">
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
              className="text-3xl md:text-4xl font-display font-bold text-white mb-4"
            >
              Who's Watching You Online?
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-400 max-w-2xl mx-auto"
            >
              Without a VPN, your online activity is exposed to multiple parties
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {threats.map((threat, i) => {
              const Icon = threat.icon;
              return (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="bg-gray-800/50 rounded-2xl p-6 border border-red-500/20"
                >
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="font-bold text-white mb-2">{threat.title}</h3>
                  <p className="text-gray-400 text-sm">{threat.description}</p>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mt-12 text-center"
          >
            <p className="text-lg text-gray-300 mb-6">
              SACVPN blocks all of these threats with one click.
            </p>
            <Link
              to="/download"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold shadow-lg shadow-brand-500/25 hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              <Shield className="w-5 h-5" />
              Start Protecting Myself
            </Link>
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
              Complete Privacy Protection
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Everything you need to browse privately and securely
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
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-green-600 flex items-center justify-center mb-6">
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
                Protect Every Part of Your Digital Life
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-lg text-gray-600 mb-8"
              >
                From banking to browsing, streaming to shopping - SACVPN keeps your personal data private.
              </motion.p>
              <motion.div
                variants={fadeInUp}
                className="grid grid-cols-2 gap-4"
              >
                {useCases.map((useCase, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
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
              <h3 className="text-2xl font-bold text-white mb-6">Simple Setup</h3>
              <div className="space-y-4">
                {[
                  "1. Download SACVPN app",
                  "2. Create your account",
                  "3. Tap to connect",
                  "4. Browse privately"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-300">
                    <ArrowRight className="w-5 h-5 text-brand-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-gray-400 text-sm">
                  Works on Windows, Mac, iOS, Android, and Linux. Protect up to 5 devices with one account.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-brand-600 to-green-600 relative overflow-hidden">
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
              Take Back Your Privacy Today
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-brand-100 max-w-2xl mx-auto mb-8"
            >
              Join millions who refuse to be tracked online.
              Start your 14-day free trial - no credit card required.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
              <Link
                to="/download"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-brand-600 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                <Shield className="w-5 h-5" />
                Download Free
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
