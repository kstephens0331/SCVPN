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
      sixMonth: "price_1SL6DKDcTrtfdJcS6xphfsqf",
      yearly: "price_1SL6DKDcTrtfdJcSiLG9XRBa",
      twoYear: "price_1SL6DKDcTrtfdJcSEeHfSuUm",
      threeYear: "price_1SL6DKDcTrtfdJcSfDX6PVCw",
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
      sixMonth: "price_1SL6GSDcTrtfdJcSpeAWPnhl",
      yearly: "price_1SL6GSDcTrtfdJcSjsNOtdeL",
      twoYear: "price_1SL6GSDcTrtfdJcS07yDIIBA",
      threeYear: "price_1SL6GSDcTrtfdJcSGgXCNdCm",
    },
    features: [
      "Low-latency gaming-optimized routes",
      "DDoS protection for competitive play",
      "Unlimited devices so all consoles & PCs are covered",
    ],
  },
  business10: {
    code: "business10",
    name: "Business 10",
    monthlyPrice: 100.00,
    devices: 10,
    pricePerDevice: 10.00,
    stripePriceIds: {
      monthly: "price_1SL6LKDcTrtfdJcSsv0N2h0U",
      sixMonth: "price_1SL6NvDcTrtfdJcSF8TU1DQI",
      yearly: "price_1SL6NvDcTrtfdJcSZiHdLWYL",
      twoYear: "price_1SL6NvDcTrtfdJcS4RaSp1B8",
      threeYear: "price_1SL6NvDcTrtfdJcStBvHeVN4",
    },
    features: [
      "Up to 10 devices",
      "Unlimited bandwidth",
      "Global server network",
      "Email support",
      "Device management dashboard",
    ],
  },
  business50: {
    code: "business50",
    name: "Business 50",
    monthlyPrice: 450.00,
    devices: 50,
    pricePerDevice: 9.00,
    badge: "Best for Teams",
    stripePriceIds: {
      monthly: "price_1SL6P2DcTrtfdJcSZKV2be1J",
      sixMonth: "price_1SL6RVDcTrtfdJcSIQK1pZ1l",
      yearly: "price_1SL6RVDcTrtfdJcSl6s6dozT",
      twoYear: "price_1SL6RVDcTrtfdJcSd49Io0Zg",
      threeYear: "price_1SL6RVDcTrtfdJcSqpYoEYda",
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
    monthlyPrice: 800.00,
    devices: 100,
    pricePerDevice: 8.00,
    stripePriceIds: {
      monthly: "price_1SL6SBDcTrtfdJcSxVRuFSPi",
      sixMonth: "price_1SL6TyDcTrtfdJcSfCTdSBEH",
      yearly: "price_1SL6TyDcTrtfdJcSxWtVJagx",
      twoYear: "price_1SL6TyDcTrtfdJcSBHsUgEXc",
      threeYear: "price_1SL6TyDcTrtfdJcSUQrzlkTG",
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
    badge: "Enterprise",
    code: "business500",
    name: "Business 500",
    monthlyPrice: 3500.00,
    users: 500,
    devices: 1500,
    pricePerUser: 7.00,
    stripePriceIds: {
      monthly: "price_1SaV0QDcTrtfdJcSyOW8NorL",
      sixMonth: "price_1SaV23DcTrtfdJcS4yOS1xP8",
      yearly: "price_1SaV23DcTrtfdJcSOGLqCQqD",
      twoYear: "price_1SaV23DcTrtfdJcSV2rxcrCs",
      threeYear: "price_1SaV23DcTrtfdJcSuLytD3Rg",
    },
    features: [
      "500 users (1,500 devices)",
      "Enterprise-grade servers",
      "5 Gbps unmetered bandwidth",
      "Priority support",
      "Device management dashboard",
      "Team member management",
      "Advanced analytics",
    ],
  },
  business1k: {
    code: "business1k",
    name: "Business 1K",
    monthlyPrice: 6000.00,
    users: 1000,
    devices: 3000,
    pricePerUser: 6.00,
    stripePriceIds: {
      monthly: "price_1SaV67DcTrtfdJcSYATKMGcb",
      sixMonth: "price_1SaV6aDcTrtfdJcSWYFFTYd3",
      yearly: "price_1SaV6aDcTrtfdJcSvszmcBJb",
      twoYear: "price_1SaV72DcTrtfdJcSzxP4xxmw",
      threeYear: "price_1SaV72DcTrtfdJcS28NuZmPX",
    },
    features: [
      "1,000 users (3,000 devices)",
      "Enterprise-grade servers",
      "5 Gbps unmetered bandwidth",
      "Priority support",
      "Device management dashboard",
      "Team member management",
      "Advanced analytics",
      "Dedicated account manager",
    ],
  },
  business2500: {
    code: "business2500",
    name: "Business 2.5K",
    monthlyPrice: 13750.00,
    users: 2500,
    devices: 7500,
    pricePerUser: 5.50,
    stripePriceIds: {
      monthly: "price_1SaV9JDcTrtfdJcSHgJisrQ8",
      sixMonth: "price_1SaVA9DcTrtfdJcSSGDadYha",
      yearly: "price_1SaVA9DcTrtfdJcS6vke8Hc5",
      twoYear: "price_1SaVA9DcTrtfdJcSlvZk8rJI",
      threeYear: "price_1SaVA9DcTrtfdJcSmecGCeqb",
    },
    features: [
      "2,500 users (7,500 devices)",
      "Enterprise-grade servers",
      "5 Gbps unmetered bandwidth",
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
    name: "Business 5K",
    monthlyPrice: 25000.00,
    users: 5000,
    devices: 15000,
    pricePerUser: 5.00,
    stripePriceIds: {
      monthly: "price_1SaVBhDcTrtfdJcSU551OIPn",
      sixMonth: "price_1SaVCzDcTrtfdJcSu6ARuHTn",
      yearly: "price_1SaVCzDcTrtfdJcSeZ0vtq2m",
      twoYear: "price_1SaVCzDcTrtfdJcSiZLGGzUY",
      threeYear: "price_1SaVCzDcTrtfdJcSVMhByGeR",
    },
    features: [
      "5,000 users (15,000 devices)",
      "Enterprise-grade servers",
      "5 Gbps unmetered bandwidth",
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
    name: "Business 10K",
    monthlyPrice: 45000.00,
    users: 10000,
    devices: 30000,
    pricePerUser: 4.50,
    stripePriceIds: {
      monthly: "price_1SaVEqDcTrtfdJcSHPDOrCJ5",
      sixMonth: "price_1SaVFfDcTrtfdJcSz8I7Kz3z",
      yearly: "price_1SaVFfDcTrtfdJcSoQMLTKfP",
      twoYear: "price_1SaVFfDcTrtfdJcS4JO2bYOF",
      threeYear: "price_1SaVFfDcTrtfdJcSWHJvtU3V",
    },
    features: [
      "10,000 users (30,000 devices)",
      "Enterprise-grade servers",
      "5 Gbps unmetered bandwidth",
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
