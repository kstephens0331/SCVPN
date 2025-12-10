import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { trackDownload, trackPlatformSelected } from "../lib/analytics";
import {
  Download as DownloadIcon,
  Monitor,
  Apple,
  Smartphone,
  Shield,
  Zap,
  Lock,
  Globe,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  Cpu,
  HardDrive,
  Wifi,
  Eye,
  Server,
  Terminal,
  ExternalLink,
  Star,
  Award,
  Clock,
  ArrowRight,
  Play,
  X,
  Bell,
  Mail,
} from "lucide-react";

// Platform detection
function detectPlatform() {
  if (typeof window === "undefined") return "windows";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("mac")) return "macos";
  if (ua.includes("linux")) return "linux";
  if (ua.includes("android")) return "android";
  if (ua.includes("iphone") || ua.includes("ipad")) return "ios";
  return "windows";
}

const platforms = {
  windows: {
    name: "Windows",
    icon: Monitor,
    version: "1.0.0",
    size: "3 MB",
    requirements: "Windows 10/11 (64-bit)",
    downloadUrl: "https://github.com/kstephens0331/sacvpn-desktop/releases/latest/download/SACVPN_1.0.0_x64-setup.exe",
    downloadUrlMsi: "https://github.com/kstephens0331/sacvpn-desktop/releases/latest/download/SACVPN_1.0.0_x64_en-US.msi",
    fileName: "SACVPN_1.0.0_x64-setup.exe",
    featured: true,
  },
  macos: {
    name: "macOS",
    icon: Apple,
    version: "1.0.0",
    size: "42 MB",
    requirements: "macOS 10.15+",
    downloadUrl: null, // Set to actual URL when builds are ready
    fileName: "SACVPN-1.0.0.dmg",
    featured: true,
  },
  linux: {
    name: "Linux",
    icon: Terminal,
    version: "1.0.0",
    size: "38 MB",
    requirements: "Ubuntu 20.04+, Debian 11+, Fedora 35+",
    downloadUrl: null, // Set to actual URL when builds are ready
    fileName: "sacvpn-1.0.0.deb",
    featured: false,
  },
  android: {
    name: "Android",
    icon: Smartphone,
    version: "1.0.0",
    size: "28 MB",
    requirements: "Android 8.0+",
    downloadUrl: null,
    fileName: "SACVPN-1.0.0.apk",
    featured: false,
    comingSoon: true,
  },
  ios: {
    name: "iOS",
    icon: Apple,
    version: "1.0.0",
    size: "32 MB",
    requirements: "iOS 14+",
    downloadUrl: null,
    fileName: "App Store",
    featured: false,
    comingSoon: true,
  },
};

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "WireGuard protocol delivers speeds up to 5x faster than traditional VPNs",
    color: "text-yellow-400",
    bg: "bg-yellow-500/20",
  },
  {
    icon: Shield,
    title: "Military-Grade Encryption",
    description: "AES-256 encryption protects your data from hackers and surveillance",
    color: "text-green-400",
    bg: "bg-green-500/20",
  },
  {
    icon: Eye,
    title: "Zero-Log Policy",
    description: "We never track, store, or share your browsing activity. Ever.",
    color: "text-blue-400",
    bg: "bg-blue-500/20",
  },
  {
    icon: Globe,
    title: "Global Network",
    description: "10+ server locations worldwide for unrestricted access",
    color: "text-purple-400",
    bg: "bg-purple-500/20",
  },
  {
    icon: Lock,
    title: "Kill Switch",
    description: "Automatic protection if VPN connection drops unexpectedly",
    color: "text-red-400",
    bg: "bg-red-500/20",
  },
  {
    icon: Server,
    title: "Split Tunneling",
    description: "Choose which apps use VPN and which use regular connection",
    color: "text-cyan-400",
    bg: "bg-cyan-500/20",
  },
];

