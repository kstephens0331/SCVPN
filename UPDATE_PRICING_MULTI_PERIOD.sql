-- ============================================================================
-- SACVPN MULTI-PERIOD DEVICE-BASED PRICING UPDATE
-- Supports: Monthly, 6-Month, Yearly, 2-Year, 3-Year billing
-- Discounts: 6-month (5%), yearly (15%), 2-year (25%), 3-year (35%)
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ltwuqjmncldopkutiyak/sql/new
-- ============================================================================

-- Step 1: Drop ALL old pricing plans (clean slate)
DELETE FROM pricing_plans;

-- Step 2: Insert Personal Plan with all billing periods
-- Personal: $9.99/mo base
INSERT INTO pricing_plans (code, name, price_cents, billing_period, device_limit, features, is_active, sort_order)
VALUES
  -- Personal Monthly: $9.99
  ('personal', 'Personal', 999, 'monthly', NULL,
   jsonb_build_array('Protect all your personal devices at home', 'Stream and browse privately without ISP throttling', 'Simple QR setup for non-technical users'),
   true, 1),
  -- Personal 6-Month: $56.94 ($9.49/mo equivalent, 5% discount)
  ('personal_6mo', 'Personal 6-Month', 5694, '6month', NULL,
   jsonb_build_array('Protect all your personal devices at home', 'Stream and browse privately without ISP throttling', 'Simple QR setup for non-technical users', '5% discount - Save $2.90'),
   true, 2),
  -- Personal Yearly: $101.90 ($8.49/mo equivalent, 15% discount)
  ('personal_yearly', 'Personal Yearly', 10190, 'yearly', NULL,
   jsonb_build_array('Protect all your personal devices at home', 'Stream and browse privately without ISP throttling', 'Simple QR setup for non-technical users', '15% discount - Save $17.98'),
   true, 3),
  -- Personal 2-Year: $179.82 ($7.49/mo equivalent, 25% discount)
  ('personal_2yr', 'Personal 2-Year', 17982, '2year', NULL,
   jsonb_build_array('Protect all your personal devices at home', 'Stream and browse privately without ISP throttling', 'Simple QR setup for non-technical users', '25% discount - Save $59.94'),
   true, 4),
  -- Personal 3-Year: $233.68 ($6.49/mo equivalent, 35% discount)
  ('personal_3yr', 'Personal 3-Year', 23368, '3year', NULL,
   jsonb_build_array('Protect all your personal devices at home', 'Stream and browse privately without ISP throttling', 'Simple QR setup for non-technical users', '35% discount - Save $125.88'),
   true, 5);

-- Step 3: Insert Gaming Plan with all billing periods
-- Gaming: $14.99/mo base
INSERT INTO pricing_plans (code, name, price_cents, billing_period, device_limit, features, is_active, sort_order)
VALUES
  -- Gaming Monthly: $14.99
  ('gaming', 'Gaming', 1499, 'monthly', NULL,
   jsonb_build_array('Low-latency gaming-optimized routes', 'DDoS protection for competitive play', 'Unlimited devices so all consoles & PCs are covered'),
   true, 10),
  -- Gaming 6-Month: $85.44 ($14.24/mo equivalent, 5% discount)
  ('gaming_6mo', 'Gaming 6-Month', 8544, '6month', NULL,
   jsonb_build_array('Low-latency gaming-optimized routes', 'DDoS protection for competitive play', 'Unlimited devices so all consoles & PCs are covered', '5% discount - Save $4.50'),
   true, 11),
  -- Gaming Yearly: $152.90 ($12.74/mo equivalent, 15% discount)
  ('gaming_yearly', 'Gaming Yearly', 15290, 'yearly', NULL,
   jsonb_build_array('Low-latency gaming-optimized routes', 'DDoS protection for competitive play', 'Unlimited devices so all consoles & PCs are covered', '15% discount - Save $26.98'),
   true, 12),
  -- Gaming 2-Year: $269.82 ($11.24/mo equivalent, 25% discount)
  ('gaming_2yr', 'Gaming 2-Year', 26982, '2year', NULL,
   jsonb_build_array('Low-latency gaming-optimized routes', 'DDoS protection for competitive play', 'Unlimited devices so all consoles & PCs are covered', '25% discount - Save $89.94'),
   true, 13),
  -- Gaming 3-Year: $350.68 ($9.74/mo equivalent, 35% discount)
  ('gaming_3yr', 'Gaming 3-Year', 35068, '3year', NULL,
   jsonb_build_array('Low-latency gaming-optimized routes', 'DDoS protection for competitive play', 'Unlimited devices so all consoles & PCs are covered', '35% discount - Save $188.88'),
   true, 14);

