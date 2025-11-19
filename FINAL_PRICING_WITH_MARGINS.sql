-- ============================================================================
-- SACVPN FINAL PRICING - MARGIN-OPTIMIZED
-- Profit Margins: Monthly 55%, 6-Month 50%, Yearly 45%, 2-Year 40%, 3-Year 35%
-- Discounts: 6-month (10%), yearly (18.2%), 2-year (25%), 3-year (30.8%)
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ltwuqjmncldopkutiyak/sql/new
-- ============================================================================

-- Step 1: Drop ALL old pricing plans (clean slate)
DELETE FROM pricing_plans;

-- Step 2: Insert Personal Plan - $9.99/mo base
INSERT INTO pricing_plans (code, name, price_cents, billing_period, device_limit, features, is_active, sort_order)
VALUES
  ('personal', 'Personal', 999, 'monthly', NULL,
   jsonb_build_array('Protect all your personal devices at home', 'Stream and browse privately without ISP throttling', 'Simple QR setup for non-technical users'),
   true, 1),
  ('personal_6mo', 'Personal 6-Month', 5395, '6month', NULL,
   jsonb_build_array('Protect all your personal devices at home', 'Stream and browse privately without ISP throttling', 'Simple QR setup for non-technical users', '10% discount - Save $5.99'),
   true, 2),
  ('personal_yearly', 'Personal Yearly', 9806, 'yearly', NULL,
   jsonb_build_array('Protect all your personal devices at home', 'Stream and browse privately without ISP throttling', 'Simple QR setup for non-technical users', '18.2% discount - Save $21.82'),
   true, 3),
  ('personal_2yr', 'Personal 2-Year', 17982, '2year', NULL,
   jsonb_build_array('Protect all your personal devices at home', 'Stream and browse privately without ISP throttling', 'Simple QR setup for non-technical users', '25% discount - Save $59.94'),
   true, 4),
  ('personal_3yr', 'Personal 3-Year', 24887, '3year', NULL,
   jsonb_build_array('Protect all your personal devices at home', 'Stream and browse privately without ISP throttling', 'Simple QR setup for non-technical users', '30.8% discount - Save $110.77'),
   true, 5);

-- Step 3: Insert Gaming Plan - $14.99/mo base
INSERT INTO pricing_plans (code, name, price_cents, billing_period, device_limit, features, is_active, sort_order)
VALUES
  ('gaming', 'Gaming', 1499, 'monthly', NULL,
   jsonb_build_array('Low-latency gaming-optimized routes', 'DDoS protection for competitive play', 'Unlimited devices so all consoles & PCs are covered'),
   true, 10),
  ('gaming_6mo', 'Gaming 6-Month', 8095, '6month', NULL,
   jsonb_build_array('Low-latency gaming-optimized routes', 'DDoS protection for competitive play', 'Unlimited devices so all consoles & PCs are covered', '10% discount - Save $8.99'),
   true, 11),
  ('gaming_yearly', 'Gaming Yearly', 14714, 'yearly', NULL,
   jsonb_build_array('Low-latency gaming-optimized routes', 'DDoS protection for competitive play', 'Unlimited devices so all consoles & PCs are covered', '18.2% discount - Save $32.74'),
   true, 12),
  ('gaming_2yr', 'Gaming 2-Year', 26982, '2year', NULL,
   jsonb_build_array('Low-latency gaming-optimized routes', 'DDoS protection for competitive play', 'Unlimited devices so all consoles & PCs are covered', '25% discount - Save $89.94'),
   true, 13),
  ('gaming_3yr', 'Gaming 3-Year', 37343, '3year', NULL,
   jsonb_build_array('Low-latency gaming-optimized routes', 'DDoS protection for competitive play', 'Unlimited devices so all consoles & PCs are covered', '30.8% discount - Save $166.21'),
   true, 14);

-- Step 4: Insert Business 100 - $911.11/mo (100 devices @ $9.11/device, 55% margin monthly)
INSERT INTO pricing_plans (code, name, price_cents, billing_period, device_limit, features, is_active, sort_order)
VALUES
  ('business100', 'Business 100', 91111, 'monthly', 100,
   jsonb_build_array('Up to 100 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management'),
   true, 20),
  ('business100_6mo', 'Business 100 (6-Month)', 492000, '6month', 100,
   jsonb_build_array('Up to 100 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', '10% discount - Save $546.67'),
   true, 21),
  ('business100_yearly', 'Business 100 (Yearly)', 894346, 'yearly', 100,
   jsonb_build_array('Up to 100 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', '18.2% discount - Save $1,989'),
   true, 22),
  ('business100_2yr', 'Business 100 (2-Year)', 1640000, '2year', 100,
   jsonb_build_array('Up to 100 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', '25% discount - Save $5,466.67'),
   true, 23),
  ('business100_3yr', 'Business 100 (3-Year)', 2269757, '3year', 100,
   jsonb_build_array('Up to 100 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', '30.8% discount - Save $10,102'),
   true, 24);

