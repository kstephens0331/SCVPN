import { PLANS } from "../lib/pricing";

const MAP = {
  personal:    { price_id: "personal",  plan_code: "personal_unlimited_monthly", account_type: "personal", quantity: 1 },
  gaming:      { price_id: "gaming",    plan_code: "gaming_monthly",             account_type: "personal", quantity: 1 },
  business10:  { price_id: "biz10",     plan_code: "business_10_seats",          account_type: "business", quantity: 10 },
  business50:  { price_id: "biz50",     plan_code: "business_50_seats",          account_type: "business", quantity: 50 },
  business250: { price_id: "biz250",    plan_code: "business_250_seats",         account_type: "business", quantity: 250 },
};

export function planToStripe(plan) {
  if (!plan || !plan.stripePriceId) return null;
  return {
    priceId: plan.stripePriceId,
    name: plan.name,
  };
}
