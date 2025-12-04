import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Shield, Zap, Lock, ChevronRight, Mail, Phone, MapPin, Gift, Clock, Download } from "lucide-react";

export default function Layout() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Handle scroll for sticky header effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { to: "/download", label: "Download" },
    { to: "/pricing", label: "Pricing" },
    { to: "/blog", label: "Blog" },
    { to: "/faq", label: "FAQ" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen w-full bg-white text-gray-900 flex flex-col">
      {/* Premium Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-100"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto w-full px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-500/20 rounded-xl blur-xl group-hover:bg-brand-500/30 transition-all duration-300" />
                <img
                  src="/sacvpn-logo.svg"
                  alt="SACVPN Logo"
                  className="h-10 w-auto relative z-10"
                />
              </div>
              <span className="text-2xl font-display font-bold bg-gradient-to-r from-brand-600 to-brand-500 bg-clip-text text-transparent">
                SACVPN
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive(link.to)
                      ? "text-brand-600 bg-brand-50"
                      : "text-gray-600 hover:text-brand-600 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-gray-600 font-medium hover:text-brand-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/download"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 transform hover:-translate-y-0.5 transition-all duration-300"
              >
                <Download className="w-4 h-4" />
                Download
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-gray-100 shadow-lg"
            >
              <div className="max-w-7xl mx-auto px-6 py-4">
                <nav className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                        isActive(link.to)
                          ? "text-brand-600 bg-brand-50"
                          : "text-gray-600 hover:text-brand-600 hover:bg-gray-50"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="border-t border-gray-100 my-2 pt-2">
                    <Link
                      to="/login"
                      className="block px-4 py-3 text-gray-600 font-medium hover:text-brand-600"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/pricing"
                      className="flex items-center justify-center gap-2 w-full mt-2 px-5 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow-lg shadow-green-500/25"
                    >
                      Start Free Trial
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-20" />

      {/* Main Content */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Premium Footer */}
      <footer className="bg-dark-900 text-white relative overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-30" />

        {/* Main Footer Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <Link to="/" className="flex items-center gap-3 mb-6">
                <img
                  src="/sacvpn-logo.svg"
                  alt="SACVPN"
                  className="h-10 w-auto"
                />
                <span className="text-2xl font-display font-bold text-white">
                  SACVPN
                </span>
              </Link>
              <p className="text-gray-400 mb-6">
                Enterprise-grade VPN security powered by WireGuard. Protect your privacy with the fastest, most secure VPN technology.
              </p>
              <div className="flex flex-wrap gap-2">
                {/* Trust badges */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/20 border border-green-500/30">
                  <Clock className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-300 font-semibold">14-Day Free Trial</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                  <Shield className="w-4 h-4 text-brand-400" />
                  <span className="text-xs text-gray-300">No-Logs</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                  <Lock className="w-4 h-4 text-accent-lime" />
                  <span className="text-xs text-gray-300">Encrypted</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Product</h4>
              <ul className="space-y-3">
                {[
                  { to: "/pricing", label: "Pricing" },
                  { to: "/blog", label: "Blog" },
                  { to: "/faq", label: "FAQ" },
                  { to: "/about", label: "About Us" },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2"
                    >
                      <ChevronRight className="w-4 h-4" />
                      {link.label}
                    </Link>
                  </li>
                ))}
                {/* Referral Program with special highlight */}
                <li>
                  <Link
                    to="/pricing#referral"
                    className="text-accent-pink hover:text-white transition-colors duration-200 flex items-center gap-2"
                  >
                    <Gift className="w-4 h-4" />
                    Referral Program
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Support</h4>
              <ul className="space-y-3">
                {[
                  { to: "/contact", label: "Contact Us" },
                  { to: "/faq", label: "Help Center" },
                  { to: "/terms", label: "Terms of Service" },
                  { to: "/privacy", label: "Privacy Policy" },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2"
                    >
                      <ChevronRight className="w-4 h-4" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Newsletter */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Stay Connected</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-400">
                  <Mail className="w-5 h-5 text-brand-400" />
                  <a href="mailto:support@sacvpn.com" className="hover:text-white transition-colors">
                    support@sacvpn.com
                  </a>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <Phone className="w-5 h-5 text-brand-400" />
                  <span>24/7 Support Available</span>
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="mt-6">
                <p className="text-sm text-gray-400 mb-3">
                  Subscribe to our newsletter for VPN tips and updates.
                </p>
                <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-400 transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} SACVPN. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <Link
                  to="/terms"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Terms
                </Link>
                <Link
                  to="/privacy"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Privacy
                </Link>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Zap className="w-4 h-4 text-accent-lime" />
                  <span>Powered by WireGuard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
