import { useState, useEffect } from 'react';
import { supabase, EMILoan } from '../lib/supabase';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  onUpdate: () => void;
}

export default function EMISection({ onUpdate }: Props) {
  const { user } = useAuth();
  const [loans, setLoans] = useState<EMILoan[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    loan_type: '',
    total_amount: '',
    interest_rate: '',
    emi_amount: '',
    start_date: '',
    end_date: '',
    remaining_months: '',
    outstanding_principal: '',
  });

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    const { data } = await supabase
      .from('emi_loans')
      .select('*')
      .order('created_at', { ascending: false });
    setLoans(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const loanData = {
      ...formData,
      total_amount: parseFloat(formData.total_amount),
      interest_rate: parseFloat(formData.interest_rate),
      emi_amount: parseFloat(formData.emi_amount),
      remaining_months: parseInt(formData.remaining_months),
      outstanding_principal: parseFloat(formData.outstanding_principal),
      user_id: user.id,
    };

    if (editingId) {
      const { error } = await supabase
        .from('emi_loans')
        .update(loanData)
        .eq('id', editingId);
      if (!error) {
        setEditingId(null);
      }
    } else {
      const { error } = await supabase.from('emi_loans').insert([loanData]);
    }

    resetForm();
    loadLoans();
    onUpdate();
  };

  const handleEdit = (loan: EMILoan) => {
    setFormData({
      loan_type: loan.loan_type,
      total_amount: loan.total_amount.toString(),
      interest_rate: loan.interest_rate.toString(),
      emi_amount: loan.emi_amount.toString(),
      start_date: loan.start_date,
      end_date: loan.end_date,
      remaining_months: loan.remaining_months.toString(),
      outstanding_principal: loan.outstanding_principal.toString(),
    });
    setEditingId(loan.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this loan?')) {
      await supabase.from('emi_loans').delete().eq('id', id);
      loadLoans();
      onUpdate();
    }
  };

  const resetForm = () => {
    setFormData({
      loan_type: '',
      total_amount: '',
      interest_rate: '',
      emi_amount: '',
      start_date: '',
      end_date: '',
      remaining_months: '',
      outstanding_principal: '',
    });
    setShowForm(false);
    setEditingId(null);
  };

  const totalEMI = loans.reduce((sum, loan) => sum + Number(loan.emi_amount), 0);
  const totalOutstanding = loans.reduce((sum, loan) => sum + Number(loan.outstanding_principal), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">EMI & Loans</h2>
          <div className="flex gap-4 mt-1 text-sm">
            <p className="text-slate-600">Total Monthly EMI: ₹{totalEMI.toLocaleString('en-IN')}</p>
            <p className="text-red-600">Total Outstanding: ₹{totalOutstanding.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Loan
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {editingId ? 'Edit Loan' : 'Add New Loan'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Loan Type</label>
              <input
                type="text"
                value={formData.loan_type}
                onChange={(e) => setFormData({ ...formData, loan_type: e.target.value })}
                placeholder="e.g., Personal Loan, Bike, Home"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Total Loan Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.total_amount}
                onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Interest Rate (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.interest_rate}
                onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Monthly EMI (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.emi_amount}
                onChange={(e) => setFormData({ ...formData, emi_amount: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Remaining Months</label>
              <input
                type="number"
                value={formData.remaining_months}
                onChange={(e) => setFormData({ ...formData, remaining_months: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Outstanding Principal (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.outstanding_principal}
                onChange={(e) => setFormData({ ...formData, outstanding_principal: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="md:col-span-2 flex gap-2 justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
              >
                {editingId ? 'Update Loan' : 'Add Loan'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loans.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <p className="text-slate-500">No loans added yet. Click "Add Loan" to get started.</p>
          </div>
        ) : (
          loans.map((loan) => {
            const progress = ((Number(loan.total_amount) - Number(loan.outstanding_principal)) / Number(loan.total_amount)) * 100;
            return (
              <div key={loan.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-lg">{loan.loan_type}</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      {loan.interest_rate}% interest
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(loan)}
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(loan.id)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Monthly EMI</span>
                    <span className="font-semibold text-red-600">
                      ₹{Number(loan.emi_amount).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total Amount</span>
                    <span className="font-semibold text-slate-800">
                      ₹{Number(loan.total_amount).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Outstanding</span>
                    <span className="font-semibold text-red-600">
                      ₹{Number(loan.outstanding_principal).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>Paid {progress.toFixed(1)}%</span>
                      <span>{loan.remaining_months} months left</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Start: {new Date(loan.start_date).toLocaleDateString('en-IN')}</span>
                      <span>End: {new Date(loan.end_date).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
