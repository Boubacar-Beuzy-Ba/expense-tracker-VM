-- Add department column to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS department TEXT;

-- Add role column to user_profiles if not exists
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS role TEXT;