-- Step 4: Insert Business 100 with all billing periods
-- Business 100: $199/mo base (100 devices @ $1.99/device)
INSERT INTO pricing_plans (code, name, price_cents, billing_period, device_limit, features, is_active, sort_order)
VALUES
  ('business100', 'Business 100', 19900, 'monthly', 100,
   jsonb_build_array('Up to 100 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management'),
   true, 20),
  ('business100_6mo', 'Business 100 (6-Month)', 113430, '6month', 100,
   jsonb_build_array('Up to 100 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', '5% discount - Save $59.70'),
   true, 21),
  ('business100_yearly', 'Business 100 (Yearly)', 203150, 'yearly', 100,
   jsonb_build_array('Up to 100 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', '15% discount - Save $358.85'),
   true, 22),
  ('business100_2yr', 'Business 100 (2-Year)', 358200, '2year', 100,
   jsonb_build_array('Up to 100 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', '25% discount - Save $1,194'),
   true, 23),
  ('business100_3yr', 'Business 100 (3-Year)', 465660, '3year', 100,
   jsonb_build_array('Up to 100 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', '35% discount - Save $2,509'),
   true, 24);

-- Step 5: Insert Business 500 with all billing periods
-- Business 500: $899/mo base (500 devices @ $1.80/device)
INSERT INTO pricing_plans (code, name, price_cents, billing_period, device_limit, features, is_active, sort_order)
VALUES
  ('business500', 'Business 500', 89900, 'monthly', 500,
   jsonb_build_array('Up to 500 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics'),
   true, 30),
  ('business500_6mo', 'Business 500 (6-Month)', 512430, '6month', 500,
   jsonb_build_array('Up to 500 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', '5% discount - Save $269.70'),
   true, 31),
  ('business500_yearly', 'Business 500 (Yearly)', 917150, 'yearly', 500,
   jsonb_build_array('Up to 500 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', '15% discount - Save $1,621'),
   true, 32),
  ('business500_2yr', 'Business 500 (2-Year)', 1618200, '2year', 500,
   jsonb_build_array('Up to 500 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', '25% discount - Save $5,394'),
   true, 33),
  ('business500_3yr', 'Business 500 (3-Year)', 2104440, '3year', 500,
   jsonb_build_array('Up to 500 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', '35% discount - Save $11,344'),
   true, 34);

-- Step 6: Insert Business 1K with all billing periods
-- Business 1K: $1,699/mo base (1,000 devices @ $1.70/device)
INSERT INTO pricing_plans (code, name, price_cents, billing_period, device_limit, features, is_active, sort_order)
VALUES
  ('business1k', 'Business 1,000', 169900, 'monthly', 1000,
   jsonb_build_array('Up to 1,000 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager'),
   true, 40),
  ('business1k_6mo', 'Business 1,000 (6-Month)', 968430, '6month', 1000,
   jsonb_build_array('Up to 1,000 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', '5% discount - Save $509.70'),
   true, 41),
  ('business1k_yearly', 'Business 1,000 (Yearly)', 1733150, 'yearly', 1000,
   jsonb_build_array('Up to 1,000 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', '15% discount - Save $3,064'),
   true, 42),
  ('business1k_2yr', 'Business 1,000 (2-Year)', 3058200, '2year', 1000,
   jsonb_build_array('Up to 1,000 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', '25% discount - Save $10,194'),
   true, 43),
  ('business1k_3yr', 'Business 1,000 (3-Year)', 3975660, '3year', 1000,
   jsonb_build_array('Up to 1,000 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', '35% discount - Save $21,444'),
   true, 44);

