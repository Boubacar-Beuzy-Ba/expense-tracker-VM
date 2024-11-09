-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS public;
CREATE SCHEMA IF NOT EXISTS petty_cash;

-- Drop existing tables if needed (be careful in production!)
DROP TABLE IF EXISTS petty_cash.reconciliations;
DROP TABLE IF EXISTS petty_cash.transactions;
DROP TABLE IF EXISTS petty_cash.funds;
DROP TABLE IF EXISTS public.transaction_files;
DROP TABLE IF EXISTS public.transactions;
DROP TABLE IF EXISTS public.projects;
DROP TABLE IF EXISTS public.user_profiles;
DROP TABLE IF EXISTS public.role_permissions;
DROP TABLE IF EXISTS public.permissions;
DROP TABLE IF EXISTS public.roles;

-- Create base tables
CREATE TABLE public.roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.permissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.role_permissions (
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  department TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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

CREATE TABLE public.transaction_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  content_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Petty Cash tables
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

-- Create views
CREATE OR REPLACE VIEW public.project_budget_analysis AS
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

CREATE OR REPLACE VIEW petty_cash.fund_summary AS
SELECT 
  f.id,
  f.name,
  f.initial_balance,
  f.current_balance,
  f.department,
  f.status,
  f.custodian_id,
  u.email as custodian_email,
  COUNT(DISTINCT t.id) as transaction_count,
  COUNT(DISTINCT r.id) as reconciliation_count,
  f.created_at,
  f.updated_at
FROM petty_cash.funds f
LEFT JOIN auth.users u ON f.custodian_id = u.id
LEFT JOIN petty_cash.transactions t ON f.id = t.fund_id
LEFT JOIN petty_cash.reconciliations r ON f.id = r.fund_id
GROUP BY f.id, f.name, f.initial_balance, f.current_balance, f.department, 
         f.status, f.custodian_id, u.email, f.created_at, f.updated_at;

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

-- Create RLS policies
-- User Profiles
CREATE POLICY "Enable read access for authenticated users"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable self profile management"
  ON public.user_profiles FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable admin profile management"
  ON public.user_profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Projects
CREATE POLICY "Users can view their own projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own projects"
  ON public.projects FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Transactions
CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own transactions"
  ON public.transactions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Transaction Files
CREATE POLICY "Users can view their own transaction files"
  ON public.transaction_files FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions t
      WHERE t.id = transaction_id
      AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own transaction files"
  ON public.transaction_files FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions t
      WHERE t.id = transaction_id
      AND t.user_id = auth.uid()
    )
  );

-- Petty Cash Funds
CREATE POLICY "Enable read access for authenticated users"
  ON petty_cash.funds FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable write access for authenticated users"
  ON petty_cash.funds FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for fund custodians and admins"
  ON petty_cash.funds FOR UPDATE
  TO authenticated
  USING (
    custodian_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Petty Cash Transactions
CREATE POLICY "Enable read access for authenticated users"
  ON petty_cash.transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable write access for fund custodians"
  ON petty_cash.transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM petty_cash.funds
      WHERE id = fund_id AND custodian_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Petty Cash Reconciliations
CREATE POLICY "Enable read access for authenticated users"
  ON petty_cash.reconciliations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable write access for fund custodians"
  ON petty_cash.reconciliations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM petty_cash.funds
      WHERE id = fund_id AND custodian_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default roles and permissions
INSERT INTO public.roles (name, description) VALUES
  ('admin', 'Full system access'),
  ('manager', 'Department management access'),
  ('user', 'Basic user access'),
  ('custodian', 'Petty cash fund custodian')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.permissions (name, description) VALUES
  ('create:transactions', 'Can create transactions'),
  ('read:transactions', 'Can view transactions'),
  ('update:transactions', 'Can update transactions'),
  ('delete:transactions', 'Can delete transactions'),
  ('manage:users', 'Can manage users'),
  ('manage:roles', 'Can manage roles'),
  ('manage:petty-cash', 'Can manage petty cash funds'),
  ('approve:reconciliations', 'Can approve reconciliations')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_project ON public.transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_transaction_files_transaction ON public.transaction_files(transaction_id);
CREATE INDEX IF NOT EXISTS idx_projects_user ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_funds_custodian ON petty_cash.funds(custodian_id);
CREATE INDEX IF NOT EXISTS idx_pc_transactions_fund ON petty_cash.transactions(fund_id);
CREATE INDEX IF NOT EXISTS idx_pc_transactions_user ON petty_cash.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reconciliations_fund ON petty_cash.reconciliations(fund_id);
CREATE INDEX IF NOT EXISTS idx_reconciliations_user ON petty_cash.reconciliations(reconciled_by);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    email,
    full_name,
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Storage setup
-- Make sure to create these buckets in Supabase dashboard:
-- 1. transaction-files
-- 2. profile-images