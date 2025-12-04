// src/pages/PricingFinal.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Check, TrendingDown } from "lucide-react";
import {
  BILLING_PERIODS,
  PLAN_PRICING,
  getPersonalPlans,
  getBusinessPlans,
  getEnterprisePlans,
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

export default function PricingFinal() {
  const personalPlans = getPersonalPlans();
  const businessPlans = getBusinessPlans();
  const enterprisePlans = getEnterprisePlans();

  return (
    <>
      <Helmet>
        <title>VPN Pricing Plans - Affordable Secure VPN Service | SACVPN</title>
        <meta name="description" content="SACVPN VPN pricing: Personal plan $7.99/mo, Gaming VPN $11.99/mo, Business VPN from $149/mo. Unlimited devices, WireGuard protocol, no-logs policy. Save up to 45% with annual plans." />
        <meta name="keywords" content="VPN pricing, cheap VPN, affordable VPN, VPN plans, business VPN pricing, gaming VPN cost, VPN subscription, WireGuard VPN price" />
        <link rel="canonical" href="https://www.sacvpn.com/pricing" />
      </Helmet>

      <section className="bg-gradient-to-b from-background to-white py-20 text-center">
        <div className="container-xl">
          <h1 className="text-5xl font-extrabold text-primary">
            Affordable VPN Pricing Plans - Simple & Transparent
          </h1>
          <p className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto">
            Choose the best VPN plan for your needs. No hidden fees. No contracts. Cancel your VPN subscription anytime. Save up to 45% with our long-term VPN plans.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            All VPN pricing shown clearly upfront - select the billing period that works best for you
          </p>

          {/* Quick jump links */}
          <div className="flex justify-center mt-8 gap-4 flex-wrap">
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
            <a
              href="#enterprise"
              className="px-4 py-2 rounded-full bg-gray-200 text-dark hover:bg-gray-300 transition"
            >
              Enterprise
            </a>
          </div>

          {/* Personal & Gaming */}
          <div id="personal" className="mt-12">
            <h2 className="text-3xl font-semibold">Personal & Gaming VPN Plans</h2>
            <p className="text-gray-700 mt-2">
              Connect unlimited devices on both VPN plans. Gaming VPN adds optimized routes for lower latency and reduced lag during online gaming.
            </p>
            <div className="grid md:grid-cols-2 gap-8 mt-8 max-w-6xl mx-auto">
              {personalPlans.map((plan) => (
                <TransparentPlanCard key={plan.code} plan={plan} />
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
                <TransparentPlanCard key={plan.code} plan={plan} />
              ))}
            </div>
          </div>

          {/* Enterprise */}
          <div id="enterprise" className="mt-20">
            <h2 className="text-3xl font-semibold">Enterprise</h2>
            <p className="text-gray-700 mt-2">
              Volume pricing for large organizations. Each user gets 3 devices. Enterprise-grade 5 Gbps servers.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mt-8">
              {enterprisePlans.map((plan) => (
                <TransparentPlanCard key={plan.code} plan={plan} isEnterprise />
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-6">
              Need more than 10,000 users?{" "}
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
                <div className="text-gray-600 mt-2">Devices (Personal & Gaming)</div>
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
 * Transparent Plan Card - Shows all billing periods within the card
 */
function TransparentPlanCard({ plan, isEnterprise = false }) {
  const [selectedPeriod, setSelectedPeriod] = useState('twoyear'); // Default to 2-year
  const [busy, setBusy] = useState(false);

  const periods = Object.values(BILLING_PERIODS);
  const selectedPricing = plan.pricing[selectedPeriod];
  const selectedPeriodInfo = BILLING_PERIODS[selectedPeriod];

  // Get capacity text based on plan type
  const getCapacityText = () => {
    if (isEnterprise && plan.users) {
      return `${plan.users.toLocaleString()} users (${plan.devices.toLocaleString()} devices)`;
    }
    if (String(plan.devices).includes("Unlimited")) {
      return "Unlimited devices";
    }
    return `${plan.devices} devices`;
  };

  return (
    <div className="card p-6 flex flex-col hover:shadow-xl transition-shadow relative bg-white">
      {/* Plan Badge */}
      {plan.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-bold bg-secondary text-white rounded-full shadow-md whitespace-nowrap">
          {plan.badge}
        </span>
      )}

      {/* Plan Header */}
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
        <p className="mt-1 text-gray-600 text-sm">{getCapacityText()}</p>
        {isEnterprise && selectedPricing.pricePerUser && (
          <p className="text-sm text-green-600 font-semibold mt-1">
            ${selectedPricing.pricePerUser}/user/month
          </p>
        )}
      </div>

      {/* Transparent Pricing Table */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="text-xs font-semibold text-gray-500 uppercase mb-2 text-center">
          Choose Your Billing Period
        </div>

        <div className="space-y-2">
          {periods.map((period) => {
            const pricing = plan.pricing[period.id];
            const isSelected = selectedPeriod === period.id;
            const savings = pricing.savings || 0;

            return (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id)}
                className={`
                  w-full text-left px-4 py-3 rounded-lg transition-all
                  ${isSelected
                    ? 'bg-primary text-white shadow-md ring-2 ring-primary'
                    : 'bg-white hover:bg-gray-100 border border-gray-200'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                        {period.name}
                      </span>
                      {period.discount > 0 && (
                        <span className={`
                          text-xs font-bold px-2 py-0.5 rounded-full
                          ${isSelected ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'}
                        `}>
                          Save {period.discount}%
                        </span>
                      )}
                    </div>
                    <div className={`text-xs mt-0.5 ${isSelected ? 'text-white/90' : 'text-gray-500'}`}>
                      {period.id === 'monthly'
                        ? 'Billed monthly'
                        : `${formatPrice(pricing.totalPrice)} billed ${period.interval}`
                      }
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-primary'}`}>
                      {formatPrice(pricing.monthlyPrice)}
                      <span className={`text-sm font-normal ${isSelected ? 'text-white/80' : 'text-gray-600'}`}>
                        /mo
                      </span>
                    </div>
                    {savings > 0 && (
                      <div className={`text-xs flex items-center justify-end gap-1 ${isSelected ? 'text-green-200' : 'text-green-600'}`}>
                        <TrendingDown className="w-3 h-3" />
                        {formatSavings(savings)}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Plan Summary */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
        <div className="text-center">
          <div className="text-xs text-gray-600 uppercase font-semibold">You'll Pay</div>
          <div className="text-3xl font-extrabold text-primary mt-1">
            {formatPrice(selectedPricing.monthlyPrice)}
            <span className="text-lg text-gray-600">/month</span>
          </div>
          {selectedPeriod !== 'monthly' && (
            <>
              <div className="text-sm text-gray-600 mt-1">
                {formatPrice(selectedPricing.totalPrice)} billed {selectedPeriodInfo.interval}
              </div>
              {selectedPricing.savings > 0 && (
                <div className="text-sm font-bold text-green-600 mt-1">
                  💰 {formatSavings(selectedPricing.savings)} vs monthly billing
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Features List */}
      <ul className="space-y-2 flex-1 mb-6">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start text-sm text-gray-700">
            <Check className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <div>
        <button
          type="button"
          disabled={busy}
          onClick={() => startCheckout(plan.code, selectedPeriod, setBusy)}
          className="button-primary w-full text-center disabled:opacity-60 text-lg py-3 font-semibold"
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
