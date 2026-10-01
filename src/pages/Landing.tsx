import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Shield, TrendingUp, PieChart, Bell, Calendar, ArrowRight, CheckCircle, ChevronDown } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">HISOBCHI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-emerald-600 transition-colors">
              Kirish
            </Link>
            <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors">
              Boshlash
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-full text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" /> Shaxsiy moliyaviy boshqaruv platformasi
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
            Pulni boshqaring.<br />
            <span className="text-emerald-500">Maqsadlaringizni</span> boshqaring.
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Daromad, xarajat, qarz, byudjet, jamg'arma va moliyaviy hisobotlarni bitta platformada boshqaring. HISOBCHI — sizning shaxsiy moliyaviy yordamchingiz.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 text-white rounded-xl text-lg font-semibold hover:bg-emerald-600 transition-all hover:shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2">
              Boshlash <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-8 py-3.5 border-2 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 rounded-xl text-lg font-semibold hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-2">
              Kirish
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50 dark:bg-slate-800/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Barcha moliyaviy imkoniyatlar</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">HISOBCHI sizning moliyaviy hayotingizni to'liq boshqarish uchun kerakli barcha vositalarni taqdim etadi.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: TrendingUp, title: 'Daromad va xarajat', desc: 'Barcha tranzaksiyalaringizni kuzatib boring va tahlil qiling.' },
              { icon: PieChart, title: 'Byudjet boshqaruvi', desc: 'Har bir kategoriya uchun byudjet yarating va xarajatlarni nazorat qiling.' },
              { icon: Shield, title: 'Qarz boshqaruvi', desc: 'Qarz olgan va bergan pullaringizni hisoblang va kuzatib boring.' },
              { icon: Calendar, title: 'Eslatmalar', desc: 'Muhim to\'lovlar va muddatlarni eslatma orqali unutmang.' },
              { icon: Bell, title: 'Moliyaviy hisobotlar', desc: 'Daromad, xarajat va byudjet bo\'yicha batafsil hisobotlar.' },
              { icon: Zap, title: 'Jamg\'arma maqsadlari', desc: 'Moliyaviy maqsadlaringizga erishish uchun jamg\'arma yarating.' },
            ].map((f, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 card-hover">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Qanday ishlaydi?</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Ro\'yxatdan o\'ting', desc: 'Bepul akkaunt yarating va HISOBCHI ni ishga tushiring.' },
              { step: '2', title: 'Ma\'lumotlarni kiriting', desc: 'Daromad va xarajatlaringizni qo\'shing, byudjet yarating.' },
              { step: '3', title: 'Moliyangizni boshqaring', desc: 'Hisobotlar va tahlillar orqali moliyaviy qarorlar qabul qiling.' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{s.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-20 bg-gray-50 dark:bg-slate-800/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Xavfsiz va ishonchli</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Sizning moliyaviy ma'lumotlaringiz to'liq himoyalangan. Har bir foydalanuvchining ma'lumotlari alohida saqlanadi va boshqalarga ko'rinmaydi.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {['Shaxsiy ma\'lumotlar himoyasi', 'Xavfsiz autentifikatsiya', 'Ma\'lumotlar shifrlash'].map((item, i) => (
              <div key={i} className="flex items-center gap-2 justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">Ko'p beriladigan savollar</h2>
          <div className="space-y-4">
            {[
              { q: 'HISOBCHI bepulmi?', a: 'Ha, HISOBCHI to\'liq bepul. Barcha funksiyalardan cheklovsiz foydalanishingiz mumkin.' },
              { q: 'Ma\'lumotlarim xavfsizmi?', a: 'Ha, barcha ma\'lumotlar shifrlangan holda saqlanadi va faqat sizga ko\'rinadi.' },
              { q: 'Qanday valyutalarni qo\'llab-quvvatlaydi?', a: 'HISOBCHI asosan O\'zbek so\'mi (UZS) da ishlaydi. Boshqa valyutalar ham qo\'shilishi mumkin.' },
              { q: 'Mobil qurilmalarda ishlaydimi?', a: 'Ha, HISOBCHI to\'liq responsiv dizaynga ega va barcha qurilmalarda ishlaydi.' },
            ].map((faq, i) => (
              <details key={i} className="group bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer text-gray-900 dark:text-white font-medium">
                  {faq.q}
                  <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="px-6 pb-4 text-gray-600 dark:text-gray-400 text-sm">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Moliyaviy erkinlikka birinchi qadam</h2>
          <p className="text-emerald-100 mb-8 max-w-lg mx-auto">Hoziroq ro'yxatdan o'ting va pulingizni to'liq nazorat qiling.</p>
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-emerald-600 rounded-xl text-lg font-semibold hover:bg-emerald-50 transition-colors">
            Bepul boshlash <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-100 dark:border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">HISOBCHI</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">© 2024 HISOBCHI. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>
    </div>
  );
}
