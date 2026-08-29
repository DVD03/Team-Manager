import React from 'react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  PhoneCall,
  Activity,
  FileText,
  Sparkles,
  Sun,
  Moon,
  ShieldCheck,
  LogOut,
  UserCheck,
  FolderPlus,
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  currentUser,
  onLogout,
}) {
  const isAdmin = currentUser && currentUser.role === 'Admin';

  const navItems = isAdmin
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'projects', label: 'Projects', icon: Briefcase },
        { id: 'tasks', label: 'Task Board', icon: CheckSquare },
        { id: 'team', label: 'Team Members', icon: Users },
        { id: 'calls', label: 'Calls & Proofs', icon: PhoneCall },
        { id: 'worklogs', label: 'Daily Work Logs', icon: FolderPlus },
        { id: 'updates', label: 'Updates', icon: Activity },
        { id: 'reports', label: 'Daily Report', icon: FileText },
        { id: 'audit', label: 'Audit Logs', icon: ShieldCheck },
      ]
    : [
        { id: 'mywork', label: 'My Workstation', icon: UserCheck },
        { id: 'worklogs', label: 'Daily Work Logs', icon: FolderPlus },
        { id: 'calls', label: 'Calls & Proofs', icon: PhoneCall },
        { id: 'updates', label: 'Project Updates', icon: Activity },
      ];

  return (
    <header
      className={`${
        darkMode
          ? 'bg-slate-800/90 border-slate-700/80'
          : 'bg-white/90 border-slate-200 shadow-sm'
      } backdrop-blur border-b sticky top-0 z-40 transition-colors duration-300`}
    >
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="shrink-0">
              <h1
                className={`text-xl font-bold whitespace-nowrap ${
                  darkMode
                    ? 'bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent'
                    : 'text-slate-900'
                }`}
              >
                ProManager A-Z
              </h1>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="whitespace-nowrap">MongoDB Connected</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2 overflow-x-auto py-1 scrollbar-none">
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                        : darkMode
                        ? 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive
                          ? 'text-white'
                          : darkMode
                          ? 'text-slate-400'
                          : 'text-slate-500'
                      }`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* User Profile Info */}
            {currentUser && (
              <div className={`hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl border ${darkMode ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-slate-100'} text-xs shrink-0`}>
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col text-left">
                  <span className={`font-bold truncate max-w-[100px] ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {currentUser.name}
                  </span>
                  <span className={`text-[9px] font-extrabold uppercase ${isAdmin ? 'text-purple-400' : 'text-emerald-400'}`}>
                    {currentUser.role}
                  </span>
                </div>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold shrink-0 ${
                darkMode
                  ? 'bg-slate-700/80 border-slate-600 text-amber-300 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-300 text-indigo-600 hover:bg-slate-200'
              }`}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 shrink-0" />
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="p-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 rounded-xl transition text-xs font-medium shrink-0 flex items-center gap-1"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div
        className={`lg:hidden flex overflow-x-auto px-4 py-2 border-t space-x-1 scrollbar-none ${
          darkMode ? 'border-slate-700/50 bg-slate-800' : 'border-slate-200 bg-slate-50'
        }`}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : darkMode
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
