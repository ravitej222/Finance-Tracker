/*
  # Personal Finance Tracker Schema

  ## New Tables Created

  ### 1. income
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `date` (date) - Income received date
  - `source` (text) - Source of income (salary/freelance/bonus)
  - `amount` (decimal) - Income amount
  - `account` (text) - Bank account or cash
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz)

  ### 2. expenses
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `date` (date) - Expense date
  - `category` (text) - Fixed or Variable
  - `sub_category` (text) - Food, Fuel, Rent, etc.
  - `amount` (decimal) - Expense amount
  - `payment_method` (text) - UPI/card/cash
  - `vendor_note` (text) - Vendor or note
  - `created_at` (timestamptz)

  ### 3. emi_loans
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `loan_type` (text) - Personal loan / Bike / Home
  - `total_amount` (decimal) - Total loan amount
  - `interest_rate` (decimal) - Interest rate percentage
  - `emi_amount` (decimal) - Monthly EMI
  - `start_date` (date) - Loan start date
  - `end_date` (date) - Loan end date
  - `remaining_months` (integer) - Months remaining
  - `outstanding_principal` (decimal) - Current outstanding amount
  - `created_at` (timestamptz)

  ### 4. mutual_funds
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `fund_name` (text) - Name of the fund
  - `fund_type` (text) - Equity/Hybrid/Debt/Index
  - `sip_amount` (decimal) - Monthly SIP amount
  - `sip_date` (integer) - Day of month for SIP
  - `lumpsum_amount` (decimal) - One-time investment
  - `invested_amount` (decimal) - Total invested
  - `current_value` (decimal) - Current market value
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. goals
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `goal_name` (text) - Name of the goal
  - `target_amount` (decimal) - Target amount
  - `target_date` (date) - Target completion date
  - `monthly_contribution` (decimal) - Monthly contribution
  - `current_saved` (decimal) - Currently saved amount
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to manage their own data
*/

-- Create income table
CREATE TABLE IF NOT EXISTS income (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  source text NOT NULL,
  amount decimal(12,2) NOT NULL,
  account text NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE income ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own income"
  ON income FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own income"
  ON income FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own income"
  ON income FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own income"
  ON income FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  category text NOT NULL,
  sub_category text NOT NULL,
  amount decimal(12,2) NOT NULL,
  payment_method text NOT NULL,
  vendor_note text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON expenses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON expenses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create EMI/Loans table
CREATE TABLE IF NOT EXISTS emi_loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  loan_type text NOT NULL,
  total_amount decimal(12,2) NOT NULL,
  interest_rate decimal(5,2) NOT NULL,
  emi_amount decimal(12,2) NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  remaining_months integer NOT NULL,
  outstanding_principal decimal(12,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE emi_loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own loans"
  ON emi_loans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own loans"
  ON emi_loans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own loans"
  ON emi_loans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own loans"
  ON emi_loans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create mutual funds table
CREATE TABLE IF NOT EXISTS mutual_funds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  fund_name text NOT NULL,
  fund_type text NOT NULL,
  sip_amount decimal(12,2) DEFAULT 0,
  sip_date integer,
  lumpsum_amount decimal(12,2) DEFAULT 0,
  invested_amount decimal(12,2) NOT NULL DEFAULT 0,
  current_value decimal(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE mutual_funds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mutual funds"
  ON mutual_funds FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mutual funds"
  ON mutual_funds FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mutual funds"
  ON mutual_funds FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own mutual funds"
  ON mutual_funds FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_name text NOT NULL,
  target_amount decimal(12,2) NOT NULL,
  target_date date NOT NULL,
  monthly_contribution decimal(12,2) DEFAULT 0,
  current_saved decimal(12,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals"
  ON goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_income_user_date ON income(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_emi_loans_user ON emi_loans(user_id);
CREATE INDEX IF NOT EXISTS idx_mutual_funds_user ON mutual_funds(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);