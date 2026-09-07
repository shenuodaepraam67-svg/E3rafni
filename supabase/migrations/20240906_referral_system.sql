-- Migration: Dynamic Referral and Admin System
-- This migration adds tables and fields for referral tracking, rewards, manual bonuses, and admin management

-- Add role column to profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user';
  END IF;
END $$;

-- Add referral_code to profiles table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'referral_code'
  ) THEN
    ALTER TABLE profiles ADD COLUMN referral_code TEXT UNIQUE;
  END IF;
END $$;

-- Generate unique referral codes for existing users who don't have one
UPDATE profiles 
SET referral_code = upper(substr(md5(id::text), 1, 8))
WHERE referral_code IS NULL;

-- Add referred_by to profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'referred_by'
  ) THEN
    ALTER TABLE profiles ADD COLUMN referred_by UUID REFERENCES profiles(id);
  END IF;
END $$;

-- Remove base_test_limit from profiles if it exists (we'll calculate dynamically)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'base_test_limit'
  ) THEN
    ALTER TABLE profiles DROP COLUMN base_test_limit;
  END IF;
END $$;

-- Create referral_visits table to track visitors before signup
CREATE TABLE referral_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  visitor_identifier TEXT NOT NULL, -- Fingerprint or session ID
  first_visit_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_visit_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  visit_count INTEGER DEFAULT 1,
  converted_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  converted_at TIMESTAMP WITH TIME ZONE,
  is_qualified BOOLEAN DEFAULT FALSE,
  qualified_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for performance
CREATE INDEX idx_referral_visits_referrer ON referral_visits(referrer_id);
CREATE INDEX idx_referral_visits_visitor ON referral_visits(visitor_identifier);
CREATE INDEX idx_referral_visits_converted ON referral_visits(converted_user_id);
CREATE INDEX idx_referral_visits_qualified ON referral_visits(is_qualified) WHERE is_qualified = TRUE;

-- Create referral_rewards table to track earned rewards (drop if exists to recreate with new schema)
DROP TABLE IF EXISTS referral_rewards CASCADE;

CREATE TABLE referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  qualified_referrals_count INTEGER DEFAULT 0,
  earned_extra_tests INTEGER DEFAULT 0,
  manual_bonus_tests INTEGER DEFAULT 0,
  used_extra_tests INTEGER DEFAULT 0,
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add index for performance
CREATE INDEX idx_referral_rewards_user ON referral_rewards(user_id);

-- Insert reward configuration into app_settings
INSERT INTO app_settings (key, value) VALUES 
('referral_reward_milestones', '[
  {"referrals": 10, "extra_tests": 3},
  {"referrals": 20, "extra_tests": 6},
  {"referrals": 30, "extra_tests": 9},
  {"referrals": 40, "extra_tests": 12},
  {"referrals": 50, "extra_tests": 15}
]'),
('base_test_limit', '5')
ON CONFLICT (key) DO NOTHING;

-- Add base_test_limit to profiles for caching
ALTER TABLE profiles 
ADD COLUMN base_test_limit INTEGER DEFAULT 5;

-- Add RLS policies for referral_visits
ALTER TABLE referral_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create referral visits" ON referral_visits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own referral visits" ON referral_visits
  FOR SELECT USING (
    auth.uid() = referrer_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add RLS policies for referral_rewards
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rewards" ON referral_rewards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all rewards" ON referral_rewards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only server can update rewards" ON referral_rewards
  FOR ALL USING (false);

-- Update profiles RLS to allow referral_code update by server
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id AND 
    -- Prevent users from changing sensitive fields
    NOT (OLD.role IS DISTINCT FROM NEW.role) AND
    NOT (OLD.referred_by IS DISTINCT FROM NEW.referred_by) AND
    NOT (OLD.referral_code IS DISTINCT FROM NEW.referral_code)
  );

-- Admin can update any profile
CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Prevent users from changing their own role
CREATE POLICY "Users cannot change role" ON profiles
  FOR UPDATE USING (
    NOT (OLD.role IS DISTINCT FROM NEW.role) OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to calculate referral rewards
CREATE OR REPLACE FUNCTION calculate_referral_rewards(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  qualified_count INTEGER;
  earned_tests INTEGER;
  milestone RECORD;
BEGIN
  -- Count qualified referrals
  SELECT COUNT(*) INTO qualified_count
  FROM referral_visits
  WHERE referrer_id = user_id 
    AND is_qualified = TRUE;
  
  -- Calculate earned tests based on milestones
  earned_tests := 0;
  
  FOR milestone IN 
    SELECT * FROM jsonb_array_to_jsonb(
      (SELECT value::jsonb FROM app_settings WHERE key = 'referral_reward_milestones')
    )
  LOOP
    IF qualified_count >= (milestone->>'referrals')::INTEGER THEN
      earned_tests := (milestone->>'extra_tests')::INTEGER;
    END IF;
  END LOOP;
  
  -- Update or insert rewards
  INSERT INTO referral_rewards (user_id, qualified_referrals_count, earned_extra_tests, last_calculated_at)
  VALUES (user_id, qualified_count, earned_tests, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET
    qualified_referrals_count = qualified_count,
    earned_extra_tests = earned_tests,
    last_calculated_at = NOW();
  
  RETURN earned_tests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-calculate rewards when a referral qualifies
CREATE OR REPLACE FUNCTION trigger_calculate_referral_reward()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_qualified = TRUE AND (OLD.is_qualified IS NULL OR OLD.is_qualified = FALSE) THEN
    PERFORM calculate_referral_rewards(NEW.referrer_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_referral_qualified
  AFTER UPDATE ON referral_visits
  FOR EACH ROW
  EXECUTE FUNCTION trigger_calculate_referral_reward();

-- Set up admin account for shenuodaepraam@gmail.com
-- This is safe to run multiple times - it will only update if the email exists
UPDATE profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email = 'shenuodaepraam@gmail.com'
);

-- If the admin account doesn't exist yet, add a comment for manual setup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'shenuodaepraam@gmail.com'
  ) THEN
    RAISE NOTICE 'Admin account shenuodaepraam@gmail.com does not exist yet. Please create the account first, then run this migration again to set the admin role.';
  ELSE
    RAISE NOTICE 'Admin role has been set for shenuodaepraam@gmail.com';
  END IF;
END $$;
