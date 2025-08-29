import { PLANS } from "../lib/pricing.js";
import { Link } from "react-router-dom";
import CheckItem from "../components/CheckItem.jsx";
import FAQComparison from "../components/FAQComparison.jsx";
// remove this old import; server maps codes -> price IDs
// import { planToStripe } from "../utils/planMap.js";

const API = import.meta.env.VITE_API_URL;

if (!API) {
  // Helpful during dev if someone forgets to set the env
  // eslint-disable-next-line no-console
  console.error("VITE_API_URL is not set — cannot call /api/checkout");
}

/** Create Stripe Checkout session on the API and redirect */
async function startCheckout(planCode, accountType = "personal", qty = 1) {
  if (!API) throw new Error("Missing VITE_API_URL in frontend env");

  const res = await fetch(`${API}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan_code: planCode, account_type: accountType, quantity: qty }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Checkout failed: ${res.status} ${msg}`);
  }

  const out = await res.json();
  if (!out.url) throw new Error("No checkout URL returned");
  window.location.href = out.url; // go to Stripe Checkout
}

/** Handle clicks: send plan.code (server maps it to Stripe price) */
function handlePlanClick(e, plan) {
  e.preventDefault();
  const accountType = plan.accountType || (plan.business ? "business" : "personal");
  startCheckout(plan.code, accountType);
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

      {/* Competitor comparison section */}
      <FAQComparison />
    </>
  );
}

function PlanCard({ plan }) {
  return (
    <div className="card p-6 flex flex-col">
      {plan.badge && (
  <span className="inline-block mb-2 px-3 py-1 text-xs font-semibold bg-secondary text-white rounded-full">
    {plan.badge}
  </span>
)}
      <h3 className="text-xl font-semibold">{plan.name}</h3>
      <p className="mt-1 text-gray-600">
        {String(plan.devices).includes("Unlimited")
          ? "Unlimited devices"
          : `${plan.devices} devices`}
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
        <Link to="/login" onClick={(e)=>handlePlanClick(e, plan)} className="button-primary w-full text-center">
          Get {plan.name}
        </Link>
      </div>
    </div>
  );
}
