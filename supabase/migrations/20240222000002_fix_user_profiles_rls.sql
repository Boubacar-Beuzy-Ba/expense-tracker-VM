-- Enable RLS on user_profiles table
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all user profiles
CREATE POLICY "Users can view all user profiles"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow admin users to manage all user profiles
CREATE POLICY "Admins can manage all user profiles"
  ON public.user_profiles
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Allow new users to insert their profile during signup
CREATE POLICY "New users can insert their profile"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);