-- Step 5: Insert Business 500 - $911.11/mo (500 devices @ $1.82/device, 55% margin monthly)
INSERT INTO pricing_plans (code, name, price_cents, billing_period, device_limit, features, is_active, sort_order)
VALUES
  ('business500', 'Business 500', 91111, 'monthly', 500,
   jsonb_build_array('Up to 500 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics'),
   true, 30),
  ('business500_6mo', 'Business 500 (6-Month)', 492000, '6month', 500,
   jsonb_build_array('Up to 500 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', '10% discount - Save $546.67'),
   true, 31),
  ('business500_yearly', 'Business 500 (Yearly)', 894346, 'yearly', 500,
   jsonb_build_array('Up to 500 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', '18.2% discount - Save $1,989'),
   true, 32),
  ('business500_2yr', 'Business 500 (2-Year)', 1640000, '2year', 500,
   jsonb_build_array('Up to 500 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', '25% discount - Save $5,466.67'),
   true, 33),
  ('business500_3yr', 'Business 500 (3-Year)', 2269757, '3year', 500,
   jsonb_build_array('Up to 500 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', '30.8% discount - Save $10,102'),
   true, 34);

-- Step 6: Insert Business 1K - $1,822.22/mo (1,000 devices @ $1.82/device, 55% margin monthly)
INSERT INTO pricing_plans (code, name, price_cents, billing_period, device_limit, features, is_active, sort_order)
VALUES
  ('business1k', 'Business 1,000', 182222, 'monthly', 1000,
   jsonb_build_array('Up to 1,000 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager'),
   true, 40),
  ('business1k_6mo', 'Business 1,000 (6-Month)', 984000, '6month', 1000,
   jsonb_build_array('Up to 1,000 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', '10% discount - Save $1,093'),
   true, 41),
  ('business1k_yearly', 'Business 1,000 (Yearly)', 1788691, 'yearly', 1000,
   jsonb_build_array('Up to 1,000 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', '18.2% discount - Save $3,978'),
   true, 42),
  ('business1k_2yr', 'Business 1,000 (2-Year)', 3280000, '2year', 1000,
   jsonb_build_array('Up to 1,000 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', '25% discount - Save $10,933'),
   true, 43),
  ('business1k_3yr', 'Business 1,000 (3-Year)', 4539514, '3year', 1000,
   jsonb_build_array('Up to 1,000 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', '30.8% discount - Save $20,205'),
   true, 44);

-- Step 7: Insert Business 2.5K - $4,555.56/mo (2,500 devices @ $1.82/device, 55% margin monthly)
INSERT INTO pricing_plans (code, name, price_cents, billing_period, device_limit, features, is_active, sort_order)
VALUES
  ('business2.5k', 'Business 2,500', 455556, 'monthly', 2500,
   jsonb_build_array('Up to 2,500 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', 'Custom SLA'),
   true, 50),
  ('business2.5k_6mo', 'Business 2,500 (6-Month)', 2460002, '6month', 2500,
   jsonb_build_array('Up to 2,500 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', 'Custom SLA', '10% discount - Save $2,733'),
   true, 51),
  ('business2.5k_yearly', 'Business 2,500 (Yearly)', 4471738, 'yearly', 2500,
   jsonb_build_array('Up to 2,500 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', 'Custom SLA', '18.2% discount - Save $9,945'),
   true, 52),
  ('business2.5k_2yr', 'Business 2,500 (2-Year)', 8200008, '2year', 2500,
   jsonb_build_array('Up to 2,500 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', 'Custom SLA', '25% discount - Save $27,333'),
   true, 53),
  ('business2.5k_3yr', 'Business 2,500 (3-Year)', 11348811, '3year', 2500,
   jsonb_build_array('Up to 2,500 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', 'Custom SLA', '30.8% discount - Save $50,511'),
   true, 54);

