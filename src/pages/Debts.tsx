import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { Modal, ConfirmDialog, EmptyState } from '../components/Layout';
import { formatCurrency, formatDate, DEBT_TYPES, DEBT_STATUSES, getDaysUntil, cn } from '../lib/utils';
import { Plus, Search, Edit2, Trash2, DollarSign, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Debts() {
  const { user, debts, addDebt, updateDebt, deleteDebt, addDebtPayment, showToast } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [editDebt, setEditDebt] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [payDebt, setPayDebt] = useState<any>(null);
  const [viewDebt, setViewDebt] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filtered = useMemo(() => {
    let d = [...debts];
    if (filterType) d = d.filter(x => x.type === filterType);
    if (filterStatus) d = d.filter(x => x.status === filterStatus);
    if (search) {
      const s = search.toLowerCase();
      d = d.filter(x => x.personName.toLowerCase().includes(s) || x.description.toLowerCase().includes(s));
    }
    return d;
  }, [debts, filterType, filterStatus, search]);

  const totalBorrowed = debts.filter(d => d.type === 'borrowed' && d.status !== 'paid').reduce((s, d) => s + d.remainingAmount, 0);
  const totalLent = debts.filter(d => d.type === 'lent' && d.status !== 'paid').reduce((s, d) => s + d.remainingAmount, 0);
  const overdueCount = debts.filter(d => d.status === 'overdue').length;

  const handleDelete = () => {
    if (deleteId) {
      const result = deleteDebt(deleteId);
      showToast(result.message, result.success ? 'success' : 'error');
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Qarzlar</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Qarz va kreditlaringizni boshqaring</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors">
          <Plus className="w-4 h-4" /> Yangi qarz
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Men qarz (berishim kerak)</p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(totalBorrowed, user?.currency)}</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Menga qarz (olishim kerak)</p>
          <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalLent, user?.currency)}</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Muddati o'tgan</p>
          <p className="text-xl font-bold text-amber-600">{overdueCount} ta</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Qidirish..." className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm">
          <option value="">Barcha turlar</option>
          {DEBT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm">
          <option value="">Barcha holatlar</option>
          {DEBT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Debts List */}
      {filtered.length === 0 ? (
        <EmptyState icon={DollarSign} title="Qarzlar yo'q" description="Hozircha hech qanday qarz qo'shilmagan." action={{ label: '+ Qarz qo\'shish', onClick: () => setShowAdd(true) }} />
      ) : (
        <div className="grid gap-4">
          {filtered.map(debt => {
            const statusInfo = DEBT_STATUSES.find(s => s.value === debt.status);
            const daysLeft = getDaysUntil(debt.dueDate);
            return (
              <div key={debt.id} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-100 dark:border-slate-700 card-hover">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{debt.personName}</h3>
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusInfo?.color)}>
                        {statusInfo?.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {debt.type === 'borrowed' ? '🔴 Men qarz olganman' : '🟢 Menga qarz berishgan'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {debt.status !== 'paid' && (
                      <button onClick={() => setPayDebt(debt)} className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-400 hover:text-emerald-500" title="To'lov qo'shish">
                        <DollarSign className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => setEditDebt(debt)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-400 hover:text-gray-600">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteId(debt.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Asl summa</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(debt.originalAmount, user?.currency)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">To'langan</p>
                    <p className="text-sm font-semibold text-emerald-600">{formatCurrency(debt.paidAmount, user?.currency)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Qolgan</p>
                    <p className="text-sm font-semibold text-red-600">{formatCurrency(debt.remainingAmount, user?.currency)}</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-2">
                  <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full progress-bar" style={{ width: `${Math.min((debt.paidAmount / debt.originalAmount) * 100, 100)}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Muddat: {formatDate(debt.dueDate)}
                    {daysLeft >= 0 && daysLeft <= 7 && debt.status !== 'paid' && (
                      <span className="text-amber-500 font-medium">({daysLeft === 0 ? 'Bugun' : `${daysLeft} kun qoldi`})</span>
                    )}
                    {daysLeft < 0 && debt.status !== 'paid' && <span className="text-red-500 font-medium">(Muddati o'tgan)</span>}
                  </span>
                  {debt.description && <span className="truncate max-w-[200px]">{debt.description}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Debt Modal */}
      {(showAdd || editDebt) && (
        <DebtForm
          isOpen={true}
          onClose={() => { setShowAdd(false); setEditDebt(null); }}
          editData={editDebt}
          onSubmit={(data) => {
            if (editDebt) {
              const result = updateDebt(editDebt.id, data);
              showToast(result.message, result.success ? 'success' : 'error');
            } else {
              addDebt(data as any);
              showToast('Qarz qo\'shildi!', 'success');
            }
            setShowAdd(false);
            setEditDebt(null);
          }}
        />
      )}

      {/* Payment Modal */}
      {payDebt && (
        <PaymentModal
          isOpen={true}
          onClose={() => setPayDebt(null)}
          debt={payDebt}
          onSubmit={(amount, date, note) => {
            const result = addDebtPayment(payDebt.id, amount, date, note);
            showToast(result.message, result.success ? 'success' : 'error');
            setPayDebt(null);
          }}
        />
      )}

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Qarzni o'chirish" message="Bu qarzni o'chirishni xohlaysizmi?" />
    </div>
  );
}

function DebtForm({ isOpen, onClose, editData, onSubmit }: { isOpen: boolean; onClose: () => void; editData: any; onSubmit: (data: any) => void }) {
  const [personName, setPersonName] = useState(editData?.personName || '');
  const [phone, setPhone] = useState(editData?.phone || '');
  const [type, setType] = useState(editData?.type || 'borrowed');
  const [originalAmount, setOriginalAmount] = useState(editData?.originalAmount?.toString() || '');
  const [dueDate, setDueDate] = useState(editData?.dueDate || '');
  const [description, setDescription] = useState(editData?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName || !originalAmount || parseFloat(originalAmount) <= 0 || !dueDate) return;
    onSubmit({ personName, phone, type, originalAmount: parseFloat(originalAmount), dueDate, description });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Qarzni tahrirlash' : 'Yangi qarz'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shaxs ismi</label>
          <input type="text" value={personName} onChange={e => setPersonName(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm" placeholder="Ism..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefon (ixtiyoriy)</label>
          <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm" placeholder="+998..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Turi</label>
          <div className="flex gap-2">
            {DEBT_TYPES.map(t => (
              <button key={t.value} type="button" onClick={() => setType(t.value)} className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition-colors", type === t.value ? (t.value === 'borrowed' ? "bg-red-500 text-white" : "bg-emerald-500 text-white") : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300")}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Summa</label>
          <input type="number" value={originalAmount} onChange={e => setOriginalAmount(e.target.value)} required min="1" className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm" placeholder="0" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Muddat</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Izoh</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm resize-none" />
        </div>
        <button type="submit" className="w-full py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors">
          {editData ? 'Saqlash' : 'Qo\'shish'}
        </button>
      </form>
    </Modal>
  );
}

function PaymentModal({ isOpen, onClose, debt, onSubmit }: { isOpen: boolean; onClose: () => void; debt: any; onSubmit: (amount: number, date: string, note: string) => void }) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    if (amt > debt.remainingAmount) return;
    onSubmit(amt, date, note);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`To'lov: ${debt.personName}`}>
      <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-300">Qolgan qarz: <span className="font-bold text-red-600">{formatCurrency(debt.remainingAmount)}</span></p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To'lov summasi</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required min="1" max={debt.remainingAmount} className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm" placeholder="0" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sana</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Izoh</label>
          <input type="text" value={note} onChange={e => setNote(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm" placeholder="Ixtiyoriy..." />
        </div>
        <button type="submit" className="w-full py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors">
          To'lov qo'shish
        </button>
      </form>
    </Modal>
  );
}
