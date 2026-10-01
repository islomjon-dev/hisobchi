import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { db, User, Category, Transaction, Debt, Budget, SavingsGoal, Reminder, Notification } from '../lib/db';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AppContextType {
  // Auth
  user: Omit<User, 'passwordHash'> | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; message: string };
  register: (fullName: string, email: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  updateUser: (updates: Partial<User>) => { success: boolean; message: string };
  changePassword: (oldPw: string, newPw: string) => { success: boolean; message: string };

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Data
  categories: Category[];
  transactions: Transaction[];
  debts: Debt[];
  budgets: Budget[];
  savings: SavingsGoal[];
  reminders: Reminder[];
  notifications: Notification[];
  unreadCount: number;

  // Actions
  refreshData: () => void;
  addTransaction: (data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Transaction;
  updateTransaction: (id: string, data: Partial<Transaction>) => { success: boolean; message: string };
  deleteTransaction: (id: string) => { success: boolean; message: string };
  addDebt: (data: Omit<Debt, 'id' | 'userId' | 'paidAmount' | 'remainingAmount' | 'status' | 'createdAt' | 'updatedAt'>) => Debt;
  updateDebt: (id: string, data: Partial<Debt>) => { success: boolean; message: string };
  deleteDebt: (id: string) => { success: boolean; message: string };
  addDebtPayment: (debtId: string, amount: number, date: string, note: string) => { success: boolean; message: string };
  addBudget: (data: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Budget;
  updateBudget: (id: string, data: Partial<Budget>) => { success: boolean; message: string };
  deleteBudget: (id: string) => { success: boolean; message: string };
  addSavings: (data: Omit<SavingsGoal, 'id' | 'userId' | 'currentAmount' | 'status' | 'createdAt' | 'updatedAt'>) => SavingsGoal;
  updateSavings: (id: string, data: Partial<SavingsGoal>) => { success: boolean; message: string };
  deleteSavings: (id: string) => { success: boolean; message: string };
  addSavingsDeposit: (goalId: string, amount: number, date: string, note: string) => { success: boolean; message: string };
  addReminder: (data: Omit<Reminder, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>) => Reminder;
  updateReminder: (id: string, data: Partial<Reminder>) => { success: boolean; message: string };
  deleteReminder: (id: string) => { success: boolean; message: string };
  addCategory: (name: string, type: 'income' | 'expense', color: string, icon: string) => Category;
  deleteCategory: (id: string) => { success: boolean; message: string };
  markNotifRead: (id: string) => void;
  markAllNotifRead: () => void;

  // Toast
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Omit<User, 'passwordHash'> | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('hisobchi_theme') as 'light' | 'dark') || 'light';
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savings, setSavings] = useState<SavingsGoal[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Apply theme
  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('hisobchi_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // Load user
  useEffect(() => {
    const u = db.getCurrentUser();
    if (u) {
      setUser(u);
      if (u.theme) setTheme(u.theme);
    }
  }, []);

  // Load data when user changes
  const refreshData = useCallback(() => {
    if (!user) return;
    setCategories(db.getCategories(user.id));
    setTransactions(db.getTransactions(user.id).transactions);
    setDebts(db.getDebts(user.id));
    setBudgets(db.getBudgets(user.id));
    setSavings(db.getSavings(user.id));
    setReminders(db.getReminders(user.id));
    setNotifications(db.getNotifications(user.id));
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshData();
      db.generateNotifications(user.id);
      setNotifications(db.getNotifications(user.id));
    }
  }, [user, refreshData]);

  const login = (email: string, password: string) => {
    const result = db.login(email, password);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return { success: result.success, message: result.message };
  };

  const register = (fullName: string, email: string, password: string) => {
    const result = db.register(fullName, email, password);
    if (result.success && result.user) {
      // Auto login after register
      const loginResult = db.login(email, password);
      if (loginResult.user) setUser(loginResult.user);
    }
    return { success: result.success, message: result.message };
  };

  const logout = () => {
    db.logout();
    setUser(null);
    setCategories([]);
    setTransactions([]);
    setDebts([]);
    setBudgets([]);
    setSavings([]);
    setReminders([]);
    setNotifications([]);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return { success: false, message: 'Kirmagan' };
    const result = db.updateUser(user.id, updates);
    if (result.success) {
      const u = db.getCurrentUser();
      if (u) setUser(u);
    }
    return result;
  };

  const changePassword = (oldPw: string, newPw: string) => {
    if (!user) return { success: false, message: 'Kirmagan' };
    return db.changePassword(user.id, oldPw, newPw);
  };

  // Data actions
  const addTransaction = (data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const txn = db.addTransaction(user!.id, data);
    refreshData();
    return txn;
  };

  const updateTransaction = (id: string, data: Partial<Transaction>) => {
    const result = db.updateTransaction(id, user!.id, data);
    refreshData();
    return result;
  };

  const deleteTransaction = (id: string) => {
    const result = db.deleteTransaction(id, user!.id);
    refreshData();
    return result;
  };

  const addDebt = (data: Omit<Debt, 'id' | 'userId' | 'paidAmount' | 'remainingAmount' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const debt = db.addDebt(user!.id, data);
    refreshData();
    return debt;
  };

  const updateDebt = (id: string, data: Partial<Debt>) => {
    const result = db.updateDebt(id, user!.id, data);
    refreshData();
    return result;
  };

  const deleteDebt = (id: string) => {
    const result = db.deleteDebt(id, user!.id);
    refreshData();
    return result;
  };

  const addDebtPayment = (debtId: string, amount: number, date: string, note: string) => {
    const result = db.addDebtPayment(debtId, user!.id, amount, date, note);
    refreshData();
    return result;
  };

  const addBudget = (data: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const budget = db.addBudget(user!.id, data);
    refreshData();
    return budget;
  };

  const updateBudget = (id: string, data: Partial<Budget>) => {
    const result = db.updateBudget(id, user!.id, data);
    refreshData();
    return result;
  };

  const deleteBudget = (id: string) => {
    const result = db.deleteBudget(id, user!.id);
    refreshData();
    return result;
  };

  const addSavings = (data: Omit<SavingsGoal, 'id' | 'userId' | 'currentAmount' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const goal = db.addSavings(user!.id, data);
    refreshData();
    return goal;
  };

  const updateSavings = (id: string, data: Partial<SavingsGoal>) => {
    const result = db.updateSavings(id, user!.id, data);
    refreshData();
    return result;
  };

  const deleteSavings = (id: string) => {
    const result = db.deleteSavings(id, user!.id);
    refreshData();
    return result;
  };

  const addSavingsDeposit = (goalId: string, amount: number, date: string, note: string) => {
    const result = db.addSavingsDeposit(goalId, user!.id, amount, date, note);
    refreshData();
    return result;
  };

  const addReminder = (data: Omit<Reminder, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const reminder = db.addReminder(user!.id, data);
    refreshData();
    return reminder;
  };

  const updateReminder = (id: string, data: Partial<Reminder>) => {
    const result = db.updateReminder(id, user!.id, data);
    refreshData();
    return result;
  };

  const deleteReminder = (id: string) => {
    const result = db.deleteReminder(id, user!.id);
    refreshData();
    return result;
  };

  const addCategory = (name: string, type: 'income' | 'expense', color: string, icon: string) => {
    const cat = db.addCategory(user!.id, name, type, color, icon);
    refreshData();
    return cat;
  };

  const deleteCategory = (id: string) => {
    const result = db.deleteCategory(id, user!.id);
    refreshData();
    return result;
  };

  const markNotifRead = (id: string) => {
    db.markNotificationRead(id, user!.id);
    setNotifications(db.getNotifications(user!.id));
  };

  const markAllNotifRead = () => {
    db.markAllNotificationsRead(user!.id);
    setNotifications(db.getNotifications(user!.id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider value={{
      user, isAuthenticated: !!user, login, register, logout, updateUser, changePassword,
      theme, toggleTheme,
      categories, transactions, debts, budgets, savings, reminders, notifications, unreadCount,
      refreshData,
      addTransaction, updateTransaction, deleteTransaction,
      addDebt, updateDebt, deleteDebt, addDebtPayment,
      addBudget, updateBudget, deleteBudget,
      addSavings, updateSavings, deleteSavings, addSavingsDeposit,
      addReminder, updateReminder, deleteReminder,
      addCategory, deleteCategory,
      markNotifRead, markAllNotifRead,
      toasts, showToast, removeToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
