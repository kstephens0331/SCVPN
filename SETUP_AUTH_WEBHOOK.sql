-- ============================================================================
-- SACVPN AUTH SIGNUP WEBHOOK SETUP
-- Creates a database webhook to notify when new users sign up
-- Sends email notification to info@stephenscode.dev
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ltwuqjmncldopkutiyak/sql/new
-- ============================================================================

-- Note: You must also configure the webhook in Supabase Dashboard
-- Go to: Database > Webhooks > Create a new hook
--
-- Configuration:
-- - Name: Auth Signup Notification
-- - Table: auth.users
-- - Events: INSERT
-- - Type: HTTP Request
-- - Method: POST
-- - URL: https://ltwuqjmncldopkutiyak.supabase.co/functions/v1/auth-signup-notify
-- - HTTP Headers:
--   Authorization: Bearer YOUR_SUPABASE_ANON_KEY
--   Content-Type: application/json

-- ============================================================================
-- ALTERNATIVE: Using PostgreSQL Trigger Function
-- ============================================================================
-- If webhooks don't work, use this trigger-based approach instead

-- Create a function to send HTTP request to Edge Function
CREATE OR REPLACE FUNCTION notify_new_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_id bigint;
  supabase_url text;
  anon_key text;
BEGIN
  -- Get Supabase URL and anon key from environment
  supabase_url := current_setting('app.settings.supabase_url', true);
  anon_key := current_setting('app.settings.supabase_anon_key', true);

  -- If not set, use hardcoded values (replace with your actual values)
  IF supabase_url IS NULL THEN
    supabase_url := 'https://ltwuqjmncldopkutiyak.supabase.co';
  END IF;

  -- Make HTTP request to Edge Function using pg_net extension
  SELECT net.http_post(
    url := supabase_url || '/functions/v1/auth-signup-notify',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE(anon_key, 'your-anon-key-here')
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'users',
      'schema', 'auth',
      'record', row_to_json(NEW),
      'old_record', NULL
    )
  ) INTO request_id;

  -- Log the request
  RAISE LOG 'Signup notification sent for user %', NEW.id;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail the signup if notification fails
    RAISE WARNING 'Failed to send signup notification: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_signup();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT SELECT ON auth.users TO postgres;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Test the trigger by creating a test user (don't actually run this in production)
-- The trigger will automatically fire when a new user signs up through your app

-- Check if trigger exists:
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Check recent signups:
SELECT
  id,
  email,
  created_at,
  raw_user_meta_data->>'full_name' as name
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Auth signup notification trigger created!';
  RAISE NOTICE '';
  RAISE NOTICE 'What happens now:';
  RAISE NOTICE '  1. When a new user signs up, the trigger fires';
  RAISE NOTICE '  2. The trigger calls the auth-signup-notify Edge Function';
  RAISE NOTICE '  3. The Edge Function sends email to info@stephenscode.dev';
  RAISE NOTICE '';
  RAISE NOTICE 'Prerequisites:';
  RAISE NOTICE '  • Deploy auth-signup-notify Edge Function';
  RAISE NOTICE '  • Set RESEND_API_KEY environment variable';
  RAISE NOTICE '  • Enable pg_net extension (for HTTP requests)';
  RAISE NOTICE '';
  RAISE NOTICE 'Alternative: Use Supabase Dashboard Webhooks instead of triggers';
END $$;
