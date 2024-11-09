export type PettyCashFund = {
  id: string;
  name: string;
  initial_balance: number;
  current_balance: number;
  custodian_id: string;
  department: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
};

export type PettyCashTransaction = {
  id: string;
  fund_id: string;
  amount: number;
  type: 'replenishment' | 'expense';
  description: string;
  receipt_number?: string;
  category: string;
  user_id: string;
  created_at: string;
};

export type PettyCashReconciliation = {
  id: string;
  fund_id: string;
  reconciled_by: string;
  physical_count: number;
  system_balance: number;
  difference: number;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

export type FundSummary = PettyCashFund & {
  custodian_email: string;
  transaction_count: number;
  reconciliation_count: number;
};