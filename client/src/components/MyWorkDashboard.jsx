import React, { useState } from 'react';
import {
  CheckSquare,
  Briefcase,
  PhoneCall,
  Clock,
  User,
  ShieldCheck,
  Plus,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import axios from 'axios';

export default function MyWorkDashboard({
  currentUser,
  tasks = [],
  projects = [],
  calls = [],
  updates = [],
  onRefresh,
  darkMode = true,
}) {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    project: '',
    updateTitle: '',
    description: '',
    progressPercentage: '',
  });

  const cardBg = darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200 shadow-sm';
  const innerBg = darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200';
  const textTitle = darkMode ? 'text-white' : 'text-slate-900';
  const textSub = darkMode ? 'text-slate-400' : 'text-slate-500';
  const inputBg = darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900';

  // Filter tasks assigned to current user
  const myTasks = tasks.filter((t) => t.assignedTo && (t.assignedTo._id === currentUser.teamMemberId || t.assignedTo._id === currentUser.id));
  const myProjects = projects.filter((p) =>
    p.assignedTeam && p.assignedTeam.some((m) => m._id === currentUser.teamMemberId || m._id === currentUser.id)
  );
  const myCalls = calls.filter((c) => c.loggedBy && (c.loggedBy._id === currentUser.teamMemberId || c.loggedBy._id === currentUser.id));

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await axios.put(`/api/tasks/${taskId}`, { status: newStatus });
      onRefresh();
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  const handlePostUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/updates', {
        ...updateFormData,
        progressPercentage: updateFormData.progressPercentage !== '' ? Number(updateFormData.progressPercentage) : undefined,
      });
      setShowUpdateModal(false);
      setUpdateFormData({ project: '', updateTitle: '', description: '', progressPercentage: '' });
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to post update');
    }
  };

  return (
    <div className="space-y-6">
      {/* Personalized Welcome Header */}
      <div className={`bg-gradient-to-r from-purple-900/70 via-slate-800 to-indigo-900/70 p-6 rounded-2xl border ${darkMode ? 'border-purple-500/20' : 'border-purple-200 shadow-lg'} flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}>
        <div>
          <span className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30 font-bold uppercase tracking-wider">
            Team Member Workstation
          </span>
          <h2 className="text-2xl font-bold text-white mt-2 flex items-center gap-2">
            <span>Welcome back, {currentUser.name}!</span>
          </h2>
          <p className="text-slate-300 text-sm mt-1">
            Here is your personalized dashboard for your assigned tasks, projects, and call logs.
          </p>
        </div>
        <button
          onClick={() => {
            setUpdateFormData({
              project: myProjects.length > 0 ? myProjects[0]._id : '',
              updateTitle: '',
              description: '',
              progressPercentage: '',
            });
            setShowUpdateModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm rounded-xl transition shadow-lg shadow-purple-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Post Work Progress Update</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`${cardBg} p-5 rounded-xl border flex items-center justify-between`}>
          <div>
            <span className={`${textSub} text-xs font-semibold`}>My Assigned Tasks</span>
            <p className={`text-2xl font-bold ${textTitle} mt-1`}>{myTasks.length}</p>
            <span className="text-[10px] text-emerald-500 font-medium">
              {myTasks.filter((t) => t.status === 'Completed').length} Completed
            </span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>

        <div className={`${cardBg} p-5 rounded-xl border flex items-center justify-between`}>
          <div>
            <span className={`${textSub} text-xs font-semibold`}>My Projects</span>
            <p className={`text-2xl font-bold ${textTitle} mt-1`}>{myProjects.length}</p>
            <span className="text-[10px] text-indigo-500 font-medium">Assigned Team Member</span>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className={`${cardBg} p-5 rounded-xl border flex items-center justify-between`}>
          <div>
            <span className={`${textSub} text-xs font-semibold`}>Customer Calls Logged</span>
            <p className={`text-2xl font-bold ${textTitle} mt-1`}>{myCalls.length}</p>
            <span className="text-[10px] text-emerald-500 font-bold">
              {myCalls.filter((c) => c.outcome === 'Deal Won').length} Deals Won 🎉
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <PhoneCall className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* My Tasks Section */}
      <div className={`${cardBg} rounded-2xl border p-6 space-y-4`}>
        <h3 className={`text-lg font-bold ${textTitle} flex items-center gap-2`}>
          <CheckSquare className="w-5 h-5 text-amber-500" />
          <span>My Assigned Tasks ({myTasks.length})</span>
        </h3>

        {myTasks.length === 0 ? (
          <div className={`text-center py-8 ${textSub} text-xs italic`}>
            You currently have no tasks assigned to you.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myTasks.map((task) => {
              const isOverdue =
                task.deadline &&
                new Date(task.deadline) < new Date() &&
                task.status !== 'Completed';

              return (
                <div
                  key={task._id}
                  className={`${innerBg} rounded-xl border p-4 space-y-3 shadow-sm hover:border-amber-500/40 transition`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className={`font-bold ${textTitle} text-sm`}>{task.title}</h4>
                      {task.project && (
                        <span className="text-[10px] text-indigo-500 font-medium">
                          📁 Project: {task.project.title}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                        task.priority === 'Urgent'
                          ? 'bg-rose-500/20 text-rose-500'
                          : task.priority === 'High'
                          ? 'bg-amber-500/20 text-amber-500'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  {task.description && (
                    <p className={`${textSub} text-xs line-clamp-2`}>{task.description}</p>
                  )}

                  {/* Status Dropdown */}
                  <div className={`flex items-center justify-between pt-2 border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'} text-xs`}>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span className={isOverdue ? 'text-rose-500 font-bold' : ''}>
                        {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">Status:</span>
                      <select
                        value={task.status}
                        onChange={(e) => handleTaskStatusChange(task._id, e.target.value)}
                        className={`text-xs font-bold px-2 py-1 rounded ${
                          task.status === 'Completed'
                            ? 'bg-emerald-500 text-white'
                            : task.status === 'In Progress'
                            ? 'bg-blue-600 text-white'
                            : 'bg-amber-600 text-white'
                        } focus:outline-none cursor-pointer`}
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="In Review">In Review</option>
                        <option value="Completed">Completed ✓</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for Quick Project Update */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`${cardBg} rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative`}>
            <h3 className={`text-lg font-bold ${textTitle}`}>Post Project Progress Update</h3>
            <form onSubmit={handlePostUpdate} className="space-y-4 text-sm">
              <div>
                <label className={`block ${textSub} mb-1 font-medium`}>Select Project *</label>
                <select
                  required
                  value={updateFormData.project}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, project: e.target.value })}
                  className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none`}
                >
                  <option value="">-- Choose Project --</option>
                  {myProjects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block ${textSub} mb-1 font-medium`}>Headline *</label>
                <input
                  type="text"
                  required
                  value={updateFormData.updateTitle}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, updateTitle: e.target.value })}
                  placeholder="e.g. Completed Database Schemas"
                  className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none`}
                />
              </div>

              <div>
                <label className={`block ${textSub} mb-1 font-medium`}>Updated Progress % (Optional)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={updateFormData.progressPercentage}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, progressPercentage: e.target.value })}
                  placeholder="e.g. 75"
                  className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none`}
                />
              </div>

              <div>
                <label className={`block ${textSub} mb-1 font-medium`}>Update Details *</label>
                <textarea
                  rows="3"
                  required
                  value={updateFormData.description}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, description: e.target.value })}
                  placeholder="Explain completed features or testing..."
                  className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className={`px-4 py-2 ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'} rounded-xl text-xs font-semibold`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold"
                >
                  Post Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