-- Step 8: Insert Business 5K - $8,200/mo (5,000 devices @ $1.64/device, 55% margin monthly)
INSERT INTO pricing_plans (code, name, price_cents, billing_period, device_limit, features, is_active, sort_order)
VALUES
  ('business5k', 'Business 5,000', 820000, 'monthly', 5000,
   jsonb_build_array('Up to 5,000 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', 'Custom SLA', '24/7 phone support'),
   true, 60),
  ('business5k_6mo', 'Business 5,000 (6-Month)', 4428000, '6month', 5000,
   jsonb_build_array('Up to 5,000 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', 'Custom SLA', '24/7 phone support', '10% discount - Save $4,920'),
   true, 61),
  ('business5k_yearly', 'Business 5,000 (Yearly)', 8049120, 'yearly', 5000,
   jsonb_build_array('Up to 5,000 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', 'Custom SLA', '24/7 phone support', '18.2% discount - Save $17,909'),
   true, 62),
  ('business5k_2yr', 'Business 5,000 (2-Year)', 14760000, '2year', 5000,
   jsonb_build_array('Up to 5,000 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', 'Custom SLA', '24/7 phone support', '25% discount - Save $49,200'),
   true, 63),
  ('business5k_3yr', 'Business 5,000 (3-Year)', 20427840, '3year', 5000,
   jsonb_build_array('Up to 5,000 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', 'Custom SLA', '24/7 phone support', '30.8% discount - Save $90,920'),
   true, 64);

