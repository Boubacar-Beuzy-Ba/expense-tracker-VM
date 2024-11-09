## Supabase Setup Instructions

1. Create the following tables in Supabase:

```sql
-- Roles table
create table public.roles (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Permissions table
create table public.permissions (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Role permissions junction table
create table public.role_permissions (
  role_id uuid references public.roles(id) on delete cascade,
  permission_id uuid references public.permissions(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (role_id, permission_id)
);

-- Add role_id to auth.users
alter table auth.users add column role_id uuid references public.roles(id);

-- Create RLS policies
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;

-- Policies for roles
create policy "Roles are viewable by authenticated users"
  on public.roles for select
  to authenticated
  using (true);

create policy "Roles are manageable by admin users"
  on public.roles for all
  to authenticated
  using (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Policies for permissions
create policy "Permissions are viewable by authenticated users"
  on public.permissions for select
  to authenticated
  using (true);

create policy "Permissions are manageable by admin users"
  on public.permissions for all
  to authenticated
  using (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Policies for role_permissions
create policy "Role permissions are viewable by authenticated users"
  on public.role_permissions for select
  to authenticated
  using (true);

create policy "Role permissions are manageable by admin users"
  on public.role_permissions for all
  to authenticated
  using (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Insert default roles and permissions
insert into public.roles (name, description) values
  ('admin', 'Full system access'),
  ('manager', 'Department management access'),
  ('user', 'Basic user access');

insert into public.permissions (name, description) values
  ('create:transactions', 'Can create transactions'),
  ('read:transactions', 'Can view transactions'),
  ('update:transactions', 'Can update transactions'),
  ('delete:transactions', 'Can delete transactions'),
  ('manage:users', 'Can manage users'),
  ('manage:roles', 'Can manage roles');

-- Assign permissions to roles
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'admin';

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'manager'
  and p.name in ('create:transactions', 'read:transactions', 'update:transactions');

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'user'
  and p.name in ('create:transactions', 'read:transactions');
```

2. Create the following Edge Functions in Supabase:

```typescript
// check-permission.ts
export async function checkPermission(permission: string, userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select(`
      role_id,
      roles (
        role_permissions (
          permissions (
            name
          )
        )
      )
    `)
    .eq('id', userId)
    .single();

  if (error) throw error;

  const permissions = data.roles.role_permissions.map(
    rp => rp.permissions.name
  );

  return permissions.includes(permission);
}</content></file>

<boltAction type="file" filePath="src/types/auth.ts">export type Role = {
  id: string;
  name: string;
  description: string;
  created_at: string;
};

export type Permission = {
  id: string;
  name: string;
  description: string;
  created_at: string;
};

export type UserWithRole = {
  id: string;
  email: string;
  full_name: string;
  role_id: string;
  role: Role;
};