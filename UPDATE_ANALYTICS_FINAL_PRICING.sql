-- ============================================================================
-- SACVPN ANALYTICS UPDATE - FINAL APPROVED PRICING
-- Updates MRR/ARR calculations with correct pricing for all billing periods
-- Server cost: $420/month OVH SCALE-1
-- Margins: Monthly 55%, 6-Month 50%, Yearly 45%, 2-Year 40%, 3-Year 35%
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ltwuqjmncldopkutiyak/sql/new
-- ============================================================================

-- Drop existing analytics functions
DROP FUNCTION IF EXISTS mrr_total_cents();
DROP FUNCTION IF EXISTS arr_total_cents();

-- Create updated MRR function with correct pricing for all plans and billing periods
CREATE OR REPLACE FUNCTION mrr_total_cents()
RETURNS BIGINT
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(SUM(
    CASE
      -- ============ PERSONAL PLAN ============
      -- Monthly: $9.99
      WHEN s.plan = 'personal' AND s.billing_period = 'monthly' THEN 999

      -- 6-Month: $53.95 total / 6 = $8.99/mo
      WHEN s.plan = 'personal' AND s.billing_period IN ('6month', 'sixmonth') THEN 899

      -- Yearly: $98.06 total / 12 = $8.17/mo
      WHEN s.plan = 'personal' AND s.billing_period = 'yearly' THEN 817

      -- 2-Year: $179.82 total / 24 = $7.49/mo
      WHEN s.plan = 'personal' AND s.billing_period IN ('2year', 'twoyear') THEN 749

      -- 3-Year: $248.87 total / 36 = $6.91/mo
      WHEN s.plan = 'personal' AND s.billing_period IN ('3year', 'threeyear') THEN 691

      -- ============ GAMING PLAN ============
      -- Monthly: $14.99
      WHEN s.plan = 'gaming' AND s.billing_period = 'monthly' THEN 1499

      -- 6-Month: $80.95 total / 6 = $13.49/mo
      WHEN s.plan = 'gaming' AND s.billing_period IN ('6month', 'sixmonth') THEN 1349

      -- Yearly: $147.14 total / 12 = $12.26/mo
      WHEN s.plan = 'gaming' AND s.billing_period = 'yearly' THEN 1226

      -- 2-Year: $269.82 total / 24 = $11.24/mo
      WHEN s.plan = 'gaming' AND s.billing_period IN ('2year', 'twoyear') THEN 1124

      -- 3-Year: $373.43 total / 36 = $10.37/mo
      WHEN s.plan = 'gaming' AND s.billing_period IN ('3year', 'threeyear') THEN 1037

      -- ============ BUSINESS 50 PLAN ============
      -- Monthly: $933.33
      WHEN s.plan IN ('business50', 'business_50') AND s.billing_period = 'monthly' THEN 93333

      -- 6-Month: $5,040.00 total / 6 = $840/mo
      WHEN s.plan IN ('business50', 'business_50') AND s.billing_period IN ('6month', 'sixmonth') THEN 84000

      -- Yearly: $9,163.64 total / 12 = $763.64/mo
      WHEN s.plan IN ('business50', 'business_50') AND s.billing_period = 'yearly' THEN 76364

      -- 2-Year: $16,800.00 total / 24 = $700/mo
      WHEN s.plan IN ('business50', 'business_50') AND s.billing_period IN ('2year', 'twoyear') THEN 70000

      -- 3-Year: $23,261.54 total / 36 = $646.15/mo
      WHEN s.plan IN ('business50', 'business_50') AND s.billing_period IN ('3year', 'threeyear') THEN 64615

      -- ============ BUSINESS 100 PLAN ============
      -- Monthly: $933.33
      WHEN s.plan IN ('business100', 'business_100') AND s.billing_period = 'monthly' THEN 93333

      -- 6-Month: $5,040.00 total / 6 = $840/mo
      WHEN s.plan IN ('business100', 'business_100') AND s.billing_period IN ('6month', 'sixmonth') THEN 84000

      -- Yearly: $9,163.64 total / 12 = $763.64/mo
      WHEN s.plan IN ('business100', 'business_100') AND s.billing_period = 'yearly' THEN 76364

      -- 2-Year: $16,800.00 total / 24 = $700/mo
      WHEN s.plan IN ('business100', 'business_100') AND s.billing_period IN ('2year', 'twoyear') THEN 70000

      -- 3-Year: $23,261.54 total / 36 = $646.15/mo
      WHEN s.plan IN ('business100', 'business_100') AND s.billing_period IN ('3year', 'threeyear') THEN 64615

      -- ============ BUSINESS 500 PLAN ============
      -- Monthly: $2,800.00
      WHEN s.plan IN ('business500', 'business_500') AND s.billing_period = 'monthly' THEN 280000

      -- 6-Month: $15,120.00 total / 6 = $2,520/mo
      WHEN s.plan IN ('business500', 'business_500') AND s.billing_period IN ('6month', 'sixmonth') THEN 252000

      -- Yearly: $27,490.91 total / 12 = $2,290.91/mo
      WHEN s.plan IN ('business500', 'business_500') AND s.billing_period = 'yearly' THEN 229091

      -- 2-Year: $50,400.00 total / 24 = $2,100/mo
      WHEN s.plan IN ('business500', 'business_500') AND s.billing_period IN ('2year', 'twoyear') THEN 210000

      -- 3-Year: $69,784.62 total / 36 = $1,938.46/mo
      WHEN s.plan IN ('business500', 'business_500') AND s.billing_period IN ('3year', 'threeyear') THEN 193846

      -- ============ BUSINESS 1K PLAN ============
      -- Monthly: $5,600.00
      WHEN s.plan IN ('business1k', 'business_1k', 'business1000') AND s.billing_period = 'monthly' THEN 560000

      -- 6-Month: $30,240.00 total / 6 = $5,040/mo
      WHEN s.plan IN ('business1k', 'business_1k', 'business1000') AND s.billing_period IN ('6month', 'sixmonth') THEN 504000

      -- Yearly: $54,981.82 total / 12 = $4,581.82/mo
      WHEN s.plan IN ('business1k', 'business_1k', 'business1000') AND s.billing_period = 'yearly' THEN 458182

      -- 2-Year: $100,800.00 total / 24 = $4,200/mo
      WHEN s.plan IN ('business1k', 'business_1k', 'business1000') AND s.billing_period IN ('2year', 'twoyear') THEN 420000

      -- 3-Year: $139,569.23 total / 36 = $3,876.92/mo
      WHEN s.plan IN ('business1k', 'business_1k', 'business1000') AND s.billing_period IN ('3year', 'threeyear') THEN 387692

      -- ============ BUSINESS 2.5K PLAN ============
      -- Monthly: $13,066.67
      WHEN s.plan IN ('business2500', 'business_2500', 'business2.5k') AND s.billing_period = 'monthly' THEN 1306667

      -- 6-Month: $70,560.00 total / 6 = $11,760/mo
      WHEN s.plan IN ('business2500', 'business_2500', 'business2.5k') AND s.billing_period IN ('6month', 'sixmonth') THEN 1176000

      -- Yearly: $128,290.91 total / 12 = $10,690.91/mo
      WHEN s.plan IN ('business2500', 'business_2500', 'business2.5k') AND s.billing_period = 'yearly' THEN 1069091

      -- 2-Year: $235,200.00 total / 24 = $9,800/mo
      WHEN s.plan IN ('business2500', 'business_2500', 'business2.5k') AND s.billing_period IN ('2year', 'twoyear') THEN 980000

      -- 3-Year: $325,661.54 total / 36 = $9,046.15/mo
      WHEN s.plan IN ('business2500', 'business_2500', 'business2.5k') AND s.billing_period IN ('3year', 'threeyear') THEN 904615

      -- ============ BUSINESS 5K PLAN ============
      -- Monthly: $25,200.00
      WHEN s.plan IN ('business5k', 'business_5k', 'business5000') AND s.billing_period = 'monthly' THEN 2520000

      -- 6-Month: $136,080.00 total / 6 = $22,680/mo
      WHEN s.plan IN ('business5k', 'business_5k', 'business5000') AND s.billing_period IN ('6month', 'sixmonth') THEN 2268000

      -- Yearly: $247,418.18 total / 12 = $20,618.18/mo
      WHEN s.plan IN ('business5k', 'business_5k', 'business5000') AND s.billing_period = 'yearly' THEN 2061818

      -- 2-Year: $453,600.00 total / 24 = $18,900/mo
      WHEN s.plan IN ('business5k', 'business_5k', 'business5000') AND s.billing_period IN ('2year', 'twoyear') THEN 1890000

      -- 3-Year: $628,061.54 total / 36 = $17,446.15/mo
      WHEN s.plan IN ('business5k', 'business_5k', 'business5000') AND s.billing_period IN ('3year', 'threeyear') THEN 1744615

      -- ============ BUSINESS 10K PLAN ============
      -- Monthly: $50,400.00
      WHEN s.plan IN ('business10k', 'business_10k', 'business10000') AND s.billing_period = 'monthly' THEN 5040000

      -- 6-Month: $272,160.00 total / 6 = $45,360/mo
      WHEN s.plan IN ('business10k', 'business_10k', 'business10000') AND s.billing_period IN ('6month', 'sixmonth') THEN 4536000

      -- Yearly: $494,836.36 total / 12 = $41,236.36/mo
      WHEN s.plan IN ('business10k', 'business_10k', 'business10000') AND s.billing_period = 'yearly' THEN 4123636

      -- 2-Year: $907,200.00 total / 24 = $37,800/mo
      WHEN s.plan IN ('business10k', 'business_10k', 'business10000') AND s.billing_period IN ('2year', 'twoyear') THEN 3780000

      -- 3-Year: $1,256,123.08 total / 36 = $34,892.31/mo
      WHEN s.plan IN ('business10k', 'business_10k', 'business10000') AND s.billing_period IN ('3year', 'threeyear') THEN 3489231

      -- Default: 0 for unknown plans
      ELSE 0
    END
  ), 0)::BIGINT
  FROM subscriptions s
  WHERE s.status = 'active';
