import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjectTracker from './components/ProjectTracker';
import TaskBoard from './components/TaskBoard';
import TeamManager from './components/TeamManager';
import CallLogger from './components/CallLogger';
import ProjectUpdateFeed from './components/ProjectUpdateFeed';
import DailyReport from './components/DailyReport';
import MyWorkDashboard from './components/MyWorkDashboard';
import AuditLogViewer from './components/AuditLogViewer';
import DailyWorkLogFeed from './components/DailyWorkLogFeed';
import AnalyticsReport from './components/AnalyticsReport';
import SettingsManager from './components/SettingsManager';
import Login from './components/Login';
import axios from 'axios';

// Configure Production API Base URL if deployed on Vercel connecting to Render
if (import.meta.env.VITE_API_BASE_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('pm_token') || '');
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('pm_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProjectIdForTasks, setSelectedProjectIdForTasks] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('pm_theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  const [settings, setSettings] = useState({ systemName: 'Team Manager', logoUrl: '' });
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [team, setTeam] = useState([]);
  const [calls, setCalls] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'Member') {
        setActiveTab('mywork');
      } else {
        setActiveTab('dashboard');
      }
    }
  }, [currentUser?.role]);

  useEffect(() => {
    localStorage.setItem('pm_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchAllData();
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/settings');
      if (res.data) {
        setSettings(res.data);
        document.title = res.data.systemName || 'Team Manager';
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoginSuccess = (newToken, user) => {
    localStorage.setItem('pm_token', newToken);
    localStorage.setItem('pm_user', JSON.stringify(user));
    setToken(newToken);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('pm_token');
    localStorage.removeItem('pm_user');
    setToken('');
    setCurrentUser(null);
  };

  const handleNavigateToTasks = (projectId) => {
    setSelectedProjectIdForTasks(projectId);
    setActiveTab('tasks');
  };

  const fetchAllData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [projRes, taskRes, teamRes, callRes, updateRes] = await Promise.all([
        axios.get('/api/projects'),
        axios.get('/api/tasks'),
        axios.get('/api/team'),
        axios.get('/api/calls'),
        axios.get('/api/updates'),
      ]);

      setProjects(projRes.data);
      setTasks(taskRes.data);
      setTeam(teamRes.data);
      setCalls(callRes.data);
      setUpdates(updateRes.data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token || !currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} systemName={settings.systemName} logoUrl={settings.logoUrl} darkMode={darkMode} />;
  }

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 flex flex-col md:flex-row ${
        darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'
      }`}
    >
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currentUser={currentUser}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        systemName={settings.systemName}
        logoUrl={settings.logoUrl}
      />

      {/* Main Content Area with Mobile & Desktop Responsive Margin/Padding */}
      <div
        className={`flex-1 transition-all duration-300 min-h-screen mt-14 md:mt-0 ${
          isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className={darkMode ? 'text-slate-400 text-sm' : 'text-slate-600 text-sm'}>
                Loading Data & Syncing DB...
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard
                  projects={projects}
                  tasks={tasks}
                  team={team}
                  calls={calls}
                  setActiveTab={setActiveTab}
                  darkMode={darkMode}
                />
              )}

              {activeTab === 'mywork' && (
                <MyWorkDashboard
                  currentUser={currentUser}
                  tasks={tasks}
                  projects={projects}
                  calls={calls}
                  updates={updates}
                  onRefresh={fetchAllData}
                  darkMode={darkMode}
                />
              )}

              {activeTab === 'projects' && (
                <ProjectTracker
                  projects={projects}
                  team={team}
                  calls={calls}
                  onRefresh={fetchAllData}
                  onNavigateToTasks={handleNavigateToTasks}
                  darkMode={darkMode}
                />
              )}

              {activeTab === 'tasks' && (
                <TaskBoard
                  tasks={tasks}
                  projects={projects}
                  team={team}
                  onRefresh={fetchAllData}
                  selectedProjectId={selectedProjectIdForTasks}
                  darkMode={darkMode}
                />
              )}

              {activeTab === 'team' && (
                <TeamManager
                  team={team}
                  onRefresh={fetchAllData}
                  darkMode={darkMode}
                />
              )}

              {activeTab === 'calls' && (
                <CallLogger
                  calls={calls}
                  projects={projects}
                  team={team}
                  onRefresh={fetchAllData}
                  darkMode={darkMode}
                />
              )}

              {activeTab === 'worklogs' && (
                <DailyWorkLogFeed
                  projects={projects}
                  currentUser={currentUser}
                  darkMode={darkMode}
                />
              )}

              {activeTab === 'updates' && (
                <ProjectUpdateFeed
                  updates={updates}
                  projects={projects}
                  team={team}
                  onRefresh={fetchAllData}
                  darkMode={darkMode}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsReport
                  projects={projects}
                  tasks={tasks}
                  team={team}
                  calls={calls}
                  darkMode={darkMode}
                />
              )}

              {activeTab === 'reports' && (
                <DailyReport team={team} darkMode={darkMode} />
              )}

              {activeTab === 'audit' && (
                <AuditLogViewer darkMode={darkMode} />
              )}

              {activeTab === 'settings' && (
                <SettingsManager
                  settings={settings}
                  onSaveSettings={(newSettings) => {
                    setSettings(newSettings);
                    document.title = newSettings.systemName;
                  }}
                  darkMode={darkMode}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
