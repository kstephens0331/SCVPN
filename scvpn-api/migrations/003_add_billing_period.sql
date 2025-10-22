-- Migration: Add billing_period tracking to subscriptions
-- Purpose: Track whether subscription is monthly, 6-month, yearly, 2-year, or 3-year
-- Created: 2025-10-21

-- Add billing_period column to subscriptions table
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS billing_period TEXT DEFAULT 'monthly';

-- Add comment for clarity
COMMENT ON COLUMN subscriptions.billing_period IS 'Billing period: monthly, sixmonth, yearly, twoyear, threeyear';

-- Add index for faster queries filtering by billing period
CREATE INDEX IF NOT EXISTS subscriptions_billing_period_idx ON subscriptions(billing_period);

-- Update existing subscriptions to have 'monthly' billing period
UPDATE subscriptions
SET billing_period = 'monthly'
WHERE billing_period IS NULL;

-- Verify the migration
SELECT
  'Migration 003 completed' as status,
  COUNT(*) as total_subscriptions,
  COUNT(CASE WHEN billing_period = 'monthly' THEN 1 END) as monthly_subscriptions
FROM subscriptions;