$$;

-- Create ARR function (Annual Recurring Revenue = MRR × 12)
CREATE OR REPLACE FUNCTION arr_total_cents()
RETURNS BIGINT
LANGUAGE SQL
STABLE
AS $$
  SELECT (mrr_total_cents() * 12)::BIGINT;
$$;

-- Grant permissions to authenticated users and anonymous users
GRANT EXECUTE ON FUNCTION mrr_total_cents() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION arr_total_cents() TO authenticated, anon;

-- Add helpful comments
COMMENT ON FUNCTION mrr_total_cents() IS 'Calculates Monthly Recurring Revenue in cents based on active subscriptions with correct multi-period pricing';
COMMENT ON FUNCTION arr_total_cents() IS 'Calculates Annual Recurring Revenue in cents (MRR × 12)';

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this to test the functions after deployment:
--
-- SELECT
--   mrr_total_cents() / 100.0 AS mrr_dollars,
--   arr_total_cents() / 100.0 AS arr_dollars,
--   (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') AS active_subscriptions;
-- ============================================================================

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Analytics functions updated with final approved pricing!';
  RAISE NOTICE '';
  RAISE NOTICE 'Pricing Structure:';
  RAISE NOTICE '  • Personal:     $9.99/mo   (6mo: $8.99, yearly: $8.17, 2yr: $7.49, 3yr: $6.91)';
  RAISE NOTICE '  • Gaming:       $14.99/mo  (6mo: $13.49, yearly: $12.26, 2yr: $11.24, 3yr: $10.37)';
  RAISE NOTICE '  • Business 50:  $933.33/mo (6mo: $840, yearly: $763.64, 2yr: $700, 3yr: $646.15)';
  RAISE NOTICE '  • Business 100: $933.33/mo (6mo: $840, yearly: $763.64, 2yr: $700, 3yr: $646.15)';
  RAISE NOTICE '  • Business 500: $2,800/mo  (6mo: $2,520, yearly: $2,290.91, 2yr: $2,100, 3yr: $1,938.46)';
  RAISE NOTICE '  • Business 1K:  $5,600/mo  (6mo: $5,040, yearly: $4,581.82, 2yr: $4,200, 3yr: $3,876.92)';
  RAISE NOTICE '  • Business 2.5K: $13,066.67/mo (6mo: $11,760, yearly: $10,690.91, 2yr: $9,800, 3yr: $9,046.15)';
  RAISE NOTICE '  • Business 5K:  $25,200/mo (6mo: $22,680, yearly: $20,618.18, 2yr: $18,900, 3yr: $17,446.15)';
  RAISE NOTICE '  • Business 10K: $50,400/mo (6mo: $45,360, yearly: $41,236.36, 2yr: $37,800, 3yr: $34,892.31)';
  RAISE NOTICE '';
  RAISE NOTICE 'Profit Margins:';
  RAISE NOTICE '  • Monthly:  55%% margin';
  RAISE NOTICE '  • 6-Month:  50%% margin (10%% customer discount)';
  RAISE NOTICE '  • Yearly:   45%% margin (18.2%% customer discount)';
  RAISE NOTICE '  • 2-Year:   40%% margin (25%% customer discount)';
  RAISE NOTICE '  • 3-Year:   35%% margin (30.8%% customer discount)';
  RAISE NOTICE '';
  RAISE NOTICE 'Server Infrastructure:';
  RAISE NOTICE '  • Personal VPS: $60/mo (1 Gbps, 100 users) = 94%% margin';
  RAISE NOTICE '  • Gaming VPS: $3,500/mo (100 Gbps @ 70%% load, 3,500 users) = 93.3%% margin';
  RAISE NOTICE '  • Business Server: $420/mo OVH SCALE-1 (5 Gbps, 187 devices @ 20 Mbps each)';
  RAISE NOTICE '';
  RAISE NOTICE 'Functions created:';
  RAISE NOTICE '  • mrr_total_cents() - Monthly Recurring Revenue';
  RAISE NOTICE '  • arr_total_cents() - Annual Recurring Revenue';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Ready for production deployment!';
END $$;
