import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { Modal, ConfirmDialog, EmptyState } from '../components/Layout';
import { formatCurrency, formatDate, REMINDER_TYPES, getDaysUntil, cn } from '../lib/utils';
import { Plus, Trash2, Bell, Clock, CheckCircle, AlertTriangle, Edit2 } from 'lucide-react';

export default function Reminders() {
  const { user, reminders, addReminder, updateReminder, deleteReminder, showToast } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [editReminder, setEditReminder] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');

  const filtered = useMemo(() => {
    let r = [...reminders];
    if (filterStatus) r = r.filter(x => x.status === filterStatus);
    return r;
  }, [reminders, filterStatus]);

  const todayCount = reminders.filter(r => r.status === 'pending' && r.date === new Date().toISOString().split('T')[0]).length;
  const upcomingCount = reminders.filter(r => r.status === 'pending' && getDaysUntil(r.date) > 0 && getDaysUntil(r.date) <= 7).length;
  const overdueCount = reminders.filter(r => r.status === 'overdue').length;

  const handleDelete = () => {
    if (deleteId) {
      const result = deleteReminder(deleteId);
      showToast(result.message, result.success ? 'success' : 'error');
      setDeleteId(null);
    }
  };

  const markComplete = (id: string) => {
    const result = updateReminder(id, { status: 'completed' });
    showToast(result.message, result.success ? 'success' : 'error');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Eslatmalar</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Muhim to'lovlar va muddatlarni unutmang</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors">
          <Plus className="w-4 h-4" /> Eslatma qo'shish
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{todayCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Bugun</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{upcomingCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Yaqin 7 kun</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Muddati o'tgan</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[{ v: '', l: 'Barchasi' }, { v: 'pending', l: 'Kutilmoqda' }, { v: 'completed', l: 'Bajarilgan' }, { v: 'overdue', l: 'Muddati o\'tgan' }].map(f => (
          <button key={f.v} onClick={() => setFilterStatus(f.v)} className={cn("px-3 py-1.5 text-xs font-medium rounded-lg transition-colors", filterStatus === f.v ? "bg-emerald-500 text-white" : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300")}>
            {f.l}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState icon={Bell} title="Eslatmalar yo'q" description="Hozircha hech qanday eslatma qo'shilmagan." action={{ label: '+ Eslatma qo\'shish', onClick: () => setShowAdd(true) }} />
      ) : (
        <div className="grid gap-3">
          {filtered.map(r => {
            const daysLeft = getDaysUntil(r.date);
            return (
              <div key={r.id} className={cn("bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 flex items-center gap-4",
                r.status === 'overdue' && "border-l-4 border-l-red-500",
                r.status === 'completed' && "opacity-60"
              )}>
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                  r.status === 'completed' ? "bg-emerald-50 dark:bg-emerald-900/30" :
                  r.status === 'overdue' ? "bg-red-50 dark:bg-red-900/30" :
                  "bg-amber-50 dark:bg-amber-900/30"
                )}>
                  {r.status === 'completed' ? <CheckCircle className="w-5 h-5 text-emerald-500" /> :
                   r.status === 'overdue' ? <AlertTriangle className="w-5 h-5 text-red-500" /> :
                   <Clock className="w-5 h-5 text-amber-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={cn("font-medium text-gray-900 dark:text-white", r.status === 'completed' && "line-through")}>{r.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>{formatDate(r.date)} {r.time && `⏰ ${r.time}`}</span>
                    <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-xs">
                      {REMINDER_TYPES.find(t => t.value === r.type)?.label || r.type}
                    </span>
                    {r.status === 'pending' && daysLeft >= 0 && (
                      <span className={cn("font-medium", daysLeft === 0 ? "text-blue-600" : daysLeft <= 3 ? "text-amber-600" : "text-gray-500")}>
                        {daysLeft === 0 ? 'Bugun' : `${daysLeft} kun qoldi`}
                      </span>
                    )}
                  </div>
                </div>
                {r.amount > 0 && <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(r.amount, user?.currency)}</span>}
                <div className="flex items-center gap-1">
                  {r.status !== 'completed' && (
                    <button onClick={() => markComplete(r.id)} className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-400 hover:text-emerald-500" title="Bajarildi">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => setEditReminder(r)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-400 hover:text-gray-600">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteId(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAdd || editReminder) && (
        <Modal isOpen={true} onClose={() => { setShowAdd(false); setEditReminder(null); }} title={editReminder ? 'Eslatmani tahrirlash' : 'Yangi eslatma'}>
          <ReminderForm editData={editReminder} onSubmit={(data) => {
            if (editReminder) {
              const result = updateReminder(editReminder.id, data);
              showToast(result.message, result.success ? 'success' : 'error');
            } else {
              addReminder(data as any);
              showToast('Eslatma qo\'shildi!', 'success');
            }
            setShowAdd(false);
            setEditReminder(null);
          }} />
        </Modal>
      )}

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Eslatmani o'chirish" message="Bu eslatmani o'chirishni xohlaysizmi?" />
    </div>
  );
}

function ReminderForm({ editData, onSubmit }: { editData: any; onSubmit: (data: any) => void }) {
  const [title, setTitle] = useState(editData?.title || '');
  const [amount, setAmount] = useState(editData?.amount?.toString() || '0');
  const [date, setDate] = useState(editData?.date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(editData?.time || '09:00');
  const [type, setType] = useState(editData?.type || 'bill');
  const [description, setDescription] = useState(editData?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;
    onSubmit({ title, amount: parseFloat(amount) || 0, date, time, type, description });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sarlavha</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm" placeholder="Masalan: Internet to'lovi" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Summa</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="0" className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Turi</label>
          <select value={type} onChange={e => setType(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm">
            {REMINDER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sana</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vaqt</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Izoh</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm resize-none" />
      </div>
      <button type="submit" className="w-full py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors">
        {editData ? 'Saqlash' : 'Qo\'shish'}
      </button>
    </form>
  );
}
