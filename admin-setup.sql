-- 1. Get the admin role ID
select id from public.roles where name = 'admin';

-- 2. Update your user's role_id (replace YOUR_USER_ID with your actual user ID)
update auth.users
set role_id = (select id from public.roles where name = 'admin')
where id = 'YOUR_USER_ID';

-- 3. Update your user's metadata to include admin role and all permissions
update auth.users
set raw_user_meta_data = jsonb_build_object(
  'roles', array['admin'],
  'permissions', array[
    'create:transactions',
    'read:transactions',
    'update:transactions',
    'delete:transactions',
    'manage:users',
    'manage:roles'
  ]
)
where id = 'YOUR_USER_ID';