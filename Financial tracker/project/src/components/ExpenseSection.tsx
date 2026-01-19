import { useState, useEffect } from 'react';
import { supabase, Expense } from '../lib/supabase';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  onUpdate: () => void;
  currentMonth: string;
}

const EXPENSE_CATEGORIES = {
  Fixed: ['Rent', 'EMI', 'Electricity', 'Water', 'Internet', 'Mobile', 'Insurance', 'Other'],
  Variable: ['Food', 'Groceries', 'Fuel', 'Travel', 'Shopping', 'Entertainment', 'Healthcare', 'Other'],
};

export default function ExpenseSection({ onUpdate, currentMonth }: Props) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Variable',
    sub_category: '',
    amount: '',
    payment_method: '',
    vendor_note: '',
  });

  useEffect(() => {
    loadExpenses();
  }, [currentMonth]);

  const loadExpenses = async () => {
    const startDate = `${currentMonth}-01`;
    const endDate = `${currentMonth}-31`;
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });
    setExpenses(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase.from('expenses').insert([
      {
        ...formData,
        amount: parseFloat(formData.amount),
        user_id: user.id,
      },
    ]);

    if (!error) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: 'Variable',
        sub_category: '',
        amount: '',
        payment_method: '',
        vendor_note: '',
      });
      setShowForm(false);
      loadExpenses();
      onUpdate();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      await supabase.from('expenses').delete().eq('id', id);
      loadExpenses();
      onUpdate();
    }
  };

  const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const fixedExpenses = expenses.filter(e => e.category === 'Fixed').reduce((sum, item) => sum + Number(item.amount), 0);
  const variableExpenses = expenses.filter(e => e.category === 'Variable').reduce((sum, item) => sum + Number(item.amount), 0);

  const categoryBreakdown = expenses.reduce((acc, expense) => {
    const key = expense.sub_category;
    acc[key] = (acc[key] || 0) + Number(expense.amount);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Expense Tracking</h2>
          <div className="flex gap-4 mt-1 text-sm">
            <p className="text-slate-600">Total: ₹{totalExpenses.toLocaleString('en-IN')}</p>
            <p className="text-red-600">Fixed: ₹{fixedExpenses.toLocaleString('en-IN')}</p>
            <p className="text-orange-600">Variable: ₹{variableExpenses.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(categoryBreakdown)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([category, amount]) => (
            <div key={category} className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <p className="text-xs text-slate-600 mb-1">{category}</p>
              <p className="text-lg font-bold text-slate-800">₹{amount.toLocaleString('en-IN')}</p>
            </div>
          ))}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Add New Expense</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value, sub_category: '' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="Fixed">Fixed</option>
                <option value="Variable">Variable</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Sub-Category</label>
              <select
                value={formData.sub_category}
                onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">Select...</option>
                {EXPENSE_CATEGORIES[formData.category as keyof typeof EXPENSE_CATEGORIES].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">Select...</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Vendor/Note</label>
              <input
                type="text"
                value={formData.vendor_note}
                onChange={(e) => setFormData({ ...formData, vendor_note: e.target.value })}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-2 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
              >
                Add Expense
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Sub-Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Vendor/Note
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No expense entries for this month. Click "Add Expense" to get started.
                  </td>
                </tr>
              ) : (
                expenses.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {new Date(item.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.category === 'Fixed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                      {item.sub_category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                      ₹{Number(item.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {item.payment_method}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {item.vendor_note || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
