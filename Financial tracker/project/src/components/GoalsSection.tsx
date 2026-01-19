import { useState, useEffect } from 'react';
import { supabase, Goal } from '../lib/supabase';
import { Plus, Trash2, Edit2, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  onUpdate: () => void;
}

export default function GoalsSection({ onUpdate }: Props) {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    goal_name: '',
    target_amount: '',
    target_date: '',
    monthly_contribution: '',
    current_saved: '',
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    const { data } = await supabase
      .from('goals')
      .select('*')
      .order('target_date', { ascending: true });
    setGoals(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const goalData = {
      ...formData,
      target_amount: parseFloat(formData.target_amount),
      monthly_contribution: parseFloat(formData.monthly_contribution) || 0,
      current_saved: parseFloat(formData.current_saved) || 0,
      user_id: user.id,
    };

    if (editingId) {
      const { error } = await supabase
        .from('goals')
        .update(goalData)
        .eq('id', editingId);
      if (!error) {
        setEditingId(null);
      }
    } else {
      const { error } = await supabase.from('goals').insert([goalData]);
    }

    resetForm();
    loadGoals();
    onUpdate();
  };

  const handleEdit = (goal: Goal) => {
    setFormData({
      goal_name: goal.goal_name,
      target_amount: goal.target_amount.toString(),
      target_date: goal.target_date,
      monthly_contribution: goal.monthly_contribution.toString(),
      current_saved: goal.current_saved.toString(),
    });
    setEditingId(goal.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      await supabase.from('goals').delete().eq('id', id);
      loadGoals();
      onUpdate();
    }
  };

  const resetForm = () => {
    setFormData({
      goal_name: '',
      target_amount: '',
      target_date: '',
      monthly_contribution: '',
      current_saved: '',
    });
    setShowForm(false);
    setEditingId(null);
  };

  const totalTargetAmount = goals.reduce((sum, goal) => sum + Number(goal.target_amount), 0);
  const totalCurrentSaved = goals.reduce((sum, goal) => sum + Number(goal.current_saved), 0);
  const totalMonthlyContribution = goals.reduce((sum, goal) => sum + Number(goal.monthly_contribution), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Financial Goals</h2>
          <div className="flex gap-4 mt-1 text-sm">
            <p className="text-slate-600">Monthly Contributions: ₹{totalMonthlyContribution.toLocaleString('en-IN')}</p>
            <p className="text-emerald-600">Total Saved: ₹{totalCurrentSaved.toLocaleString('en-IN')}</p>
            <p className="text-blue-600">Target: ₹{totalTargetAmount.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {editingId ? 'Edit Goal' : 'Add New Goal'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Goal Name</label>
              <input
                type="text"
                value={formData.goal_name}
                onChange={(e) => setFormData({ ...formData, goal_name: e.target.value })}
                placeholder="e.g., Emergency Fund, Bike, House Down Payment"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Target Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.target_amount}
                onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Target Date</label>
              <input
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Contribution (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.monthly_contribution}
                onChange={(e) => setFormData({ ...formData, monthly_contribution: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Current Saved (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.current_saved}
                onChange={(e) => setFormData({ ...formData, current_saved: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
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
                {editingId ? 'Update Goal' : 'Add Goal'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <p className="text-slate-500">No goals set yet. Click "Add Goal" to get started.</p>
          </div>
        ) : (
          goals.map((goal) => {
            const progress = (Number(goal.current_saved) / Number(goal.target_amount)) * 100;
            const remaining = Number(goal.target_amount) - Number(goal.current_saved);
            const targetDate = new Date(goal.target_date);
            const today = new Date();
            const monthsRemaining = Math.max(0, Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)));
            const requiredMonthly = monthsRemaining > 0 ? remaining / monthsRemaining : 0;
            const isOnTrack = Number(goal.monthly_contribution) >= requiredMonthly;
            const isPastDue = targetDate < today && progress < 100;

            return (
              <div key={goal.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-emerald-100 p-2 rounded-lg">
                      <Target className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-lg">{goal.goal_name}</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Target: {targetDate.toLocaleDateString('en-IN')}
                        {isPastDue && <span className="ml-2 text-red-600 font-medium">(Past Due)</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-slate-800">
                        ₹{Number(goal.current_saved).toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-slate-600">
                        of ₹{Number(goal.target_amount).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-600">{progress.toFixed(1)}%</p>
                      <p className="text-xs text-slate-600">Complete</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Progress</span>
                      <span>₹{remaining.toLocaleString('en-IN')} remaining</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          progress >= 100 ? 'bg-emerald-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-600 mb-1">Monthly Contribution</p>
                      <p className="text-lg font-bold text-slate-800">
                        ₹{Number(goal.monthly_contribution).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-600 mb-1">Months Remaining</p>
                      <p className="text-lg font-bold text-slate-800">{monthsRemaining}</p>
                    </div>
                  </div>

                  {!isPastDue && remaining > 0 && (
                    <div className={`p-3 rounded-lg ${isOnTrack ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className={`w-4 h-4 ${isOnTrack ? 'text-emerald-600' : 'text-amber-600'}`} />
                        <p className={`text-xs font-medium ${isOnTrack ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {isOnTrack ? 'On Track' : 'Behind Schedule'}
                        </p>
                      </div>
                      <p className={`text-xs ${isOnTrack ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {isOnTrack
                          ? `You're on track to reach your goal!`
                          : `Need ₹${requiredMonthly.toLocaleString('en-IN')}/month to reach goal on time`
                        }
                      </p>
                    </div>
                  )}

                  {progress >= 100 && (
                    <div className="p-3 rounded-lg bg-emerald-50">
                      <p className="text-emerald-700 font-medium text-sm text-center">
                        Goal Achieved!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
