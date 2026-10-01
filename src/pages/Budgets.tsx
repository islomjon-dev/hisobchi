import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { db } from '../lib/db';
import { Modal, ConfirmDialog, EmptyState } from '../components/Layout';
import { formatCurrency, getMonthName, getPercentage, getCurrentMonth, getCurrentYear, cn } from '../lib/utils';
import { Plus, Trash2, Target, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Budgets() {
  const { user, categories, budgets, addBudget, updateBudget, deleteBudget, transactions, showToast } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [month, setMonth] = useState(getCurrentMonth());
  const [year, setYear] = useState(getCurrentYear());

  const monthBudgets = useMemo(() => {
    return budgets.filter(b => b.month === month && b.year === year).map(b => {
      const spent = db.getBudgetSpent(user!.id, b.categoryId, month, year);
      const category = categories.find(c => c.id === b.categoryId);
      const percentage = getPercentage(spent, b.limit);
      return { ...b, spent, category, percentage, remaining: b.limit - spent };
    });
  }, [budgets, categories, transactions, month, year, user]);

  const totalLimit = monthBudgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = monthBudgets.reduce((s, b) => s + b.spent, 0);
  const totalPercentage = getPercentage(totalSpent, totalLimit);

  const handleDelete = () => {
    if (deleteId) {
      const result = deleteBudget(deleteId);
      showToast(result.message, result.success ? 'success' : 'error');
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Byudjet</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Oylik byudjetingizni boshqaring</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors">
          <Plus className="w-4 h-4" /> Byudjet qo'shish
        </button>
      </div>

      {/* Month selector */}
      <div className="flex items-center gap-3">
        <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm">
          {Array.from({ length: 12 }, (_, i) => <option key={i+1} value={i+1}>{getMonthName(i+1)}</option>)}
        </select>
        <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm">
          {[getCurrentYear()-1, getCurrentYear(), getCurrentYear()+1].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">Umumiy byudjet — {getMonthName(month)} {year}</h3>
          <span className={cn("text-sm font-medium", totalPercentage >= 100 ? "text-red-600" : totalPercentage >= 80 ? "text-amber-600" : "text-emerald-600")}>
            {totalPercentage}%
          </span>
        </div>
        <div className="w-full h-4 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
          <div className={cn("h-full rounded-full progress-bar", totalPercentage >= 100 ? "bg-red-500" : totalPercentage >= 80 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${Math.min(totalPercentage, 100)}%` }} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div><p className="text-xs text-gray-500 dark:text-gray-400">Limit</p><p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(totalLimit, user?.currency)}</p></div>
          <div><p className="text-xs text-gray-500 dark:text-gray-400">Sarflangan</p><p className="text-sm font-bold text-red-600">{formatCurrency(totalSpent, user?.currency)}</p></div>
          <div><p className="text-xs text-gray-500 dark:text-gray-400">Qolgan</p><p className="text-sm font-bold text-emerald-600">{formatCurrency(Math.max(totalLimit - totalSpent, 0), user?.currency)}</p></div>
        </div>
      </div>

      {/* Budgets list */}
      {monthBudgets.length === 0 ? (
        <EmptyState icon={Target} title="Byudjet yo'q" description="Bu oy uchun byudjet yaratilmagan." action={{ label: '+ Byudjet qo\'shish', onClick: () => setShowAdd(true) }} />
      ) : (
        <div className="grid gap-4">
          {monthBudgets.map(b => (
            <div key={b.id} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-100 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: (b.category?.color || '#6b7280') + '20' }}>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: b.category?.color }} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{b.category?.name || 'Noma\'lum'}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatCurrency(b.spent, user?.currency)} / {formatCurrency(b.limit, user?.currency)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {b.percentage >= 100 && <AlertTriangle className="w-4 h-4 text-red-500" />}
                  {b.percentage >= 80 && b.percentage < 100 && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                  {b.percentage < 80 && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                  <button onClick={() => setDeleteId(b.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="w-full h-2.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full progress-bar", b.percentage >= 100 ? "bg-red-500" : b.percentage >= 80 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${Math.min(b.percentage, 100)}%` }} />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{b.percentage}% ishlatildi</span>
                <span>Qolgan: {formatCurrency(Math.max(b.remaining, 0), user?.currency)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAdd && <BudgetForm isOpen={true} onClose={() => setShowAdd(false)} month={month} year={year} onSubmit={(data) => {
        addBudget(data as any);
        showToast('Byudjet qo\'shildi!', 'success');
        setShowAdd(false);
      }} />}

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Byudjetni o'chirish" message="Bu byudjetni o'chirishni xohlaysizmi?" />
    </div>
  );
}

function BudgetForm({ isOpen, onClose, month, year, onSubmit }: { isOpen: boolean; onClose: () => void; month: number; year: number; onSubmit: (data: any) => void }) {
  const { categories } = useApp();
  const [categoryId, setCategoryId] = useState('');
  const [limit, setLimit] = useState('');

  const expenseCategories = categories.filter(c => c.type === 'expense');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !limit || parseFloat(limit) <= 0) return;
    onSubmit({ categoryId, limit: parseFloat(limit), month, year });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Yangi byudjet">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategoriya</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm">
            <option value="">Tanlang...</option>
            {expenseCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Limit (so'm)</label>
          <input type="number" value={limit} onChange={e => setLimit(e.target.value)} required min="1" className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm" placeholder="1,500,000" />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">Byudjet {getMonthName(month)} {year} uchun yaratiladi.</p>
        <button type="submit" className="w-full py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors">Qo'shish</button>
      </form>
    </Modal>
  );
}
