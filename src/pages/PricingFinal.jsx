// src/pages/PricingFinal.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Check, TrendingDown, ChevronDown, Shield, Zap, Users, Headphones, CreditCard, ArrowRight, Clock, Gift } from "lucide-react";
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
import { trackViewPricing, trackBeginCheckout, trackPlanSelected, trackBillingPeriodChange } from "../lib/analytics";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const API_URL = import.meta.env.VITE_API_URL || "https://scvpn-production.up.railway.app";

/**
 * Create Stripe Checkout session
 */
async function startCheckout(planCode, billingPeriod, setBusy) {
  try {
    setBusy(true);

    const plan = PLAN_PRICING[planCode];
    const pricing = plan.pricing[billingPeriod];

    // Track checkout begin event
    trackBeginCheckout(plan.name, billingPeriod, pricing.totalCents / 100);

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

  // Track pricing page view
  useEffect(() => {
    trackViewPricing();
  }, []);

  return (
    <>
      <Helmet>
        <title>Business VPN Pricing - Enterprise & Team Plans | SACVPN</title>
        <meta name="description" content="SACVPN business VPN pricing: Team plans from $6/device/month. Enterprise VPN with centralized management, HIPAA compliance, and 14-day free trial. Personal and gaming plans also available." />
        <meta name="keywords" content="business VPN pricing, enterprise VPN cost, team VPN plans, corporate VPN subscription, managed VPN service pricing, VPN for companies, small business VPN cost" />
        <link rel="canonical" href="https://www.sacvpn.com/pricing" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-accent-purple/5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl" />

        <div className="container-xl relative z-10 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Trial Badge */}
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-3 mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold shadow-lg shadow-green-500/25">
                <Clock className="w-4 h-4" />
                <span>14-Day Free Trial</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 text-brand-700 text-sm font-medium">
                <CreditCard className="w-4 h-4" />
                <span>30-Day Money Back Guarantee</span>
              </div>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 max-w-4xl mx-auto">
              Simple, Transparent{" "}
              <span className="text-gradient">VPN Pricing</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Start with a <span className="font-bold text-green-600">14-day free trial</span> — no credit card required.
              Choose the perfect VPN plan for your needs. No hidden fees. Cancel anytime. Save up to 45% with long-term plans.
            </motion.p>

            {/* Quick jump links */}
            <motion.div variants={fadeInUp} className="flex justify-center mt-8 gap-3 flex-wrap">
              <a
                href="#personal"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-medium shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Personal & Gaming
              </a>
              <a
                href="#business"
                className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:border-brand-200 hover:text-brand-600 transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Business
              </a>
              <a
                href="#enterprise"
                className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:border-brand-200 hover:text-brand-600 transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Enterprise
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-xl">

          {/* Personal & Gaming */}
          <motion.div
            id="personal"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="scroll-mt-24"
          >
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-4">
                <Users className="w-4 h-4" />
                For Individuals
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
                Personal & Gaming <span className="text-gradient">VPN Plans</span>
              </h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Connect unlimited devices on both plans. Gaming adds optimized routes for lower latency.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {personalPlans.map((plan) => (
                <TransparentPlanCard key={plan.code} plan={plan} />
              ))}
            </div>
          </motion.div>

          {/* Business */}
          <motion.div
            id="business"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mt-24 scroll-mt-24"
          >
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-purple/10 text-accent-purple text-sm font-medium mb-4">
                <Shield className="w-4 h-4" />
                For Teams
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
                Business <span className="text-gradient">VPN Solutions</span>
              </h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Secure your team with clear device quotas. Add or revoke devices anytime from your dashboard.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {businessPlans.map((plan) => (
                <TransparentPlanCard key={plan.code} plan={plan} />
              ))}
            </div>
          </motion.div>

          {/* Enterprise */}
          <motion.div
            id="enterprise"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mt-24 scroll-mt-24"
          >
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-lime/10 text-green-700 text-sm font-medium mb-4">
                <Zap className="w-4 h-4" />
                Volume Discounts
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
                Enterprise <span className="text-gradient">VPN Plans</span>
              </h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Volume pricing for large organizations. Each user gets 3 devices. Enterprise-grade 5 Gbps servers.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
              {enterprisePlans.map((plan) => (
                <div key={plan.code} className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
                  <CompactPlanCard plan={plan} isEnterprise />
                </div>
              ))}
            </div>
            <p className="text-center mt-8">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-brand-600 font-medium hover:text-brand-700 transition-colors"
              >
                Need more than 10,000 users? Contact us for custom pricing
                <ArrowRight className="w-4 h-4" />
              </Link>
            </p>
          </motion.div>

          {/* Trust Signals */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mt-20"
          >
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-dark-900 via-dark-800 to-brand-950 p-12">
              {/* Background pattern */}
              <div className="absolute inset-0 bg-gradient-mesh opacity-30" />

              <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-display font-bold text-white text-center mb-10">
                  Why 50,000+ Users Trust SACVPN
                </h3>

                <div className="grid md:grid-cols-5 gap-6">
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-white">14-Day</div>
                    <div className="text-gray-400 mt-1 text-sm">Free Trial</div>
                  </div>
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center mx-auto mb-3">
                      <CreditCard className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-white">30-Day</div>
                    <div className="text-gray-400 mt-1 text-sm">Money-Back Guarantee</div>
                  </div>
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-purple to-accent-pink flex items-center justify-center mx-auto mb-3">
                      <Gift className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-white">Refer</div>
                    <div className="text-gray-400 mt-1 text-sm">Get 1 Month Free</div>
                  </div>
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-lime to-emerald-500 flex items-center justify-center mx-auto mb-3">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-white">Unlimited</div>
                    <div className="text-gray-400 mt-1 text-sm">Devices (Personal/Gaming)</div>
                  </div>
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-white">No-Logs</div>
                    <div className="text-gray-400 mt-1 text-sm">Privacy Policy</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Referral Program Section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mt-16"
          >
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-accent-purple/10 via-brand-50 to-accent-pink/10 p-12 border border-accent-purple/20">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent-purple/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-pink/10 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="text-center mb-10">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-purple/20 text-accent-purple text-sm font-bold mb-4">
                    <Gift className="w-4 h-4" />
                    Referral Program
                  </span>
                  <h3 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
                    Refer Friends, <span className="text-gradient">Get Free VPN</span>
                  </h3>
                  <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                    Share SACVPN with friends. When they stay for a month, you both get a free month of service.
                  </p>
                </div>

                {/* How it works */}
                <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center mx-auto mb-4 border border-gray-100">
                      <span className="text-2xl font-bold text-brand-600">1</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Invite Friends</h4>
                    <p className="text-gray-600 text-sm">Share your unique referral link with friends and family</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center mx-auto mb-4 border border-gray-100">
                      <span className="text-2xl font-bold text-brand-600">2</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">They Subscribe</h4>
                    <p className="text-gray-600 text-sm">Your friend signs up and stays for at least one month</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center mx-auto mb-4 border border-gray-100">
                      <span className="text-2xl font-bold text-accent-purple">🎉</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Both Win</h4>
                    <p className="text-gray-600 text-sm">You both receive a free month of SACVPN service</p>
                  </div>
                </div>

                {/* CTA */}
                <div className="text-center mt-10">
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink text-white font-bold shadow-lg shadow-accent-purple/25 hover:shadow-xl hover:shadow-accent-purple/30 transform hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <Gift className="w-5 h-5" />
                    Get Your Referral Link
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <p className="text-sm text-gray-500 mt-3">Available to all SACVPN subscribers</p>
                </div>
              </div>
            </div>
          </motion.div>
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

      {/* 14-Day Free Trial Badge */}
      <div className="mb-4 -mx-6 -mt-6 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-t-xl">
        <div className="flex items-center justify-center gap-2 text-white font-bold">
          <Clock className="w-4 h-4" />
          <span>14-Day Free Trial</span>
        </div>
        <p className="text-center text-green-100 text-xs mt-1">No credit card required to start</p>
      </div>

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
                onClick={() => {
                  setSelectedPeriod(period.id);
                  trackBillingPeriodChange(period.name);
                }}
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
          className="w-full text-center disabled:opacity-60 text-lg py-3 font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transform hover:-translate-y-0.5 transition-all duration-300"
        >
          {busy ? "Redirecting…" : "Start Free Trial"}
        </button>
        <p className="text-center text-xs text-gray-500 mt-2">Then {formatPrice(selectedPricing.monthlyPrice)}/mo after trial</p>
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

/**
 * Compact Plan Card - Shows recommended 2-year price with accordion for other options
 */
function CompactPlanCard({ plan, isEnterprise = false }) {
  const [showAllPeriods, setShowAllPeriods] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('twoyear'); // Default to 2-year (recommended)
  const [busy, setBusy] = useState(false);

  const periods = Object.values(BILLING_PERIODS);
  const selectedPricing = plan.pricing[selectedPeriod];
  const selectedPeriodInfo = BILLING_PERIODS[selectedPeriod];

  // Get capacity text
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
      </div>

      {/* Main Price Display - Shows selected period */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4 text-center">
        <div className="text-xs text-gray-500 uppercase font-semibold mb-1">
          {selectedPeriodInfo.name} Plan
          {selectedPeriodInfo.discount > 0 && (
            <span className="ml-2 text-green-600">Save {selectedPeriodInfo.discount}%</span>
          )}
        </div>
        <div className="text-3xl font-extrabold text-primary">
          {formatPrice(selectedPricing.monthlyPrice)}
          <span className="text-lg text-gray-600">/mo</span>
        </div>
        {isEnterprise && selectedPricing.pricePerUser && (
          <div className="text-sm text-green-600 font-semibold mt-1">
            ${selectedPricing.pricePerUser}/user/month
          </div>
        )}
        {selectedPeriod !== 'monthly' && (
          <div className="text-sm text-gray-600 mt-1">
            {formatPrice(selectedPricing.totalPrice)} billed {selectedPeriodInfo.interval}
          </div>
        )}
        {selectedPricing.savings > 0 && (
          <div className="text-sm font-bold text-green-600 mt-1">
            💰 {formatSavings(selectedPricing.savings)}
          </div>
        )}
      </div>

      {/* Billing Period Accordion */}
      <div className="mb-4">
        <button
          onClick={() => setShowAllPeriods(!showAllPeriods)}
          className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition"
        >
          <span>Change billing period</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showAllPeriods ? 'rotate-180' : ''}`} />
        </button>

        {showAllPeriods && (
          <div className="mt-2 space-y-1 border-t pt-2">
            {periods.map((period) => {
              const pricing = plan.pricing[period.id];
              const isSelected = selectedPeriod === period.id;

              return (
                <button
                  key={period.id}
                  onClick={() => {
                    setSelectedPeriod(period.id);
                    setShowAllPeriods(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition text-sm ${
                    isSelected
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{period.name}</span>
                      {period.discount > 0 && (
                        <span className={`ml-2 text-xs ${isSelected ? 'text-green-200' : 'text-green-600'}`}>
                          -{period.discount}%
                        </span>
                      )}
                    </div>
                    <div className={`font-semibold ${isSelected ? 'text-white' : 'text-primary'}`}>
                      {formatPrice(pricing.monthlyPrice)}/mo
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Features List */}
      <ul className="space-y-2 flex-1 mb-6">
        {plan.features.slice(0, 5).map((feature, i) => (
          <li key={i} className="flex items-start text-sm text-gray-700">
            <Check className="w-4 h-4 text-primary mr-2 flex-shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
        {plan.features.length > 5 && (
          <li className="text-xs text-gray-500 pl-6">
            +{plan.features.length - 5} more features
          </li>
        )}
      </ul>

      {/* CTA Button */}
      <button
        type="button"
        disabled={busy}
        onClick={() => startCheckout(plan.code, selectedPeriod, setBusy)}
        className="button-primary w-full text-center disabled:opacity-60 py-3 font-semibold"
      >
        {busy ? "Redirecting…" : `Get ${plan.name}`}
      </button>

      {/* Sign in link */}
      <div className="mt-3 text-center">
        <Link to="/login" className="text-sm text-gray-500 underline hover:text-gray-700">
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
}
