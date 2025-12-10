import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Globe,
  Shield,
  AlertTriangle,
  CheckCircle,
  Copy,
  RefreshCw,
  MapPin,
  Server,
  Wifi,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Clock
} from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function Tools() {
  const [ipData, setIpData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchIP = async () => {
    setLoading(true);
    setError(null);
    try {
      // Using ipapi.co for IP geolocation (free tier available)
      const response = await fetch("https://ipapi.co/json/");
      if (!response.ok) throw new Error("Failed to fetch IP data");
      const data = await response.json();
      setIpData(data);
    } catch (err) {
      setError("Unable to fetch IP information. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIP();
  }, []);

  const copyToClipboard = () => {
    if (ipData?.ip) {
      navigator.clipboard.writeText(ipData.ip);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isVPNLikely = ipData?.org?.toLowerCase().includes("vpn") ||
                       ipData?.org?.toLowerCase().includes("proxy") ||
                       ipData?.org?.toLowerCase().includes("hosting");

  return (
    <>
      <Helmet>
        <title>Free IP Lookup Tool - What Is My IP Address | SACVPN</title>
        <meta
          name="description"
          content="Free IP address lookup tool. Check your public IP address, location, ISP, and see if your connection is exposed. Protect your privacy with SACVPN."
        />
        <meta
          name="keywords"
          content="what is my IP, IP address lookup, check my IP, IP location, my public IP, IP checker, VPN test, privacy check"
        />
        <link rel="canonical" href="https://www.sacvpn.com/tools" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "SACVPN IP Lookup Tool",
            "description": "Free tool to check your public IP address, location, and connection security status.",
            "applicationCategory": "SecurityApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "provider": {
              "@type": "Organization",
              "name": "SACVPN"
            }
          })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-accent-cyan/5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl" />

        <div className="container-xl relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-6"
            >
              <Globe className="w-4 h-4" />
              <span>Free Privacy Tools</span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900"
            >
              What Is My{" "}
              <span className="text-gradient">IP Address?</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mt-6 text-lg md:text-xl text-gray-600"
            >
              Check your public IP address, location, and see what information websites can see about you.
              Your IP address reveals more than you think.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* IP Display Section */}
      <section className="py-12 bg-white">
        <div className="container-xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-4xl mx-auto"
          >
            {/* Main IP Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 shadow-2xl">
              {loading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-12 h-12 text-brand-400 animate-spin mx-auto mb-4" />
                  <p className="text-gray-400">Detecting your IP address...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-4">{error}</p>
                  <button
                    onClick={fetchIP}
                    className="px-6 py-3 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-400 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  {/* IP Address Display */}
                  <div className="text-center mb-8">
                    <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Your Public IP Address</p>
                    <div className="flex items-center justify-center gap-4">
                      <h2 className="text-4xl md:text-5xl font-mono font-bold text-white">
                        {ipData?.ip || "Unknown"}
                      </h2>
                      <button
                        onClick={copyToClipboard}
                        className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                        title="Copy IP address"
                      >
                        {copied ? (
                          <CheckCircle className="w-6 h-6 text-green-400" />
                        ) : (
                          <Copy className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {copied && (
                      <p className="text-green-400 text-sm mt-2">Copied to clipboard!</p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="flex justify-center mb-8">
                    {isVPNLikely ? (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                        <Shield className="w-5 h-5 text-green-400" />
                        <span className="text-green-300 font-medium">VPN/Proxy Detected - Good!</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <span className="text-red-300 font-medium">Your Real IP Is Exposed</span>
                      </div>
                    )}
                  </div>

                  {/* IP Details Grid */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <MapPin className="w-5 h-5 text-brand-400" />
                        <span className="text-gray-400 text-sm">Location</span>
                      </div>
                      <p className="text-white font-medium">
                        {ipData?.city || "Unknown"}, {ipData?.region || ""} {ipData?.country_name || ""}
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <Server className="w-5 h-5 text-accent-cyan" />
                        <span className="text-gray-400 text-sm">ISP / Organization</span>
                      </div>
                      <p className="text-white font-medium truncate">
                        {ipData?.org || "Unknown"}
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <Globe className="w-5 h-5 text-accent-purple" />
                        <span className="text-gray-400 text-sm">Country Code</span>
                      </div>
                      <p className="text-white font-medium">
                        {ipData?.country_code || "Unknown"}
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <Wifi className="w-5 h-5 text-accent-lime" />
                        <span className="text-gray-400 text-sm">IP Version</span>
                      </div>
                      <p className="text-white font-medium">
                        {ipData?.version || (ipData?.ip?.includes(":") ? "IPv6" : "IPv4")}
                      </p>
                    </div>
                  </div>

                  {/* Refresh Button */}
                  <div className="text-center mt-6">
                    <button
                      onClick={fetchIP}
                      className="inline-flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Privacy Warning Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
                What Your IP Address Reveals
              </h2>
              <p className="text-lg text-gray-600">
                Without a VPN, websites, advertisers, and hackers can see this information about you
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[
                {
                  icon: MapPin,
                  title: "Physical Location",
                  description: "Your city, region, and country can be determined from your IP address",
                  color: "from-red-500 to-orange-500",
                },
                {
                  icon: Server,
                  title: "Internet Provider",
                  description: "Your ISP is visible, which can be used to identify your household",
                  color: "from-yellow-500 to-amber-500",
                },
                {
                  icon: Eye,
                  title: "Browsing Activity",
                  description: "Websites track your IP to build a profile of your online behavior",
                  color: "from-purple-500 to-pink-500",
                },
                {
                  icon: Globe,
                  title: "Network Type",
                  description: "Whether you're on home WiFi, mobile data, or public networks",
                  color: "from-blue-500 to-cyan-500",
                },
                {
                  icon: AlertTriangle,
                  title: "Security Risks",
                  description: "Hackers can target your IP for DDoS attacks or intrusion attempts",
                  color: "from-red-600 to-red-500",
                },
                {
                  icon: EyeOff,
                  title: "No Privacy",
                  description: "Every website you visit logs your IP address in their server records",
                  color: "from-gray-600 to-gray-500",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-4`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How VPN Protects Section */}
      <section className="py-16 bg-white">
        <div className="container-xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
                How a VPN Protects Your Privacy
              </h2>
              <p className="text-lg text-gray-600">
                SACVPN masks your real IP address and encrypts your internet connection
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl p-8 md:p-12"
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">With SACVPN:</h3>
                  <ul className="space-y-4">
                    {[
                      "Your real IP is hidden from websites",
                      "Your traffic is encrypted with WireGuard",
                      "Your ISP can't see what you browse",
                      "You appear to be in a different location",
                      "Hackers can't target your real IP",
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3 text-white">
                        <CheckCircle className="w-5 h-5 text-accent-lime flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-center">
                  <div className="inline-block bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
                    <Lock className="w-16 h-16 text-accent-lime mx-auto mb-4" />
                    <p className="text-white font-bold text-xl mb-2">Your IP with VPN:</p>
                    <p className="text-accent-lime font-mono text-lg">Protected</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Related Resources */}
      <section className="py-16 bg-gray-50">
        <div className="container-xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-4xl mx-auto"
          >
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Learn More About VPN Security</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <Link to="/blog/what-is-vpn-complete-guide" className="block p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <h4 className="font-semibold text-gray-900 mb-2">What Is a VPN?</h4>
                <p className="text-gray-600 text-sm">Complete guide to VPN technology and how it protects you</p>
              </Link>
              <Link to="/blog/public-wifi-security-risks" className="block p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <h4 className="font-semibold text-gray-900 mb-2">Public WiFi Dangers</h4>
                <p className="text-gray-600 text-sm">Why you need a VPN on public networks</p>
              </Link>
              <Link to="/blog/protect-privacy-online-2025" className="block p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <h4 className="font-semibold text-gray-900 mb-2">Online Privacy Guide</h4>
                <p className="text-gray-600 text-sm">Tips to protect your privacy in 2025</p>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

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
              Ready to Hide Your IP Address?
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-300 max-w-2xl mx-auto mb-8"
            >
              Protect your privacy with SACVPN. Start your 14-day free trial and browse anonymously.
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
                to="/blog/what-is-vpn-complete-guide"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-white/20 text-white font-bold hover:bg-white/10 transition-all duration-300"
              >
                Learn About VPNs
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
