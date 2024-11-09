-- Add custodian role if it doesn't exist
INSERT INTO public.roles (name, description)
VALUES ('custodian', 'Petty cash fund custodian')
ON CONFLICT (name) DO NOTHING;

-- Add custodian permissions
INSERT INTO public.permissions (name, description)
VALUES 
  ('manage:funds', 'Can manage petty cash funds'),
  ('manage:transactions', 'Can manage fund transactions'),
  ('manage:reconciliations', 'Can manage fund reconciliations')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to custodian role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'custodian'
  AND p.name IN ('manage:funds', 'manage:transactions', 'manage:reconciliations')
ON CONFLICT DO NOTHING;