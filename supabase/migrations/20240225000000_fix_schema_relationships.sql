-- Drop existing schema if exists
DROP SCHEMA IF EXISTS petty_cash CASCADE;

-- Create schema for petty cash management
CREATE SCHEMA petty_cash;

-- Create funds table with proper foreign key reference
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

-- Create transactions table
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

-- Create reconciliations table
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

-- Enable RLS
ALTER TABLE petty_cash.funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE petty_cash.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE petty_cash.reconciliations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

CREATE POLICY "Enable delete for admins"
  ON petty_cash.funds FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for transactions
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

-- Create policies for reconciliations
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