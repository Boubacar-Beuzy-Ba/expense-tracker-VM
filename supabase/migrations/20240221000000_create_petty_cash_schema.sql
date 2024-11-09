-- Create schema for petty cash management
CREATE SCHEMA IF NOT EXISTS petty_cash;

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

-- Create views
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

-- Enable RLS
ALTER TABLE petty_cash.funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE petty_cash.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE petty_cash.reconciliations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Funds are viewable by authenticated users"
  ON petty_cash.funds FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Funds are manageable by admin users and custodians"
  ON petty_cash.funds FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    custodian_id = auth.uid()
  );

CREATE POLICY "Transactions are viewable by authenticated users"
  ON petty_cash.transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Transactions are manageable by admin users and fund custodians"
  ON petty_cash.transactions FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    EXISTS (
      SELECT 1 FROM petty_cash.funds f
      WHERE f.id = fund_id AND f.custodian_id = auth.uid()
    )
  );

CREATE POLICY "Reconciliations are viewable by authenticated users"
  ON petty_cash.reconciliations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Reconciliations are manageable by admin users and fund custodians"
  ON petty_cash.reconciliations FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    EXISTS (
      SELECT 1 FROM petty_cash.funds f
      WHERE f.id = fund_id AND f.custodian_id = auth.uid()
    )
  );