# Database Setup Guide

## Schema Overview

```sql
-- Create necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS public;
CREATE SCHEMA IF NOT EXISTS petty_cash;

-- Roles table
CREATE TABLE public.roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Permissions table
CREATE TABLE public.permissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Role permissions junction table
CREATE TABLE public.role_permissions (
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (role_id, permission_id)
);

-- User profiles table
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  department TEXT,
  role_id UUID REFERENCES public.roles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Projects table
CREATE TABLE public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  budget DECIMAL(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  department TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Transactions table
CREATE TABLE public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  amount DECIMAL(12,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  department TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Transaction files table
CREATE TABLE public.transaction_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  content_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Petty Cash Fund table
CREATE TABLE petty_cash.funds (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  initial_balance DECIMAL(12,2) NOT NULL,
  current_balance DECIMAL(12,2) NOT NULL,
  custodian_id UUID REFERENCES auth.users(id),
  department TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Petty Cash Transactions table
CREATE TABLE petty_cash.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  fund_id UUID REFERENCES petty_cash.funds(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('replenishment', 'expense')),
  description TEXT NOT NULL,
  receipt_number TEXT,
  category TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Petty Cash Reconciliation table
CREATE TABLE petty_cash.reconciliations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  fund_id UUID REFERENCES petty_cash.funds(id) ON DELETE CASCADE,
  reconciled_by UUID REFERENCES auth.users(id),
  physical_count DECIMAL(12,2) NOT NULL,
  system_balance DECIMAL(12,2) NOT NULL,
  difference DECIMAL(12,2) NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Views
CREATE VIEW public.project_budget_analysis AS
WITH project_totals AS (
  SELECT 
    project_id,
    COALESCE(SUM(
      CASE 
        WHEN type = 'expense' THEN -amount 
        ELSE amount 
      END
    ), 0) as total_spent,
    COUNT(id) as transaction_count
  FROM public.transactions
  GROUP BY project_id
)
SELECT 
  p.id as project_id,
  p.name as project_name,
  p.description,
  p.budget as total_budget,
  p.status,
  p.department,
  p.start_date,
  p.end_date,
  p.user_id,
  p.created_at,
  COALESCE(pt.total_spent, 0) as total_spent,
  p.budget + COALESCE(pt.total_spent, 0) as remaining_budget,
  COALESCE(pt.transaction_count, 0) as transaction_count,
  CASE WHEN ABS(COALESCE(pt.total_spent, 0)) > p.budget THEN true ELSE false END as is_over_budget
FROM 
  public.projects p
LEFT JOIN 
  project_totals pt ON p.id = pt.project_id;

CREATE VIEW petty_cash.fund_summary AS
SELECT 
  f.id,
  f.name,
  f.initial_balance,
  f.current_balance,
  f.department,
  f.status,
  u.email as custodian_email,
  (
    SELECT COUNT(*)
    FROM petty_cash.transactions t
    WHERE t.fund_id = f.id
  ) as transaction_count,
  (
    SELECT COUNT(*)
    FROM petty_cash.reconciliations r
    WHERE r.fund_id = f.id
  ) as reconciliation_count
FROM petty_cash.funds f
LEFT JOIN auth.users u ON f.custodian_id = u.id;

-- Default data
INSERT INTO public.roles (name, description) VALUES
  ('admin', 'Full system access'),
  ('manager', 'Department management access'),
  ('user', 'Basic user access'),
  ('custodian', 'Petty cash fund custodian');

INSERT INTO public.permissions (name, description) VALUES
  ('create:transactions', 'Can create transactions'),
  ('read:transactions', 'Can view transactions'),
  ('update:transactions', 'Can update transactions'),
  ('delete:transactions', 'Can delete transactions'),
  ('manage:users', 'Can manage users'),
  ('manage:roles', 'Can manage roles'),
  ('manage:petty-cash', 'Can manage petty cash funds'),
  ('approve:reconciliations', 'Can approve reconciliations');

-- Enable RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE petty_cash.funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE petty_cash.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE petty_cash.reconciliations ENABLE ROW LEVEL SECURITY;

-- Create necessary policies (see migrations folder for detailed policies)
```

## Storage Configuration

1. Create the following buckets:
   - `transaction-files`: For transaction attachments
   - `profile-images`: For user profile images

2. Configure CORS for your domain

3. Set up storage policies to restrict access

## Authentication Configuration

1. Enable Email auth provider
2. Configure email templates
3. Set up OAuth providers if needed
4. Configure password policies