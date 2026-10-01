import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { formatCurrency, getMonthName, getCurrentMonth, getCurrentYear, cn } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area } from 'recharts';
import { FileBarChart, TrendingUp, TrendingDown, PieChart as PieIcon } from 'lucide-react';

export default function Reports() {
  const { user, categories, transactions, debts, budgets, savings } = useApp();
  const [reportType, setReportType] = useState<'overview' | 'income' | 'expense' | 'category' | 'trend'>('overview');
  const [period, setPeriod] = useState<'month' | 'year' | 'custom'>('month');
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());

  const filteredTxns = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      if (period === 'month') return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
      if (period === 'year') return d.getFullYear() === selectedYear;
      return true;
    });
  }, [transactions, period, selectedMonth, selectedYear]);

  const totalIncome = filteredTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filteredTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Monthly trend data
  const monthlyData = useMemo(() => {
    const data = [];
    const months = period === 'year' ? 12 : [selectedMonth];
    for (const m of (period === 'year' ? Array.from({length: 12}, (_, i) => i + 1) : [selectedMonth])) {
      const monthTxns = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() + 1 === m && d.getFullYear() === selectedYear;
      });
      data.push({
        month: getMonthName(m).slice(0, 3),
        income: monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      });
    }
    return data;
  }, [transactions, period, selectedMonth, selectedYear]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const expenseCategories = categories.filter(c => c.type === 'expense');
    return expenseCategories.map(c => ({
      name: c.name,
      value: filteredTxns.filter(t => t.type === 'expense' && t.categoryId === c.id).reduce((s, t) => s + t.amount, 0),
      color: c.color,
    })).filter(c => c.value > 0).sort((a, b) => b.value - a.value);
  }, [filteredTxns, categories]);

  const incomeCategoryData = useMemo(() => {
    const incomeCategories = categories.filter(c => c.type === 'income');
    return incomeCategories.map(c => ({
      name: c.name,
      value: filteredTxns.filter(t => t.type === 'income' && t.categoryId === c.id).reduce((s, t) => s + t.amount, 0),
      color: c.color,
    })).filter(c => c.value > 0).sort((a, b) => b.value - a.value);
  }, [filteredTxns, categories]);

  const tabs = [
    { value: 'overview', label: 'Umumiy', icon: FileBarChart },
    { value: 'income', label: 'Daromad', icon: TrendingUp },
    { value: 'expense', label: 'Xarajat', icon: TrendingDown },
    { value: 'category', label: 'Kategoriya', icon: PieIcon },
    { value: 'trend', label: 'Trend', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hisobotlar</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Moliyaviy tahlil va hisobotlar</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(t => (
          <button key={t.value} onClick={() => setReportType(t.value as any)} className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
            reportType === t.value ? "bg-emerald-500 text-white" : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300"
          )}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Period selector */}
      <div className="flex flex-wrap gap-3 items-center">
        <select value={period} onChange={e => setPeriod(e.target.value as any)} className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm">
          <option value="month">Oy bo'yicha</option>
          <option value="year">Yil bo'yicha</option>
        </select>
        {period === 'month' && (
          <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))} className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm">
            {Array.from({ length: 12 }, (_, i) => <option key={i+1} value={i+1}>{getMonthName(i+1)}</option>)}
          </select>
        )}
        <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm">
          {[getCurrentYear()-1, getCurrentYear(), getCurrentYear()+1].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Daromad</p>
          <p className="text-lg font-bold text-emerald-600">{formatCurrency(totalIncome, user?.currency)}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Xarajat</p>
          <p className="text-lg font-bold text-red-600">{formatCurrency(totalExpense, user?.currency)}</p>
        </div>
        <div className={cn("rounded-xl p-4", balance >= 0 ? "bg-blue-50 dark:bg-blue-900/20" : "bg-amber-50 dark:bg-amber-900/20")}>
          <p className="text-xs text-gray-500 dark:text-gray-400">Balans</p>
          <p className={cn("text-lg font-bold", balance >= 0 ? "text-blue-600" : "text-amber-600")}>{formatCurrency(balance, user?.currency)}</p>
        </div>
      </div>

      {/* Report content */}
      {reportType === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Daromad vs Xarajat</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip formatter={(value: number) => formatCurrency(value, user?.currency)} />
                <Legend />
                <Bar dataKey="income" name="Daromad" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Xarajat" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Xarajat kategoriyalari</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={2}>
                    {categoryData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value, user?.currency)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">Ma'lumot yo'q</div>
            )}
          </div>
        </div>
      )}

      {reportType === 'income' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Daromad tahlili</h3>
          {incomeCategoryData.length > 0 ? (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={incomeCategoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} stroke="#94a3b8" width={80} />
                  <Tooltip formatter={(value: number) => formatCurrency(value, user?.currency)} />
                  <Bar dataKey="value" name="Summa" radius={[0, 4, 4, 0]}>
                    {incomeCategoryData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {incomeCategoryData.map((c, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{c.name}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(c.value, user?.currency)}</span>
                    <span className="text-xs text-gray-500 w-12 text-right">{totalIncome > 0 ? Math.round((c.value / totalIncome) * 100) : 0}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">Daromad ma'lumotlari yo'q</p>
          )}
        </div>
      )}

      {reportType === 'expense' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Xarajat tahlili</h3>
          {categoryData.length > 0 ? (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} stroke="#94a3b8" width={80} />
                  <Tooltip formatter={(value: number) => formatCurrency(value, user?.currency)} />
                  <Bar dataKey="value" name="Summa" radius={[0, 4, 4, 0]}>
                    {categoryData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {categoryData.map((c, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{c.name}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(c.value, user?.currency)}</span>
                    <span className="text-xs text-gray-500 w-12 text-right">{totalExpense > 0 ? Math.round((c.value / totalExpense) * 100) : 0}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">Xarajat ma'lumotlari yo'q</p>
          )}
        </div>
      )}

      {reportType === 'category' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Xarajat bo'limi</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" outerRadius={110} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {categoryData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value, user?.currency)} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-gray-400 py-8">Ma'lumot yo'q</p>}
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Daromad bo'limi</h3>
            {incomeCategoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={incomeCategoryData} cx="50%" cy="50%" outerRadius={110} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {incomeCategoryData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value, user?.currency)} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-gray-400 py-8">Ma'lumot yo'q</p>}
          </div>
        </div>
      )}

      {reportType === 'trend' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Oylik trend</h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip formatter={(value: number) => formatCurrency(value, user?.currency)} />
              <Legend />
              <Area type="monotone" dataKey="income" name="Daromad" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
              <Area type="monotone" dataKey="expense" name="Xarajat" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
