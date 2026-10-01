import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { getInitials, cn } from '../lib/utils';
import { User, Mail, Lock, Globe, LogOut, Save, Eye, EyeOff } from 'lucide-react';

export function Profile() {
  const { user, updateUser, changePassword, logout, showToast } = useApp();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [currency, setCurrency] = useState(user?.currency || 'UZS');
  const [showPwForm, setShowPwForm] = useState(false);
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    const result = updateUser({ fullName: fullName.trim(), currency });
    showToast(result.message, result.success ? 'success' : 'error');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPw || !newPw || !confirmPw) { showToast('Barcha maydonlarni to\'ldiring.', 'error'); return; }
    if (newPw.length < 8) { showToast('Parol kamida 8 ta belgidan iborat bo\'lishi kerak.', 'error'); return; }
    if (newPw !== confirmPw) { showToast('Parollar mos kelmayapti.', 'error'); return; }
    const result = changePassword(oldPw, newPw);
    showToast(result.message, result.success ? 'success' : 'error');
    if (result.success) {
      setOldPw(''); setNewPw(''); setConfirmPw('');
      setShowPwForm(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profil</h1>

      {/* Avatar & Info */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {user?.avatar ? <img src={user.avatar} alt="" className="w-16 h-16 rounded-full object-cover" /> : getInitials(user?.fullName || 'U')}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{user?.fullName}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Ro'yxatdan o'tgan: {new Date(user?.createdAt || '').toLocaleDateString('uz-Latn-UZ')}
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To'liq ism</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" value={user?.email || ''} disabled className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-gray-400 text-sm cursor-not-allowed" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valyuta</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm">
                <option value="UZS">UZS — O'zbek so'mi</option>
                <option value="USD">USD — AQSh dollari</option>
                <option value="EUR">EUR — Yevro</option>
                <option value="RUB">RUB — Rossiya rubli</option>
              </select>
            </div>
          </div>

          <button type="submit" className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors">
            <Save className="w-4 h-4" /> Saqlash
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5" /> Parolni o'zgartirish
          </h3>
          <button onClick={() => setShowPwForm(!showPwForm)} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            {showPwForm ? 'Bekor qilish' : 'O\'zgartirish'}
          </button>
        </div>

        {showPwForm && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Joriy parol</label>
              <div className="relative">
                <input type={showOldPw ? 'text' : 'password'} value={oldPw} onChange={e => setOldPw(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm pr-10" />
                <button type="button" onClick={() => setShowOldPw(!showOldPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showOldPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Yangi parol</label>
              <div className="relative">
                <input type={showNewPw ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm pr-10" />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Yangi parolni tasdiqlang</label>
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm" />
            </div>
            <button type="submit" className="px-4 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors">
              Parolni yangilash
            </button>
          </form>
        )}
      </div>

      {/* Logout */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700">
        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
          <LogOut className="w-4 h-4" /> Chiqish
        </button>
      </div>
    </div>
  );
}

export function Settings() {
  const { theme, toggleTheme, user, updateUser, showToast } = useApp();

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sozlamalar</h1>

      {/* Theme */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Mavzu</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => { if (theme !== 'light') toggleTheme(); }}
            className={cn("p-4 rounded-xl border-2 transition-colors text-left",
              theme === 'light' ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "border-gray-200 dark:border-slate-600"
            )}
          >
            <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg mb-2" />
            <p className="font-medium text-gray-900 dark:text-white text-sm">Yorug' rejim</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Oq fon, qora matn</p>
          </button>
          <button
            onClick={() => { if (theme !== 'dark') toggleTheme(); }}
            className={cn("p-4 rounded-xl border-2 transition-colors text-left",
              theme === 'dark' ? "border-emerald-500 bg-emerald-900/20" : "border-gray-200 dark:border-slate-600"
            )}
          >
            <div className="w-8 h-8 bg-slate-800 rounded-lg mb-2" />
            <p className="font-medium text-gray-900 dark:text-white text-sm">Qorong'u rejim</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Qora fon, oq matn</p>
          </button>
        </div>
      </div>

      {/* Language */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Til</h3>
        <select
          value={user?.language || 'uz'}
          onChange={e => {
            const result = updateUser({ language: e.target.value });
            showToast(result.message, result.success ? 'success' : 'error');
          }}
          className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
        >
          <option value="uz">O'zbekcha</option>
          <option value="ru">Русский</option>
          <option value="en">English</option>
        </select>
      </div>

      {/* About */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Ilova haqida</h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p><span className="font-medium text-gray-900 dark:text-white">HISOBCHI</span> — Shaxsiy moliyaviy boshqaruv platformasi</p>
          <p>Versiya: 1.0.0</p>
          <p>Pulni boshqaring. Maqsadlaringizni boshqaring.</p>
        </div>
      </div>
    </div>
  );
}
