import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Income, Expense, EMILoan, MutualFund, Goal } from '../lib/supabase';
import {
  TrendingUp, TrendingDown, Wallet, CreditCard,
  PieChart, Target, LogOut, Plus, Calendar
} from 'lucide-react';
import IncomeSection from './IncomeSection';
import ExpenseSection from './ExpenseSection';
import EMISection from './EMISection';
import MutualFundsSection from './MutualFundsSection';
import GoalsSection from './GoalsSection';

type Section = 'dashboard' | 'income' | 'expenses' | 'emi' | 'funds' | 'goals';

export default function Dashboard() {
  const { signOut } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));

  const [income, setIncome] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loans, setLoans] = useState<EMILoan[]>([]);
  const [funds, setFunds] = useState<MutualFund[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [currentMonth]);

  const loadData = async () => {
    setLoading(true);
    const startDate = `${currentMonth}-01`;
    const endDate = `${currentMonth}-31`;

    const [incomeData, expensesData, loansData, fundsData, goalsData] = await Promise.all([
      supabase.from('income').select('*').gte('date', startDate).lte('date', endDate).order('date', { ascending: false }),
      supabase.from('expenses').select('*').gte('date', startDate).lte('date', endDate).order('date', { ascending: false }),
      supabase.from('emi_loans').select('*').order('created_at', { ascending: false }),
      supabase.from('mutual_funds').select('*').order('created_at', { ascending: false }),
      supabase.from('goals').select('*').order('created_at', { ascending: false }),
    ]);

    setIncome(incomeData.data || []);
    setExpenses(expensesData.data || []);
    setLoans(loansData.data || []);
    setFunds(fundsData.data || []);
    setGoals(goalsData.data || []);
    setLoading(false);
  };

  const totalIncome = income.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const fixedExpenses = expenses.filter(e => e.category === 'Fixed').reduce((sum, item) => sum + Number(item.amount), 0);
  const variableExpenses = expenses.filter(e => e.category === 'Variable').reduce((sum, item) => sum + Number(item.amount), 0);
  const totalEMI = loans.reduce((sum, loan) => sum + Number(loan.emi_amount), 0);
  const totalSIP = funds.reduce((sum, fund) => sum + Number(fund.sip_amount), 0);
  const totalInvested = funds.reduce((sum, fund) => sum + Number(fund.invested_amount), 0);
  const totalCurrentValue = funds.reduce((sum, fund) => sum + Number(fund.current_value), 0);
  const totalGoalsSaved = goals.reduce((sum, goal) => sum + Number(goal.current_saved), 0);
  const savingsLeft = totalIncome - totalExpenses - totalSIP;
  const returns = totalCurrentValue - totalInvested;
  const returnsPercentage = totalInvested > 0 ? ((returns / totalInvested) * 100).toFixed(2) : '0.00';

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Monthly Summary</h2>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-600" />
          <input
            type="month"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-emerald-100 text-sm">Total Income</p>
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-3xl font-bold">₹{totalIncome.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-red-100 text-sm">Total Expenses</p>
            <TrendingDown className="w-5 h-5" />
          </div>
          <p className="text-3xl font-bold">₹{totalExpenses.toLocaleString('en-IN')}</p>
          <p className="text-red-100 text-xs mt-2">Fixed: ₹{fixedExpenses.toLocaleString('en-IN')} | Variable: ₹{variableExpenses.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-100 text-sm">Investments (SIP)</p>
            <PieChart className="w-5 h-5" />
          </div>
          <p className="text-3xl font-bold">₹{totalSIP.toLocaleString('en-IN')}</p>
          <p className="text-blue-100 text-xs mt-2">Total Value: ₹{totalCurrentValue.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-violet-100 text-sm">Savings Left</p>
            <Wallet className="w-5 h-5" />
          </div>
          <p className="text-3xl font-bold">₹{savingsLeft.toLocaleString('en-IN')}</p>
          <p className="text-violet-100 text-xs mt-2">{totalIncome > 0 ? ((savingsLeft / totalIncome) * 100).toFixed(1) : 0}% of income</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">EMI Commitments</h3>
          {loans.length === 0 ? (
            <p className="text-slate-500 text-sm">No active loans</p>
          ) : (
            <div className="space-y-3">
              {loans.map(loan => (
                <div key={loan.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-800">{loan.loan_type}</p>
                    <p className="text-xs text-slate-600">{loan.remaining_months} months left</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-800">₹{Number(loan.emi_amount).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-slate-600">Outstanding: ₹{Number(loan.outstanding_principal).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-slate-700">Total Monthly EMI</p>
                  <p className="text-xl font-bold text-red-600">₹{totalEMI.toLocaleString('en-IN')}</p>
                </div>
                {totalIncome > 0 && (
                  <p className="text-xs text-slate-600 mt-1">
                    Debt-to-Income: {((totalEMI / totalIncome) * 100).toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Investment Performance</h3>
          {funds.length === 0 ? (
            <p className="text-slate-500 text-sm">No mutual funds added</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-xs text-blue-700 mb-1">Total Invested</p>
                  <p className="text-xl font-bold text-blue-900">₹{totalInvested.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4">
                  <p className="text-xs text-emerald-700 mb-1">Current Value</p>
                  <p className="text-xl font-bold text-emerald-900">₹{totalCurrentValue.toLocaleString('en-IN')}</p>
                </div>
              </div>
              <div className={`p-4 rounded-lg ${returns >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                <p className={`text-xs mb-1 ${returns >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  Total Returns
                </p>
                <p className={`text-2xl font-bold ${returns >= 0 ? 'text-emerald-900' : 'text-red-900'}`}>
                  ₹{Math.abs(returns).toLocaleString('en-IN')} ({returnsPercentage}%)
                </p>
              </div>
              <div className="text-xs text-slate-600">
                {funds.filter(f => f.fund_type === 'Equity').length} Equity |
                {funds.filter(f => f.fund_type === 'Debt').length} Debt |
                {funds.filter(f => f.fund_type === 'Hybrid').length} Hybrid |
                {funds.filter(f => f.fund_type === 'Index').length} Index
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Goals Progress</h3>
        {goals.length === 0 ? (
          <p className="text-slate-500 text-sm">No goals set yet</p>
        ) : (
          <div className="space-y-4">
            {goals.map(goal => {
              const progress = (Number(goal.current_saved) / Number(goal.target_amount)) * 100;
              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-slate-800">{goal.goal_name}</p>
                      <p className="text-xs text-slate-600">
                        Target: ₹{Number(goal.target_amount).toLocaleString('en-IN')} by {new Date(goal.target_date).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">{progress.toFixed(1)}%</p>
                      <p className="text-xs text-slate-600">₹{Number(goal.current_saved).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Quick Budget Analysis (50/30/20 Modified)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-slate-300 text-xs mb-1">Needs (Fixed + EMI)</p>
            <p className="text-xl font-bold">
              {totalIncome > 0 ? (((fixedExpenses + totalEMI) / totalIncome) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-slate-400 mt-1">Target: 55-60%</p>
          </div>
          <div>
            <p className="text-slate-300 text-xs mb-1">Wants (Variable)</p>
            <p className="text-xl font-bold">
              {totalIncome > 0 ? ((variableExpenses / totalIncome) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-slate-400 mt-1">Target: 10-20%</p>
          </div>
          <div>
            <p className="text-slate-300 text-xs mb-1">Investments</p>
            <p className="text-xl font-bold">
              {totalIncome > 0 ? ((totalSIP / totalIncome) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-slate-400 mt-1">Target: 15-25%</p>
          </div>
          <div>
            <p className="text-slate-300 text-xs mb-1">Savings</p>
            <p className="text-xl font-bold">
              {totalIncome > 0 ? ((savingsLeft / totalIncome) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-slate-400 mt-1">Target: 5-10%</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 p-2 rounded-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-800">Finance Tracker</h1>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveSection('dashboard')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeSection === 'dashboard'
                ? 'bg-emerald-500 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveSection('income')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeSection === 'income'
                ? 'bg-emerald-500 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setActiveSection('expenses')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeSection === 'expenses'
                ? 'bg-emerald-500 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setActiveSection('emi')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeSection === 'emi'
                ? 'bg-emerald-500 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            EMI / Loans
          </button>
          <button
            onClick={() => setActiveSection('funds')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeSection === 'funds'
                ? 'bg-emerald-500 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            Mutual Funds
          </button>
          <button
            onClick={() => setActiveSection('goals')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeSection === 'goals'
                ? 'bg-emerald-500 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            Goals
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <>
            {activeSection === 'dashboard' && renderDashboard()}
            {activeSection === 'income' && <IncomeSection onUpdate={loadData} currentMonth={currentMonth} />}
            {activeSection === 'expenses' && <ExpenseSection onUpdate={loadData} currentMonth={currentMonth} />}
            {activeSection === 'emi' && <EMISection onUpdate={loadData} />}
            {activeSection === 'funds' && <MutualFundsSection onUpdate={loadData} />}
            {activeSection === 'goals' && <GoalsSection onUpdate={loadData} />}
          </>
        )}
      </div>
    </div>
  );
}