const installSteps = {
  windows: [
    { step: 1, title: "Download", description: "Click the download button to get the installer" },
    { step: 2, title: "Run Installer", description: "Double-click the .msi file and follow prompts" },
    { step: 3, title: "Sign In", description: "Launch SACVPN and sign in with your account" },
    { step: 4, title: "Connect", description: "Click the connect button to secure your connection" },
  ],
  macos: [
    { step: 1, title: "Download", description: "Click the download button to get the DMG file" },
    { step: 2, title: "Install", description: "Open the DMG and drag SACVPN to Applications" },
    { step: 3, title: "Authorize", description: "Allow system extension in Security preferences" },
    { step: 4, title: "Connect", description: "Launch SACVPN, sign in, and connect" },
  ],
  linux: [
    { step: 1, title: "Download", description: "Download the .deb or .rpm package" },
    { step: 2, title: "Install", description: "Run: sudo dpkg -i sacvpn.deb" },
    { step: 3, title: "Configure", description: "Run: sacvpn login" },
    { step: 4, title: "Connect", description: "Run: sacvpn connect" },
  ],
};

export default function Download() {
  const [detectedPlatform, setDetectedPlatform] = useState("windows");
  const [selectedPlatform, setSelectedPlatform] = useState("windows");
  const [showAllPlatforms, setShowAllPlatforms] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadingPlatform, setDownloadingPlatform] = useState(null);

  useEffect(() => {
    const platform = detectPlatform();
    setDetectedPlatform(platform);
    setSelectedPlatform(platform);
  }, []);

  // Handle download click
  const handleDownload = (platformKey) => {
    const platform = platforms[platformKey];

    if (platform.comingSoon) {
      return; // Already handled by "Coming Soon" button
    }

    if (platform.downloadUrl) {
      // Track the download event
      const fileExt = platform.fileName?.split('.').pop() || 'exe';
      trackDownload(platform.name, fileExt);
      // If we have a real download URL, trigger the download
      window.open(platform.downloadUrl, '_blank');
    } else {
      // Show modal that download is being prepared
      setDownloadingPlatform(platformKey);
      setShowDownloadModal(true);
    }
  };

  const currentPlatform = platforms[selectedPlatform];
  const PlatformIcon = currentPlatform.icon;

  // Auto-advance installation steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Helmet>
        <title>Download Business VPN Client - Windows, Mac, Linux | SACVPN</title>
        <meta
          name="description"
          content="Download SACVPN business VPN client for Windows, macOS, and Linux. Enterprise-grade WireGuard encryption, centralized team deployment, and 14-day free trial for businesses."
        />
        <meta
          name="keywords"
          content="download business VPN, enterprise VPN client, corporate VPN download, Windows VPN client, Mac VPN client, team VPN deployment"
        />
        <link rel="canonical" href="https://www.sacvpn.com/download" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent-purple/10 rounded-full blur-[100px] animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-cyan/5 rounded-full blur-[150px]" />
          </div>

          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />

          <div className="relative max-w-7xl mx-auto px-6">
            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mb-8"
            >
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="flex -space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <span className="text-white/80 text-sm font-medium">Trusted by 10,000+ users</span>
                <Award className="w-4 h-4 text-brand-400" />
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center max-w-4xl mx-auto mb-12"
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="text-white">Download </span>
                <span className="bg-gradient-to-r from-brand-400 via-accent-cyan to-accent-purple bg-clip-text text-transparent">
                  SACVPN
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-400 leading-relaxed">
                Protect your privacy with the fastest VPN powered by{" "}
                <span className="text-brand-400 font-semibold">WireGuard</span>
              </p>
            </motion.div>

            {/* Main Download Card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 via-accent-cyan to-accent-purple rounded-3xl blur-xl opacity-30" />

                {/* Card */}
                <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
                  {/* Detected Platform Banner */}
                  {detectedPlatform === selectedPlatform && (
                    <div className="bg-gradient-to-r from-brand-500/20 to-accent-cyan/20 px-6 py-3 border-b border-white/10">
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-white/80">
                          We detected you're using <span className="text-white font-semibold">{currentPlatform.name}</span>
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-8 md:p-10">
                    {/* Platform Icon & Info */}
                    <div className="flex flex-col items-center text-center mb-8">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center mb-6 shadow-2xl shadow-brand-500/30">
                        <PlatformIcon className="w-12 h-12 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-2">
                        SACVPN for {currentPlatform.name}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>Version {currentPlatform.version}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-600" />
                        <span>{currentPlatform.size}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-600" />
                        <span>{currentPlatform.requirements}</span>
                      </div>
                    </div>

                    {/* Download Button */}
                    {currentPlatform.comingSoon ? (
                      <div className="mb-6">
                        <button
                          disabled
                          className="w-full py-5 rounded-2xl bg-gray-800 text-gray-400 font-bold text-lg cursor-not-allowed"
                        >
                          Coming Soon
                        </button>
                        <p className="text-center text-gray-500 text-sm mt-3">
                          Mobile apps are currently in development
                        </p>
                      </div>
                    ) : (
                      <div className="mb-6">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleDownload(selectedPlatform)}
                          className="w-full py-5 rounded-2xl bg-gradient-to-r from-brand-500 via-accent-cyan to-brand-500 bg-[length:200%_100%] hover:bg-right text-white font-bold text-lg shadow-2xl shadow-brand-500/30 transition-all duration-500 flex items-center justify-center gap-3"
                        >
                          <DownloadIcon className="w-6 h-6" />
                          Download for {currentPlatform.name}
                          <ArrowRight className="w-5 h-5" />
                        </motion.button>
                        <p className="text-center text-gray-500 text-sm mt-3">
                          Free 14-day trial • No credit card required
                        </p>
                        {/* Enterprise MSI option for Windows */}
                        {selectedPlatform === "windows" && currentPlatform.downloadUrlMsi && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-center text-gray-400 text-sm mb-2">
                              <strong>Enterprise deployment?</strong>
                            </p>
                            <a
                              href={currentPlatform.downloadUrlMsi}
                              className="flex items-center justify-center gap-2 text-brand-400 hover:text-brand-300 text-sm transition-colors"
                            >
                              <HardDrive className="w-4 h-4" />
                              Download MSI for Group Policy / SCCM
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
                      {[
                        { label: "Setup Time", value: "< 2 min", icon: Clock },
                        { label: "Protocol", value: "WireGuard", icon: Zap },
                        { label: "Encryption", value: "AES-256", icon: Lock },
                      ].map((stat) => (
                        <div key={stat.label} className="text-center">
                          <stat.icon className="w-5 h-5 text-brand-400 mx-auto mb-2" />
                          <div className="text-white font-semibold">{stat.value}</div>
                          <div className="text-gray-500 text-xs">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Other Platforms Toggle */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                onClick={() => setShowAllPlatforms(!showAllPlatforms)}
                className="w-full mt-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-medium transition-all flex items-center justify-center gap-2"
              >
                {showAllPlatforms ? "Hide" : "Show"} all platforms
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${showAllPlatforms ? "rotate-180" : ""}`}
                />
              </motion.button>

              {/* All Platforms Grid */}
              <AnimatePresence>
                {showAllPlatforms && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3 overflow-hidden"
                  >
                    {Object.entries(platforms).map(([key, platform]) => {
                      const Icon = platform.icon;
                      const isSelected = selectedPlatform === key;
                      return (
                        <motion.button
                          key={key}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedPlatform(key);
                            trackPlatformSelected(platform.name);
                          }}
                          className={`p-4 rounded-xl border transition-all ${
                            isSelected
                              ? "bg-brand-500/20 border-brand-500 text-white"
                              : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                          }`}
                        >
                          <Icon className="w-6 h-6 mx-auto mb-2" />
                          <div className="text-sm font-medium">{platform.name}</div>
                          {platform.comingSoon && (
                            <div className="text-xs text-gray-500 mt-1">Soon</div>
                          )}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Why Choose SACVPN?
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Built from the ground up for speed, security, and simplicity
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all">
                    <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Installation Guide */}
        <section className="py-20 relative bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Get Started in Minutes
              </h2>
              <p className="text-gray-400 text-lg">
                Simple installation, instant protection
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-4 gap-4">
                {(installSteps[selectedPlatform] || installSteps.windows).map((item, i) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`relative p-6 rounded-2xl border transition-all ${
                      activeStep === i
                        ? "bg-brand-500/10 border-brand-500/50"
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    {/* Step Number */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 font-bold text-lg ${
                        activeStep === i
                          ? "bg-brand-500 text-white"
                          : "bg-white/10 text-gray-400"
                      }`}
                    >
                      {item.step}
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">{item.title}</h4>
                    <p className="text-gray-400 text-sm">{item.description}</p>

                    {/* Connector Line */}
                    {i < 3 && (
                      <div className="hidden md:block absolute top-12 -right-2 w-4 h-0.5 bg-white/20" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* System Requirements */}
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                System Requirements
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Windows */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Monitor className="w-8 h-8 text-brand-400" />
                  <h3 className="text-xl font-semibold text-white">Windows</h3>
                </div>
                <ul className="space-y-3 text-gray-400">
                  <li className="flex items-start gap-2">
                    <Cpu className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <span>Windows 10 or 11 (64-bit)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <HardDrive className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <span>100 MB free disk space</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Wifi className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <span>Active internet connection</span>
                  </li>
                </ul>
              </motion.div>

              {/* macOS */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Apple className="w-8 h-8 text-brand-400" />
                  <h3 className="text-xl font-semibold text-white">macOS</h3>
                </div>
                <ul className="space-y-3 text-gray-400">
                  <li className="flex items-start gap-2">
                    <Cpu className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <span>macOS 10.15 (Catalina) or later</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <HardDrive className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <span>100 MB free disk space</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Wifi className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <span>Apple Silicon or Intel Mac</span>
                  </li>
                </ul>
              </motion.div>

              {/* Linux */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Terminal className="w-8 h-8 text-brand-400" />
                  <h3 className="text-xl font-semibold text-white">Linux</h3>
                </div>
                <ul className="space-y-3 text-gray-400">
                  <li className="flex items-start gap-2">
                    <Cpu className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <span>Ubuntu 20.04+, Debian 11+, Fedora 35+</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <HardDrive className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <span>100 MB free disk space</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Wifi className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <span>systemd-based distribution</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 via-accent-purple/10 to-accent-cyan/10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.15),transparent_70%)]" />

          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Ready to Protect Your Privacy?
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Join thousands of users who trust SACVPN to secure their online life
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDownload(selectedPlatform)}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-brand-500 to-accent-cyan text-white font-bold text-lg shadow-2xl shadow-brand-500/30 flex items-center justify-center gap-2"
                >
                  <DownloadIcon className="w-5 h-5" />
                  Download Now
                </motion.button>
                <Link
                  to="/pricing"
                  className="px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-lg transition-all flex items-center justify-center gap-2"
                >
                  View Plans
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
              <p className="text-gray-500 mt-6">
                14-day free trial • No credit card required • Cancel anytime
              </p>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Download Coming Soon Modal */}
      <AnimatePresence>
        {showDownloadModal && downloadingPlatform && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowDownloadModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-gray-900 rounded-3xl border border-white/10 overflow-hidden"
            >
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 via-accent-cyan to-accent-purple rounded-3xl blur-xl opacity-20" />

              <div className="relative">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <h3 className="text-xl font-bold text-white">Download Coming Soon</h3>
                  <button
                    onClick={() => setShowDownloadModal(false)}
                    className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center">
                      {(() => {
                        const PlatformModalIcon = platforms[downloadingPlatform].icon;
                        return <PlatformModalIcon className="w-8 h-8 text-white" />;
                      })()}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">
                        SACVPN for {platforms[downloadingPlatform].name}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        Version {platforms[downloadingPlatform].version} • {platforms[downloadingPlatform].size}
                      </p>
                    </div>
                  </div>

                  <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Bell className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white font-medium mb-1">
                          We're putting the finishing touches on the {platforms[downloadingPlatform].name} app!
                        </p>
                        <p className="text-gray-400 text-sm">
                          Our desktop clients are in final testing. Leave your email to be notified when the download is available.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Email Signup */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const email = e.target.email.value;
                      // TODO: Hook up to actual email list
                      console.log('Notify email:', email, 'Platform:', downloadingPlatform);
                      setShowDownloadModal(false);
                      alert(`We'll notify you at ${email} when SACVPN for ${platforms[downloadingPlatform].name} is ready!`);
                    }}
                    className="space-y-4"
                  >
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                      />
                    </div>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-accent-cyan text-white font-semibold shadow-lg shadow-brand-500/30 transition-all"
                    >
                      Notify Me When Available
                    </motion.button>
                  </form>

                  <p className="text-center text-gray-500 text-xs mt-4">
                    No spam. We'll only email you when the download is ready.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
