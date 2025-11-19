-- ============================================================================
-- SACVPN DEVICE-BASED PRICING UPDATE
-- This migrates from user-based to device-based pricing structure
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ltwuqjmncldopkutiyak/sql/new
-- ============================================================================

-- Step 1: Drop old pricing plans (clean slate)
DELETE FROM pricing_plans WHERE code LIKE 'business%';

-- Step 2: Insert new device-based pricing tiers
-- General Formula: Total Devices = (Stores × Devices/Store) + (Corporate Employees × 3)
-- Pricing maintains 50%+ profit margins at all scales

INSERT INTO pricing_plans (code, name, price_cents, billing_period, device_limit, features, is_active, sort_order)
VALUES
  -- Business 100 Devices ($199/mo = $1.99/device, 63% margin)
  (
    'business100',
    'Business 100',
    19900,
    'monthly',
    100,
    jsonb_build_array(
      'Up to 100 devices',
      'Unlimited bandwidth',
      'Global server network',
      'Priority support',
      'Device management dashboard',
      'Team member management'
    ),
    true,
    1
  ),

  -- Business 500 Devices ($899/mo = $1.80/device, 60% margin)
  (
    'business500',
    'Business 500',
    89900,
    'monthly',
    500,
    jsonb_build_array(
      'Up to 500 devices',
      'Unlimited bandwidth',
      'Global server network',
      'Priority support',
      'Device management dashboard',
      'Team member management',
      'Advanced analytics'
    ),
    true,
    2
  ),

  -- Business 1K Devices ($1,699/mo = $1.70/device, 58% margin)
  (
    'business1k',
    'Business 1,000',
    169900,
    'monthly',
    1000,
    jsonb_build_array(
      'Up to 1,000 devices',
      'Unlimited bandwidth',
      'Global server network',
      'Priority support',
      'Device management dashboard',
      'Team member management',
      'Advanced analytics',
      'Dedicated account manager'
    ),
    true,
    3
  ),

  -- Business 2.5K Devices ($3,999/mo = $1.60/device, 55% margin)
  (
    'business2.5k',
    'Business 2,500',
    399900,
    'monthly',
    2500,
    jsonb_build_array(
      'Up to 2,500 devices',
      'Unlimited bandwidth',
      'Global server network',
      'Priority support',
      'Device management dashboard',
      'Team member management',
      'Advanced analytics',
      'Dedicated account manager',
      'Custom SLA'
    ),
    true,
    4
  ),

  -- Business 5K Devices ($7,499/mo = $1.50/device, 52% margin)
  (
    'business5k',
    'Business 5,000',
    749900,
    'monthly',
    5000,
    jsonb_build_array(
      'Up to 5,000 devices',
      'Unlimited bandwidth',
      'Global server network',
      'Priority support',
      'Device management dashboard',
      'Team member management',
      'Advanced analytics',
      'Dedicated account manager',
      'Custom SLA',
      '24/7 phone support'
    ),
    true,
    5
  ),

  -- Business 10K Devices ($14,999/mo = $1.50/device, 52% margin)
  (
    'business10k',
    'Business 10,000',
    1499900,
    'monthly',
    10000,
    jsonb_build_array(
      'Up to 10,000 devices',
      'Unlimited bandwidth',
      'Global server network',
      'Priority support',
      'Device management dashboard',
      'Team member management',
      'Advanced analytics',
      'Dedicated account manager',
      'Custom SLA',
      '24/7 phone support',
      'Custom integrations'
    ),
    true,
    6
  ),

  -- Enterprise Custom (100K+ devices)
  (
    'enterprise',
    'Enterprise Custom',
    NULL,  -- Custom pricing
    'monthly',
    NULL,  -- Unlimited
    jsonb_build_array(
      'Unlimited devices',
      'Unlimited bandwidth',
      'Global server network',
      'White-glove support',
      'Device management dashboard',
      'Team member management',
      'Advanced analytics',
      'Dedicated account manager',
      'Custom SLA',
      '24/7 phone support',
      'Custom integrations',
      'Bulk server discounts',
      'Custom deployment options'
    ),
    true,
    7
  );

-- Step 3: Update analytics functions to support custom device pricing
-- Drop old functions
DROP FUNCTION IF EXISTS mrr_total_cents();
DROP FUNCTION IF EXISTS arr_total_cents();

