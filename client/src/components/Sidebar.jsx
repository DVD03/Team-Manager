import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  PhoneCall,
  Activity,
  FileText,
  Sun,
  Moon,
  ShieldCheck,
  LogOut,
  UserCheck,
  FolderPlus,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Settings,
  Shield,
  Menu,
  X,
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  currentUser,
  onLogout,
  isCollapsed,
  setIsCollapsed,
  systemName = 'Team Manager',
  logoUrl = '',
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = currentUser && currentUser.role === 'Admin';

  const navItems = isAdmin
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'projects', label: 'Projects Pipeline', icon: Briefcase },
        { id: 'tasks', label: 'Task Kanban', icon: CheckSquare },
        { id: 'team', label: 'Team & Hierarchy', icon: Users },
        { id: 'calls', label: 'Calls & Proofs', icon: PhoneCall },
        { id: 'worklogs', label: 'Daily Work Logs', icon: FolderPlus },
        { id: 'updates', label: 'Project Updates', icon: Activity },
        { id: 'analytics', label: 'Analytics & Sector Reports', icon: BarChart3 },
        { id: 'reports', label: 'In-Detail Daily Report', icon: FileText },
        { id: 'audit', label: 'System Audit Logs', icon: ShieldCheck },
        { id: 'settings', label: 'Settings & Branding', icon: Settings },
      ]
    : [
        { id: 'mywork', label: 'My Workstation', icon: UserCheck },
        { id: 'worklogs', label: 'Daily Work Logs', icon: FolderPlus },
        { id: 'calls', label: 'Calls & Proofs', icon: PhoneCall },
        { id: 'updates', label: 'Project Updates', icon: Activity },
      ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Sticky Bar */}
      <div
        className={`md:hidden fixed top-0 left-0 right-0 z-40 h-14 px-4 flex items-center justify-between border-b ${
          darkMode ? 'bg-slate-900/95 border-slate-800 text-white' : 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
        } backdrop-blur`}
      >
        <div className="flex items-center space-x-2">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-6 h-6 object-contain" />
          ) : (
            <Shield className="w-6 h-6 text-indigo-500" />
          )}
          <span className="font-bold text-sm truncate">{systemName || 'Team Manager'}</span>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`p-2 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        />
      )}

      {/* Responsive Sidebar Container (Mobile Drawer + Desktop Fixed) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col justify-between transition-all duration-300 border-r ${
          darkMode ? 'bg-slate-900/95 border-slate-800 text-slate-100' : 'bg-white/95 border-slate-200 text-slate-800 shadow-xl'
        } backdrop-blur ${
          mobileOpen
            ? 'translate-x-0 w-64'
            : '-translate-x-full md:translate-x-0 ' + (isCollapsed ? 'md:w-20' : 'md:w-64')
        }`}
      >
        {/* Sidebar Header & Toggle */}
        <div className="p-3 border-b border-slate-700/40">
          {!isCollapsed || mobileOpen ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2.5 overflow-hidden">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-7 h-7 object-contain shrink-0" />
                ) : (
                  <Shield className="w-6 h-6 text-indigo-500 shrink-0" />
                )}
                <div className="truncate">
                  <h1 className="text-sm font-bold tracking-tight truncate">{systemName || 'Team Manager'}</h1>
                  <p className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>MongoDB Live</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (mobileOpen) setMobileOpen(false);
                  else setIsCollapsed(true);
                }}
                className={`p-1.5 rounded-xl border transition shrink-0 ${
                  darkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                }`}
              >
                {mobileOpen ? <X className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2 py-1">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-7 h-7 object-contain" />
              ) : (
                <Shield className="w-6 h-6 text-indigo-500" />
              )}
              <button
                onClick={() => setIsCollapsed(false)}
                className={`p-1.5 rounded-xl border transition ${
                  darkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                }`}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1.5 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center ${
                  isCollapsed && !mobileOpen ? 'justify-center px-2 py-3' : 'space-x-3 px-3.5 py-3'
                } rounded-2xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-[1.02]'
                    : darkMode
                    ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={isCollapsed && !mobileOpen ? item.label : ''}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {(!isCollapsed || mobileOpen) && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Footer Profile & Actions */}
        <div className="p-2.5 border-t border-slate-700/40 space-y-2">
          {currentUser && (!isCollapsed || mobileOpen) && (
            <div className={`flex items-center space-x-3 p-2.5 rounded-xl border ${darkMode ? 'border-slate-800 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold truncate">{currentUser.name}</p>
                <span className={`text-[9px] font-extrabold uppercase ${isAdmin ? 'text-purple-400' : 'text-emerald-400'}`}>
                  {currentUser.role}
                </span>
              </div>
            </div>
          )}

          <div className={`flex items-center ${isCollapsed && !mobileOpen ? 'flex-col gap-2' : 'justify-between gap-1'}`}>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl border transition flex items-center justify-center gap-2 text-xs font-medium ${
                isCollapsed && !mobileOpen ? 'w-full' : 'flex-1'
              } ${
                darkMode
                  ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-300 text-indigo-600 hover:bg-slate-200'
              }`}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400 shrink-0" /> : <Moon className="w-4 h-4 text-indigo-600 shrink-0" />}
              {(!isCollapsed || mobileOpen) && <span>{darkMode ? 'Light' : 'Dark'}</span>}
            </button>

            <button
              onClick={onLogout}
              className={`p-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 rounded-xl transition text-xs font-medium flex items-center justify-center gap-1 ${
                isCollapsed && !mobileOpen ? 'w-full' : ''
              }`}
            >
              <LogOut className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
