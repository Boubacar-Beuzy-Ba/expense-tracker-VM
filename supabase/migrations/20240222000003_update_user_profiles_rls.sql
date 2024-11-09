-- First, ensure the roles table has the custodian role
INSERT INTO public.roles (name, description)
VALUES ('custodian', 'Petty cash fund custodian')
ON CONFLICT (name) DO NOTHING;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view all user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage all user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "New users can insert their profile" ON public.user_profiles;

-- Create comprehensive policies for user_profiles
CREATE POLICY "Enable read access for authenticated users"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow admins to insert any user
    EXISTS (
      SELECT 1 FROM public.roles r
      INNER JOIN public.user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
    -- Allow users to insert their own profile
    OR auth.uid() = id
  );

CREATE POLICY "Enable update for admins and own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- Allow admins to update any profile
    EXISTS (
      SELECT 1 FROM public.roles r
      INNER JOIN public.user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
    -- Allow users to update their own profile
    OR auth.uid() = id
  );

CREATE POLICY "Enable delete for admins only"
  ON public.user_profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.roles r
      INNER JOIN public.user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Add necessary permissions for custodian role
INSERT INTO public.permissions (name, description)
VALUES 
  ('manage:petty-cash', 'Can manage petty cash funds'),
  ('create:transactions', 'Can create transactions'),
  ('approve:reconciliations', 'Can approve reconciliations')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to custodian role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'custodian'
  AND p.name IN ('manage:petty-cash', 'create:transactions', 'approve:reconciliations')
ON CONFLICT DO NOTHING;