-- NEW: MRR from active subscriptions with device-based pricing
CREATE FUNCTION mrr_total_cents()
RETURNS BIGINT
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(SUM(
    CASE
      -- Personal plans (unchanged)
      WHEN s.plan = 'personal' AND s.billing_period = 'monthly' THEN 999
      WHEN s.plan = 'personal' AND s.billing_period = 'annual' THEN 9900 / 12

      -- Gaming plans (unchanged)
      WHEN s.plan = 'gaming' AND s.billing_period = 'monthly' THEN 1499
      WHEN s.plan = 'gaming' AND s.billing_period = 'annual' THEN 14900 / 12

      -- Device-based business plans
      WHEN s.plan = 'business100' AND s.billing_period = 'monthly' THEN 19900
      WHEN s.plan = 'business500' AND s.billing_period = 'monthly' THEN 89900
      WHEN s.plan = 'business1k' AND s.billing_period = 'monthly' THEN 169900
      WHEN s.plan = 'business2.5k' AND s.billing_period = 'monthly' THEN 399900
      WHEN s.plan = 'business5k' AND s.billing_period = 'monthly' THEN 749900
      WHEN s.plan = 'business10k' AND s.billing_period = 'monthly' THEN 1499900

      -- Annual business plans (divide by 12 for MRR)
      WHEN s.plan = 'business100' AND s.billing_period = 'annual' THEN 19900 * 12 / 12
      WHEN s.plan = 'business500' AND s.billing_period = 'annual' THEN 89900 * 12 / 12
      WHEN s.plan = 'business1k' AND s.billing_period = 'annual' THEN 169900 * 12 / 12
      WHEN s.plan = 'business2.5k' AND s.billing_period = 'annual' THEN 399900 * 12 / 12
      WHEN s.plan = 'business5k' AND s.billing_period = 'annual' THEN 749900 * 12 / 12
      WHEN s.plan = 'business10k' AND s.billing_period = 'annual' THEN 1499900 * 12 / 12

      -- Legacy business plans (keep for existing customers)
      WHEN s.plan = 'business10' AND s.billing_period = 'monthly' THEN 5999
      WHEN s.plan = 'business50' AND s.billing_period = 'monthly' THEN 17999
      WHEN s.plan = 'business250' AND s.billing_period = 'monthly' THEN 99999

      ELSE 0
    END
  ), 0)::BIGINT
  FROM subscriptions s
  WHERE s.status = 'active';
$$;

-- NEW: ARR from active subscriptions
CREATE FUNCTION arr_total_cents()
RETURNS BIGINT
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(SUM(
    CASE
      -- Personal plans (unchanged)
      WHEN s.plan = 'personal' AND s.billing_period = 'monthly' THEN 999 * 12
      WHEN s.plan = 'personal' AND s.billing_period = 'annual' THEN 9900

      -- Gaming plans (unchanged)
      WHEN s.plan = 'gaming' AND s.billing_period = 'monthly' THEN 1499 * 12
      WHEN s.plan = 'gaming' AND s.billing_period = 'annual' THEN 14900

      -- Device-based business plans
      WHEN s.plan = 'business100' AND s.billing_period = 'monthly' THEN 19900 * 12
      WHEN s.plan = 'business500' AND s.billing_period = 'monthly' THEN 89900 * 12
      WHEN s.plan = 'business1k' AND s.billing_period = 'monthly' THEN 169900 * 12
      WHEN s.plan = 'business2.5k' AND s.billing_period = 'monthly' THEN 399900 * 12
      WHEN s.plan = 'business5k' AND s.billing_period = 'monthly' THEN 749900 * 12
      WHEN s.plan = 'business10k' AND s.billing_period = 'monthly' THEN 1499900 * 12

      -- Annual business plans
      WHEN s.plan = 'business100' AND s.billing_period = 'annual' THEN 19900 * 12
      WHEN s.plan = 'business500' AND s.billing_period = 'annual' THEN 89900 * 12
      WHEN s.plan = 'business1k' AND s.billing_period = 'annual' THEN 169900 * 12
      WHEN s.plan = 'business2.5k' AND s.billing_period = 'annual' THEN 399900 * 12
      WHEN s.plan = 'business5k' AND s.billing_period = 'annual' THEN 749900 * 12
      WHEN s.plan = 'business10k' AND s.billing_period = 'annual' THEN 1499900 * 12

      -- Legacy business plans
      WHEN s.plan = 'business10' AND s.billing_period = 'monthly' THEN 5999 * 12
      WHEN s.plan = 'business50' AND s.billing_period = 'monthly' THEN 17999 * 12
      WHEN s.plan = 'business250' AND s.billing_period = 'monthly' THEN 99999 * 12

      ELSE 0
    END
  ), 0)::BIGINT
  FROM subscriptions s
  WHERE s.status = 'active';
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION mrr_total_cents() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION arr_total_cents() TO authenticated, anon;

-- ============================================================================
-- SUCCESS!
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Device-based pricing tiers created!';
  RAISE NOTICE '✅ Analytics functions updated with new pricing!';
  RAISE NOTICE '';
  RAISE NOTICE 'New Pricing Structure:';
  RAISE NOTICE '  • Business 100: $199/mo (100 devices @ $1.99/device)';
  RAISE NOTICE '  • Business 500: $899/mo (500 devices @ $1.80/device)';
  RAISE NOTICE '  • Business 1K: $1,699/mo (1,000 devices @ $1.70/device)';
  RAISE NOTICE '  • Business 2.5K: $3,999/mo (2,500 devices @ $1.60/device)';
  RAISE NOTICE '  • Business 5K: $7,499/mo (5,000 devices @ $1.50/device)';
  RAISE NOTICE '  • Business 10K: $14,999/mo (10,000 devices @ $1.50/device)';
  RAISE NOTICE '  • Enterprise: Custom pricing for 100K+ devices';
  RAISE NOTICE '';
  RAISE NOTICE 'General Formula: Total Devices = (Stores × Devices/Store) + (Corporate Employees × 3)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Update src/lib/pricing.js with new device-based tiers';
  RAISE NOTICE '2. Update Pricing page UI to show device counts';
  RAISE NOTICE '3. Create Stripe products for new tiers';
END $$;
