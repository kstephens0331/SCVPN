// src/lib/pricing-new.js
// Enhanced pricing structure with annual billing options

/**
 * Billing periods configuration
 */
export const BILLING_PERIODS = {
  monthly: {
    id: 'monthly',
    name: 'Monthly',
    interval: 'month',
    months: 1,
    discount: 0,
    badge: null,
  },
  sixmonth: {
    id: 'sixmonth',
    name: '6 Months',
    interval: '6 months',
    months: 6,
    discount: 10,
    badge: null,
  },
  yearly: {
    id: 'yearly',
    name: '1 Year',
    interval: 'year',
    months: 12,
    discount: 20,
    badge: null,
  },
  twoyear: {
    id: 'twoyear',
    name: '2 Years',
    interval: '2 years',
    months: 24,
    discount: 30,
    badge: 'Most Popular',
  },
  threeyear: {
    id: 'threeyear',
    name: '3 Years',
    interval: '3 years',
    months: 36,
    discount: 45,
    badge: 'Best Value',
  },
};

/**
 * Plan pricing structure
 * Each plan has pricing for all billing periods
 */
export const PLAN_PRICING = {
  personal: {
    code: 'personal',
    name: 'Personal',
    accountType: 'personal',
    devices: 'Unlimited',
    description: 'Perfect for individuals and families',
    features: [
      'Protect all your personal devices at home',
      'Stream and browse privately without ISP throttling',
      'Simple QR setup for non-technical users',
      'Unlimited devices - connect everything',
      '24/7 customer support',
    ],
    pricing: {
      monthly: {
        monthlyPrice: 9.99,
        totalPrice: 9.99,
        stripePriceId: 'price_1SL6ArDcTrtfdJcSCdOK5tBa',
      },
      sixmonth: {
        monthlyPrice: 8.99,
        totalPrice: 53.94,
        savings: 6.00,
        stripePriceId: 'price_1SL6DKDcTrtfdJcS6xphfsqf',
      },
      yearly: {
        monthlyPrice: 7.99,
        totalPrice: 95.88,
        savings: 24.00,
        stripePriceId: 'price_1SL6DKDcTrtfdJcSiLG9XRBa',
      },
      twoyear: {
        monthlyPrice: 6.99,
        totalPrice: 167.76,
        savings: 72.00,
        stripePriceId: 'price_1SL6DKDcTrtfdJcSEeHfSuUm',
      },
      threeyear: {
        monthlyPrice: 5.49,
        totalPrice: 197.64,
        savings: 162.00,
        stripePriceId: 'price_1SL6DKDcTrtfdJcSfDX6PVCw',
      },
    },
  },

  gaming: {
    code: 'gaming',
    name: 'Gaming',
    accountType: 'personal',
    devices: 'Unlimited',
    badge: 'Most Popular',
    description: 'Optimized for gamers and streamers',
    features: [
      'Low-latency gaming-optimized routes',
      'DDoS protection for competitive play',
      'Unlimited devices - all consoles & PCs covered',
      'Priority routing for best performance',
      'Gaming-focused support team',
    ],
    pricing: {
      monthly: {
        monthlyPrice: 14.99,
        totalPrice: 14.99,
        stripePriceId: 'price_1SL6EeDcTrtfdJcSrQ5XO4vb',
      },
      sixmonth: {
        monthlyPrice: 13.49,
        totalPrice: 80.94,
        savings: 9.00,
        stripePriceId: 'price_1SL6GSDcTrtfdJcSpeAWPnhl',
      },
      yearly: {
        monthlyPrice: 11.99,
        totalPrice: 143.88,
        savings: 36.00,
        stripePriceId: 'price_1SL6GSDcTrtfdJcSjsNOtdeL',
      },
      twoyear: {
        monthlyPrice: 10.49,
        totalPrice: 251.76,
        savings: 108.00,
        stripePriceId: 'price_1SL6GSDcTrtfdJcS07yDIIBA',
      },
      threeyear: {
        monthlyPrice: 8.24,
        totalPrice: 296.64,
        savings: 243.00,
        stripePriceId: 'price_1SL6GSDcTrtfdJcSGgXCNdCm',
      },
    },
  },

  business10: {
    code: 'business10',
    name: 'Business 10',
    accountType: 'business',
    devices: 10,
    description: 'Perfect for small teams',
    features: [
      'Secure up to 10 work devices',
      'Centralized management dashboard',
      'Team member access controls',
      'Affordable entry tier for small teams',
      'Email support',
    ],
    pricing: {
      monthly: {
        monthlyPrice: 59.99,
        totalPrice: 59.99,
        stripePriceId: 'price_1SL6LKDcTrtfdJcSsv0N2h0U',
      },
      sixmonth: {
        monthlyPrice: 53.99,
        totalPrice: 323.94,
        savings: 36.00,
        stripePriceId: 'price_1SL6NvDcTrtfdJcSF8TU1DQI',
      },
      yearly: {
        monthlyPrice: 47.99,
        totalPrice: 575.88,
        savings: 144.00,
        stripePriceId: 'price_1SL6NvDcTrtfdJcSZiHdLWYL',
      },
      twoyear: {
        monthlyPrice: 41.99,
        totalPrice: 1007.76,
        savings: 432.00,
        stripePriceId: 'price_1SL6NvDcTrtfdJcS4RaSp1B8',
      },
      threeyear: {
        monthlyPrice: 32.99,
        totalPrice: 1187.64,
        savings: 972.00,
        stripePriceId: 'price_1SL6NvDcTrtfdJcStBvHeVN4',
      },
    },
  },

  business50: {
    code: 'business50',
    name: 'Business 50',
    accountType: 'business',
    devices: 50,
    badge: 'Best for Teams',
    description: 'Ideal for growing companies',
    features: [
      'Cover 50 devices across your organization',
      'Role-based device management',
      'Priority support response times',
      'Advanced usage analytics',
      'Dedicated onboarding specialist',
    ],
    pricing: {
      monthly: {
        monthlyPrice: 179.99,
        totalPrice: 179.99,
        stripePriceId: 'price_1SL6P2DcTrtfdJcSZKV2be1J',
      },
      sixmonth: {
        monthlyPrice: 161.99,
        totalPrice: 971.94,
        savings: 108.00,
        stripePriceId: 'price_1SL6RVDcTrtfdJcSIQK1pZ1l',
      },
      yearly: {
        monthlyPrice: 143.99,
        totalPrice: 1727.88,
        savings: 432.00,
        stripePriceId: 'price_1SL6RVDcTrtfdJcSl6s6dozT',
      },
      twoyear: {
        monthlyPrice: 125.99,
        totalPrice: 3023.76,
        savings: 1296.00,
        stripePriceId: 'price_1SL6RVDcTrtfdJcSd49Io0Zg',
      },
      threeyear: {
        monthlyPrice: 98.99,
        totalPrice: 3563.64,
        savings: 2916.00,
        stripePriceId: 'price_1SL6RVDcTrtfdJcSqpYoEYda',
      },
    },
  },

  business250: {
    code: 'business250',
    name: 'Business 250',
    accountType: 'business',
    devices: 250,
    description: 'Enterprise-grade solution',
    features: [
      'Enterprise coverage for 250+ devices',
      'Custom SLAs and onboarding support',
      'Dedicated account manager',
      'Tailored routing and infrastructure',
      '24/7 phone and email support',
    ],
    pricing: {
      monthly: {
        monthlyPrice: 999.99,
        totalPrice: 999.99,
        stripePriceId: 'price_1SL6SBDcTrtfdJcSxVRuFSPi',
      },
      sixmonth: {
        monthlyPrice: 899.99,
        totalPrice: 5399.94,
        savings: 600.00,
        stripePriceId: 'price_1SL6TyDcTrtfdJcSfCTdSBEH',
      },
      yearly: {
        monthlyPrice: 799.99,
        totalPrice: 9599.88,
        savings: 2400.00,
        stripePriceId: 'price_1SL6TyDcTrtfdJcSxWtVJagx',
      },
      twoyear: {
        monthlyPrice: 699.99,
        totalPrice: 16799.76,
        savings: 7200.00,
        stripePriceId: 'price_1SL6TyDcTrtfdJcSBHsUgEXc',
      },
      threeyear: {
        monthlyPrice: 549.99,
        totalPrice: 19799.64,
        savings: 16200.00,
        stripePriceId: 'price_1SL6TyDcTrtfdJcSUQrzlkTG',
      },
    },
  },
};

/**
 * Helper function to get pricing for a plan and billing period
 */
export function getPlanPricing(planCode, billingPeriod = 'monthly') {
  const plan = PLAN_PRICING[planCode];
  if (!plan) return null;

  const pricing = plan.pricing[billingPeriod];
  const period = BILLING_PERIODS[billingPeriod];

  return {
    ...plan,
    ...pricing,
    billingPeriod: period,
    interval: period.interval,
    discount: period.discount,
  };
}

/**
 * Helper function to format savings
 */
export function formatSavings(amount) {
  return `Save $${amount.toFixed(2)}`;
}

/**
 * Helper function to format price
 */
export function formatPrice(amount) {
  return `$${amount.toFixed(2)}`;
}

/**
 * Helper function to get all plans for a category
 */
export function getPersonalPlans() {
  return [PLAN_PRICING.personal, PLAN_PRICING.gaming];
}

export function getBusinessPlans() {
  return [PLAN_PRICING.business10, PLAN_PRICING.business50, PLAN_PRICING.business250];
}
