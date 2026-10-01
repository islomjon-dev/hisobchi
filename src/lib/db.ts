import { v4 as uuidv4 } from 'uuid';

// Types
export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  avatar: string;
  currency: string;
  language: string;
  theme: 'light' | 'dark';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: 'income' | 'expense';
  isDefault: boolean;
  color: string;
  icon: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  categoryId: string;
  title: string;
  description: string;
  date: string;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'other';
  createdAt: string;
  updatedAt: string;
}

export interface Debt {
  id: string;
  userId: string;
  personName: string;
  phone: string;
  type: 'borrowed' | 'lent';
  originalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  description: string;
  status: 'active' | 'partial' | 'paid' | 'overdue';
  createdAt: string;
  updatedAt: string;
}

export interface DebtPayment {
  id: string;
  debtId: string;
  userId: string;
  amount: number;
  date: string;
  note: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  limit: number;
  month: number;
  year: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
  updatedAt: string;
}

export interface SavingsTransaction {
  id: string;
  goalId: string;
  userId: string;
  amount: number;
  date: string;
  note: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  amount: number;
  date: string;
  time: string;
  description: string;
  status: 'pending' | 'completed' | 'overdue';
  type: 'bill' | 'debt' | 'rent' | 'subscription' | 'other';
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  read: boolean;
  createdAt: string;
}

// Database helpers
function getStore<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function setStore<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function getSingle<T>(key: string): T | null {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

// Simple hash for demo (in production use bcrypt)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'h_' + Math.abs(hash).toString(36) + '_' + str.length;
}

function verifyHash(password: string, hash: string): boolean {
  return simpleHash(password) === hash;
}

// Default categories
const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Maosh', color: '#10b981', icon: 'Briefcase' },
  { name: 'Frilans', color: '#3b82f6', icon: 'Laptop' },
  { name: 'Biznes', color: '#8b5cf6', icon: 'Building2' },
  { name: "Sovg'a", color: '#ec4899', icon: 'Gift' },
  { name: 'Investitsiya', color: '#f59e0b', icon: 'TrendingUp' },
  { name: 'Boshqa', color: '#6b7280', icon: 'MoreHorizontal' },
];

const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Ovqat', color: '#ef4444', icon: 'UtensilsCrossed' },
  { name: 'Transport', color: '#f97316', icon: 'Car' },
  { name: 'Kiyim', color: '#ec4899', icon: 'Shirt' },
  { name: "Ta'lim", color: '#8b5cf6', icon: 'GraduationCap' },
  { name: 'Uy', color: '#06b6d4', icon: 'Home' },
  { name: 'Salomatlik', color: '#10b981', icon: 'Heart' },
  { name: 'Ko\'ngilochar', color: '#f59e0b', icon: 'Gamepad2' },
  { name: 'Xarid', color: '#3b82f6', icon: 'ShoppingBag' },
  { name: 'Telefon', color: '#6366f1', icon: 'Smartphone' },
  { name: 'Internet', color: '#14b8a6', icon: 'Wifi' },
  { name: 'To\'lovlar', color: '#a855f7', icon: 'Receipt' },
  { name: 'Boshqa', color: '#6b7280', icon: 'MoreHorizontal' },
];

