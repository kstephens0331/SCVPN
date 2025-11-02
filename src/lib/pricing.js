// Pricing structure with multi-period support
// Maintains target profit margins: Monthly 55%, 6-Month 50%, Yearly 45%, 2-Year 40%, 3-Year 35%
// Discount structure: 6-month (10%), yearly (18.2%), 2-year (25%), 3-year (30.8%)

export const BILLING_PERIODS = {
  monthly: { label: "Monthly", months: 1, discount: 0 },
  sixMonth: { label: "6 Months", months: 6, discount: 0.10 },
  yearly: { label: "Yearly", months: 12, discount: 0.182 },
  twoYear: { label: "2 Years", months: 24, discount: 0.25 },
  threeYear: { label: "3 Years", months: 36, discount: 0.308 },
};

// Helper function to calculate price for a billing period
export function calculatePrice(monthlyPrice, billingPeriod) {
  const period = BILLING_PERIODS[billingPeriod];
  const discount = 1 - period.discount;
  return (monthlyPrice * period.months * discount).toFixed(2);
}

// Helper function to get monthly equivalent price
export function getMonthlyEquivalent(monthlyPrice, billingPeriod) {
  const period = BILLING_PERIODS[billingPeriod];
  const discount = 1 - period.discount;
  return (monthlyPrice * discount).toFixed(2);
}

