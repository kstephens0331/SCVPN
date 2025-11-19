-- ============================================================================
-- INSERT THE MISSING GAMING INVOICE
-- This adds the October 23rd Gaming invoice ($14.99) to show revenue
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Insert the Gaming invoice from October 23, 2025
INSERT INTO invoices (
  subscription_id,
  user_id,
  amount_cents,
  currency,
  status,
  period_start,
  period_end,
  paid_at,
  created_at
)
VALUES (
  '0f3b3e0f-bc89-4952-9682-88ecc600baf4',  -- Subscription UUID (not Stripe ID)
  '467e4d7b-421d-45f3-a839-cb0076d26320',  -- User ID
  1499,  -- $14.99
  'USD',
  'paid',
  '2025-10-23T00:00:00Z',  -- Period start
  '2025-11-23T00:00:00Z',  -- Period end (1 month)
  '2025-10-23T19:18:37Z',  -- Paid at (from Stripe invoice)
  NOW()
)
ON CONFLICT DO NOTHING;

-- Verify it was inserted
DO $$
DECLARE
  today_revenue BIGINT;
BEGIN
  SELECT COALESCE(SUM(amount_cents), 0) INTO today_revenue
  FROM invoices
  WHERE paid_at >= CURRENT_DATE
    AND paid_at IS NOT NULL;

  RAISE NOTICE '✅ Invoice inserted!';
  RAISE NOTICE '';
  RAISE NOTICE 'Revenue Today: $%.2f', today_revenue / 100.0;
END $$;
