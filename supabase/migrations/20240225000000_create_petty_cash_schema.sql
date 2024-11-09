-- Create schema for petty cash management
CREATE SCHEMA IF NOT EXISTS petty_cash;

-- Create funds table
CREATE TABLE IF NOT EXISTS petty_cash.funds (
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
CREATE TABLE IF NOT EXISTS petty_cash.transactions (
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
CREATE TABLE IF NOT EXISTS petty_cash.reconciliations (
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

-- Create fund summary view
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

-- Policies for transactions
CREATE POLICY "Transactions are viewable by authenticated users"
  ON petty_cash.transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Transactions are manageable by admin users and fund custodians"
  ON petty_cash.transactions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    ) OR
    EXISTS (
      SELECT 1 FROM petty_cash.funds f
      WHERE f.id = fund_id AND f.custodian_id = auth.uid()
    )
  );

-- Policies for reconciliations
CREATE POLICY "Reconciliations are viewable by authenticated users"
  ON petty_cash.reconciliations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Reconciliations are manageable by admin users and fund custodians"
  ON petty_cash.reconciliations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    ) OR
    EXISTS (
      SELECT 1 FROM petty_cash.funds f
      WHERE f.id = fund_id AND f.custodian_id = auth.uid()
    )
  );