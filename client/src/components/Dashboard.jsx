import React from 'react';
import {
  Briefcase,
  CheckSquare,
  Users,
  PhoneCall,
  TrendingUp,
  AlertTriangle,
  Clock,
  Plus,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function Dashboard({
  projects = [],
  tasks = [],
  team = [],
  calls = [],
  setActiveTab,
  darkMode = true,
}) {
  const activeProjects = projects.filter((p) => p.status === 'In Progress');
  const pendingTasks = tasks.filter((t) => t.status !== 'Completed');
  const urgentTasks = tasks.filter((t) => t.priority === 'Urgent' && t.status !== 'Completed');
  const dealsWon = calls.filter((c) => c.outcome === 'Deal Won');

  const avgProgress =
    projects.length > 0
      ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length)
      : 0;

  const cardBg = darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200 shadow-sm';
  const innerBg = darkMode ? 'bg-slate-900/60 border-slate-700/60' : 'bg-slate-50 border-slate-200';
  const textTitle = darkMode ? 'text-white' : 'text-slate-900';
  const textSub = darkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div
        className={`${
          darkMode
            ? 'bg-gradient-to-r from-indigo-900/60 via-slate-800 to-purple-900/60 border-indigo-500/20'
            : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white border-transparent'
        } p-6 rounded-2xl border shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}
      >
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>Project Manager Command Center</span>
            <span className="text-xs bg-indigo-500/30 text-indigo-100 px-2.5 py-1 rounded-full border border-indigo-400/40">
              Live DB Sync
            </span>
          </h2>
          <p className={`${darkMode ? 'text-slate-300' : 'text-indigo-100'} text-sm mt-1`}>
            Track your team, project deadlines, customer call leads, proof attachments, and daily progress in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('calls')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition shadow-lg shadow-emerald-600/20"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Log Customer Call</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-sm font-medium transition shadow-lg shadow-indigo-600/20"
          >
            <Clock className="w-4 h-4" />
            <span>Daily Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <div
          onClick={() => setActiveTab('projects')}
          className={`${cardBg} p-5 rounded-xl border hover:border-indigo-500/50 transition cursor-pointer group`}
        >
          <div className="flex items-center justify-between">
            <span className={`${textSub} text-sm font-medium`}>Total Projects</span>
            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-500 group-hover:scale-110 transition">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className={`text-3xl font-extrabold ${textTitle}`}>{projects.length}</span>
            <span className="text-xs text-indigo-500 font-medium">
              {activeProjects.length} In Progress
            </span>
          </div>
          <div className={`mt-3 w-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'} h-1.5 rounded-full overflow-hidden`}>
            <div
              className="bg-indigo-500 h-full transition-all duration-500"
              style={{ width: `${avgProgress}%` }}
            ></div>
          </div>
          <p className={`text-xs ${textSub} mt-1.5`}>{avgProgress}% Avg Completion Rate</p>
        </div>

        {/* Pending Tasks */}
        <div
          onClick={() => setActiveTab('tasks')}
          className={`${cardBg} p-5 rounded-xl border hover:border-amber-500/50 transition cursor-pointer group`}
        >
          <div className="flex items-center justify-between">
            <span className={`${textSub} text-sm font-medium`}>Pending Tasks</span>
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500 group-hover:scale-110 transition">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className={`text-3xl font-extrabold ${textTitle}`}>{pendingTasks.length}</span>
            {urgentTasks.length > 0 ? (
              <span className="text-xs text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 font-medium">
                {urgentTasks.length} Urgent!
              </span>
            ) : (
              <span className="text-xs text-emerald-500 font-medium">On Track</span>
            )}
          </div>
          <p className={`text-xs ${textSub} mt-4`}>
            {tasks.filter((t) => t.status === 'Completed').length} tasks completed out of {tasks.length}
          </p>
        </div>

        {/* Team Members */}
        <div
          onClick={() => setActiveTab('team')}
          className={`${cardBg} p-5 rounded-xl border hover:border-purple-500/50 transition cursor-pointer group`}
        >
          <div className="flex items-center justify-between">
            <span className={`${textSub} text-sm font-medium`}>Team Members</span>
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-500 group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className={`text-3xl font-extrabold ${textTitle}`}>{team.length}</span>
            <span className="text-xs text-purple-500 font-medium">
              {team.filter((m) => m.status === 'Active').length} Active Now
            </span>
          </div>
          <p className={`text-xs ${textSub} mt-4`}>Workload balanced across team</p>
        </div>

        {/* Customer Calls & Deals */}
        <div
          onClick={() => setActiveTab('calls')}
          className={`${cardBg} p-5 rounded-xl border hover:border-emerald-500/50 transition cursor-pointer group`}
        >
          <div className="flex items-center justify-between">
            <span className={`${textSub} text-sm font-medium`}>Customer Calls & Deals</span>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition">
              <PhoneCall className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className={`text-3xl font-extrabold ${textTitle}`}>{calls.length}</span>
            <span className="text-xs text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {dealsWon.length} Deals Won 🎉
            </span>
          </div>
          <p className={`text-xs ${textSub} mt-4`}>With uploaded proof attachments</p>
        </div>
      </div>

      {/* Projects Progress & Recent Calls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects Overview */}
        <div className={`lg:col-span-2 ${cardBg} rounded-2xl border p-6 space-y-4`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${textTitle} flex items-center gap-2`}>
              <Briefcase className="w-5 h-5 text-indigo-500" />
              <span>Project Progress Tracker</span>
            </h3>
            <button
              onClick={() => setActiveTab('projects')}
              className="text-xs text-indigo-500 hover:text-indigo-600 flex items-center gap-1 font-medium"
            >
              View All ({projects.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {projects.length === 0 ? (
            <div className={`text-center py-10 ${textSub}`}>
              <p>No projects added yet.</p>
              <button
                onClick={() => setActiveTab('projects')}
                className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium"
              >
                Add Your First Project
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.slice(0, 5).map((project) => (
                <div
                  key={project._id}
                  className={`${innerBg} p-4 rounded-xl border transition`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <h4 className={`font-semibold ${textTitle} text-base`}>{project.title}</h4>
                      <p className={`text-xs ${textSub}`}>Client: {project.clientName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          project.status === 'Completed'
                            ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                            : project.status === 'In Progress'
                            ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                            : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                        }`}
                      >
                        {project.status}
                      </span>
                      <span className="text-xs font-bold text-indigo-500">
                        {project.progress || 0}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className={`w-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'} h-2 rounded-full overflow-hidden`}>
                    <div
                      className={`h-full transition-all duration-500 ${
                        project.progress === 100
                          ? 'bg-emerald-500'
                          : project.progress > 50
                          ? 'bg-indigo-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${project.progress || 0}%` }}
                    ></div>
                  </div>

                  <div className={`flex items-center justify-between mt-3 text-xs ${textSub}`}>
                    <span>
                      Deadline:{' '}
                      {project.deadline
                        ? new Date(project.deadline).toLocaleDateString()
                        : 'No deadline'}
                    </span>
                    <span>Team: {project.assignedTeam?.length || 0} members</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer Calls */}
        <div className={`${cardBg} rounded-2xl border p-6 space-y-4 flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${textTitle} flex items-center gap-2`}>
                <PhoneCall className="w-5 h-5 text-emerald-500" />
                <span>Recent Customer Calls</span>
              </h3>
              <button
                onClick={() => setActiveTab('calls')}
                className="text-xs text-emerald-500 hover:text-emerald-600 font-medium"
              >
                Log New Call
              </button>
            </div>

            {calls.length === 0 ? (
              <div className={`text-center py-8 ${textSub}`}>
                <p className="text-sm">No customer calls recorded yet.</p>
                <p className="text-xs mt-1">
                  Log call notes & proof screenshots to mark project acquisition!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {calls.slice(0, 4).map((call) => (
                  <div
                    key={call._id}
                    className={`${innerBg} p-3 rounded-xl border text-xs space-y-1`}
                  >
                    <div className={`flex items-center justify-between font-medium ${textTitle}`}>
                      <span>{call.clientName}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          call.outcome === 'Deal Won'
                            ? 'bg-emerald-500/20 text-emerald-500'
                            : call.outcome === 'Interested'
                            ? 'bg-blue-500/20 text-blue-500'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {call.outcome}
                      </span>
                    </div>
                    <p className={`${textSub} line-clamp-2`}>{call.notes}</p>
                    {call.proofFiles && call.proofFiles.length > 0 && (
                      <div className="text-[10px] text-emerald-500 font-medium flex items-center gap-1 mt-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{call.proofFiles.length} Proof File(s) Attached</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`pt-4 border-t ${darkMode ? 'border-slate-700/60' : 'border-slate-200'}`}>
            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full py-2.5 ${
                darkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              } text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2`}
            >
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>Generate Full Daily Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
