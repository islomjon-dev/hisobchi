import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { db } from '../lib/db';
import { formatCurrency, formatDate, getPercentage, cn } from '../lib/utils';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Hand, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

export default function Dashboard() {
  const { user, categories, transactions, debts, savings, reminders } = useApp();
  const [period, setPeriod] = useState<'week' | 'month' | 'last_month' | 'year'>('month');

  const data = useMemo(() => {
    if (!user) return null;
    return db.getDashboardData(user.id, period);
  }, [user, period, transactions, debts, savings]);

  const currentMonthBudgets = useMemo(() => {
    if (!user) return [];
    const now = new Date();
    const budgets = db.getBudgets(user.id, now.getMonth() + 1, now.getFullYear());
    return budgets.map(b => {
      const spent = db.getBudgetSpent(user.id, b.categoryId, now.getMonth() + 1, now.getFullYear());
      const cat = categories.find(c => c.id === b.categoryId);
      return { ...b, spent, category: cat, percentage: getPercentage(spent, b.limit) };
    });
  }, [user, categories, transactions]);

  const upcomingReminders = useMemo(() => {
    return reminders.filter(r => r.status === 'pending').slice(0, 5);
  }, [reminders]);

  if (!data) return null;

  const statCards = [
    { label: 'Umumiy balans', value: data.balance, icon: Wallet, color: 'bg-blue-500', trend: data.balance >= 0 },
    { label: 'Daromad', value: data.periodIncome, icon: TrendingUp, color: 'bg-emerald-500', trend: true },
    { label: 'Xarajat', value: data.periodExpense, icon: TrendingDown, color: 'bg-red-500', trend: false },
    { label: 'Jamg\'arma', value: data.totalSavings, icon: PiggyBank, color: 'bg-purple-500', trend: true },
    { label: 'Qarz (men qarz)', value: data.totalDebtOwed, icon: Hand, color: 'bg-amber-500', trend: false },
  ];

  const pieData = data.categoryBreakdown.slice(0, 6).map(c => ({
    name: c.category.name,
    value: c.amount,
    color: c.category.color,
  }));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Boshqaruv paneli</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Xush kelibsiz, {user?.fullName?.split(' ')[0]}!</p>
        </div>
        <div className="flex gap-2">
          {[
            { value: 'week', label: 'Hafta' },
            { value: 'month', label: 'Oy' },
            { value: 'last_month', label: 'O\'tgan oy' },
            { value: 'year', label: 'Yil' },
          ].map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value as any)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                period === p.value
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 card-hover">
              <div className="flex items-center justify-between mb-3">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", card.color)}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                {card.trend ? (
                  <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{card.label}</p>
              <p className={cn("text-lg font-bold", card.trend ? "text-gray-900 dark:text-white" : "text-red-600 dark:text-red-400")}>
                {formatCurrency(card.value, user?.currency)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Income vs Expense Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Daromad va Xarajat (6 oy)</h3>
          {data.monthlyTrend.some(m => m.income > 0 || m.expense > 0) ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  formatter={(value: number) => formatCurrency(value, user?.currency)}
                />
                <Legend />
                <Bar dataKey="income" name="Daromad" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Xarajat" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
              Ma'lumotlar yo'q. Tranzaksiya qo'shing.
            </div>
          )}
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Xarajat kategoriyalari</h3>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value, user?.currency)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {pieData.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-600 dark:text-gray-400 flex-1 truncate">{item.name}</span>
                    <span className="text-xs font-medium text-gray-900 dark:text-white">{formatCurrency(item.value, user?.currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
              Xarajat ma'lumotlari yo'q.
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">So'nggi tranzaksiyalar</h3>
          {data.recentTxns.length > 0 ? (
            <div className="space-y-3">
              {data.recentTxns.map(txn => {
                const cat = categories.find(c => c.id === txn.categoryId);
                return (
                  <div key={txn.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: (cat?.color || '#6b7280') + '20' }}>
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat?.color || '#6b7280' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{txn.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(txn.date)}</p>
                    </div>
                    <span className={cn("text-sm font-semibold", txn.type === 'income' ? "text-emerald-600" : "text-red-600")}>
                      {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount, user?.currency)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">Tranzaksiyalar yo'q</p>
          )}
        </div>

        {/* Budget Progress */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Byudjet holati</h3>
          {currentMonthBudgets.length > 0 ? (
            <div className="space-y-4">
              {currentMonthBudgets.slice(0, 4).map(b => (
                <div key={b.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{b.category?.name || 'Noma\'lum'}</span>
                    <span className={cn("text-xs font-medium",
                      b.percentage >= 100 ? "text-red-600" : b.percentage >= 80 ? "text-amber-600" : "text-emerald-600"
                    )}>
                      {b.percentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full progress-bar",
                        b.percentage >= 100 ? "bg-red-500" : b.percentage >= 80 ? "bg-amber-500" : "bg-emerald-500"
                      )}
                      style={{ width: `${Math.min(b.percentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {formatCurrency(b.spent, user?.currency)} / {formatCurrency(b.limit, user?.currency)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">Byudjetlar yo'q</p>
          )}
        </div>

        {/* Upcoming Reminders */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Yaqin eslatmalar</h3>
          {upcomingReminders.length > 0 ? (
            <div className="space-y-3">
              {upcomingReminders.map(r => (
                <div key={r.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{r.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(r.date)}</p>
                  </div>
                  {r.amount > 0 && (
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {formatCurrency(r.amount, user?.currency)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">Eslatmalar yo'q</p>
          )}
        </div>
      </div>

      {/* Where is my money */}
      {data.periodIncome > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">💰 Pulim qayerga ketyapti?</h3>
          <div className="grid sm:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Daromad</p>
              <p className="text-lg font-bold text-emerald-600">{formatCurrency(data.periodIncome, user?.currency)}</p>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Xarajat</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(data.periodExpense, user?.currency)}</p>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Jamg'arma</p>
              <p className="text-lg font-bold text-purple-600">{formatCurrency(data.totalSavings, user?.currency)}</p>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Qolgan</p>
              <p className={cn("text-lg font-bold", (data.periodIncome - data.periodExpense) >= 0 ? "text-blue-600" : "text-red-600")}>
                {formatCurrency(data.periodIncome - data.periodExpense, user?.currency)}
              </p>
            </div>
          </div>
          {data.categoryBreakdown.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Eng katta xarajatlar:</p>
              <div className="space-y-2">
                {data.categoryBreakdown.slice(0, 3).map((c, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.category.color }} />
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{c.category.name}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(c.amount, user?.currency)}</span>
                    <span className="text-xs text-gray-500 w-12 text-right">
                      {data.periodExpense > 0 ? Math.round((c.amount / data.periodExpense) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
