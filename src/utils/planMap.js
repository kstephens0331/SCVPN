import { PLANS } from "../lib/pricing";

const MAP = {
  personal:     { price_id: "personal",  plan_code: "personal_unlimited_monthly", account_type: "personal", quantity: 1 },
  gaming:       { price_id: "gaming",    plan_code: "gaming_monthly",             account_type: "personal", quantity: 1 },
  business10:   { price_id: "biz10",     plan_code: "business_10_seats",          account_type: "business", quantity: 10 },
  business50:   { price_id: "biz50",     plan_code: "business_50_seats",          account_type: "business", quantity: 50 },
  business100:  { price_id: "biz100",    plan_code: "business_100_seats",         account_type: "business", quantity: 100 },
  // Enterprise plans (500+ users)
  business500:  { price_id: "biz500",    plan_code: "business_500_seats",         account_type: "business", quantity: 500 },
  business1k:   { price_id: "biz1k",     plan_code: "business_1000_seats",        account_type: "business", quantity: 1000 },
  business2500: { price_id: "biz2500",   plan_code: "business_2500_seats",        account_type: "business", quantity: 2500 },
  business5k:   { price_id: "biz5k",     plan_code: "business_5000_seats",        account_type: "business", quantity: 5000 },
  business10k:  { price_id: "biz10k",    plan_code: "business_10000_seats",       account_type: "business", quantity: 10000 },
};

export function planToStripe(plan) {
  if (!plan || !plan.stripePriceId) return null;
  return {
    priceId: plan.stripePriceId,
    name: plan.name,
  };
}