-- Step 9: Insert Business 10K - $16,400/mo (10,000 devices @ $1.64/device, 55% margin monthly)
INSERT INTO pricing_plans (code, name, price_cents, billing_period, device_limit, features, is_active, sort_order)
VALUES
  ('business10k', 'Business 10,000', 1640000, 'monthly', 10000,
   jsonb_build_array('Up to 10,000 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', 'Custom SLA', '24/7 phone support', 'Custom integrations'),
   true, 70),
  ('business10k_6mo', 'Business 10,000 (6-Month)', 8856000, '6month', 10000,
   jsonb_build_array('Up to 10,000 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', 'Custom SLA', '24/7 phone support', 'Custom integrations', '10% discount - Save $9,840'),
   true, 71),
  ('business10k_yearly', 'Business 10,000 (Yearly)', 16098240, 'yearly', 10000,
   jsonb_build_array('Up to 10,000 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', 'Custom SLA', '24/7 phone support', 'Custom integrations', '18.2% discount - Save $35,818'),
   true, 72),
  ('business10k_2yr', 'Business 10,000 (2-Year)', 29520000, '2year', 10000,
   jsonb_build_array('Up to 10,000 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', 'Custom SLA', '24/7 phone support', 'Custom integrations', '25% discount - Save $98,400'),
   true, 73),
  ('business10k_3yr', 'Business 10,000 (3-Year)', 40855680, '3year', 10000,
   jsonb_build_array('Up to 10,000 devices', 'Unlimited bandwidth', 'Global server network', 'Priority support', 'Device management dashboard', 'Team member management', 'Advanced analytics', 'Dedicated account manager', 'Custom SLA', '24/7 phone support', 'Custom integrations', '30.8% discount - Save $181,840'),
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
      WHEN s.plan = 'personal_6mo' AND s.billing_period = '6month' THEN 5395 / 6
      WHEN s.plan = 'personal_yearly' AND s.billing_period = 'yearly' THEN 9806 / 12
      WHEN s.plan = 'personal_2yr' AND s.billing_period = '2year' THEN 17982 / 24
      WHEN s.plan = 'personal_3yr' AND s.billing_period = '3year' THEN 24887 / 36

      -- Gaming plans
      WHEN s.plan = 'gaming' AND s.billing_period = 'monthly' THEN 1499
      WHEN s.plan = 'gaming_6mo' AND s.billing_period = '6month' THEN 8095 / 6
      WHEN s.plan = 'gaming_yearly' AND s.billing_period = 'yearly' THEN 14714 / 12
      WHEN s.plan = 'gaming_2yr' AND s.billing_period = '2year' THEN 26982 / 24
      WHEN s.plan = 'gaming_3yr' AND s.billing_period = '3year' THEN 37343 / 36

      -- Business 100 plans
      WHEN s.plan = 'business100' AND s.billing_period = 'monthly' THEN 91111
      WHEN s.plan = 'business100_6mo' AND s.billing_period = '6month' THEN 492000 / 6
      WHEN s.plan = 'business100_yearly' AND s.billing_period = 'yearly' THEN 894346 / 12
      WHEN s.plan = 'business100_2yr' AND s.billing_period = '2year' THEN 1640000 / 24
      WHEN s.plan = 'business100_3yr' AND s.billing_period = '3year' THEN 2269757 / 36

      -- Business 500 plans
      WHEN s.plan = 'business500' AND s.billing_period = 'monthly' THEN 91111
      WHEN s.plan = 'business500_6mo' AND s.billing_period = '6month' THEN 492000 / 6
      WHEN s.plan = 'business500_yearly' AND s.billing_period = 'yearly' THEN 894346 / 12
      WHEN s.plan = 'business500_2yr' AND s.billing_period = '2year' THEN 1640000 / 24
      WHEN s.plan = 'business500_3yr' AND s.billing_period = '3year' THEN 2269757 / 36

      -- Business 1K plans
      WHEN s.plan = 'business1k' AND s.billing_period = 'monthly' THEN 182222
      WHEN s.plan = 'business1k_6mo' AND s.billing_period = '6month' THEN 984000 / 6
      WHEN s.plan = 'business1k_yearly' AND s.billing_period = 'yearly' THEN 1788691 / 12
      WHEN s.plan = 'business1k_2yr' AND s.billing_period = '2year' THEN 3280000 / 24
      WHEN s.plan = 'business1k_3yr' AND s.billing_period = '3year' THEN 4539514 / 36

      -- Business 2.5K plans
      WHEN s.plan = 'business2.5k' AND s.billing_period = 'monthly' THEN 455556
      WHEN s.plan = 'business2.5k_6mo' AND s.billing_period = '6month' THEN 2460002 / 6
      WHEN s.plan = 'business2.5k_yearly' AND s.billing_period = 'yearly' THEN 4471738 / 12
      WHEN s.plan = 'business2.5k_2yr' AND s.billing_period = '2year' THEN 8200008 / 24
      WHEN s.plan = 'business2.5k_3yr' AND s.billing_period = '3year' THEN 11348811 / 36

      -- Business 5K plans
      WHEN s.plan = 'business5k' AND s.billing_period = 'monthly' THEN 820000
      WHEN s.plan = 'business5k_6mo' AND s.billing_period = '6month' THEN 4428000 / 6
      WHEN s.plan = 'business5k_yearly' AND s.billing_period = 'yearly' THEN 8049120 / 12
      WHEN s.plan = 'business5k_2yr' AND s.billing_period = '2year' THEN 14760000 / 24
      WHEN s.plan = 'business5k_3yr' AND s.billing_period = '3year' THEN 20427840 / 36

      -- Business 10K plans
      WHEN s.plan = 'business10k' AND s.billing_period = 'monthly' THEN 1640000
      WHEN s.plan = 'business10k_6mo' AND s.billing_period = '6month' THEN 8856000 / 6
      WHEN s.plan = 'business10k_yearly' AND s.billing_period = 'yearly' THEN 16098240 / 12
      WHEN s.plan = 'business10k_2yr' AND s.billing_period = '2year' THEN 29520000 / 24
      WHEN s.plan = 'business10k_3yr' AND s.billing_period = '3year' THEN 40855680 / 36

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
-- SUCCESS! FINAL PRICING WITH GUARANTEED MARGINS
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Margin-optimized pricing created!';
  RAISE NOTICE '';
  RAISE NOTICE 'Profit Margins by Billing Period:';
  RAISE NOTICE '  • Monthly:  55%% profit margin';
  RAISE NOTICE '  • 6-Month:  50%% profit margin (10%% discount)';
  RAISE NOTICE '  • Yearly:   45%% profit margin (18.2%% discount)';
  RAISE NOTICE '  • 2-Year:   40%% profit margin (25%% discount)';
  RAISE NOTICE '  • 3-Year:   35%% profit margin (30.8%% discount)';
  RAISE NOTICE '';
  RAISE NOTICE 'Business Plans Created:';
  RAISE NOTICE '  • Business 100:  $911.11/mo  (100 devices @ $9.11/device)';
  RAISE NOTICE '  • Business 500:  $911.11/mo  (500 devices @ $1.82/device)';
  RAISE NOTICE '  • Business 1K:   $1,822.22/mo (1,000 devices @ $1.82/device)';
  RAISE NOTICE '  • Business 2.5K: $4,555.56/mo (2,500 devices @ $1.82/device)';
  RAISE NOTICE '  • Business 5K:   $8,200/mo    (5,000 devices @ $1.64/device)';
  RAISE NOTICE '  • Business 10K:  $16,400/mo   (10,000 devices @ $1.64/device)';
  RAISE NOTICE '';
  RAISE NOTICE 'Total: 40 pricing plans created (8 products × 5 billing periods)';
  RAISE NOTICE '';
  RAISE NOTICE 'Server Capacity: 570 devices per $410/mo server @ 75%% max load';
END $$;
