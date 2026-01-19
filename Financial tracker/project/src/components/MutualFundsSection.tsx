import { useState, useEffect } from 'react';
import { supabase, MutualFund } from '../lib/supabase';
import { Plus, Trash2, Edit2, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  onUpdate: () => void;
}

const FUND_TYPES = ['Equity', 'Debt', 'Hybrid', 'Index'];

export default function MutualFundsSection({ onUpdate }: Props) {
  const { user } = useAuth();
  const [funds, setFunds] = useState<MutualFund[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fund_name: '',
    fund_type: 'Equity',
    sip_amount: '',
    sip_date: '',
    lumpsum_amount: '',
    invested_amount: '',
    current_value: '',
  });

  useEffect(() => {
    loadFunds();
  }, []);

  const loadFunds = async () => {
    const { data } = await supabase
      .from('mutual_funds')
      .select('*')
      .order('created_at', { ascending: false });
    setFunds(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const fundData = {
      ...formData,
      sip_amount: parseFloat(formData.sip_amount) || 0,
      sip_date: formData.sip_date ? parseInt(formData.sip_date) : null,
      lumpsum_amount: parseFloat(formData.lumpsum_amount) || 0,
      invested_amount: parseFloat(formData.invested_amount),
      current_value: parseFloat(formData.current_value),
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      const { error } = await supabase
        .from('mutual_funds')
        .update(fundData)
        .eq('id', editingId);
      if (!error) {
        setEditingId(null);
      }
    } else {
      const { error } = await supabase.from('mutual_funds').insert([fundData]);
    }

    resetForm();
    loadFunds();
    onUpdate();
  };

  const handleEdit = (fund: MutualFund) => {
    setFormData({
      fund_name: fund.fund_name,
      fund_type: fund.fund_type,
      sip_amount: fund.sip_amount.toString(),
      sip_date: fund.sip_date?.toString() || '',
      lumpsum_amount: fund.lumpsum_amount.toString(),
      invested_amount: fund.invested_amount.toString(),
      current_value: fund.current_value.toString(),
    });
    setEditingId(fund.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this mutual fund?')) {
      await supabase.from('mutual_funds').delete().eq('id', id);
      loadFunds();
      onUpdate();
    }
  };

  const resetForm = () => {
    setFormData({
      fund_name: '',
      fund_type: 'Equity',
      sip_amount: '',
      sip_date: '',
      lumpsum_amount: '',
      invested_amount: '',
      current_value: '',
    });
    setShowForm(false);
    setEditingId(null);
  };

  const totalSIP = funds.reduce((sum, fund) => sum + Number(fund.sip_amount), 0);
  const totalInvested = funds.reduce((sum, fund) => sum + Number(fund.invested_amount), 0);
  const totalCurrentValue = funds.reduce((sum, fund) => sum + Number(fund.current_value), 0);
  const totalReturns = totalCurrentValue - totalInvested;
  const returnsPercentage = totalInvested > 0 ? ((totalReturns / totalInvested) * 100) : 0;

  const fundTypeBreakdown = funds.reduce((acc, fund) => {
    acc[fund.fund_type] = (acc[fund.fund_type] || 0) + Number(fund.current_value);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Mutual Funds Portfolio</h2>
          <div className="flex gap-4 mt-1 text-sm">
            <p className="text-slate-600">Monthly SIP: ₹{totalSIP.toLocaleString('en-IN')}</p>
            <p className="text-blue-600">Total Invested: ₹{totalInvested.toLocaleString('en-IN')}</p>
            <p className={totalReturns >= 0 ? 'text-emerald-600' : 'text-red-600'}>
              Returns: ₹{Math.abs(totalReturns).toLocaleString('en-IN')} ({returnsPercentage.toFixed(2)}%)
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Fund
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(fundTypeBreakdown).map(([type, value]) => (
          <div key={type} className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <p className="text-xs text-slate-600 mb-1">{type}</p>
            <p className="text-lg font-bold text-slate-800">₹{value.toLocaleString('en-IN')}</p>
            <p className="text-xs text-slate-500 mt-1">
              {((value / totalCurrentValue) * 100).toFixed(1)}% allocation
            </p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {editingId ? 'Edit Mutual Fund' : 'Add New Mutual Fund'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Fund Name</label>
              <input
                type="text"
                value={formData.fund_name}
                onChange={(e) => setFormData({ ...formData, fund_name: e.target.value })}
                placeholder="e.g., HDFC Top 100 Fund"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Fund Type</label>
              <select
                value={formData.fund_type}
                onChange={(e) => setFormData({ ...formData, fund_type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                required
              >
                {FUND_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Monthly SIP Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.sip_amount}
                onChange={(e) => setFormData({ ...formData, sip_amount: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">SIP Date (Day of Month)</label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.sip_date}
                onChange={(e) => setFormData({ ...formData, sip_date: e.target.value })}
                placeholder="1-31"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Lumpsum Investment (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.lumpsum_amount}
                onChange={(e) => setFormData({ ...formData, lumpsum_amount: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Total Invested (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.invested_amount}
                onChange={(e) => setFormData({ ...formData, invested_amount: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Current Value (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.current_value}
                onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
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
                {editingId ? 'Update Fund' : 'Add Fund'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {funds.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <p className="text-slate-500">No mutual funds added yet. Click "Add Fund" to get started.</p>
          </div>
        ) : (
          funds.map((fund) => {
            const returns = Number(fund.current_value) - Number(fund.invested_amount);
            const returnsPercent = Number(fund.invested_amount) > 0
              ? ((returns / Number(fund.invested_amount)) * 100)
              : 0;
            const isPositive = returns >= 0;

            return (
              <div key={fund.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-slate-800">{fund.fund_name}</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {fund.fund_type}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(fund)}
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(fund.id)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {Number(fund.sip_amount) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Monthly SIP</span>
                      <span className="font-semibold text-blue-600">
                        ₹{Number(fund.sip_amount).toLocaleString('en-IN')}
                        {fund.sip_date && <span className="text-xs text-slate-500 ml-1">({fund.sip_date}th)</span>}
                      </span>
                    </div>
                  )}

                  {Number(fund.lumpsum_amount) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Lumpsum</span>
                      <span className="font-semibold text-slate-800">
                        ₹{Number(fund.lumpsum_amount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Invested</span>
                      <span className="font-semibold text-slate-800">
                        ₹{Number(fund.invested_amount).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Current Value</span>
                      <span className="font-semibold text-slate-800">
                        ₹{Number(fund.current_value).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className={`flex items-center justify-between p-3 rounded-lg ${
                      isPositive ? 'bg-emerald-50' : 'bg-red-50'
                    }`}>
                      <span className={`text-xs font-medium ${isPositive ? 'text-emerald-700' : 'text-red-700'}`}>
                        Returns
                      </span>
                      <div className="flex items-center gap-1">
                        {isPositive ? (
                          <TrendingUp className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`font-bold ${isPositive ? 'text-emerald-700' : 'text-red-700'}`}>
                          ₹{Math.abs(returns).toLocaleString('en-IN')}
                        </span>
                        <span className={`text-xs ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                          ({returnsPercent.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 pt-2">
                    Last updated: {new Date(fund.updated_at).toLocaleDateString('en-IN')}
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
