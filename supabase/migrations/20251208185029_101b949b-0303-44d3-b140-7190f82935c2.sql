-- Create referrals table to track who invited whom
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(referred_id) -- Each user can only be referred once
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can view referrals where they are the referrer
CREATE POLICY "Users can view their referrals"
ON public.referrals
FOR SELECT
USING (auth.uid() = referrer_id);

-- Allow insert only from authenticated users (for the referred user during registration)
CREATE POLICY "Users can create referral on signup"
ON public.referrals
FOR INSERT
WITH CHECK (auth.uid() = referred_id);

-- Add referral_code column to profiles for unique invite codes
ALTER TABLE public.profiles 
ADD COLUMN referral_code TEXT UNIQUE DEFAULT substring(gen_random_uuid()::text, 1, 8);