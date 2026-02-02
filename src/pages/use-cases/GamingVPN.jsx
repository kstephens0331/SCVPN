import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Gamepad2, Zap, Shield, Globe, Wifi, Clock, CheckCircle, ArrowRight, Target, Swords, Trophy, Rocket } from "lucide-react";

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
    icon: Zap,
    title: "Ultra-Low Latency",
    description: "WireGuard protocol delivers the fastest VPN speeds available. Get ping times as low as 5-15ms overhead - barely noticeable in competitive play."
  },
  {
    icon: Shield,
    title: "DDoS Protection",
    description: "Shield your real IP from DDoS attacks during streams, tournaments, and competitive matches. Stay connected when it matters most."
  },
  {
    icon: Globe,
    title: "Access Any Server Region",
    description: "Connect to game servers in any region. Play with friends worldwide, access geo-locked games, or find less crowded servers."
  },
  {
    icon: Wifi,
    title: "Bypass ISP Throttling",
    description: "Some ISPs throttle gaming traffic. SACVPN encrypts your connection so your ISP can't slow down your games."
  },
  {
    icon: Target,
    title: "Reduce Ping & Packet Loss",
    description: "Our optimized routing can actually improve your connection to distant servers by finding faster paths than your ISP's default route."
  },
  {
    icon: Rocket,
    title: "Early Game Access",
    description: "Access games that release earlier in other regions. Play new releases hours or days before they launch in your country."
  }
];

const games = [
  "Steam Games",
  "Call of Duty / Warzone",
  "Fortnite",
  "Valorant",
  "League of Legends",
  "CS2 / Counter-Strike",
  "Apex Legends",
  "DOTA 2",
  "Overwatch 2",
  "Rocket League",
  "Xbox Game Pass",
  "PlayStation Network"
];

const benefits = [
  { title: "Low Ping", desc: "5-15ms typical overhead" },
  { title: "No Lag Spikes", desc: "Stable, consistent connection" },
  { title: "DDoS Shield", desc: "Hide your real IP address" },
  { title: "Any Region", desc: "Play on servers worldwide" }
];

const testimonials = [
  {
    quote: "Finally a VPN that doesn't tank my ping. I use SACVPN for every Valorant session now.",
    author: "StreamerPro",
    game: "Valorant"
  },
  {
    quote: "Got DDoS'd twice during tournaments before SACVPN. Haven't had an issue since.",
    author: "CompetitiveGamer",
    game: "Call of Duty"
  },
  {
    quote: "Playing with EU friends was impossible before. Now I connect to their servers with playable ping.",
    author: "GlobalPlayer",
    game: "League of Legends"
  }
];

export default function GamingVPN() {
  return (
    <>
      <Helmet>
        <title>VPN for Gaming | Low Ping Gaming VPN with DDoS Protection | SACVPN</title>
        <meta
          name="description"
          content="The best VPN for gaming. Ultra-low latency WireGuard VPN with DDoS protection, ISP throttling bypass, and access to any game server region worldwide."
        />
        <meta
          name="keywords"
          content="gaming VPN, VPN for gaming, low ping VPN, DDoS protection VPN, Warzone VPN, Fortnite VPN, Valorant VPN, game server VPN, reduce ping VPN, gaming lag fix"
        />
        <link rel="canonical" href="https://www.sacvpn.com/gaming" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Gaming VPN Service",
            "name": "SACVPN Gaming VPN",
            "description": "Ultra-low latency VPN service optimized for gaming with DDoS protection and global server access.",
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
              "audienceType": "Gamers"
            }
          })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-gray-900 to-brand-900" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-50" />

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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm font-medium mb-6"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>Built for Gamers</span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6"
              >
                The VPN That{" "}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Won't Kill Your Ping</span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-lg md:text-xl text-gray-300 mb-8"
              >
                WireGuard-powered gaming VPN with DDoS protection, ISP throttling bypass,
                and access to game servers worldwide. Typical overhead: just 5-15ms.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                <Link
                  to="/download"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg shadow-purple-500/25 hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                >
                  <Gamepad2 className="w-5 h-5" />
                  Download Free
                </Link>
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-purple-500/30 text-white font-bold hover:bg-purple-500/10 transition-all"
                >
                  <Clock className="w-5 h-5" />
                  14-Day Free Trial
                </Link>
              </motion.div>

              {/* Quick Stats */}
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-6 mt-8 pt-8 border-t border-white/10">
                <div>
                  <div className="text-3xl font-bold text-white">5-15ms</div>
                  <div className="text-sm text-gray-400">Typical Overhead</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">50+</div>
                  <div className="text-sm text-gray-400">Server Locations</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">100%</div>
                  <div className="text-sm text-gray-400">DDoS Protected</div>
                </div>
              </motion.div>
            </div>

            <motion.div
              variants={fadeInUp}
              className="relative"
            >
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20 shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Competitive Ready</h3>
                    <p className="text-gray-400">No compromises on performance</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {["WireGuard protocol (fastest)", "Hide IP from opponents", "Bypass ISP throttling", "Access any game region", "No bandwidth limits"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-gray-200">
                      <CheckCircle className="w-5 h-5 text-purple-400" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Gamers Need a VPN Section */}
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
              Why Gamers Use SACVPN
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-400 max-w-2xl mx-auto"
            >
              Not all VPNs are created equal. Most add 50-100ms of lag. We add just 5-15ms.
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
                className="bg-gray-800/50 rounded-2xl p-6 border border-purple-500/10 hover:border-purple-500/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">{point.title}</h3>
                <p className="text-gray-400 text-sm">{point.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-950">
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
              Gaming-Optimized Features
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-400 max-w-2xl mx-auto"
            >
              Every feature built with competitive gamers in mind
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
                  className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700/50 hover:border-purple-500/30 transition-all hover:bg-gray-800/50"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Games We Support Section */}
      <section className="py-20 bg-gray-900">
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
                className="text-3xl md:text-4xl font-display font-bold text-white mb-6"
              >
                Works With Every Game
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-lg text-gray-400 mb-8"
              >
                Whether you're grinding ranked, streaming, or playing casually with friends worldwide, SACVPN has you covered.
              </motion.p>
              <motion.div
                variants={fadeInUp}
                className="grid grid-cols-2 gap-4"
              >
                {games.map((game, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Swords className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    <span className="text-gray-300">{game}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="space-y-6"
            >
              {testimonials.map((testimonial, i) => (
                <div key={i} className="bg-gray-800/50 rounded-2xl p-6 border border-purple-500/10">
                  <p className="text-gray-300 mb-4">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                      <Gamepad2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.author}</div>
                      <div className="text-sm text-gray-400">{testimonial.game}</div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-950">
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
              Get Gaming in 60 Seconds
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            {[
              { step: "1", title: "Download", desc: "Get SACVPN for Windows, Mac, iOS, or Android" },
              { step: "2", title: "Connect", desc: "Choose a server or let us pick the fastest one" },
              { step: "3", title: "Play", desc: "Launch your game and dominate with protected ping" }
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-900 via-gray-900 to-pink-900 relative overflow-hidden">
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
              Ready to Level Up Your Connection?
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-300 max-w-2xl mx-auto mb-8"
            >
              Join thousands of gamers who protect their connection with SACVPN.
              Start your 14-day free trial - no credit card required.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
              <Link
                to="/download"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                <Gamepad2 className="w-5 h-5" />
                Download Now
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
