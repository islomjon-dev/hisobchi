export function formatCurrency(amount: number, currency: string = 'UZS'): string {
  const formatted = new Intl.NumberFormat('uz-Latn-UZ').format(Math.round(amount));
  return `${formatted} so'm`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('uz-Latn-UZ', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('uz-Latn-UZ', { day: 'numeric', month: 'short' });
}

export function formatTime(timeStr: string): string {
  return timeStr;
}

export function getMonthName(month: number): string {
  const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
  return months[month - 1] || '';
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function getPercentage(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(Math.round((current / total) * 100), 100);
}

export function getDaysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Naqd pul' },
  { value: 'card', label: 'Karta' },
  { value: 'bank_transfer', label: 'Bank o\'tkazmasi' },
  { value: 'other', label: 'Boshqa' },
];

export const DEBT_TYPES = [
  { value: 'borrowed', label: 'Qarz oldim' },
  { value: 'lent', label: 'Qarz berdim' },
];

export const DEBT_STATUSES = [
  { value: 'active', label: 'Faol', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'partial', label: 'Qisman to\'langan', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'paid', label: 'To\'langan', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'overdue', label: 'Muddati o\'tgan', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
];

export const REMINDER_TYPES = [
  { value: 'bill', label: 'To\'lov' },
  { value: 'debt', label: 'Qarz' },
  { value: 'rent', label: 'Ijara' },
  { value: 'subscription', label: 'Obuna' },
  { value: 'other', label: 'Boshqa' },
];

export const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#14b8a6', '#a855f7'];
