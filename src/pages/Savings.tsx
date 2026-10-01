import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Modal, ConfirmDialog, EmptyState } from '../components/Layout';
import { formatCurrency, formatDate, getPercentage, cn } from '../lib/utils';
import { Plus, Trash2, PiggyBank, DollarSign, Target, TrendingUp } from 'lucide-react';

export default function Savings() {
  const { user, savings, addSavings, updateSavings, deleteSavings, addSavingsDeposit, showToast } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [depositGoal, setDepositGoal] = useState<any>(null);

  const totalSaved = savings.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = savings.reduce((s, g) => s + g.targetAmount, 0);
  const activeGoals = savings.filter(g => g.status === 'active');

  const handleDelete = () => {
    if (deleteId) {
      const result = deleteSavings(deleteId);
      showToast(result.message, result.success ? 'success' : 'error');
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jamg'arma</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Moliyaviy maqsadlaringizni kuzatib boring</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors">
          <Plus className="w-4 h-4" /> Yangi maqsad
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Jami jamg'arma</p>
          <p className="text-xl font-bold text-purple-600">{formatCurrency(totalSaved, user?.currency)}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Maqsad summasi</p>
          <p className="text-xl font-bold text-blue-600">{formatCurrency(totalTarget, user?.currency)}</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Faol maqsadlar</p>
          <p className="text-xl font-bold text-emerald-600">{activeGoals.length} ta</p>
        </div>
      </div>

      {/* Goals */}
      {savings.length === 0 ? (
        <EmptyState icon={PiggyBank} title="Jamg'arma maqsadlari yo'q" description="Birinchi jamg'arma maqsadingizni yarating." action={{ label: '+ Maqsad qo\'shish', onClick: () => setShowAdd(true) }} />
      ) : (
        <div className="grid gap-4">
          {savings.map(goal => {
            const percentage = getPercentage(goal.currentAmount, goal.targetAmount);
            return (
              <div key={goal.id} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-100 dark:border-slate-700 card-hover">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{goal.name}</h3>
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium",
                        goal.status === 'completed' ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" :
                        goal.status === 'paused' ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200" :
                        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      )}>
                        {goal.status === 'completed' ? 'Bajarildi' : goal.status === 'paused' ? 'To\'xtatilgan' : 'Faol'}
                      </span>
                    </div>
                    {goal.description && <p className="text-xs text-gray-500 dark:text-gray-400">{goal.description}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    {goal.status !== 'completed' && (
                      <button onClick={() => setDepositGoal(goal)} className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-400 hover:text-emerald-500" title="Mablag' qo'shish">
                        <DollarSign className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => setDeleteId(goal.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div><p className="text-xs text-gray-500 dark:text-gray-400">Maqsad</p><p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(goal.targetAmount, user?.currency)}</p></div>
                  <div><p className="text-xs text-gray-500 dark:text-gray-400">Jamg'arilgan</p><p className="text-sm font-semibold text-emerald-600">{formatCurrency(goal.currentAmount, user?.currency)}</p></div>
                  <div><p className="text-xs text-gray-500 dark:text-gray-400">Qolgan</p><p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(Math.max(goal.targetAmount - goal.currentAmount, 0), user?.currency)}</p></div>
                </div>

                <div className="w-full h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full progress-bar" style={{ width: `${Math.min(percentage, 100)}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{percentage}% bajarildi</span>
                  {goal.deadline && <span>Muddat: {formatDate(goal.deadline)}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <Modal isOpen={true} onClose={() => setShowAdd(false)} title="Yangi jamg'arma maqsadi">
          <SavingsForm onSubmit={(data) => {
            addSavings(data as any);
            showToast('Maqsad qo\'shildi!', 'success');
            setShowAdd(false);
          }} />
        </Modal>
      )}

      {/* Deposit Modal */}
      {depositGoal && (
        <Modal isOpen={true} onClose={() => setDepositGoal(null)} title={`Mablag' qo'shish: ${depositGoal.name}`}>
          <DepositForm remaining={depositGoal.targetAmount - depositGoal.currentAmount} onSubmit={(amount, date, note) => {
            const result = addSavingsDeposit(depositGoal.id, amount, date, note);
            showToast(result.message, result.success ? 'success' : 'error');
            setDepositGoal(null);
          }} />
        </Modal>
      )}

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Maqsadni o'chirish" message="Bu jamg'arma maqsadini o'chirishni xohlaysizmi?" />
    </div>
  );
}

function SavingsForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount || parseFloat(targetAmount) <= 0) return;
    onSubmit({ name, targetAmount: parseFloat(targetAmount), deadline, description });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Maqsad nomi</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm" placeholder="Masalan: Yangi laptop" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Maqsad summasi</label>
        <input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} required min="1" className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm" placeholder="10,000,000" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Muddat (ixtiyoriy)</label>
        <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Izoh</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm resize-none" />
      </div>
      <button type="submit" className="w-full py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors">Qo'shish</button>
    </form>
  );
}

function DepositForm({ remaining, onSubmit }: { remaining: number; onSubmit: (amount: number, date: string, note: string) => void }) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    onSubmit(amt, date, note);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">Maqsadgacha qolgan: <span className="font-bold text-purple-600">{formatCurrency(Math.max(remaining, 0))}</span></p>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Summa</label>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required min="1" className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm" placeholder="0" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sana</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Izoh</label>
        <input type="text" value={note} onChange={e => setNote(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm" placeholder="Ixtiyoriy..." />
      </div>
      <button type="submit" className="w-full py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors">Mablag' qo'shish</button>
    </form>
  );
}