-- Step 7: Insert Business 2.5K with all billing periods
-- Business 2.5K: $3,999/mo base (2,500 devices @ $1.60/device)
INSERT INTO pricing_plans (code, name, price_cents, billing_period, device_limit, features, is_active, sort_order)
VALUES
  ('business2.5k', 'Business 2,500', 399900, 'monthly', 2500,
   jsonb_build_array('Up to 2,500 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', 'Custom SLA'),
   true, 50),
  ('business2.5k_6mo', 'Business 2,500 (6-Month)', 2279430, '6month', 2500,
   jsonb_build_array('Up to 2,500 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', 'Custom SLA', '5% discount - Save $1,199'),
   true, 51),
  ('business2.5k_yearly', 'Business 2,500 (Yearly)', 4079150, 'yearly', 2500,
   jsonb_build_array('Up to 2,500 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', 'Custom SLA', '15% discount - Save $7,208'),
   true, 52),
  ('business2.5k_2yr', 'Business 2,500 (2-Year)', 7198200, '2year', 2500,
   jsonb_build_array('Up to 2,500 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', 'Custom SLA', '25% discount - Save $23,994'),
   true, 53),
  ('business2.5k_3yr', 'Business 2,500 (3-Year)', 9357660, '3year', 2500,
   jsonb_build_array('Up to 2,500 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', 'Custom SLA', '35% discount - Save $50,428'),
   true, 54);

-- Step 8: Insert Business 5K with all billing periods
-- Business 5K: $7,499/mo base (5,000 devices @ $1.50/device)
INSERT INTO pricing_plans (code, name, price_cents, billing_period, device_limit, features, is_active, sort_order)
VALUES
  ('business5k', 'Business 5,000', 749900, 'monthly', 5000,
   jsonb_build_array('Up to 5,000 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', 'Custom SLA', '24/7 phone support'),
   true, 60),
  ('business5k_6mo', 'Business 5,000 (6-Month)', 4274430, '6month', 5000,
   jsonb_build_array('Up to 5,000 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', 'Custom SLA', '24/7 phone support', '5% discount - Save $2,249'),
   true, 61),
  ('business5k_yearly', 'Business 5,000 (Yearly)', 7649150, 'yearly', 5000,
   jsonb_build_array('Up to 5,000 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', 'Custom SLA', '24/7 phone support', '15% discount - Save $13,499'),
   true, 62),
  ('business5k_2yr', 'Business 5,000 (2-Year)', 13498200, '2year', 5000,
   jsonb_build_array('Up to 5,000 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', 'Custom SLA', '24/7 phone support', '25% discount - Save $44,994'),
   true, 63),
  ('business5k_3yr', 'Business 5,000 (3-Year)', 17549460, '3year', 5000,
   jsonb_build_array('Up to 5,000 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', 'Custom SLA', '24/7 phone support', '35% discount - Save $94,616'),
   true, 64);

