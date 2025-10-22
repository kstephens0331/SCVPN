-- Migration: Add billing_period to checkout_sessions table
-- Purpose: Track billing period during checkout process
-- Created: 2025-10-21

-- Add billing_period column to checkout_sessions table
ALTER TABLE checkout_sessions
ADD COLUMN IF NOT EXISTS billing_period TEXT DEFAULT 'monthly';

-- Add comment for clarity
COMMENT ON COLUMN checkout_sessions.billing_period IS 'Billing period selected during checkout: monthly, sixmonth, yearly, twoyear, threeyear';

-- Update existing checkout sessions to have 'monthly' billing period
UPDATE checkout_sessions
SET billing_period = 'monthly'
WHERE billing_period IS NULL;

-- Verify the migration
SELECT
  'Migration 004 completed' as status,
  COUNT(*) as total_checkout_sessions,
  COUNT(CASE WHEN billing_period = 'monthly' THEN 1 END) as monthly_checkouts
FROM checkout_sessions;
