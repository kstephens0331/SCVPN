import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  Lock,
  Globe,
  Gamepad2,
  Building2,
  Users,
  CheckCircle2,
  ArrowRight,
  Play,
  Star,
  TrendingUp,
  Wifi,
  Server,
  Gift,
  Heart,
} from "lucide-react";

// Animation variants
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

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

export default function Home() {
  return (
    <>
      <Helmet>
        <title>SACVPN - Business VPN Solution | Secure Remote Access for Teams & Enterprises</title>
        <meta
          name="description"
          content="SACVPN provides enterprise VPN service powered by WireGuard. Secure remote access for businesses, HIPAA-compliant encryption, team management dashboard, and 14-day free trial. Trusted by healthcare, legal, and financial organizations."
        />
        <meta
          name="keywords"
          content="business VPN solution, enterprise VPN service, secure remote access VPN, corporate VPN network, team VPN management, WireGuard business VPN, HIPAA compliant VPN, remote work security, small business VPN, VPN for companies"
        />
        <link rel="canonical" href="https://www.sacvpn.com/" />
        <meta property="og:title" content="SACVPN - Business VPN Solution for Secure Remote Access" />
        <meta
          property="og:description"
          content="Enterprise-grade VPN service for businesses. Secure remote access, team management, and compliance-ready encryption. Start your 14-day free trial."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.sacvpn.com/" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden -mt-20">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-brand-950">
          {/* Animated gradient orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/30 rounded-full blur-3xl animate-blob" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent-purple/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-accent-cyan/20 rounded-full blur-3xl animate-blob animation-delay-4000" />

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container-xl py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                <Zap className="w-4 h-4 text-accent-lime" />
                <span className="text-sm text-white/90">Powered by WireGuard Protocol</span>
              </motion.div>

              {/* Headline */}
              <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight">
                Secure Your Digital Life with{" "}
                <span className="bg-gradient-to-r from-brand-400 via-accent-cyan to-accent-purple bg-clip-text text-transparent">
                  Next-Gen VPN
                </span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p variants={fadeInUp} className="mt-6 text-lg md:text-xl text-gray-300 max-w-xl mx-auto lg:mx-0">
                Enterprise-grade security meets lightning-fast speeds. Protect unlimited devices, bypass restrictions, and browse with complete privacy.
              </motion.p>

              {/* Free Trial Badge */}
              <motion.div variants={fadeInUp} className="mt-6 inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-accent-lime/20 border border-accent-lime/30">
                <div className="w-10 h-10 rounded-full bg-accent-lime/30 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-accent-lime" />
                </div>
                <div className="text-left">
                  <p className="text-accent-lime font-bold text-lg">14-Day Free Trial</p>
                  <p className="text-gray-400 text-sm">No credit card required</p>
                </div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div variants={fadeInUp} className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/pricing"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-accent-lime to-emerald-500 text-white font-semibold text-lg shadow-lg shadow-accent-lime/30 hover:shadow-xl hover:shadow-accent-lime/40 transform hover:-translate-y-1 transition-all duration-300"
                >
                  Start 14-Day Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white/20 text-white font-semibold text-lg hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
                >
                  <Play className="w-5 h-5" />
                  Learn More
                </Link>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div variants={fadeInUp} className="mt-10 flex flex-wrap items-center gap-6 justify-center lg:justify-start">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-accent-purple border-2 border-dark-900 flex items-center justify-center text-xs font-bold text-white"
                      >
                        {i}K+
                      </div>
                    ))}
                  </div>
                  <span className="text-gray-400 text-sm ml-2">Active Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <span className="text-gray-400 text-sm">4.9/5 Rating</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              {/* Dashboard mockup card */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-500/20 to-accent-purple/20 blur-3xl rounded-3xl" />
                <div className="relative bg-dark-700/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
                  {/* Status header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">VPN Connected</h3>
                        <p className="text-gray-400 text-sm">Your connection is secure</p>
                      </div>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-accent-lime animate-pulse" />
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <TrendingUp className="w-5 h-5 text-brand-400 mb-2" />
                      <p className="text-2xl font-bold text-white">847 Mbps</p>
                      <p className="text-gray-400 text-sm">Download Speed</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <Wifi className="w-5 h-5 text-accent-lime mb-2" />
                      <p className="text-2xl font-bold text-white">12 ms</p>
                      <p className="text-gray-400 text-sm">Latency</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <Globe className="w-5 h-5 text-accent-cyan mb-2" />
                      <p className="text-2xl font-bold text-white">50+</p>
                      <p className="text-gray-400 text-sm">Server Locations</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <Server className="w-5 h-5 text-accent-purple mb-2" />
                      <p className="text-2xl font-bold text-white">5 Gbps</p>
                      <p className="text-gray-400 text-sm">Server Capacity</p>
                    </div>
                  </div>

                  {/* Connection status bar */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-brand-500/20 to-accent-purple/20 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-accent-lime" />
                        <span className="text-white font-medium">256-bit AES Encryption</span>
                      </div>
                      <span className="text-accent-lime text-sm font-medium">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-white/50"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="container-xl">
          {/* Section Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              Why Choose SACVPN
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-gray-900">
              Enterprise Security,{" "}
              <span className="text-gradient">Simple Setup</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Experience the perfect blend of military-grade security and user-friendly design. Get protected in under 60 seconds.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Shield,
                title: "No-Logs Policy",
                description: "We never track, collect, or share your browsing data. Your privacy is our priority.",
                color: "from-brand-500 to-brand-600",
              },
              {
                icon: Zap,
                title: "WireGuard Protocol",
                description: "The fastest, most modern VPN protocol. Up to 3x faster than OpenVPN.",
                color: "from-accent-cyan to-brand-500",
              },
              {
                icon: Globe,
                title: "50+ Locations",
                description: "Connect to servers worldwide. Bypass geo-restrictions and access global content.",
                color: "from-accent-purple to-accent-pink",
              },
              {
                icon: Gamepad2,
                title: "Gaming Optimized",
                description: "Low-latency routes designed for competitive gaming. Reduce ping and packet loss.",
                color: "from-accent-lime to-emerald-500",
              },
              {
                icon: Building2,
                title: "Business Ready",
                description: "Secure your entire team with centralized management and enterprise features.",
                color: "from-orange-500 to-red-500",
              },
              {
                icon: Users,
                title: "Unlimited Devices",
                description: "Protect all your devices with a single subscription. No device limits.",
                color: "from-pink-500 to-accent-purple",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="container-xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-purple/10 text-accent-purple text-sm font-medium mb-4">
              <CheckCircle2 className="w-4 h-4" />
              Simple Setup
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-gray-900">
              Get Protected in{" "}
              <span className="text-gradient">3 Easy Steps</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                step: "01",
                title: "Choose Your Plan",
                description: "Select a plan that fits your needs. Personal, Gaming, or Business - we have you covered.",
                icon: Star,
              },
              {
                step: "02",
                title: "Create Your Device",
                description: "Set up your device in seconds with our intuitive dashboard. No technical knowledge required.",
                icon: Wifi,
              },
              {
                step: "03",
                title: "Connect & Go",
                description: "Scan the QR code or download your config. You're protected in under 60 seconds.",
                icon: Shield,
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="relative text-center"
              >
                {/* Connecting line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-brand-500 to-accent-purple" />
                )}

                {/* Step number */}
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-brand-500 to-accent-purple text-white text-4xl font-bold mb-6 shadow-lg shadow-brand-500/30">
                  {step.step}
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 max-w-xs mx-auto">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-br from-dark-900 via-dark-800 to-brand-950 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-30" />

        <div className="container-xl relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: "50K+", label: "Active Users" },
              { value: "50+", label: "Server Locations" },
              { value: "99.9%", label: "Uptime" },
              { value: "5 Gbps", label: "Server Speed" },
            ].map((stat, index) => (
              <motion.div key={index} variants={scaleIn} className="text-center">
                <div className="text-4xl md:text-5xl lg:text-6xl font-display font-bold bg-gradient-to-r from-white via-brand-200 to-accent-cyan bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <p className="mt-2 text-gray-400 uppercase tracking-wider text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Referral Program Section */}
      <section className="py-24 bg-gray-50">
        <div className="container-xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-pink/10 text-accent-pink text-sm font-medium mb-4">
              <Gift className="w-4 h-4" />
              Referral Program
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-gray-900">
              Share the Love,{" "}
              <span className="text-gradient">Get Rewarded</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Invite your friends to SACVPN and both of you get rewarded. It's our way of saying thank you!
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {/* Step 1 */}
            <motion.div variants={fadeInUp} className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-pink to-accent-purple flex items-center justify-center mx-auto mb-6 shadow-lg shadow-accent-pink/30">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">1. Invite Friends</h3>
              <p className="text-gray-600">Share your unique referral link with friends and family</p>
            </motion.div>

            {/* Step 2 */}
            <motion.div variants={fadeInUp} className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-500/30">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">2. They Subscribe</h3>
              <p className="text-gray-600">When your friend signs up and stays for 1 month</p>
            </motion.div>

            {/* Step 3 */}
            <motion.div variants={fadeInUp} className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-lime to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-accent-lime/30">
                <Gift className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">3. You Both Win</h3>
              <p className="text-gray-600">You get a FREE month of SACVPN!</p>
            </motion.div>
          </motion.div>

          {/* Referral CTA */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mt-16 text-center"
          >
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-white shadow-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8 text-accent-pink" />
                <div className="text-left">
                  <p className="text-gray-900 font-semibold">Refer a friend, get 1 month FREE</p>
                  <p className="text-gray-500 text-sm">No limit on referrals - the more you share, the more you save!</p>
                </div>
              </div>
              <Link
                to="/pricing"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent-pink to-accent-purple text-white font-semibold shadow-lg shadow-accent-purple/25 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap"
              >
                Start Free Trial
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="container-xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-brand-500 to-accent-purple p-12 md:p-16 text-center"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px)`,
                  backgroundSize: "40px 40px",
                }}
              />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                14-Day Free Trial - No Credit Card Required
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-6">
                Ready to Secure Your Digital Life?
              </h2>
              <p className="text-lg text-white/80 mb-8">
                Join thousands of users who trust SACVPN for their online privacy. Start your free 14-day trial today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/pricing"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-brand-600 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  Start 14-Day Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white/30 text-white font-semibold text-lg hover:bg-white/10 transition-all duration-300"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
