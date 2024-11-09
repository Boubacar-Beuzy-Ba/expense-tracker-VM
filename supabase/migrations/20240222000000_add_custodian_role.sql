-- Add custodian role
INSERT INTO public.roles (name, description)
VALUES ('custodian', 'Petty cash fund custodian')
ON CONFLICT (name) DO NOTHING;

-- Add custodian-specific permissions
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
  AND p.name IN ('manage:petty-cash', 'create:transactions', 'approve:reconciliations');

-- Add role column to user_profiles if not exists
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS role TEXT;