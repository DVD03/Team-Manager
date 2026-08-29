import React, { useState } from 'react';
import { Shield, Lock, Mail, AlertTriangle, ArrowRight, Zap, BarChart3, Users, CheckCircle } from 'lucide-react';
import axios from 'axios';

export default function Login({ onLoginSuccess, systemName = 'Team Manager', logoUrl = '', darkMode = true }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      onLoginSuccess(res.data.token, res.data.user);
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to server. Please try again.');
      } else {
        setError(err.response?.data?.error || 'Login failed. Check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Zap, label: 'Live Project Pipeline', desc: 'Track progress from Planning to Post-Handover.' },
    { icon: BarChart3, label: 'Sector Analytics Hub', desc: 'Salon, E-Commerce & industry-wise reports.' },
    { icon: Users, label: 'Team Leader Hierarchy', desc: 'Assign members under leaders, track workload.' },
    { icon: CheckCircle, label: 'Daily Audit Reports', desc: 'A-Z employee output & call conversion rates.' },
  ];

  if (darkMode) {
    return (
      <div className="min-h-screen w-full flex items-stretch bg-[#080c14] overflow-hidden relative">
        {/* Ambient Background Blobs */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-700/20 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/4" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-700/20 rounded-full blur-[120px] pointer-events-none translate-x-1/3 translate-y-1/4" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[80px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />

        {/* Left Panel */}
        <div className="hidden lg:flex flex-col justify-between w-[52%] px-16 py-14 relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-9 h-9 object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Shield className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <span className="text-white font-bold text-lg tracking-tight">{systemName}</span>
              <p className="text-indigo-400 text-[10px] font-semibold uppercase tracking-widest">Enterprise Suite</p>
            </div>
          </div>

          {/* Hero Text */}
          <div className="space-y-8">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-indigo-300 text-xs font-semibold">MongoDB Live Cloud Sync</span>
              </div>
              <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight">
                Manage Projects,<br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Teams & Calls
                </span>
                <br />in Real-time.
              </h1>
              <p className="text-slate-400 text-base leading-relaxed max-w-md">
                An enterprise-grade workstation for project managers, team leaders, and field teams — all in one place.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-2 gap-3">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="group p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-indigo-500/30 transition-all duration-300">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-3 group-hover:bg-indigo-500/20 transition-colors">
                      <Icon className="w-4 h-4 text-indigo-400" />
                    </div>
                    <p className="text-white text-xs font-bold mb-1">{f.label}</p>
                    <p className="text-slate-500 text-[11px] leading-snug">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Tag */}
          <div className="text-slate-600 text-xs">
            © {new Date().getFullYear()} {systemName} · Enterprise Project & Team Suite
          </div>
        </div>

        {/* Right Panel — Login Card */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
          <div className="w-full max-w-[400px]">
            {/* Card */}
            <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl shadow-black/40">
              {/* Card Header */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain" />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
                      <Shield className="w-7 h-7 text-white" />
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white">{systemName}</h2>
                <p className="text-slate-400 text-xs mt-1">Sign in to your workstation</p>
              </div>

              {error && (
                <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="text-rose-300 text-xs leading-snug">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-xs font-semibold pl-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@promanager.com"
                      className="w-full pl-10 pr-4 py-3 bg-white/[0.05] border border-white/[0.08] text-white text-xs rounded-xl focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.07] placeholder-slate-600 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-xs font-semibold pl-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-white/[0.05] border border-white/[0.08] text-white text-xs rounded-xl focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.07] placeholder-slate-600 transition-all"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to Workstation</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider + Info */}
              <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-slate-500 text-[11px]">Secured with JWT · MongoDB Atlas Cloud</span>
              </div>
            </div>

            {/* Bottom text for mobile */}
            <p className="text-center text-slate-600 text-xs mt-6 lg:hidden">
              {systemName} · Enterprise Project & Team Suite
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ===================== LIGHT MODE ===================== */
  return (
    <div className="min-h-screen w-full flex items-stretch bg-slate-50 overflow-hidden relative">
      {/* Subtle Light Background Orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 -translate-y-1/4 opacity-80" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-100 rounded-full blur-[100px] pointer-events-none translate-x-1/3 translate-y-1/4 opacity-80" />

      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] px-16 py-14 relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-9 h-9 object-contain" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <Shield className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <span className="text-slate-900 font-bold text-lg tracking-tight">{systemName}</span>
            <p className="text-indigo-500 text-[10px] font-semibold uppercase tracking-widest">Enterprise Suite</p>
          </div>
        </div>

        {/* Hero Text */}
        <div className="space-y-8">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-700 text-xs font-semibold">MongoDB Live Cloud Sync</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Manage Projects,<br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                Teams & Calls
              </span>
              <br />in Real-time.
            </h1>
            <p className="text-slate-500 text-base leading-relaxed max-w-md">
              An enterprise-grade workstation for project managers, team leaders, and field teams — all in one place.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 gap-3">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="group p-4 rounded-2xl bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50 transition-all duration-300 shadow-sm">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition-colors">
                    <Icon className="w-4 h-4 text-indigo-600" />
                  </div>
                  <p className="text-slate-800 text-xs font-bold mb-1">{f.label}</p>
                  <p className="text-slate-400 text-[11px] leading-snug">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-slate-400 text-xs">
          © {new Date().getFullYear()} {systemName} · Enterprise Project & Team Suite
        </div>
      </div>

      {/* Right Panel — Login Card */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-[400px]">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl shadow-slate-200/60">
            {/* Card Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{systemName}</h2>
              <p className="text-slate-400 text-xs mt-1">Sign in to your workstation</p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="text-rose-600 text-xs leading-snug">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-slate-600 text-xs font-semibold pl-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@promanager.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl focus:outline-none focus:border-indigo-400 focus:bg-white placeholder-slate-300 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 text-xs font-semibold pl-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl focus:outline-none focus:border-indigo-400 focus:bg-white placeholder-slate-300 transition-all shadow-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300/50 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-60"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Workstation</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-slate-400 text-[11px]">Secured with JWT · MongoDB Atlas Cloud</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
