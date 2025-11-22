import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import CheckItem from "../components/CheckItem.jsx";
import HowItWorks from "../components/HowItWorks.jsx";
import WhyVPN from "../components/WhyVPN.jsx";
import Comparison from "../components/Comparison.jsx";
import Security from "../components/Security.jsx";

export default function Home(){
  return (
    <>
      <Helmet>
        <title>SACVPN - Secure VPN Service with WireGuard | Fast, Private & Reliable</title>
        <meta name="description" content="SACVPN offers secure VPN service powered by WireGuard protocol. Protect your online privacy, secure public WiFi connections, and enjoy fast speeds for streaming and gaming. No-logs policy guaranteed." />
        <meta name="keywords" content="VPN service, WireGuard VPN, secure VPN, private internet access, online privacy, VPN for gaming, VPN for streaming, business VPN, remote work VPN, encrypted connection" />
        <link rel="canonical" href="https://www.sacvpn.com/" />
        <meta property="og:title" content="SACVPN - Secure VPN Service with WireGuard Technology" />
        <meta property="og:description" content="Protect your online privacy with SACVPN's WireGuard-powered VPN service. Fast speeds, unlimited devices, and enterprise-grade security." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.sacvpn.com/" />
      </Helmet>

      {/* Hero */}
      <section className="container-xl py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">Secure VPN Service: Private, Fast & Simple</h1>
            <p className="mt-4 text-lg text-gray-700">Protect your online privacy and secure your internet connection with SACVPN's WireGuard-powered VPN service. Stop ISP throttling, encrypt your data on public WiFi, and secure unlimited devices in minutes with our easy-to-use VPN solution.</p>
            <div className="mt-8 flex gap-3">
              <Link to="/pricing" className="button-primary">Get Started with VPN</Link>
              <Link to="/blog/what-is-vpn-complete-guide" className="button-outline">Learn About VPNs</Link>
            </div>
            <ul className="mt-6 text-gray-700 grid gap-2">
              <CheckItem>Unlimited devices on Personal and Gaming VPN plans</CheckItem>
              <CheckItem>One-click VPN setup with QR code and email instructions</CheckItem>
              <CheckItem>Transparent Business VPN pricing with flexible device quotas</CheckItem>
            </ul>
          </div>
          <div className="card p-6">
            <h3 className="text-xl font-semibold">Why Choose SACVPN's VPN Service?</h3>
            <ul className="mt-4 space-y-2 text-gray-700">
              <CheckItem>Strict no-logs privacy policy for complete anonymity</CheckItem>
              <CheckItem>WireGuard protocol for maximum VPN speed and performance</CheckItem>
              <CheckItem>Gaming-optimized VPN routes for lower latency and reduced lag</CheckItem>
              <CheckItem>24/7 customer support for all VPN setup and technical issues</CheckItem>
            </ul>
          </div>
        </div>
      </section>

      <HowItWorks />
      <WhyVPN />
      <Comparison />
      <Security />

      {/* CTA */}
      <section className="container-xl py-16">
        <div className="card p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold">Ready to Secure Your Devices with VPN Protection?</h2>
            <p className="text-gray-700 mt-2">Choose a VPN plan and protect your online privacy in under a minute with WireGuard technology.</p>
          </div>
          <Link to="/pricing" className="button-primary">View VPN Plans</Link>
        </div>
      </section>

    </>
  );
}
