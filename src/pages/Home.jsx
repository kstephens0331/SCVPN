import { Link } from "react-router-dom";
import CheckItem from "../components/CheckItem.jsx";
import HowItWorks from "../components/HowItWorks.jsx";
import WhyVPN from "../components/WhyVPN.jsx";
import Comparison from "../components/Comparison.jsx";
import Security from "../components/Security.jsx";

export default function Home(){
  return (
    <>
      {/* Hero */}
      <section className="container-xl py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">Private. Fast. Simple.</h1>
            <p className="mt-4 text-lg text-gray-700">Protect your privacy, stop throttling, and secure every device in minutes with SACVPN.</p>
            <div className="mt-8 flex gap-3">
              <Link to="/pricing" className="button-primary">Get Started</Link>
              <Link to="/faq" className="button-outline">How it works</Link>
            </div>
            <ul className="mt-6 text-gray-700 grid gap-2">
              <CheckItem>Unlimited devices on Personal and Gaming plans.</CheckItem>
              <CheckItem>One-click setup with QR code + email instructions.</CheckItem>
              <CheckItem>Transparent Business pricing with device quotas.</CheckItem>
            </ul>
          </div>
          <div className="card p-6">
            <h3 className="text-xl font-semibold">Why SACVPN?</h3>
            <ul className="mt-4 space-y-2 text-gray-700">
              <CheckItem>No-logs policy.</CheckItem>
              <CheckItem>WireGuard performance (built for speed).</CheckItem>
              <CheckItem>Gaming-optimized routes (lower latency).</CheckItem>
              <CheckItem>24/7 email support.</CheckItem>
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
            <h2 className="text-2xl font-bold">Ready to protect every device?</h2>
            <p className="text-gray-700 mt-2">Pick a plan and connect in under a minute.</p>
          </div>
          <Link to="/pricing" className="button-primary">See Plans</Link>
        </div>
      </section>
    </>
  );
}
