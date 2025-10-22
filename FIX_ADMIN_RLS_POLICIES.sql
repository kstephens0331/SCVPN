-- Fix RLS policies to allow admin users to view all data
-- Run this in Supabase SQL Editor

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_emails WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Devices table - allow admins to view all devices
DROP POLICY IF EXISTS "Admins can view all devices" ON devices;
CREATE POLICY "Admins can view all devices"
  ON devices FOR SELECT
  USING (
    is_admin(auth.jwt()->>'email')
  );

-- Profiles table - allow admins to view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    is_admin(auth.jwt()->>'email')
  );

-- Organizations table - allow admins to view all organizations
DROP POLICY IF EXISTS "Admins can view all organizations" ON organizations;
CREATE POLICY "Admins can view all organizations"
  ON organizations FOR SELECT
  USING (
    is_admin(auth.jwt()->>'email')
  );

-- Device telemetry - allow admins to view all telemetry
DROP POLICY IF EXISTS "Admins can view all device_telemetry" ON device_telemetry;
CREATE POLICY "Admins can view all device_telemetry"
  ON device_telemetry FOR SELECT
  USING (
    is_admin(auth.jwt()->>'email')
  );

-- Subscriptions - allow admins to view all subscriptions
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON subscriptions;
CREATE POLICY "Admins can view all subscriptions"
  ON subscriptions FOR SELECT
  USING (
    is_admin(auth.jwt()->>'email')
  );

-- Invoices - allow admins to view all invoices
DROP POLICY IF EXISTS "Admins can view all invoices" ON invoices;
CREATE POLICY "Admins can view all invoices"
  ON invoices FOR SELECT
  USING (
    is_admin(auth.jwt()->>'email')
  );
