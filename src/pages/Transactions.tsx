import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { Modal, ConfirmDialog, EmptyState } from '../components/Layout';
import { formatCurrency, formatDate, PAYMENT_METHODS, cn } from '../lib/utils';
import { Plus, Search, Filter, Edit2, Trash2, ArrowUpRight, ArrowDownRight, X } from 'lucide-react';

interface Props { typeFilter?: 'income' | 'expense'; }

export default function Transactions({ typeFilter }: Props) {
  const { user, categories, transactions, addTransaction, updateTransaction, deleteTransaction, showToast } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [editTxn, setEditTxn] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const filtered = useMemo(() => {
    let txns = [...transactions];
    if (typeFilter) txns = txns.filter(t => t.type === typeFilter);
    if (filterType) txns = txns.filter(t => t.type === filterType);
    if (filterCategory) txns = txns.filter(t => t.categoryId === filterCategory);
    if (filterPayment) txns = txns.filter(t => t.paymentMethod === filterPayment);
    if (search) {
      const s = search.toLowerCase();
      txns = txns.filter(t => t.title.toLowerCase().includes(s) || t.description.toLowerCase().includes(s));
    }
    return txns;
  }, [transactions, typeFilter, filterType, filterCategory, filterPayment, search]);

  const paginated = filtered.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(filtered.length / limit);

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const handleDelete = () => {
    if (deleteId) {
      const result = deleteTransaction(deleteId);
      showToast(result.message, result.success ? 'success' : 'error');
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {typeFilter === 'income' ? 'Daromadlar' : typeFilter === 'expense' ? 'Xarajatlar' : 'Tranzaksiyalar'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Jami: {filtered.length} ta tranzaksiya
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
        >
          <Plus className="w-4 h-4" /> Qo'shish
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Umumiy daromad</p>
          <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalIncome, user?.currency)}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Umumiy xarajat</p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(totalExpense, user?.currency)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Qidirish..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        {!typeFilter && (
          <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm">
            <option value="">Barcha turlar</option>
            <option value="income">Daromad</option>
            <option value="expense">Xarajat</option>
          </select>
        )}
        <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm">
          <option value="">Barcha kategoriyalar</option>
          {categories.filter(c => !typeFilter || c.type === typeFilter).map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select value={filterPayment} onChange={e => { setFilterPayment(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm">
          <option value="">Barcha to'lov usullari</option>
          {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>

      {/* Transactions List */}
      {paginated.length === 0 ? (
        <EmptyState
          icon={typeFilter === 'income' ? ArrowUpRight : typeFilter === 'expense' ? ArrowDownRight : Filter}
          title={typeFilter === 'income' ? 'Daromadlar yo\'q' : typeFilter === 'expense' ? 'Xarajatlar yo\'q' : 'Tranzaksiyalar yo\'q'}
          description="Hozircha hech qanday tranzaksiya qo'shilmagan."
          action={{ label: '+ Qo\'shish', onClick: () => setShowAdd(true) }}
        />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="table-responsive overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sarlavha</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Kategoriya</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Sana</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">To'lov</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Summa</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {paginated.map(txn => {
                  const cat = categories.find(c => c.id === txn.categoryId);
                  return (
                    <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", txn.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-red-50 dark:bg-red-900/30')}>
                            {txn.type === 'income' ? <ArrowUpRight className="w-4 h-4 text-emerald-500" /> : <ArrowDownRight className="w-4 h-4 text-red-500" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{txn.title}</p>
                            {txn.description && <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{txn.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: (cat?.color || '#6b7280') + '20', color: cat?.color || '#6b7280' }}>
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat?.color }} />
                          {cat?.name || 'Noma\'lum'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hidden sm:table-cell">{formatDate(txn.date)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hidden md:table-cell">
                        {PAYMENT_METHODS.find(m => m.value === txn.paymentMethod)?.label || txn.paymentMethod}
                      </td>
                      <td className={cn("px-4 py-3 text-sm font-semibold text-right", txn.type === 'income' ? 'text-emerald-600' : 'text-red-600')}>
                        {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount, user?.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => setEditTxn(txn)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-400 hover:text-gray-600">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteId(txn.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-slate-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">{(page-1)*limit+1}-{Math.min(page*limit, filtered.length)} / {filtered.length}</p>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="px-3 py-1 text-xs rounded bg-gray-100 dark:bg-slate-700 disabled:opacity-50">Oldingi</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="px-3 py-1 text-xs rounded bg-gray-100 dark:bg-slate-700 disabled:opacity-50">Keyingi</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAdd || editTxn) && (
        <TransactionForm
          isOpen={true}
          onClose={() => { setShowAdd(false); setEditTxn(null); }}
          editData={editTxn}
          typeFilter={typeFilter}
          onSubmit={(data) => {
            if (editTxn) {
              const result = updateTransaction(editTxn.id, data);
              showToast(result.message, result.success ? 'success' : 'error');
            } else {
              addTransaction(data as any);
              showToast('Tranzaksiya qo\'shildi!', 'success');
            }
            setShowAdd(false);
            setEditTxn(null);
          }}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Tranzaksiyani o'chirish"
        message="Bu tranzaksiyani o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi."
      />
    </div>
  );
}

function TransactionForm({ isOpen, onClose, editData, typeFilter, onSubmit }: {
  isOpen: boolean;
  onClose: () => void;
  editData: any;
  typeFilter?: string;
  onSubmit: (data: any) => void;
}) {
  const { categories } = useApp();
  const [type, setType] = useState(editData?.type || typeFilter || 'expense');
  const [amount, setAmount] = useState(editData?.amount?.toString() || '');
  const [categoryId, setCategoryId] = useState(editData?.categoryId || '');
  const [title, setTitle] = useState(editData?.title || '');
  const [description, setDescription] = useState(editData?.description || '');
  const [date, setDate] = useState(editData?.date || new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState(editData?.paymentMethod || 'cash');

  const filteredCategories = categories.filter(c => c.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    if (!categoryId || !title) return;
    onSubmit({ type, amount: parseFloat(amount), categoryId, title, description, date, paymentMethod });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Tahrirlash' : 'Yangi tranzaksiya'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!typeFilter && (
          <div className="flex gap-2">
            <button type="button" onClick={() => { setType('income'); setCategoryId(''); }} className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition-colors", type === 'income' ? "bg-emerald-500 text-white" : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300")}>
              Daromad
            </button>
            <button type="button" onClick={() => { setType('expense'); setCategoryId(''); }} className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition-colors", type === 'expense' ? "bg-red-500 text-white" : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300")}>
              Xarajat
            </button>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Summa</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" min="0" step="1000" required className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategoriya</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm">
            <option value="">Tanlang...</option>
            {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sarlavha</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Nomi..." required className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sana</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To'lov usuli</label>
            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm">
              {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Izoh (ixtiyoriy)</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm resize-none" />
        </div>

        <button type="submit" className="w-full py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors">
          {editData ? 'Saqlash' : 'Qo\'shish'}
        </button>
      </form>
    </Modal>
  );
}
