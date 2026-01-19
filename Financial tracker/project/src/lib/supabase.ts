import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Income = {
  id: string;
  user_id: string;
  date: string;
  source: string;
  amount: number;
  account: string;
  notes: string;
  created_at: string;
};

export type Expense = {
  id: string;
  user_id: string;
  date: string;
  category: string;
  sub_category: string;
  amount: number;
  payment_method: string;
  vendor_note: string;
  created_at: string;
};

export type EMILoan = {
  id: string;
  user_id: string;
  loan_type: string;
  total_amount: number;
  interest_rate: number;
  emi_amount: number;
  start_date: string;
  end_date: string;
  remaining_months: number;
  outstanding_principal: number;
  created_at: string;
};

export type MutualFund = {
  id: string;
  user_id: string;
  fund_name: string;
  fund_type: string;
  sip_amount: number;
  sip_date: number | null;
  lumpsum_amount: number;
  invested_amount: number;
  current_value: number;
  created_at: string;
  updated_at: string;
};

export type Goal = {
  id: string;
  user_id: string;
  goal_name: string;
  target_amount: number;
  target_date: string;
  monthly_contribution: number;
  current_saved: number;
  created_at: string;
};
