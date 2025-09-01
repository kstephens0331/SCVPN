// src/pages/Pricing.jsx
import React, { useState } from "react";
import { PLANS } from "../lib/pricing.js";
import { Link } from "react-router-dom";
import CheckItem from "../components/CheckItem.jsx";
import FAQComparison from "../components/FAQComparison.jsx";

const API_URL = import.meta.env.VITE_API_URL || "https://scvpn-production.up.railway.app";
if (!API_URL) console.error("VITE_API_URL is not set — cannot call /api/checkout");

console.log("API URL is", import.meta.env.VITE_API_URL);
// optional helper – fill from your auth if you have it
async function getUserEmail() {
  try {
    // If you’re using Supabase Auth, you can uncomment:
    // const { data } = await supabase.auth.getUser();
    // return data?.user?.email || undefined;
    return undefined;
  } catch {
    return undefined;
  }
}

/** Create Stripe Checkout session on the API and redirect */
async function startCheckout(planCode, accountType = "personal", planName, setBusy) {
  try {
    if (typeof setBusy === "function") setBusy(true);

    const customer_email = await getUserEmail();

    const res = await fetch(`${API_URL}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan_code: planCode,
        plan_name: planName,           // 👈 include readable name
        account_type: accountType,
        quantity: 1,
        customer_email: customer_email // 👈 prefill Stripe email if available
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Checkout failed: ${res.status} ${txt}`);
    }

    const { url } = await res.json();
    if (!url) throw new Error("Missing 'url' in API response");

    window.location.assign(url);
  } catch (err) {
    console.error("[pricing] checkout error", err);
    alert("We couldn’t start checkout. Please try again in a moment.");
  } finally {
    if (typeof setBusy === "function") setBusy(false);
  }
}

/** Handle clicks: send plan.code and plan.name */
function handlePlanClick(e, plan, setBusy) {
  e.preventDefault();
  const accountType = plan.accountType || (plan.business ? "business" : "personal");
  startCheckout(plan.code, accountType, plan.name, setBusy);
}

const personalCards = [PLANS.personal, PLANS.gaming];
const businessCards = [PLANS.business10, PLANS.business50, PLANS.business250];

export default function Pricing() {
  return (
    <>
      <section className="bg-gradient-to-b from-background to-white py-20 text-center">
        <div className="container-xl">
          <h1 className="text-5xl font-extrabold text-primary">Simple, Transparent Pricing</h1>
          <p className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto">
            No hidden fees. No contracts. Cancel anytime. Choose the plan that fits your lifestyle or business.
          </p>
        </div>

        {/* Quick jump links */}
        <div className="flex justify-center mt-10 gap-4">
          <a href="#personal" className="px-4 py-2 rounded-full bg-primary text-white hover:bg-primary/90">
            Personal & Gaming
          </a>
          <a href="#business" className="px-4 py-2 rounded-full bg-gray-200 text-dark hover:bg-gray-300">
            Business
          </a>
        </div>

        {/* Personal & Gaming */}
        <div id="personal" className="mt-10">
          <h2 className="text-2xl font-semibold">Personal & Gaming</h2>
          <p className="text-gray-700 mt-1">
            Unlimited devices on both plans. Gaming adds optimized routes for lower latency.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {(personalCards ?? []).map((p) => (
              <PlanCard key={p.code} plan={p} />
            ))}
          </div>
        </div>

        {/* Business */}
        <div id="business" className="mt-16">
          <h2 className="text-2xl font-semibold">Business</h2>
          <p className="text-gray-700 mt-1">
            Clear device quotas for teams. Add or revoke devices anytime from your dashboard.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            {(businessCards ?? []).map((p) => (
              <PlanCard key={p.code} plan={p} />
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-6">
            Business 250+ covers 250 devices; contact us for higher limits.
          </p>
        </div>
      </section>

      <FAQComparison />
    </>
  );
}

function PlanCard({ plan }) {
  const [busy, setBusy] = useState(false);

  return (
    <div className="card p-6 flex flex-col">
      {plan.badge && (
        <span className="inline-block mb-2 px-3 py-1 text-xs font-semibold bg-secondary text-white rounded-full">
          {plan.badge}
        </span>
      )}
      <h3 className="text-xl font-semibold">{plan.name}</h3>
      <p className="mt-1 text-gray-600">
        {String(plan.devices).includes("Unlimited") ? "Unlimited devices" : `${plan.devices} devices`}
      </p>
      <div className="mt-4">
        <span className="text-4xl font-bold">${plan.price}</span>
        <span className="text-gray-600">/mo</span>
      </div>
      <ul className="mt-4 text-gray-700 space-y-2">
        {(plan.features ?? []).map((f, i) => (
          <CheckItem key={i}>{f}</CheckItem>
        ))}
      </ul>
      <div className="mt-6">
        <button
          type="button"
          disabled={busy}
          onClick={(e) => handlePlanClick(e, plan, setBusy)}
          className="button-primary w-full text-center disabled:opacity-60"
        >
          {busy ? "Redirecting…" : `Get ${plan.name}`}
        </button>
      </div>
      {/* fallback link if JS disabled */}
      <div className="mt-2 text-center">
        <Link to="/login" className="text-sm text-gray-500 underline">Sign in first</Link>
      </div>
    </div>
  );
}
