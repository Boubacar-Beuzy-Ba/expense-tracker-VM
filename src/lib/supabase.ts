import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export type TransactionFile = {
  id: string;
  transaction_id: string;
  file_name: string;
  file_path: string;
  content_type: string;
  created_at: string;
};

export type Transaction = {
  id: string;
  created_at: string;
  amount: number;
  description: string;
  category: string;
  department: string;
  user_id: string;
  files?: TransactionFile[];
};

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  department: string;
};