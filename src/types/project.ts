export type Project = {
  id: string;
  name: string;
  description: string;
  budget: number;
  status: 'active' | 'completed' | 'cancelled';
  department: string;
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
};