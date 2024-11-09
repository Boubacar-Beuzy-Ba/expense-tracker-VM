-- First, update your user's metadata to include admin role
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
  'role', 'admin',
  'full_name', COALESCE(raw_user_meta_data->>'full_name', email)
)
WHERE email = 'YOUR_EMAIL_HERE'; -- Replace with your email

-- Ensure the roles exist
INSERT INTO public.roles (name, description)
VALUES 
  ('admin', 'Administrator with full access'),
  ('custodian', 'Petty cash fund custodian')
ON CONFLICT (name) DO NOTHING;

-- Add admin role to your user
INSERT INTO public.user_roles (user_id, role_id)
SELECT 
  auth.users.id,
  public.roles.id
FROM auth.users
CROSS JOIN public.roles
WHERE auth.users.email = 'YOUR_EMAIL_HERE' -- Replace with your email
  AND public.roles.name = 'admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Add custodian role to your user
INSERT INTO public.user_roles (user_id, role_id)
SELECT 
  auth.users.id,
  public.roles.id
FROM auth.users
CROSS JOIN public.roles
WHERE auth.users.email = 'YOUR_EMAIL_HERE' -- Replace with your email
  AND public.roles.name = 'custodian'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Grant necessary permissions
INSERT INTO public.permissions (name, description)
VALUES 
  ('manage:users', 'Can manage users'),
  ('manage:roles', 'Can manage roles'),
  ('manage:petty-cash', 'Can manage petty cash funds'),
  ('create:transactions', 'Can create transactions'),
  ('approve:reconciliations', 'Can approve reconciliations')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name IN ('admin', 'custodian')
ON CONFLICT DO NOTHING;