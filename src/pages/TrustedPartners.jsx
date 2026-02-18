import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, ExternalLink, ChevronRight, Users, Handshake } from "lucide-react";

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
  viewport: { once: true, amount: 0.2 },
});

const partners = [
  {
    name: "StephensCode LLC",
    category: "Web Development",
    description:
      "A veteran-owned web development firm with more than fourteen years of hands-on experience and over 2,600 delivered projects. StephensCode builds custom websites, API integrations, and full-stack web applications for businesses of every size across the country.",
    url: "https://stephenscode.dev",
  },
  {
    name: "GradeStack",
    category: "SEO & Website Monitoring",
    description:
      "A self-hosted platform that audits websites for performance, SEO, security, accessibility, and best practices. GradeStack uses automated crawling to surface issues and delivers step-by-step instructions so teams can fix problems without guesswork.",
    url: "https://gradestack.dev",
  },
  {
    name: "LotSwap",
    category: "Automotive Marketplace",
    description:
      "A fee-free marketplace connecting auto dealers directly for wholesale vehicle trades. LotSwap cuts out the auction house, letting dealers list inventory, negotiate in real time, and close deals — saving an average of $1,500 to $2,500 per vehicle.",
    url: "https://lotswap.io",
  },
  {
    name: "Forge-X",
    category: "Construction Technology",
    description:
      "A project management platform purpose-built for contractors. Forge-X brings invoicing, scheduling, daily logs, and payment tracking into a single clean dashboard, giving contractors and homeowners full visibility from the first estimate to the final walk-through.",
    url: "https://forge-x.app",
  },
  {
    name: "Get Step Ready",
    category: "Medical Education",
    description:
      "A study platform built for medical students preparing for the USMLE Step 1 exam. With more than 50,000 flashcards, 5,000 practice questions, video lectures, and AI-driven study tools, it equips future physicians with everything they need to pass their boards.",
    url: "https://getstepready.com",
  },
  {
    name: "ColorFuse Prints",
    category: "Custom Printing",
    description:
      "An online destination for high-quality DTF transfers, sublimation printing, and custom apparel. ColorFuse ships vibrant, ready-to-press transfers and fully customized designs straight to your door — ideal for businesses and creators alike.",
    url: "https://colorfuseprints.com",
  },
  {
    name: "Benefit Builder LLC",
    category: "Benefits Consulting",
    description:
      "A benefits brokerage focused on Section 125 plans and supplemental coverage including life, dental, and vision insurance. Benefit Builder helps employers and their teams reduce tax liability through smart pre-tax benefit structures.",
    url: "https://benefitbuilderllc.com",
  },
  {
    name: "AMW Cooling & Heating",
    category: "HVAC Services",
    description:
      "A veteran-owned HVAC company serving Conroe, TX and the surrounding communities. AMW handles air conditioning repair, heating installation, routine maintenance, and around-the-clock emergency calls — all backed by licensed, insured technicians.",
    url: "https://amwairconditioning.com",
  },
  {
    name: "Terracotta Construction",
    category: "General Contracting",
    description:
      "A professional contractor offering construction, landscaping, fencing, handyman work, apartment turnovers, and 24/7 emergency repairs across Montgomery County and the Greater Houston area. Licensed, insured, and committed to quality craftsmanship.",
    url: "https://terracottaconstruction.com",
  },
  {
    name: "C.A.R.S Collision & Refinish",
    category: "Auto Body & Paint",
    description:
      "A veteran and family-owned auto body shop in Spring, TX specializing in collision repair, custom paint jobs, paintless dent removal, and spray-in bedliners. They accept insurance claims and serve Spring, The Woodlands, and North Houston.",
    url: "https://carscollisionandrefinishshop.com",
  },
  {
    name: "FC Photo Houston",
    category: "Photography",
    description:
      "A Houston-based photography service that captures portraits, events, professional headshots, and creative shoots. FC Photo Houston pairs high-quality imagery with a personal, local approach to every session.",
    url: "https://fcphotohouston.com",
  },
  {
    name: "JustWell Clinical Research",
    category: "Clinical Research",
    description:
      "Houston's trusted partner for ethical, inclusive clinical trials spanning cardiology, neurology, dermatology, ophthalmology, and family medicine. Every study is IRB-approved, and compensation is available for qualified participants.",
    url: "https://justwellclinical.org",
  },
];

export default function TrustedPartners() {
  return (
    <>
      <Helmet>
        <title>Trusted Local Partners | SACVPN — Veteran-Owned VPN</title>
        <meta
          name="description"
          content="SACVPN is proud to work alongside a network of trusted local businesses. Explore our partners across technology, construction, healthcare, and more."
        />
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero py-20">
        <div className="absolute inset-0 bg-gradient-glow opacity-50" />
        <div className="relative z-10 container-xl text-center">
          <motion.div {...fadeIn()}>
            <div className="badge-gradient mb-6 inline-flex items-center gap-2">
              <Handshake className="w-4 h-4" />
              Community Network
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-4">
              Trusted Local Partners
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              At SACVPN, we believe strong businesses are built through strong partnerships.
              These are the companies we work with, trust, and proudly recommend to our customers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="container-xl py-16">
        <motion.div {...fadeIn(0.1)}>
          <h2 className="text-3xl font-semibold text-gray-900 mb-2">Our Network</h2>
          <p className="text-gray-500 mb-10 max-w-2xl">
            Each of these businesses brings expertise and integrity to the communities
            they serve. We are honored to count them as part of our professional circle.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {partners.map((partner, i) => (
            <motion.div
              key={partner.name}
              className="card p-8 group"
              {...fadeIn(0.05 * i)}
            >
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="badge-primary">{partner.category}</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 group-hover:text-brand-600 transition-colors mb-3">
                {partner.name}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-5">
                {partner.description}
              </p>
              <a
                href={partner.url}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 text-brand-600 font-medium hover:text-brand-700 transition-colors"
              >
                Visit Website
                <ExternalLink className="w-4 h-4" />
              </a>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-xl pb-16">
        <motion.div
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-dark-900 via-dark-800 to-brand-950 p-10 shadow-2xl"
          {...fadeIn(0.1)}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-cyan/20 rounded-full blur-3xl" />
          <div className="relative z-10 text-center">
            <Users className="w-10 h-10 text-brand-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">
              Interested in Partnering with SACVPN?
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-6">
              We are always looking to connect with businesses that share our commitment
              to quality, trust, and veteran values.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Get in Touch
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>
    </>
  );
}
