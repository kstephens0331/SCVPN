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
        monthlyPrice: 8.17,
        totalPrice: 98.06,
        savings: 21.82,
        stripePriceId: 'price_1SL6DKDcTrtfdJcSiLG9XRBa',
      },
      twoyear: {
        monthlyPrice: 6.99,
        totalPrice: 167.76,
        savings: 72.00,
        stripePriceId: 'price_1SL6DKDcTrtfdJcSEeHfSuUm',
      },
      threeyear: {
        monthlyPrice: 6.91,
        totalPrice: 248.87,
        savings: 110.77,
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
        monthlyPrice: 12.26,
        totalPrice: 147.14,
        savings: 32.74,
        stripePriceId: 'price_1SL6GSDcTrtfdJcSjsNOtdeL',
      },
      twoyear: {
        monthlyPrice: 10.49,
        totalPrice: 251.76,
        savings: 108.00,
        stripePriceId: 'price_1SL6GSDcTrtfdJcS07yDIIBA',
      },
      threeyear: {
        monthlyPrice: 10.37,
        totalPrice: 373.43,
        savings: 166.21,
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
        monthlyPrice: 100.00,
        totalPrice: 100.00,
        stripePriceId: 'price_1SL6LKDcTrtfdJcSsv0N2h0U',
      },
      sixmonth: {
        monthlyPrice: 90.00,
        totalPrice: 540.00,
        savings: 60.00,
        stripePriceId: 'price_1SL6NvDcTrtfdJcSF8TU1DQI',
      },
      yearly: {
        monthlyPrice: 80.00,
        totalPrice: 960.00,
        savings: 240.00,
        stripePriceId: 'price_1SL6NvDcTrtfdJcSZiHdLWYL',
      },
      twoyear: {
        monthlyPrice: 70.00,
        totalPrice: 1680.00,
        savings: 720.00,
        stripePriceId: 'price_1SL6NvDcTrtfdJcS4RaSp1B8',
      },
      threeyear: {
        monthlyPrice: 55.00,
        totalPrice: 1980.00,
        savings: 1620.00,
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
        monthlyPrice: 450.00,
        totalPrice: 450.00,
        stripePriceId: 'price_1SL6P2DcTrtfdJcSZKV2be1J',
      },
      sixmonth: {
        monthlyPrice: 405.00,
        totalPrice: 2430.00,
        savings: 270.00,
        stripePriceId: 'price_1SL6RVDcTrtfdJcSIQK1pZ1l',
      },
      yearly: {
        monthlyPrice: 360.00,
        totalPrice: 4320.00,
        savings: 1080.00,
        stripePriceId: 'price_1SL6RVDcTrtfdJcSl6s6dozT',
      },
      twoyear: {
        monthlyPrice: 315.00,
        totalPrice: 7560.00,
        savings: 3240.00,
        stripePriceId: 'price_1SL6RVDcTrtfdJcSd49Io0Zg',
      },
      threeyear: {
        monthlyPrice: 247.50,
        totalPrice: 8910.00,
        savings: 7290.00,
        stripePriceId: 'price_1SL6RVDcTrtfdJcSqpYoEYda',
      },
    },
  },

  business100: {
    code: 'business100',
    name: 'Business 100',
    accountType: 'business',
    devices: 100,
    description: 'Built for mid-size organizations',
    features: [
      'Protect up to 100 devices',
      'Advanced management dashboard',
      'Priority support response times',
      'Team usage analytics',
      'Dedicated onboarding support',
    ],
    pricing: {
      monthly: {
        monthlyPrice: 800.00,
        totalPrice: 800.00,
        stripePriceId: 'price_1SL6SBDcTrtfdJcSxVRuFSPi',
      },
      sixmonth: {
        monthlyPrice: 720.00,
        totalPrice: 4320.00,
        savings: 480.00,
        stripePriceId: 'price_1SL6TyDcTrtfdJcSfCTdSBEH',
      },
      yearly: {
        monthlyPrice: 640.00,
        totalPrice: 7680.00,
        savings: 1920.00,
        stripePriceId: 'price_1SL6TyDcTrtfdJcSxWtVJagx',
      },
      twoyear: {
        monthlyPrice: 560.00,
        totalPrice: 13440.00,
        savings: 5760.00,
        stripePriceId: 'price_1SL6TyDcTrtfdJcSBHsUgEXc',
      },
      threeyear: {
        monthlyPrice: 440.00,
        totalPrice: 15840.00,
        savings: 12960.00,
        stripePriceId: 'price_1SL6TyDcTrtfdJcSUQrzlkTG',
      },
    },
  },

  // Enterprise Plans (500+ users)
  business500: {
    code: 'business500',
    name: 'Business 500',
    accountType: 'business',
    users: 500,
    devices: 1500,
    badge: 'Enterprise',
    description: 'For growing enterprises',
    features: [
      '500 users (1,500 devices)',
      'Enterprise-grade servers (5 Gbps)',
      'Dedicated account manager',
      'Priority support response times',
      'Advanced usage analytics',
      'Custom onboarding',
    ],
    pricing: {
      monthly: {
        monthlyPrice: 3500.00,
        totalPrice: 3500.00,
        pricePerUser: 7.00,
        stripePriceId: 'price_1SaV0QDcTrtfdJcSyOW8NorL',
      },
      sixmonth: {
        monthlyPrice: 3150.00,
        totalPrice: 18900.00,
        pricePerUser: 6.30,
        savings: 2100.00,
        stripePriceId: 'price_1SaV23DcTrtfdJcS4yOS1xP8',
      },
      yearly: {
        monthlyPrice: 2800.00,
        totalPrice: 33600.00,
        pricePerUser: 5.60,
        savings: 8400.00,
        stripePriceId: 'price_1SaV23DcTrtfdJcSOGLqCQqD',
      },
      twoyear: {
        monthlyPrice: 2450.00,
        totalPrice: 58800.00,
        pricePerUser: 4.90,
        savings: 25200.00,
        stripePriceId: 'price_1SaV23DcTrtfdJcSV2rxcrCs',
      },
      threeyear: {
        monthlyPrice: 1925.00,
        totalPrice: 69300.00,
        pricePerUser: 3.85,
        savings: 56700.00,
        stripePriceId: 'price_1SaV23DcTrtfdJcSuLytD3Rg',
      },
    },
  },

  business1k: {
    code: 'business1k',
    name: 'Business 1K',
    accountType: 'business',
    users: 1000,
    devices: 3000,
    description: 'For mid-size enterprises',
    features: [
      '1,000 users (3,000 devices)',
      'Enterprise-grade servers (5 Gbps)',
      'Dedicated account manager',
      'Priority support response times',
      'Advanced usage analytics',
      'Custom onboarding',
      'SLA guarantee',
    ],
    pricing: {
      monthly: {
        monthlyPrice: 6000.00,
        totalPrice: 6000.00,
        pricePerUser: 6.00,
        stripePriceId: 'price_1SaV67DcTrtfdJcSYATKMGcb',
      },
      sixmonth: {
        monthlyPrice: 5400.00,
        totalPrice: 32400.00,
        pricePerUser: 5.40,
        savings: 3600.00,
        stripePriceId: 'price_1SaV6aDcTrtfdJcSWYFFTYd3',
      },
      yearly: {
        monthlyPrice: 4800.00,
        totalPrice: 57600.00,
        pricePerUser: 4.80,
        savings: 14400.00,
        stripePriceId: 'price_1SaV6aDcTrtfdJcSvszmcBJb',
      },
      twoyear: {
        monthlyPrice: 4200.00,
        totalPrice: 100800.00,
        pricePerUser: 4.20,
        savings: 43200.00,
        stripePriceId: 'price_1SaV72DcTrtfdJcSzxP4xxmw',
      },
      threeyear: {
        monthlyPrice: 3300.00,
        totalPrice: 118800.00,
        pricePerUser: 3.30,
        savings: 97200.00,
        stripePriceId: 'price_1SaV72DcTrtfdJcS28NuZmPX',
      },
    },
  },

  business2500: {
    code: 'business2500',
    name: 'Business 2.5K',
    accountType: 'business',
    users: 2500,
    devices: 7500,
    description: 'For large enterprises',
    features: [
      '2,500 users (7,500 devices)',
      'Enterprise-grade servers (5 Gbps)',
      'Dedicated account manager',
      'Priority support response times',
      'Advanced usage analytics',
      'Custom onboarding',
      'SLA guarantee',
      '24/7 phone support',
    ],
    pricing: {
      monthly: {
        monthlyPrice: 13750.00,
        totalPrice: 13750.00,
        pricePerUser: 5.50,
        stripePriceId: 'price_1SaV9JDcTrtfdJcSHgJisrQ8',
      },
      sixmonth: {
        monthlyPrice: 12375.00,
        totalPrice: 74250.00,
        pricePerUser: 4.95,
        savings: 8250.00,
        stripePriceId: 'price_1SaVA9DcTrtfdJcSSGDadYha',
      },
      yearly: {
        monthlyPrice: 11000.00,
        totalPrice: 132000.00,
        pricePerUser: 4.40,
        savings: 33000.00,
        stripePriceId: 'price_1SaVA9DcTrtfdJcS6vke8Hc5',
      },
      twoyear: {
        monthlyPrice: 9625.00,
        totalPrice: 231000.00,
        pricePerUser: 3.85,
        savings: 99000.00,
        stripePriceId: 'price_1SaVA9DcTrtfdJcSlvZk8rJI',
      },
      threeyear: {
        monthlyPrice: 7562.50,
        totalPrice: 272250.00,
        pricePerUser: 3.03,
        savings: 222750.00,
        stripePriceId: 'price_1SaVA9DcTrtfdJcSmecGCeqb',
      },
    },
  },

  business5k: {
    code: 'business5k',
    name: 'Business 5K',
    accountType: 'business',
    users: 5000,
    devices: 15000,
    description: 'For large-scale deployments',
    features: [
      '5,000 users (15,000 devices)',
      'Enterprise-grade servers (5 Gbps)',
      'Dedicated account manager',
      'Priority support response times',
      'Advanced usage analytics',
      'Custom onboarding',
      'SLA guarantee',
      '24/7 phone support',
      'Custom integrations',
    ],
    pricing: {
      monthly: {
        monthlyPrice: 25000.00,
        totalPrice: 25000.00,
        pricePerUser: 5.00,
        stripePriceId: 'price_1SaVBhDcTrtfdJcSU551OIPn',
      },
      sixmonth: {
        monthlyPrice: 22500.00,
        totalPrice: 135000.00,
        pricePerUser: 4.50,
        savings: 15000.00,
        stripePriceId: 'price_1SaVCzDcTrtfdJcSu6ARuHTn',
      },
      yearly: {
        monthlyPrice: 20000.00,
        totalPrice: 240000.00,
        pricePerUser: 4.00,
        savings: 60000.00,
        stripePriceId: 'price_1SaVCzDcTrtfdJcSeZ0vtq2m',
      },
      twoyear: {
        monthlyPrice: 17500.00,
        totalPrice: 420000.00,
        pricePerUser: 3.50,
        savings: 180000.00,
        stripePriceId: 'price_1SaVCzDcTrtfdJcSiZLGGzUY',
      },
      threeyear: {
        monthlyPrice: 13750.00,
        totalPrice: 495000.00,
        pricePerUser: 2.75,
        savings: 405000.00,
        stripePriceId: 'price_1SaVCzDcTrtfdJcSVMhByGeR',
      },
    },
  },

  business10k: {
    code: 'business10k',
    name: 'Business 10K',
    accountType: 'business',
    users: 10000,
    devices: 30000,
    badge: 'Best Value',
    description: 'For enterprise-scale deployments',
    features: [
      '10,000 users (30,000 devices)',
      'Enterprise-grade servers (5 Gbps)',
      'Dedicated account manager',
      'Priority support response times',
      'Advanced usage analytics',
      'Custom onboarding',
      'SLA guarantee',
      '24/7 phone support',
      'Custom integrations',
      'Volume discounts',
    ],
    pricing: {
      monthly: {
        monthlyPrice: 45000.00,
        totalPrice: 45000.00,
        pricePerUser: 4.50,
        stripePriceId: 'price_1SaVEqDcTrtfdJcSHPDOrCJ5',
      },
      sixmonth: {
        monthlyPrice: 40500.00,
        totalPrice: 243000.00,
        pricePerUser: 4.05,
        savings: 27000.00,
        stripePriceId: 'price_1SaVFfDcTrtfdJcSz8I7Kz3z',
      },
      yearly: {
        monthlyPrice: 36000.00,
        totalPrice: 432000.00,
        pricePerUser: 3.60,
        savings: 108000.00,
        stripePriceId: 'price_1SaVFfDcTrtfdJcSoQMLTKfP',
      },
      twoyear: {
        monthlyPrice: 31500.00,
        totalPrice: 756000.00,
        pricePerUser: 3.15,
        savings: 324000.00,
        stripePriceId: 'price_1SaVFfDcTrtfdJcS4JO2bYOF',
      },
      threeyear: {
        monthlyPrice: 24750.00,
        totalPrice: 891000.00,
        pricePerUser: 2.48,
        savings: 729000.00,
        stripePriceId: 'price_1SaVFfDcTrtfdJcSWHJvtU3V',
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
  return [PLAN_PRICING.business10, PLAN_PRICING.business50, PLAN_PRICING.business100];
}

export function getEnterprisePlans() {
  return [
    PLAN_PRICING.business500,
    PLAN_PRICING.business1k,
    PLAN_PRICING.business2500,
    PLAN_PRICING.business5k,
    PLAN_PRICING.business10k,
  ];
}

export function getAllBusinessPlans() {
  return [...getBusinessPlans(), ...getEnterprisePlans()];
}
