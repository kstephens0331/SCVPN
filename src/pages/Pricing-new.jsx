// src/pages/Pricing-new.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import {
  BILLING_PERIODS,
  PLAN_PRICING,
  getPersonalPlans,
  getBusinessPlans,
  formatPrice,
  formatSavings,
} from "../lib/pricing-new.js";
import FAQComparison from "../components/FAQComparison.jsx";

const API_URL = import.meta.env.VITE_API_URL || "https://scvpn-production.up.railway.app";

/**
 * Create Stripe Checkout session
 */
async function startCheckout(planCode, billingPeriod, setBusy) {
  try {
    setBusy(true);

    const plan = PLAN_PRICING[planCode];
    const pricing = plan.pricing[billingPeriod];

    const res = await fetch(`${API_URL}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan_code: planCode,
        billing_period: billingPeriod,
        stripe_price_id: pricing.stripePriceId,
        plan_name: plan.name,
        account_type: plan.accountType,
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
    alert("We couldn't start checkout. Please try again in a moment.");
  } finally {
    setBusy(false);
  }
}

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState('twoyear'); // Default to 2-year (best value)

  const personalPlans = getPersonalPlans();
  const businessPlans = getBusinessPlans();

  return (
    <>
      <section className="bg-gradient-to-b from-background to-white py-20 text-center">
        <div className="container-xl">
          <h1 className="text-5xl font-extrabold text-primary">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto">
            No hidden fees. No contracts. Cancel anytime. Save up to 83% with longer billing periods.
          </p>

          {/* Billing Period Toggle */}
          <BillingPeriodToggle
            billingPeriod={billingPeriod}
            onChange={setBillingPeriod}
          />

          {/* Quick jump links */}
          <div className="flex justify-center mt-8 gap-4">
            <a
              href="#personal"
              className="px-4 py-2 rounded-full bg-primary text-white hover:bg-primary/90 transition"
            >
              Personal & Gaming
            </a>
            <a
              href="#business"
              className="px-4 py-2 rounded-full bg-gray-200 text-dark hover:bg-gray-300 transition"
            >
              Business
            </a>
          </div>

          {/* Personal & Gaming */}
          <div id="personal" className="mt-12">
            <h2 className="text-3xl font-semibold">Personal & Gaming</h2>
            <p className="text-gray-700 mt-2">
              Unlimited devices on both plans. Gaming adds optimized routes for lower latency.
            </p>
            <div className="grid md:grid-cols-2 gap-8 mt-8 max-w-5xl mx-auto">
              {personalPlans.map((plan) => (
                <PlanCard
                  key={plan.code}
                  plan={plan}
                  billingPeriod={billingPeriod}
                />
              ))}
            </div>
          </div>

          {/* Business */}
          <div id="business" className="mt-20">
            <h2 className="text-3xl font-semibold">Business</h2>
            <p className="text-gray-700 mt-2">
              Clear device quotas for teams. Add or revoke devices anytime from your dashboard.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              {businessPlans.map((plan) => (
                <PlanCard
                  key={plan.code}
                  plan={plan}
                  billingPeriod={billingPeriod}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-6">
              Need more than 250 devices?{" "}
              <Link to="/contact" className="text-primary underline">
                Contact us
              </Link>{" "}
              for custom enterprise pricing.
            </p>
          </div>

          {/* Trust Signals */}
          <div className="mt-16 bg-gray-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary">30-Day</div>
                <div className="text-gray-600 mt-2">Money-Back Guarantee</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary">24/7</div>
                <div className="text-gray-600 mt-2">Customer Support</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary">Unlimited</div>
                <div className="text-gray-600 mt-2">Devices</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FAQComparison />
    </>
  );
}

/**
 * Billing Period Toggle Component
 */
function BillingPeriodToggle({ billingPeriod, onChange }) {
  const periods = Object.values(BILLING_PERIODS);

  return (
    <div className="mt-8 flex flex-col items-center">
      <p className="text-sm text-gray-600 mb-3">Select billing period:</p>
      <div className="flex flex-wrap justify-center gap-2 bg-gray-100 p-2 rounded-full">
        {periods.map((period) => {
          const isActive = billingPeriod === period.id;
          return (
            <button
              key={period.id}
              onClick={() => onChange(period.id)}
              className={`
                relative px-6 py-2.5 rounded-full font-medium transition-all
                ${isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-transparent text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {period.name}
              {period.discount > 0 && (
                <span
                  className={`
                    ml-2 text-xs font-semibold
                    ${isActive ? 'text-lime-300' : 'text-secondary'}
                  `}
                >
                  -{period.discount}%
                </span>
              )}
              {period.badge && (
                <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                  {period.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Plan Card Component
 */
function PlanCard({ plan, billingPeriod }) {
  const [busy, setBusy] = useState(false);
  const pricing = plan.pricing[billingPeriod];
  const periodInfo = BILLING_PERIODS[billingPeriod];

  if (!pricing) {
    console.error(`No pricing found for plan ${plan.code} with period ${billingPeriod}`);
    return null;
  }

  const monthlyPrice = pricing.monthlyPrice;
  const totalPrice = pricing.totalPrice;
  const savings = pricing.savings || 0;

  return (
    <div className="card p-8 flex flex-col hover:shadow-xl transition-shadow relative">
      {/* Plan Badge */}
      {plan.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-bold bg-secondary text-white rounded-full shadow-md">
          {plan.badge}
        </span>
      )}

      {/* Plan Name */}
      <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>

      {/* Device Count */}
      <p className="mt-1 text-gray-600">
        {String(plan.devices).includes("Unlimited")
          ? "Unlimited devices"
          : `${plan.devices} devices`}
      </p>

      {/* Pricing */}
      <div className="mt-6">
        <div className="flex items-baseline justify-center">
          <span className="text-5xl font-extrabold text-primary">
            {formatPrice(monthlyPrice)}
          </span>
          <span className="text-gray-600 ml-2">/mo</span>
        </div>

        {/* Billing Details */}
        <div className="mt-2 text-center">
          {billingPeriod === 'monthly' ? (
            <p className="text-sm text-gray-500">Billed monthly</p>
          ) : (
            <>
              <p className="text-sm text-gray-600 font-medium">
                {formatPrice(totalPrice)} billed {periodInfo.interval}
              </p>
              {savings > 0 && (
                <p className="text-sm font-bold text-green-600 mt-1">
                  {formatSavings(savings)} vs monthly
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Features */}
      <ul className="mt-6 space-y-3 flex-1">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start text-sm text-gray-700">
            <Check className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <div className="mt-8">
        <button
          type="button"
          disabled={busy}
          onClick={() => startCheckout(plan.code, billingPeriod, setBusy)}
          className="button-primary w-full text-center disabled:opacity-60 text-lg py-3"
        >
          {busy ? "Redirecting…" : `Get ${plan.name}`}
        </button>
      </div>

      {/* Sign in link */}
      <div className="mt-3 text-center">
        <Link to="/login" className="text-sm text-gray-500 underline hover:text-gray-700">
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
}