-- Step 9: Insert Business 10K with all billing periods
-- Business 10K: $14,999/mo base (10,000 devices @ $1.50/device)
INSERT INTO pricing_plans (code, name, price_cents, billing_period, device_limit, features, is_active, sort_order)
VALUES
  ('business10k', 'Business 10,000', 1499900, 'monthly', 10000,
   jsonb_build_array('Up to 10,000 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', 'Custom SLA', '24/7 phone support', 'Custom integrations'),
   true, 70),
  ('business10k_6mo', 'Business 10,000 (6-Month)', 8549430, '6month', 10000,
   jsonb_build_array('Up to 10,000 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', 'Custom SLA', '24/7 phone support', 'Custom integrations', '5% discount - Save $4,499'),
   true, 71),
  ('business10k_yearly', 'Business 10,000 (Yearly)', 15299150, 'yearly', 10000,
   jsonb_build_array('Up to 10,000 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', 'Custom SLA', '24/7 phone support', 'Custom integrations', '15% discount - Save $26,989'),
   true, 72),
  ('business10k_2yr', 'Business 10,000 (2-Year)', 26998200, '2year', 10000,
   jsonb_build_array('Up to 10,000 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', 'Custom SLA', '24/7 phone support', 'Custom integrations', '25% discount - Save $89,994'),
   true, 73),
  ('business10k_3yr', 'Business 10,000 (3-Year)', 35097660, '3year', 10000,
   jsonb_build_array('Up to 10,000 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', 'Custom SLA', '24/7 phone support', 'Custom integrations', '35% discount - Save $189,268'),
   true, 74);

-- Step 10: Update analytics functions to handle all billing periods
DROP FUNCTION IF EXISTS mrr_total_cents();
DROP FUNCTION IF EXISTS arr_total_cents();

CREATE FUNCTION mrr_total_cents()
RETURNS BIGINT
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(SUM(
    CASE
      -- Personal plans
      WHEN s.plan = 'personal' AND s.billing_period = 'monthly' THEN 999
      WHEN s.plan = 'personal_6mo' AND s.billing_period = '6month' THEN 5694 / 6
      WHEN s.plan = 'personal_yearly' AND s.billing_period = 'yearly' THEN 10190 / 12
      WHEN s.plan = 'personal_2yr' AND s.billing_period = '2year' THEN 17982 / 24
      WHEN s.plan = 'personal_3yr' AND s.billing_period = '3year' THEN 23368 / 36

      -- Gaming plans
      WHEN s.plan = 'gaming' AND s.billing_period = 'monthly' THEN 1499
      WHEN s.plan = 'gaming_6mo' AND s.billing_period = '6month' THEN 8544 / 6
      WHEN s.plan = 'gaming_yearly' AND s.billing_period = 'yearly' THEN 15290 / 12
      WHEN s.plan = 'gaming_2yr' AND s.billing_period = '2year' THEN 26982 / 24
      WHEN s.plan = 'gaming_3yr' AND s.billing_period = '3year' THEN 35068 / 36

      -- Business 100 plans
      WHEN s.plan = 'business100' AND s.billing_period = 'monthly' THEN 19900
      WHEN s.plan = 'business100_6mo' AND s.billing_period = '6month' THEN 113430 / 6
      WHEN s.plan = 'business100_yearly' AND s.billing_period = 'yearly' THEN 203150 / 12
      WHEN s.plan = 'business100_2yr' AND s.billing_period = '2year' THEN 358200 / 24
      WHEN s.plan = 'business100_3yr' AND s.billing_period = '3year' THEN 465660 / 36

      -- Business 500 plans
      WHEN s.plan = 'business500' AND s.billing_period = 'monthly' THEN 89900
      WHEN s.plan = 'business500_6mo' AND s.billing_period = '6month' THEN 512430 / 6
      WHEN s.plan = 'business500_yearly' AND s.billing_period = 'yearly' THEN 917150 / 12
      WHEN s.plan = 'business500_2yr' AND s.billing_period = '2year' THEN 1618200 / 24
      WHEN s.plan = 'business500_3yr' AND s.billing_period = '3year' THEN 2104440 / 36

      -- Business 1K plans
      WHEN s.plan = 'business1k' AND s.billing_period = 'monthly' THEN 169900
      WHEN s.plan = 'business1k_6mo' AND s.billing_period = '6month' THEN 968430 / 6
      WHEN s.plan = 'business1k_yearly' AND s.billing_period = 'yearly' THEN 1733150 / 12
      WHEN s.plan = 'business1k_2yr' AND s.billing_period = '2year' THEN 3058200 / 24
      WHEN s.plan = 'business1k_3yr' AND s.billing_period = '3year' THEN 3975660 / 36

      -- Business 2.5K plans
      WHEN s.plan = 'business2.5k' AND s.billing_period = 'monthly' THEN 399900
      WHEN s.plan = 'business2.5k_6mo' AND s.billing_period = '6month' THEN 2279430 / 6
      WHEN s.plan = 'business2.5k_yearly' AND s.billing_period = 'yearly' THEN 4079150 / 12
      WHEN s.plan = 'business2.5k_2yr' AND s.billing_period = '2year' THEN 7198200 / 24
      WHEN s.plan = 'business2.5k_3yr' AND s.billing_period = '3year' THEN 9357660 / 36

      -- Business 5K plans
      WHEN s.plan = 'business5k' AND s.billing_period = 'monthly' THEN 749900
      WHEN s.plan = 'business5k_6mo' AND s.billing_period = '6month' THEN 4274430 / 6
      WHEN s.plan = 'business5k_yearly' AND s.billing_period = 'yearly' THEN 7649150 / 12
      WHEN s.plan = 'business5k_2yr' AND s.billing_period = '2year' THEN 13498200 / 24
      WHEN s.plan = 'business5k_3yr' AND s.billing_period = '3year' THEN 17549460 / 36

      -- Business 10K plans
      WHEN s.plan = 'business10k' AND s.billing_period = 'monthly' THEN 1499900
      WHEN s.plan = 'business10k_6mo' AND s.billing_period = '6month' THEN 8549430 / 6
      WHEN s.plan = 'business10k_yearly' AND s.billing_period = 'yearly' THEN 15299150 / 12
      WHEN s.plan = 'business10k_2yr' AND s.billing_period = '2year' THEN 26998200 / 24
      WHEN s.plan = 'business10k_3yr' AND s.billing_period = '3year' THEN 35097660 / 36

      ELSE 0
    END
  ), 0)::BIGINT
  FROM subscriptions s
  WHERE s.status = 'active';