// DB API
export const db = {
  // Auth
  register(fullName: string, email: string, password: string): { success: boolean; message: string; user?: Omit<User, 'passwordHash'> } {
    const users = getStore<User>('hisobchi_users');
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'Bu email allaqachon ro\'yxatdan o\'tgan.' };
    }
    const now = new Date().toISOString();
    const user: User = {
      id: uuidv4(),
      fullName,
      email: email.toLowerCase(),
      passwordHash: simpleHash(password),
      avatar: '',
      currency: 'UZS',
      language: 'uz',
      theme: 'light',
      createdAt: now,
      updatedAt: now,
    };
    users.push(user);
    setStore('hisobchi_users', users);

    // Create default categories
    const categories = getStore<Category>('hisobchi_categories');
    DEFAULT_INCOME_CATEGORIES.forEach(c => {
      categories.push({ id: uuidv4(), userId: user.id, name: c.name, type: 'income', isDefault: true, color: c.color, icon: c.icon });
    });
    DEFAULT_EXPENSE_CATEGORIES.forEach(c => {
      categories.push({ id: uuidv4(), userId: user.id, name: c.name, type: 'expense', isDefault: true, color: c.color, icon: c.icon });
    });
    setStore('hisobchi_categories', categories);

    const { passwordHash, ...safeUser } = user;
    return { success: true, message: 'Muvaffaqiyatli ro\'yxatdan o\'tdingiz!', user: safeUser };
  },

  login(email: string, password: string): { success: boolean; message: string; user?: Omit<User, 'passwordHash'>; token?: string } {
    const users = getStore<User>('hisobchi_users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return { success: false, message: 'Email yoki parol noto\'g\'ri.' };
    if (!verifyHash(password, user.passwordHash)) return { success: false, message: 'Email yoki parol noto\'g\'ri.' };
    const token = btoa(JSON.stringify({ userId: user.id, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }));
    localStorage.setItem('hisobchi_token', token);
    const { passwordHash, ...safeUser } = user;
    return { success: true, message: 'Muvaffaqiyatli kirdingiz!', user: safeUser, token };
  },

  logout() {
    localStorage.removeItem('hisobchi_token');
  },

  getCurrentUser(): Omit<User, 'passwordHash'> | null {
    const token = localStorage.getItem('hisobchi_token');
    if (!token) return null;
    try {
      const decoded = JSON.parse(atob(token));
      if (decoded.exp < Date.now()) {
        localStorage.removeItem('hisobchi_token');
        return null;
      }
      const users = getStore<User>('hisobchi_users');
      const user = users.find(u => u.id === decoded.userId);
      if (!user) return null;
      const { passwordHash, ...safeUser } = user;
      return safeUser;
    } catch { return null; }
  },

  updateUser(userId: string, updates: Partial<User>): { success: boolean; message: string } {
    const users = getStore<User>('hisobchi_users');
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return { success: false, message: 'Foydalanuvchi topilmadi.' };
    users[idx] = { ...users[idx], ...updates, updatedAt: new Date().toISOString() };
    setStore('hisobchi_users', users);
    return { success: true, message: 'Profil yangilandi.' };
  },

  changePassword(userId: string, oldPassword: string, newPassword: string): { success: boolean; message: string } {
    const users = getStore<User>('hisobchi_users');
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return { success: false, message: 'Foydalanuvchi topilmadi.' };
    if (!verifyHash(oldPassword, users[idx].passwordHash)) return { success: false, message: 'Joriy parol noto\'g\'ri.' };
    users[idx].passwordHash = simpleHash(newPassword);
    users[idx].updatedAt = new Date().toISOString();
    setStore('hisobchi_users', users);
    return { success: true, message: 'Parol o\'zgartirildi.' };
  },

  // Categories
  getCategories(userId: string): Category[] {
    return getStore<Category>('hisobchi_categories').filter(c => c.userId === userId);
  },

  addCategory(userId: string, name: string, type: 'income' | 'expense', color: string, icon: string): Category {
    const categories = getStore<Category>('hisobchi_categories');
    const cat: Category = { id: uuidv4(), userId, name, type, isDefault: false, color, icon };
    categories.push(cat);
    setStore('hisobchi_categories', categories);
    return cat;
  },

  deleteCategory(categoryId: string, userId: string): { success: boolean; message: string } {
    const categories = getStore<Category>('hisobchi_categories');
    const cat = categories.find(c => c.id === categoryId && c.userId === userId);
    if (!cat) return { success: false, message: 'Kategoriya topilmadi.' };
    if (cat.isDefault) return { success: false, message: 'Standart kategoriyani o\'chirib bo\'lmaydi.' };
    setStore('hisobchi_categories', categories.filter(c => c.id !== categoryId));
    return { success: true, message: 'Kategoriya o\'chirildi.' };
  },

  // Transactions
  getTransactions(userId: string, filters?: { type?: string; categoryId?: string; dateFrom?: string; dateTo?: string; search?: string; paymentMethod?: string; page?: number; limit?: number }): { transactions: Transaction[]; total: number } {
    let txns = getStore<Transaction>('hisobchi_transactions').filter(t => t.userId === userId);
    if (filters?.type) txns = txns.filter(t => t.type === filters.type);
    if (filters?.categoryId) txns = txns.filter(t => t.categoryId === filters.categoryId);
    if (filters?.paymentMethod) txns = txns.filter(t => t.paymentMethod === filters.paymentMethod);
    if (filters?.dateFrom) txns = txns.filter(t => t.date >= filters.dateFrom!);
    if (filters?.dateTo) txns = txns.filter(t => t.date <= filters.dateTo!);
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      txns = txns.filter(t => t.title.toLowerCase().includes(s) || t.description.toLowerCase().includes(s));
    }
    txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const total = txns.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    txns = txns.slice((page - 1) * limit, page * limit);
    return { transactions: txns, total };
  },

  addTransaction(userId: string, data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Transaction {
    const txns = getStore<Transaction>('hisobchi_transactions');
    const now = new Date().toISOString();
    const txn: Transaction = { ...data, id: uuidv4(), userId, createdAt: now, updatedAt: now };
    txns.push(txn);
    setStore('hisobchi_transactions', txns);
    return txn;
  },

  updateTransaction(txnId: string, userId: string, data: Partial<Transaction>): { success: boolean; message: string } {
    const txns = getStore<Transaction>('hisobchi_transactions');
    const idx = txns.findIndex(t => t.id === txnId && t.userId === userId);
    if (idx === -1) return { success: false, message: 'Tranzaksiya topilmadi.' };
    txns[idx] = { ...txns[idx], ...data, updatedAt: new Date().toISOString() };
    setStore('hisobchi_transactions', txns);
    return { success: true, message: 'Tranzaksiya yangilandi.' };
  },

  deleteTransaction(txnId: string, userId: string): { success: boolean; message: string } {
    const txns = getStore<Transaction>('hisobchi_transactions');
    const exists = txns.find(t => t.id === txnId && t.userId === userId);
    if (!exists) return { success: false, message: 'Tranzaksiya topilmadi.' };
    setStore('hisobchi_transactions', txns.filter(t => t.id !== txnId));
    return { success: true, message: 'Tranzaksiya o\'chirildi.' };
  },

  // Debts
  getDebts(userId: string, filters?: { type?: string; status?: string; search?: string }): Debt[] {
    let debts = getStore<Debt>('hisobchi_debts').filter(d => d.userId === userId);
    if (filters?.type) debts = debts.filter(d => d.type === filters.type);
    if (filters?.status) debts = debts.filter(d => d.status === filters.status);
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      debts = debts.filter(d => d.personName.toLowerCase().includes(s) || d.description.toLowerCase().includes(s));
    }
    // Update overdue status
    const now = new Date().toISOString().split('T')[0];
    debts = debts.map(d => {
      if (d.status !== 'paid' && d.dueDate < now) return { ...d, status: 'overdue' as const };
      return d;
    });
    return debts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  addDebt(userId: string, data: Omit<Debt, 'id' | 'userId' | 'paidAmount' | 'remainingAmount' | 'status' | 'createdAt' | 'updatedAt'>): Debt {
    const debts = getStore<Debt>('hisobchi_debts');
    const now = new Date().toISOString();
    const debt: Debt = { ...data, id: uuidv4(), userId, paidAmount: 0, remainingAmount: data.originalAmount, status: 'active', createdAt: now, updatedAt: now };
    debts.push(debt);
    setStore('hisobchi_debts', debts);
    return debt;
  },

  updateDebt(debtId: string, userId: string, data: Partial<Debt>): { success: boolean; message: string } {
    const debts = getStore<Debt>('hisobchi_debts');
    const idx = debts.findIndex(d => d.id === debtId && d.userId === userId);
    if (idx === -1) return { success: false, message: 'Qarz topilmadi.' };
    debts[idx] = { ...debts[idx], ...data, updatedAt: new Date().toISOString() };
    setStore('hisobchi_debts', debts);
    return { success: true, message: 'Qarz yangilandi.' };
  },

  deleteDebt(debtId: string, userId: string): { success: boolean; message: string } {
    const debts = getStore<Debt>('hisobchi_debts');
    const exists = debts.find(d => d.id === debtId && d.userId === userId);
    if (!exists) return { success: false, message: 'Qarz topilmadi.' };
    setStore('hisobchi_debts', debts.filter(d => d.id !== debtId));
    // Also delete payments
    const payments = getStore<DebtPayment>('hisobchi_debt_payments');
    setStore('hisobchi_debt_payments', payments.filter(p => p.debtId !== debtId));
    return { success: true, message: 'Qarz o\'chirildi.' };
  },

  addDebtPayment(debtId: string, userId: string, amount: number, date: string, note: string): { success: boolean; message: string } {
    const debts = getStore<Debt>('hisobchi_debts');
    const idx = debts.findIndex(d => d.id === debtId && d.userId === userId);
    if (idx === -1) return { success: false, message: 'Qarz topilmadi.' };
    const debt = debts[idx];
    if (amount > debt.remainingAmount) return { success: false, message: 'To\'lov summasi qolgan qarzdan oshib ketdi.' };
    if (amount <= 0) return { success: false, message: 'Summa 0 dan katta bo\'lishi kerak.' };

    const payments = getStore<DebtPayment>('hisobchi_debt_payments');
    payments.push({ id: uuidv4(), debtId, userId, amount, date, note, createdAt: new Date().toISOString() });
    setStore('hisobchi_debt_payments', payments);

    debts[idx].paidAmount += amount;
    debts[idx].remainingAmount -= amount;
    debts[idx].status = debts[idx].remainingAmount === 0 ? 'paid' : 'partial';
    debts[idx].updatedAt = new Date().toISOString();
    setStore('hisobchi_debts', debts);
    return { success: true, message: 'To\'lov qo\'shildi.' };
  },

  getDebtPayments(debtId: string, userId: string): DebtPayment[] {
    return getStore<DebtPayment>('hisobchi_debt_payments')
      .filter(p => p.debtId === debtId && p.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  // Budgets
  getBudgets(userId: string, month?: number, year?: number): Budget[] {
    let budgets = getStore<Budget>('hisobchi_budgets').filter(b => b.userId === userId);
    if (month !== undefined) budgets = budgets.filter(b => b.month === month);
    if (year !== undefined) budgets = budgets.filter(b => b.year === year);
    return budgets;
  },

  addBudget(userId: string, data: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Budget {
    const budgets = getStore<Budget>('hisobchi_budgets');
    const now = new Date().toISOString();
    const budget: Budget = { ...data, id: uuidv4(), userId, createdAt: now, updatedAt: now };
    budgets.push(budget);
    setStore('hisobchi_budgets', budgets);
    return budget;
  },

  updateBudget(budgetId: string, userId: string, data: Partial<Budget>): { success: boolean; message: string } {
    const budgets = getStore<Budget>('hisobchi_budgets');
    const idx = budgets.findIndex(b => b.id === budgetId && b.userId === userId);
    if (idx === -1) return { success: false, message: 'Byudjet topilmadi.' };
    budgets[idx] = { ...budgets[idx], ...data, updatedAt: new Date().toISOString() };
    setStore('hisobchi_budgets', budgets);
    return { success: true, message: 'Byudjet yangilandi.' };
  },

  deleteBudget(budgetId: string, userId: string): { success: boolean; message: string } {
    const budgets = getStore<Budget>('hisobchi_budgets');
    const exists = budgets.find(b => b.id === budgetId && b.userId === userId);
    if (!exists) return { success: false, message: 'Byudjet topilmadi.' };
    setStore('hisobchi_budgets', budgets.filter(b => b.id !== budgetId));
    return { success: true, message: 'Byudjet o\'chirildi.' };
  },

  getBudgetSpent(userId: string, categoryId: string, month: number, year: number): number {
    const txns = getStore<Transaction>('hisobchi_transactions')
      .filter(t => t.userId === userId && t.type === 'expense' && t.categoryId === categoryId);
    return txns
      .filter(t => {
        const d = new Date(t.date);
        return d.getMonth() + 1 === month && d.getFullYear() === year;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  },

  // Savings
  getSavings(userId: string): SavingsGoal[] {
    return getStore<SavingsGoal>('hisobchi_savings').filter(s => s.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  addSavings(userId: string, data: Omit<SavingsGoal, 'id' | 'userId' | 'currentAmount' | 'status' | 'createdAt' | 'updatedAt'>): SavingsGoal {
    const goals = getStore<SavingsGoal>('hisobchi_savings');
    const now = new Date().toISOString();
    const goal: SavingsGoal = { ...data, id: uuidv4(), userId, currentAmount: 0, status: 'active', createdAt: now, updatedAt: now };
    goals.push(goal);
    setStore('hisobchi_savings', goals);
    return goal;
  },

  updateSavings(goalId: string, userId: string, data: Partial<SavingsGoal>): { success: boolean; message: string } {
    const goals = getStore<SavingsGoal>('hisobchi_savings');
    const idx = goals.findIndex(g => g.id === goalId && g.userId === userId);
    if (idx === -1) return { success: false, message: 'Maqsad topilmadi.' };
    goals[idx] = { ...goals[idx], ...data, updatedAt: new Date().toISOString() };
    setStore('hisobchi_savings', goals);
    return { success: true, message: 'Maqsad yangilandi.' };
  },

  deleteSavings(goalId: string, userId: string): { success: boolean; message: string } {
    const goals = getStore<SavingsGoal>('hisobchi_savings');
    const exists = goals.find(g => g.id === goalId && g.userId === userId);
    if (!exists) return { success: false, message: 'Maqsad topilmadi.' };
    setStore('hisobchi_savings', goals.filter(g => g.id !== goalId));
    const txns = getStore<SavingsTransaction>('hisobchi_savings_transactions');
    setStore('hisobchi_savings_transactions', txns.filter(t => t.goalId !== goalId));
    return { success: true, message: 'Maqsad o\'chirildi.' };
  },

  addSavingsDeposit(goalId: string, userId: string, amount: number, date: string, note: string): { success: boolean; message: string } {
    const goals = getStore<SavingsGoal>('hisobchi_savings');
    const idx = goals.findIndex(g => g.id === goalId && g.userId === userId);
    if (idx === -1) return { success: false, message: 'Maqsad topilmadi.' };
    if (amount <= 0) return { success: false, message: 'Summa 0 dan katta bo\'lishi kerak.' };

    const txns = getStore<SavingsTransaction>('hisobchi_savings_transactions');
    txns.push({ id: uuidv4(), goalId, userId, amount, date, note, createdAt: new Date().toISOString() });
    setStore('hisobchi_savings_transactions', txns);

    goals[idx].currentAmount += amount;
    if (goals[idx].currentAmount >= goals[idx].targetAmount) goals[idx].status = 'completed';
    goals[idx].updatedAt = new Date().toISOString();
    setStore('hisobchi_savings', goals);
    return { success: true, message: 'Mablag\' qo\'shildi.' };
  },

  getSavingsTransactions(goalId: string, userId: string): SavingsTransaction[] {
    return getStore<SavingsTransaction>('hisobchi_savings_transactions')
      .filter(t => t.goalId === goalId && t.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  // Reminders
  getReminders(userId: string, status?: string): Reminder[] {
    let reminders = getStore<Reminder>('hisobchi_reminders').filter(r => r.userId === userId);
    if (status) reminders = reminders.filter(r => r.status === status);
    // Update overdue
    const now = new Date().toISOString().split('T')[0];
    reminders = reminders.map(r => {
      if (r.status === 'pending' && r.date < now) return { ...r, status: 'overdue' as const };
      return r;
    });
    return reminders.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },

  addReminder(userId: string, data: Omit<Reminder, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>): Reminder {
    const reminders = getStore<Reminder>('hisobchi_reminders');
    const now = new Date().toISOString();
    const reminder: Reminder = { ...data, id: uuidv4(), userId, status: 'pending', createdAt: now, updatedAt: now };
    reminders.push(reminder);
    setStore('hisobchi_reminders', reminders);
    return reminder;
  },

  updateReminder(reminderId: string, userId: string, data: Partial<Reminder>): { success: boolean; message: string } {
    const reminders = getStore<Reminder>('hisobchi_reminders');
    const idx = reminders.findIndex(r => r.id === reminderId && r.userId === userId);
    if (idx === -1) return { success: false, message: 'Eslatma topilmadi.' };
    reminders[idx] = { ...reminders[idx], ...data, updatedAt: new Date().toISOString() };
    setStore('hisobchi_reminders', reminders);
    return { success: true, message: 'Eslatma yangilandi.' };
  },

  deleteReminder(reminderId: string, userId: string): { success: boolean; message: string } {
    const reminders = getStore<Reminder>('hisobchi_reminders');
    const exists = reminders.find(r => r.id === reminderId && r.userId === userId);
    if (!exists) return { success: false, message: 'Eslatma topilmadi.' };
    setStore('hisobchi_reminders', reminders.filter(r => r.id !== reminderId));
    return { success: true, message: 'Eslatma o\'chirildi.' };
  },

  // Notifications
  getNotifications(userId: string): Notification[] {
    return getStore<Notification>('hisobchi_notifications')
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  addNotification(userId: string, title: string, message: string, type: Notification['type'] = 'info'): void {
    const notifications = getStore<Notification>('hisobchi_notifications');
    notifications.push({ id: uuidv4(), userId, title, message, type, read: false, createdAt: new Date().toISOString() });
    setStore('hisobchi_notifications', notifications);
  },

  markNotificationRead(notifId: string, userId: string): void {
    const notifications = getStore<Notification>('hisobchi_notifications');
    const idx = notifications.findIndex(n => n.id === notifId && n.userId === userId);
    if (idx !== -1) {
      notifications[idx].read = true;
      setStore('hisobchi_notifications', notifications);
    }
  },

  markAllNotificationsRead(userId: string): void {
    const notifications = getStore<Notification>('hisobchi_notifications');
    setStore('hisobchi_notifications', notifications.map(n => n.userId === userId ? { ...n, read: true } : n));
  },

  // Reports / Analytics
  getDashboardData(userId: string, period: 'week' | 'month' | 'last_month' | 'year' | 'custom' = 'month', customFrom?: string, customTo?: string) {
    const now = new Date();
    let dateFrom: string, dateTo: string;

    if (period === 'week') {
      const start = new Date(now);
      start.setDate(start.getDate() - start.getDay());
      dateFrom = start.toISOString().split('T')[0];
      dateTo = now.toISOString().split('T')[0];
    } else if (period === 'month') {
      dateFrom = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      dateTo = now.toISOString().split('T')[0];
    } else if (period === 'last_month') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      dateFrom = lastMonth.toISOString().split('T')[0];
      dateTo = lastMonthEnd.toISOString().split('T')[0];
    } else if (period === 'year') {
      dateFrom = `${now.getFullYear()}-01-01`;
      dateTo = now.toISOString().split('T')[0];
    } else {
      dateFrom = customFrom || `${now.getFullYear()}-01-01`;
      dateTo = customTo || now.toISOString().split('T')[0];
    }

    const allTxns = getStore<Transaction>('hisobchi_transactions').filter(t => t.userId === userId);
    const periodTxns = allTxns.filter(t => t.date >= dateFrom && t.date <= dateTo);

    const totalIncome = allTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = allTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const periodIncome = periodTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const periodExpense = periodTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const debts = getStore<Debt>('hisobchi_debts').filter(d => d.userId === userId);
    const totalDebtOwed = debts.filter(d => d.type === 'borrowed' && d.status !== 'paid').reduce((s, d) => s + d.remainingAmount, 0);
    const totalDebtLent = debts.filter(d => d.type === 'lent' && d.status !== 'paid').reduce((s, d) => s + d.remainingAmount, 0);

    const savings = getStore<SavingsGoal>('hisobchi_savings').filter(s => s.userId === userId);
    const totalSavings = savings.reduce((s, g) => s + g.currentAmount, 0);

    // Category breakdown for expenses
    const categories = getStore<Category>('hisobchi_categories').filter(c => c.userId === userId && c.type === 'expense');
    const categoryBreakdown = categories.map(c => ({
      category: c,
      amount: periodTxns.filter(t => t.type === 'expense' && t.categoryId === c.id).reduce((s, t) => s + t.amount, 0),
    })).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);

    // Monthly trend
    const monthlyTrend: { month: string; income: number; expense: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthTxns = allTxns.filter(t => t.date.startsWith(monthStr));
      monthlyTrend.push({
        month: d.toLocaleDateString('uz-Latn-UZ', { month: 'short' }),
        income: monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      });
    }

    const recentTxns = allTxns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

    return {
      balance: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
      periodIncome,
      periodExpense,
      totalDebtOwed,
      totalDebtLent,
      totalSavings,
      categoryBreakdown,
      monthlyTrend,
      recentTxns,
    };
  },

  // Calendar data
  getCalendarData(userId: string, year: number, month: number) {
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    const txns = getStore<Transaction>('hisobchi_transactions')
      .filter(t => t.userId === userId && t.date.startsWith(monthStr));
    const reminders = getStore<Reminder>('hisobchi_reminders')
      .filter(r => r.userId === userId && r.date.startsWith(monthStr));
    const debts = getStore<Debt>('hisobchi_debts')
      .filter(d => d.userId === userId && d.dueDate.startsWith(monthStr));
    const payments = getStore<DebtPayment>('hisobchi_debt_payments')
      .filter(p => p.userId === userId && p.date.startsWith(monthStr));

    return { txns, reminders, debts, payments };
  },

  // Generate notifications based on data
  generateNotifications(userId: string): void {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const today = now.toISOString().split('T')[0];
    const tomorrow = new Date(now.getTime() + 86400000).toISOString().split('T')[0];

    // Budget warnings
    const budgets = this.getBudgets(userId, month, year);
    budgets.forEach(b => {
      const spent = this.getBudgetSpent(userId, b.categoryId, month, year);
      const pct = (spent / b.limit) * 100;
      if (pct >= 100) {
        this.addNotification(userId, 'Byudjet oshib ketdi!', `Siz byudjet chegarasini oshib ketdingiz.`, 'danger');
      } else if (pct >= 80) {
        this.addNotification(userId, 'Byudjet ogohlantirishi', `Siz byudjetning 80% dan oshdingiz.`, 'warning');
      }
    });

    // Overdue debts
    const debts = this.getDebts(userId);
    const overdue = debts.filter(d => d.status === 'overdue');
    if (overdue.length > 0) {
      this.addNotification(userId, 'Muddati o\'tgan qarz', `Sizda ${overdue.length} ta muddati o'tgan qarz bor.`, 'danger');
    }

    // Tomorrow reminders
    const reminders = this.getReminders(userId);
    const tomorrowReminders = reminders.filter(r => r.date === tomorrow && r.status === 'pending');
    tomorrowReminders.forEach(r => {
      this.addNotification(userId, 'Eslatma', `"${r.title}" eslatmasi ertaga.`, 'info');
    });

    // Savings progress
    const savings = this.getSavings(userId);
    savings.forEach(s => {
      const pct = (s.currentAmount / s.targetAmount) * 100;
      if (pct >= 70 && pct < 100) {
        this.addNotification(userId, 'Jamg\'arma progressi', `"${s.name}" maqsadingiz ${Math.round(pct)}% bajarildi!`, 'success');
      }
    });
  },
};