export const PLANS = {
  personal: {
    code: "personal",
    name: "Personal",
    monthlyPrice: 9.99,
    devices: "Unlimited",
    stripePriceIds: {
      monthly: "price_1SL6ArDcTrtfdJcSCdOK5tBa",
      sixMonth: "price_TBD_personal_6mo",
      yearly: "price_TBD_personal_yearly",
      twoYear: "price_TBD_personal_2yr",
      threeYear: "price_TBD_personal_3yr",
    },
    features: [
      "Protect all your personal devices at home",
      "Stream and browse privately without ISP throttling",
      "Simple QR setup for non-technical users",
    ],
  },
  gaming: {
    badge: "Most Popular",
    code: "gaming",
    name: "Gaming",
    monthlyPrice: 14.99,
    devices: "Unlimited",
    stripePriceIds: {
      monthly: "price_1SL6EeDcTrtfdJcSrQ5XO4vb",
      sixMonth: "price_TBD_gaming_6mo",
      yearly: "price_TBD_gaming_yearly",
      twoYear: "price_TBD_gaming_2yr",
      threeYear: "price_TBD_gaming_3yr",
    },
    features: [
      "Low-latency gaming-optimized routes",
      "DDoS protection for competitive play",
      "Unlimited devices so all consoles & PCs are covered",
    ],
  },
  business50: {
    code: "business50",
    name: "Business 50",
    monthlyPrice: 933.33,
    devices: 50,
    pricePerDevice: 18.67,
    stripePriceIds: {
      monthly: "price_TBD_business50_monthly",
      sixMonth: "price_TBD_business50_6mo",
      yearly: "price_TBD_business50_yearly",
      twoYear: "price_TBD_business50_2yr",
      threeYear: "price_TBD_business50_3yr",
    },
    features: [
      "Up to 50 devices",
      "Unlimited bandwidth",
      "Global server network",
      "Priority support",
      "Device management dashboard",
      "Team member management",
    ],
  },
  business100: {
    code: "business100",
    name: "Business 100",
    monthlyPrice: 933.33,
    devices: 100,
    pricePerDevice: 9.33,
    stripePriceIds: {
      monthly: "price_TBD_business100_monthly",
      sixMonth: "price_TBD_business100_6mo",
      yearly: "price_TBD_business100_yearly",
      twoYear: "price_TBD_business100_2yr",
      threeYear: "price_TBD_business100_3yr",
    },
    features: [
      "Up to 100 devices",
      "Unlimited bandwidth",
      "Global server network",
      "Priority support",
      "Device management dashboard",
      "Team member management",
    ],
  },
  business500: {
    badge: "Best for Teams",
    code: "business500",
    name: "Business 500",
    monthlyPrice: 2800.00,
    devices: 500,
    pricePerDevice: 5.60,
    stripePriceIds: {
      monthly: "price_TBD_business500_monthly",
      sixMonth: "price_TBD_business500_6mo",
      yearly: "price_TBD_business500_yearly",
      twoYear: "price_TBD_business500_2yr",
      threeYear: "price_TBD_business500_3yr",
    },
    features: [
      "Up to 500 devices",
      "Unlimited bandwidth",
      "Global server network",
      "Priority support",
      "Device management dashboard",
      "Team member management",
      "Advanced analytics",
    ],
  },
  business1k: {
    code: "business1k",
    name: "Business 1,000",
    monthlyPrice: 5600.00,
    devices: 1000,
    pricePerDevice: 5.60,
    stripePriceIds: {
      monthly: "price_TBD_business1k_monthly",
      sixMonth: "price_TBD_business1k_6mo",
      yearly: "price_TBD_business1k_yearly",
      twoYear: "price_TBD_business1k_2yr",
      threeYear: "price_TBD_business1k_3yr",
    },
    features: [
      "Up to 1,000 devices",
      "Unlimited bandwidth",
      "Global server network",
      "Priority support",
      "Device management dashboard",
      "Team member management",
      "Advanced analytics",
      "Dedicated account manager",
    ],
  },
  business2500: {
    code: "business2500",
    name: "Business 2,500",
    monthlyPrice: 13066.67,
    devices: 2500,
    pricePerDevice: 5.23,
    stripePriceIds: {
      monthly: "price_TBD_business2500_monthly",
      sixMonth: "price_TBD_business2500_6mo",
      yearly: "price_TBD_business2500_yearly",
      twoYear: "price_TBD_business2500_2yr",
      threeYear: "price_TBD_business2500_3yr",
    },
    features: [
      "Up to 2,500 devices",
      "Unlimited bandwidth",
      "Global server network",
      "Priority support",
      "Device management dashboard",
      "Team member management",
      "Advanced analytics",
      "Dedicated account manager",
      "Custom SLA",
    ],
  },
  business5k: {
    code: "business5k",
    name: "Business 5,000",
    monthlyPrice: 25200.00,
    devices: 5000,
    pricePerDevice: 5.04,
    stripePriceIds: {
      monthly: "price_TBD_business5k_monthly",
      sixMonth: "price_TBD_business5k_6mo",
      yearly: "price_TBD_business5k_yearly",
      twoYear: "price_TBD_business5k_2yr",
      threeYear: "price_TBD_business5k_3yr",
    },
    features: [
      "Up to 5,000 devices",
      "Unlimited bandwidth",
      "Global server network",
      "Priority support",
      "Device management dashboard",
      "Team member management",
      "Advanced analytics",
      "Dedicated account manager",
      "Custom SLA",
      "24/7 phone support",
    ],
  },
  business10k: {
    code: "business10k",
    name: "Business 10,000",
    monthlyPrice: 50400.00,
    devices: 10000,
    pricePerDevice: 5.04,
    stripePriceIds: {
      monthly: "price_TBD_business10k_monthly",
      sixMonth: "price_TBD_business10k_6mo",
      yearly: "price_TBD_business10k_yearly",
      twoYear: "price_TBD_business10k_2yr",
      threeYear: "price_TBD_business10k_3yr",
    },
    features: [
      "Up to 10,000 devices",
      "Unlimited bandwidth",
      "Global server network",
      "Priority support",
      "Device management dashboard",
      "Team member management",
      "Advanced analytics",
      "Dedicated account manager",
      "Custom SLA",
      "24/7 phone support",
      "Custom integrations",
    ],
  },
  enterprise: {
    badge: "Fortune 500",
    code: "enterprise",
    name: "Enterprise Custom",
    monthlyPrice: "Custom",
    devices: "Unlimited",
    pricePerDevice: "Contact Sales",
    stripePriceIds: {
      monthly: null,
      sixMonth: null,
      yearly: null,
      twoYear: null,
      threeYear: null,
    },
    features: [
      "Unlimited devices",
      "Unlimited bandwidth",
      "Global server network",
      "White-glove support",
      "Device management dashboard",
      "Team member management",
      "Advanced analytics",
      "Dedicated account manager",
      "Custom SLA",
      "24/7 phone support",
      "Custom integrations",
      "Bulk server discounts",
      "Custom deployment options",
    ],
  },
};

// Profit margin targets per billing period
export const TARGET_MARGINS = {
  monthly: 0.55,    // 55% profit margin
  sixMonth: 0.50,   // 50% profit margin
  yearly: 0.45,     // 45% profit margin
  twoYear: 0.40,    // 40% profit margin
  threeYear: 0.35,  // 35% profit margin
};

// Example usage:
// const plan = PLANS.business500;
// const yearlyPrice = calculatePrice(plan.monthlyPrice, 'yearly');
// const monthlyEquivalent = getMonthlyEquivalent(plan.monthlyPrice, 'yearly');
// Result: yearlyPrice = $8943.46, monthlyEquivalent = $745.45/mo (18.2% discount)
