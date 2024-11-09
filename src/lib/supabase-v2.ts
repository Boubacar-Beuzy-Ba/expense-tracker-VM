import { createClient } from '@supabase/supabase-js';
import { PettyCashFund, PettyCashTransaction, PettyCashReconciliation } from '../types/petty-cash';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const pettyCashApi = {
  // Fund Management
  getFunds: async () => {
    const { data, error } = await supabase
      .from('petty_cash.funds')
      .select(`
        *,
        custodian:custodian_id (
          id,
          email
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching funds:', error);
      throw error;
    }
    return data;
  },

  getFund: async (id: string) => {
    const { data, error } = await supabase
      .from('petty_cash.funds')
      .select(`
        *,
        custodian:custodian_id (
          id,
          email
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching fund:', error);
      throw error;
    }
    return data;
  },

  createFund: async (fund: Partial<PettyCashFund>) => {
    const { data, error } = await supabase
      .from('petty_cash.funds')
      .insert([{
        ...fund,
        current_balance: fund.initial_balance,
        status: 'active'
      }])
      .select(`
        *,
        custodian:custodian_id (
          id,
          email
        )
      `)
      .single();
    
    if (error) {
      console.error('Error creating fund:', error);
      throw error;
    }
    return data;
  },

  updateFund: async (id: string, updates: Partial<PettyCashFund>) => {
    const { data, error } = await supabase
      .from('petty_cash.funds')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        custodian:custodian_id (
          id,
          email
        )
      `)
      .single();
    
    if (error) {
      console.error('Error updating fund:', error);
      throw error;
    }
    return data;
  },

  // Transaction Management
  getTransactions: async (fundId?: string) => {
    let query = supabase
      .from('petty_cash.transactions')
      .select(`
        *,
        fund:fund_id (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });
    
    if (fundId) {
      query = query.eq('fund_id', fundId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
    return data;
  },

  createTransaction: async (transaction: Partial<PettyCashTransaction>) => {
    const { data, error } = await supabase
      .from('petty_cash.transactions')
      .insert([transaction])
      .select(`
        *,
        fund:fund_id (
          id,
          name
        )
      `)
      .single();
    
    if (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
    return data;
  },

  updateTransaction: async (id: string, updates: Partial<PettyCashTransaction>) => {
    const { data, error } = await supabase
      .from('petty_cash.transactions')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        fund:fund_id (
          id,
          name
        )
      `)
      .single();
    
    if (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
    return data;
  },

  deleteTransaction: async (id: string) => {
    const { error } = await supabase
      .from('petty_cash.transactions')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  },

  // Reconciliation Management
  getReconciliations: async (fundId?: string) => {
    let query = supabase
      .from('petty_cash.reconciliations')
      .select(`
        *,
        fund:fund_id (
          id,
          name
        ),
        reconciled_by_user:reconciled_by (
          id,
          email
        )
      `)
      .order('created_at', { ascending: false });
    
    if (fundId) {
      query = query.eq('fund_id', fundId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching reconciliations:', error);
      throw error;
    }
    return data;
  },

  createReconciliation: async (reconciliation: Partial<PettyCashReconciliation>) => {
    const { data, error } = await supabase
      .from('petty_cash.reconciliations')
      .insert([reconciliation])
      .select(`
        *,
        fund:fund_id (
          id,
          name
        ),
        reconciled_by_user:reconciled_by (
          id,
          email
        )
      `)
      .single();
    
    if (error) {
      console.error('Error creating reconciliation:', error);
      throw error;
    }
    return data;
  },

  updateReconciliationStatus: async (id: string, status: 'approved' | 'rejected') => {
    const { data, error } = await supabase
      .from('petty_cash.reconciliations')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        fund:fund_id (
          id,
          name
        ),
        reconciled_by_user:reconciled_by (
          id,
          email
        )
      `)
      .single();
    
    if (error) {
      console.error('Error updating reconciliation status:', error);
      throw error;
    }
    return data;
  },
};