$$;

CREATE FUNCTION arr_total_cents()
RETURNS BIGINT
LANGUAGE SQL
STABLE
AS $$
  SELECT (mrr_total_cents() * 12)::BIGINT;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION mrr_total_cents() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION arr_total_cents() TO authenticated, anon;

-- ============================================================================
-- SUCCESS!
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Multi-period device-based pricing created!';
  RAISE NOTICE '';
  RAISE NOTICE 'Billing Periods:';
  RAISE NOTICE '  • Monthly: No discount';
  RAISE NOTICE '  • 6-Month: 5%% discount';
  RAISE NOTICE '  • Yearly: 15%% discount';
  RAISE NOTICE '  • 2-Year: 25%% discount';
  RAISE NOTICE '  • 3-Year: 35%% discount';
  RAISE NOTICE '';
  RAISE NOTICE 'Plans Created:';
  RAISE NOTICE '  • Personal: $9.99/mo - 5 billing periods';
  RAISE NOTICE '  • Gaming: $14.99/mo - 5 billing periods';
  RAISE NOTICE '  • Business 100: $199/mo - 5 billing periods';
  RAISE NOTICE '  • Business 500: $899/mo - 5 billing periods';
  RAISE NOTICE '  • Business 1K: $1,699/mo - 5 billing periods';
  RAISE NOTICE '  • Business 2.5K: $3,999/mo - 5 billing periods';
  RAISE NOTICE '  • Business 5K: $7,499/mo - 5 billing periods';
  RAISE NOTICE '  • Business 10K: $14,999/mo - 5 billing periods';
  RAISE NOTICE '';
  RAISE NOTICE 'Total: 40 pricing plans created';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Create Stripe products and update stripePriceIds in pricing.js';
END $$;
