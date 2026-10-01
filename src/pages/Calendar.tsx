import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { db } from '../lib/db';
import { formatCurrency, getMonthName, cn } from '../lib/utils';
import { ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, Bell, DollarSign } from 'lucide-react';

export default function CalendarPage() {
  const { user, categories } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const calendarData = useMemo(() => {
    if (!user) return { txns: [], reminders: [], debts: [], payments: [] };
    return db.getCalendarData(user.id, year, month);
  }, [user, year, month]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1; // Monday start

  const prevMonth = () => setCurrentDate(new Date(year, month - 2, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month, 1));

  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const txns = calendarData.txns.filter(t => t.date === dateStr);
    const reminders = calendarData.reminders.filter(r => r.date === dateStr);
    const debts = calendarData.debts.filter(d => d.dueDate === dateStr);
    const payments = calendarData.payments.filter(p => p.date === dateStr);
    return { txns, reminders, debts, payments, hasEvents: txns.length + reminders.length + debts.length + payments.length > 0 };
  };

  const selectedEvents = selectedDate ? getEventsForDate(parseInt(selectedDate.split('-')[2])) : null;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Moliyaviy kalendar</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Tranzaksiya, eslatma va qarzlar taqvimi</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getMonthName(month)} {year}
            </h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sh', 'Ya'].map(d => (
              <div key={d} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: adjustedFirstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const events = getEventsForDate(day);
              const isToday = dateStr === today;
              const isSelected = selectedDate === dateStr;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={cn(
                    "aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative transition-colors",
                    isToday && "ring-2 ring-emerald-500",
                    isSelected && "bg-emerald-500 text-white",
                    !isSelected && events.hasEvents && "bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700",
                    !isSelected && !events.hasEvents && "hover:bg-gray-50 dark:hover:bg-slate-700/30"
                  )}
                >
                  <span className={cn("font-medium", isToday && !isSelected && "text-emerald-600")}>{day}</span>
                  {events.hasEvents && !isSelected && (
                    <div className="flex gap-0.5 mt-0.5">
                      {events.txns.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                      {events.reminders.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                      {events.debts.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /><span className="text-xs text-gray-500 dark:text-gray-400">Tranzaksiya</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /><span className="text-xs text-gray-500 dark:text-gray-400">Eslatma</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className="text-xs text-gray-500 dark:text-gray-400">Qarz</span></div>
          </div>
        </div>

        {/* Selected date events */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            {selectedDate ? new Date(selectedDate).toLocaleDateString('uz-Latn-UZ', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Sanani tanlang'}
          </h3>
          {selectedEvents && selectedEvents.hasEvents ? (
            <div className="space-y-3">
              {selectedEvents.txns.map(t => {
                const cat = categories.find(c => c.id === t.categoryId);
                return (
                  <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                    {t.type === 'income' ? <ArrowUpRight className="w-4 h-4 text-emerald-500" /> : <ArrowDownRight className="w-4 h-4 text-red-500" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{t.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{cat?.name}</p>
                    </div>
                    <span className={cn("text-sm font-semibold", t.type === 'income' ? "text-emerald-600" : "text-red-600")}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, user?.currency)}
                    </span>
                  </div>
                );
              })}
              {selectedEvents.reminders.map(r => (
                <div key={r.id} className="flex items-center gap-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                  <Bell className="w-4 h-4 text-amber-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{r.title}</p>
                    {r.time && <p className="text-xs text-gray-500 dark:text-gray-400">{r.time}</p>}
                  </div>
                  {r.amount > 0 && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{formatCurrency(r.amount, user?.currency)}</span>}
                </div>
              ))}
              {selectedEvents.debts.map(d => (
                <div key={d.id} className="flex items-center gap-3 p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <DollarSign className="w-4 h-4 text-red-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{d.personName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{d.type === 'borrowed' ? 'Qarz olgan' : 'Qarz bergan'}</p>
                  </div>
                  <span className="text-sm font-semibold text-red-600">{formatCurrency(d.remainingAmount, user?.currency)}</span>
                </div>
              ))}
            </div>
          ) : selectedDate ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">Bu sana uchun voqealar yo'q</p>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">Kalendardan sana tanlang</p>
          )}
        </div>
      </div>
    </div>
  );
}
