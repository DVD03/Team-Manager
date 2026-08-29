import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  User,
  Filter,
  Trash2,
  Edit2,
  X,
  AlertCircle,
} from 'lucide-react';
import axios from 'axios';

const STATUS_COLUMNS = ['To Do', 'In Development', 'Testing / QA', 'Client Review', 'Completed'];

const normalizeStatus = (status) => {
  if (status === 'In Progress') return 'In Development';
  if (status === 'In Review') return 'Client Review';
  return status || 'To Do';
};

export default function TaskBoard({ tasks = [], projects = [], team = [], onRefresh, selectedProjectId = '', darkMode = true }) {
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [filterProject, setFilterProject] = useState(selectedProjectId || '');
  const [filterAssignee, setFilterAssignee] = useState('');

  useEffect(() => {
    if (selectedProjectId) {
      setFilterProject(selectedProjectId);
    }
  }, [selectedProjectId]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: selectedProjectId || (projects.length > 0 ? projects[0]._id : ''),
    assignedTo: team.length > 0 ? team[0]._id : '',
    priority: 'Medium',
    status: 'To Do',
    deadline: '',
  });

  const cardBg = darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200 shadow-sm';
  const colBg = darkMode ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-100/80 border-slate-200';
  const innerBg = darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200 shadow-sm';
  const textTitle = darkMode ? 'text-white' : 'text-slate-900';
  const textSub = darkMode ? 'text-slate-400' : 'text-slate-500';
  const inputBg = darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await axios.put(`/api/tasks/${editingTask._id}`, formData);
      } else {
        await axios.post('/api/tasks', formData);
      }
      setShowModal(false);
      setEditingTask(null);
      resetForm();
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save task');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      project: filterProject || (projects.length > 0 ? projects[0]._id : ''),
      assignedTo: team.length > 0 ? team[0]._id : '',
      priority: 'Medium',
      status: 'To Do',
      deadline: '',
    });
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await axios.put(`/api/tasks/${task._id}`, { status: newStatus });
      onRefresh();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await axios.delete(`/api/tasks/${id}`);
      onRefresh();
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      project: task.project ? (task.project._id || task.project) : '',
      assignedTo: task.assignedTo ? (task.assignedTo._id || task.assignedTo) : '',
      priority: task.priority || 'Medium',
      status: normalizeStatus(task.status),
      deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
    });
    setShowModal(true);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterProject && t.project?._id !== filterProject) return false;
    if (filterAssignee && t.assignedTo?._id !== filterAssignee) return false;
    return true;
  });

  const selectedProjectObj = projects.find((p) => p._id === filterProject);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className={`${cardBg} p-6 rounded-2xl border space-y-4`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className={`text-xl font-bold ${textTitle} flex items-center gap-2`}>
              <CheckSquare className="w-6 h-6 text-amber-500" />
              <span>Development Pipeline Task Board</span>
            </h2>
            <p className={`${textSub} text-sm mt-1`}>
              Track tasks through Development pipeline stages: To Do ➔ In Development ➔ Testing / QA ➔ Client Review ➔ Completed.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingTask(null);
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm rounded-xl transition shadow-lg shadow-amber-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create & Assign Task</span>
          </button>
        </div>

        {/* Filters */}
        <div className={`flex flex-wrap items-center gap-3 pt-3 border-t ${darkMode ? 'border-slate-700/60' : 'border-slate-200'} text-xs`}>
          <span className={`${textSub} flex items-center gap-1 font-medium`}>
            <Filter className="w-3.5 h-3.5" /> Filter By Project / Team:
          </span>

          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className={`px-3 py-1.5 ${inputBg} rounded-lg focus:outline-none font-bold`}
          >
            <option value="">All Projects ({tasks.length} total tasks)</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                📁 {p.title} ({p.clientName})
              </option>
            ))}
          </select>

          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className={`px-3 py-1.5 ${inputBg} rounded-lg focus:outline-none`}
          >
            <option value="">All Team Members</option>
            {team.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name} ({m.role})
              </option>
            ))}
          </select>

          {(filterProject || filterAssignee) && (
            <button
              onClick={() => {
                setFilterProject('');
                setFilterAssignee('');
              }}
              className="text-amber-500 hover:underline font-bold px-2 py-1 bg-amber-500/10 rounded border border-amber-500/20"
            >
              Clear Filters (Show All Tasks)
            </button>
          )}
        </div>

        {/* Filter Notice Banner if 0 tasks in selected project */}
        {filterProject && filteredTasks.length === 0 && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-500 text-xs font-semibold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                No tasks created for project "<strong>{selectedProjectObj ? selectedProjectObj.title : 'Selected Project'}</strong>" yet.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingTask(null);
                  resetForm();
                  setShowModal(true);
                }}
                className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-500"
              >
                + Create Task For This Project
              </button>
              <button
                onClick={() => setFilterProject('')}
                className="px-3 py-1 bg-slate-700 text-slate-200 rounded-lg text-xs font-bold hover:bg-slate-600"
              >
                Show All Tasks
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Kanban Board Columns (5 Stages) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {STATUS_COLUMNS.map((statusCol) => {
          const colTasks = filteredTasks.filter((t) => normalizeStatus(t.status) === statusCol);

          return (
            <div
              key={statusCol}
              className={`${colBg} rounded-2xl border p-3.5 space-y-3 flex flex-col min-h-[500px]`}
            >
              {/* Column Header */}
              <div className={`flex items-center justify-between pb-2 border-b ${darkMode ? 'border-slate-700' : 'border-slate-300'}`}>
                <h3 className={`font-bold ${textTitle} text-xs flex items-center gap-1.5 truncate`}>
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      statusCol === 'Completed'
                        ? 'bg-emerald-500'
                        : statusCol === 'Client Review'
                        ? 'bg-purple-500'
                        : statusCol === 'Testing / QA'
                        ? 'bg-pink-500'
                        : statusCol === 'In Development'
                        ? 'bg-blue-500'
                        : 'bg-amber-500'
                    }`}
                  ></span>
                  <span className="truncate">{statusCol}</span>
                </h3>
                <span className={`px-2 py-0.5 ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'} rounded-full text-[10px] font-bold shrink-0`}>
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {colTasks.length === 0 ? (
                  <div className={`text-center py-8 ${textSub} text-[11px] italic`}>
                    No tasks in {statusCol}
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const isOverdue =
                      task.deadline &&
                      new Date(task.deadline) < new Date() &&
                      normalizeStatus(task.status) !== 'Completed';

                    return (
                      <div
                        key={task._id}
                        className={`${innerBg} rounded-xl border p-3.5 space-y-2.5 hover:border-amber-500/50 transition shadow-md group text-xs`}
                      >
                        {/* Title & Priority */}
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`font-semibold ${textTitle} text-xs leading-snug`}>
                            {task.title}
                          </h4>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase shrink-0 ${
                              task.priority === 'Urgent'
                                ? 'bg-rose-500/20 text-rose-500'
                                : task.priority === 'High'
                                ? 'bg-amber-500/20 text-amber-500'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        {task.description && (
                          <p className={`${textSub} text-[11px] line-clamp-2`}>
                            {task.description}
                          </p>
                        )}

                        {/* Project Badge */}
                        {task.project && (
                          <div className="text-[10px] text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 truncate font-medium">
                            📁 {task.project.title}
                          </div>
                        )}

                        {/* Assignee & Deadline */}
                        <div className={`space-y-1 pt-2 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'} text-[11px] ${textSub}`}>
                          {task.assignedTo && (
                            <div className="flex items-center gap-1.5">
                              <User className="w-3 h-3 text-purple-500 shrink-0" />
                              <span className={`font-medium ${textTitle} truncate`}>
                                {task.assignedTo.name}
                              </span>
                            </div>
                          )}

                          {task.deadline && (
                            <div
                              className={`flex items-center gap-1.5 ${
                                isOverdue ? 'text-rose-500 font-bold' : textSub
                              }`}
                            >
                              <Clock className="w-3 h-3 shrink-0" />
                              <span>
                                {isOverdue ? 'Overdue: ' : 'Due: '}
                                {new Date(task.deadline).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Move Status Dropdown */}
                        <div className={`flex items-center justify-between pt-2 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'} text-xs`}>
                          <select
                            value={normalizeStatus(task.status)}
                            onChange={(e) => handleStatusChange(task, e.target.value)}
                            className={`text-[10px] px-1.5 py-0.5 rounded ${inputBg} focus:outline-none max-w-[110px] truncate`}
                          >
                            {STATUS_COLUMNS.map((st) => (
                              <option key={st} value={st}>
                                Move to {st}
                              </option>
                            ))}
                          </select>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEdit(task)}
                              className={`p-1 ${textSub} hover:text-amber-500`}
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDelete(task._id)}
                              className={`p-1 ${textSub} hover:text-rose-500`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`${cardBg} rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative`}>
            <div className={`flex items-center justify-between border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'} pb-3`}>
              <h3 className={`text-lg font-bold ${textTitle}`}>
                {editingTask ? 'Edit Task' : 'Create & Assign Task'}
              </h3>
              <button onClick={() => setShowModal(false)} className={`${textSub} hover:text-white`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className={`block ${textSub} mb-1 font-medium`}>Task Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Design Landing Page UI"
                  className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-amber-500`}
                />
              </div>

              <div>
                <label className={`block ${textSub} mb-1 font-medium`}>Select Project *</label>
                <select
                  required
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-amber-500`}
                >
                  <option value="">-- Choose Project --</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title} ({p.clientName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block ${textSub} mb-1 font-medium`}>Assign To Team Member</label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-amber-500`}
                >
                  <option value="">-- Select Member --</option>
                  {team.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} - {m.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block ${textSub} mb-1 font-medium`}>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-amber-500`}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className={`block ${textSub} mb-1 font-medium`}>Pipeline Stage *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-amber-500`}
                  >
                    {STATUS_COLUMNS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={`block ${textSub} mb-1 font-medium`}>Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-amber-500`}
                />
              </div>

              <div>
                <label className={`block ${textSub} mb-1 font-medium`}>Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Task instructions and expectations..."
                  className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-amber-500`}
                />
              </div>

              <div className={`flex justify-end gap-2 pt-3 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`px-4 py-2 ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'} rounded-xl text-xs font-semibold`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-amber-600/30"
                >
                  {editingTask ? 'Save Task' : 'Assign Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
