import React, { useState } from 'react';
import { Shield, Lock, Mail, AlertTriangle, ArrowRight, CheckCircle2, Zap, BarChart3, Users } from 'lucide-react';
import axios from 'axios';

export default function Login({ onLoginSuccess, systemName = 'Team Manager', logoUrl = '', darkMode = true }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cardBg = darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200 shadow-2xl';
  const textTitle = darkMode ? 'text-white' : 'text-slate-900';
  const textSub = darkMode ? 'text-slate-400' : 'text-slate-500';
  const inputBg = darkMode ? 'bg-slate-950/80 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/login', { email, password });
      onLoginSuccess(res.data.token, res.data.user);
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to backend server. Please ensure backend port 5000 is active.');
      } else {
        setError(err.response?.data?.error || 'Login failed. Please check your email and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-950 relative overflow-hidden">
      {/* Background Decorative Glow Meshes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Side: Brand Showcase Highlights */}
        <div className="space-y-6 text-white hidden lg:block pr-4">
          <div className="flex items-center space-x-3">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <Shield className="w-7 h-7 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">{systemName || 'Team Manager'}</h1>
              <p className="text-xs text-indigo-400 font-semibold">Enterprise Project & Team Suite</p>
            </div>
          </div>

          <h2 className="text-3xl font-black leading-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
            Manage Projects, Teams, & Customer Calls in Real-time.
          </h2>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <Zap className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <p className="font-bold text-white">Live Development Pipeline</p>
                <p className="text-slate-400 text-[11px]">Track progress from Planning, QA, to Post-Handover updates.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <BarChart3 className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <p className="font-bold text-white">Industry Sector Analytics</p>
                <p className="text-slate-400 text-[11px]">Analyze Salon, E-Commerce, and top project sectors.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <Users className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-white">Team Leaders & Workload Hierarchy</p>
                <p className="text-slate-400 text-[11px]">Assign members under Team Leaders and track daily output.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Glassmorphism Login Form */}
        <div className={`${cardBg} backdrop-blur-2xl rounded-3xl border p-8 space-y-6 shadow-2xl relative`}>
          <div className="text-center space-y-2">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain mx-auto" />
            ) : (
              <Shield className="w-10 h-10 text-indigo-500 mx-auto" />
            )}
            <h2 className={`text-2xl font-bold ${textTitle}`}>{systemName || 'Team Manager'}</h2>
            <p className={`${textSub} text-xs`}>
              Sign in to access your Project & Team Workstation
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-xs font-semibold text-center flex items-center gap-2 justify-center">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div>
              <label className={`block ${textSub} mb-1 font-medium text-xs`}>Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@promanager.com"
                  className={`w-full pl-9 pr-3 py-3 ${inputBg} rounded-xl focus:outline-none focus:border-indigo-500 text-xs transition`}
                />
              </div>
            </div>

            <div>
              <label className={`block ${textSub} mb-1 font-medium text-xs`}>Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-3 py-3 ${inputBg} rounded-xl focus:outline-none focus:border-indigo-500 text-xs transition`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Sign In To Workstation</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
