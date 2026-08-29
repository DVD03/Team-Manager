import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Calendar,
  DollarSign,
  Edit2,
  Trash2,
  X,
  PhoneCall,
  CheckSquare,
  Activity,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  Tag,
  Users,
} from 'lucide-react';
import axios from 'axios';

const PIPELINE_STATUSES = [
  'Planning',
  'Requirements & Design',
  'In Development',
  'Testing / QA',
  'Delivered / Handed Over',
  'Maintenance & Updates',
  'On Hold',
];

export default function ProjectTracker({ projects = [], team = [], calls = [], onRefresh, onNavigateToTasks, darkMode = true }) {
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [expandedProject, setExpandedProject] = useState(null);
  const [categoriesList, setCategoriesList] = useState([]);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    category: 'Software & Mobile Apps',
    description: '',
    status: 'In Development',
    priority: 'Medium',
    deadline: '',
    progress: 0,
    budget: 0,
    assignedTeam: [],
    acquiredViaCall: false,
    linkedCall: '',
    autoOpenTasks: true,
  });

  const cardBg = darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200 shadow-sm';
  const innerBg = darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200';
  const textTitle = darkMode ? 'text-white' : 'text-slate-900';
  const textSub = darkMode ? 'text-slate-400' : 'text-slate-500';
  const inputBg = darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      setCategoriesList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let finalCategory = formData.category;
      if (isCustomCategory && customCategoryInput.trim()) {
        finalCategory = customCategoryInput.trim();
        await axios.post('/api/categories', { name: finalCategory });
        await fetchCategories();
      }

      const payload = {
        ...formData,
        category: finalCategory,
      };

      let createdId = null;
      if (editingProject) {
        await axios.put(`/api/projects/${editingProject._id}`, payload);
      } else {
        const res = await axios.post('/api/projects', payload);
        createdId = res.data._id;
      }
      setShowModal(false);
      setEditingProject(null);
      const shouldNavigate = formData.autoOpenTasks && !editingProject;
      resetForm();
      await onRefresh();

      if (shouldNavigate && onNavigateToTasks && createdId) {
        onNavigateToTasks(createdId);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save project');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      clientName: '',
      category: categoriesList.length > 0 ? categoriesList[0].name : 'Software & Mobile Apps',
      description: '',
      status: 'In Development',
      priority: 'Medium',
      deadline: '',
      progress: 0,
      budget: 0,
      assignedTeam: [],
      acquiredViaCall: false,
      linkedCall: '',
      autoOpenTasks: true,
    });
    setCustomCategoryInput('');
    setIsCustomCategory(false);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      clientName: project.clientName,
      category: project.category || 'Software & Mobile Apps',
      description: project.description || '',
      status: project.status || 'In Development',
      priority: project.priority || 'Medium',
      deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '',
      progress: project.progress || 0,
      budget: project.budget || 0,
      assignedTeam: project.assignedTeam ? project.assignedTeam.map((t) => t._id || t) : [],
      acquiredViaCall: !!project.acquiredViaCall,
      linkedCall: project.linkedCall ? (project.linkedCall._id || project.linkedCall) : '',
      autoOpenTasks: false,
    });
    setIsCustomCategory(false);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project and all its tasks/updates?')) return;
    try {
      await axios.delete(`/api/projects/${id}`);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete project');
    }
  };

  const handleTeamCheckbox = (memberId) => {
    const exists = formData.assignedTeam.includes(memberId);
    if (exists) {
      setFormData({
        ...formData,
        assignedTeam: formData.assignedTeam.filter((id) => id !== memberId),
      });
    } else {
      setFormData({
        ...formData,
        assignedTeam: [...formData.assignedTeam, memberId],
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${cardBg} p-6 rounded-2xl border`}>
        <div>
          <h2 className={`text-xl font-bold ${textTitle} flex items-center gap-2`}>
            <Briefcase className="w-6 h-6 text-indigo-500" />
            <span>Projects Hub & Category Management</span>
          </h2>
          <p className={`${textSub} text-sm mt-1`}>
            Create projects, assign teams/leaders, set custom industry categories (e.g. Salon), and track call acquisition leads.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProject(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className={`col-span-full text-center py-12 ${cardBg} rounded-2xl border ${textSub}`}>
            <p className="text-base font-medium">No projects added yet.</p>
            <p className="text-xs mt-1">Create projects to mark progress, assign teams, & track post-handover updates.</p>
          </div>
        ) : (
          projects.map((project) => {
            const isDeadlineNear =
              project.deadline &&
              new Date(project.deadline) - new Date() < 3 * 24 * 60 * 60 * 1000 &&
              project.status !== 'Delivered / Handed Over';

            const isExpanded = expandedProject === project._id;
            const isHandedOver = project.status === 'Delivered / Handed Over' || project.status === 'Maintenance & Updates';

            return (
              <div
                key={project._id}
                className={`${cardBg} rounded-2xl border p-6 space-y-4 hover:border-indigo-500/50 transition shadow-xl flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  {/* Top line */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded font-bold border border-purple-500/20">
                          {project.category || 'Software'}
                        </span>
                        {project.acquiredViaCall && (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-bold border border-emerald-500/20">
                            📞 Call Acquisition
                          </span>
                        )}
                      </div>
                      <h3 className={`text-lg font-bold ${textTitle} leading-snug mt-1`}>
                        {project.title}
                      </h3>
                      <p className={`text-xs ${textSub}`}>Client: {project.clientName}</p>
                    </div>
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase shrink-0 ${
                        project.status === 'Delivered / Handed Over'
                          ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                          : project.status === 'Maintenance & Updates'
                          ? 'bg-purple-500/20 text-purple-500 border border-purple-500/30'
                          : project.status === 'In Development'
                          ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                          : project.status === 'Testing / QA'
                          ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <p className={`${textSub} text-xs line-clamp-2`}>{project.description}</p>

                  {/* Development Stage Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      onClick={() => onNavigateToTasks && onNavigateToTasks(project._id)}
                      className="text-[10px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20 font-semibold flex items-center gap-1 transition"
                    >
                      <CheckSquare className="w-3 h-3" />
                      {project.completedTasks || 0} / {project.totalTasks || 0} Tasks (Go To Board <ArrowRight className="w-2.5 h-2.5" />)
                    </button>

                    {isHandedOver && (
                      <span className="text-[10px] bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded border border-purple-500/20 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Maintenance Active
                      </span>
                    )}
                  </div>

                  {/* Progress Bar & Percentage */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className={textSub}>Pipeline Progress</span>
                      <span className="text-indigo-500 font-bold">{project.progress || 0}%</span>
                    </div>
                    <div className={`w-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'} h-2.5 rounded-full overflow-hidden`}>
                      <div
                        className={`h-full transition-all duration-500 ${
                          project.progress === 100
                            ? 'bg-emerald-500'
                            : project.progress > 60
                            ? 'bg-indigo-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${project.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Expand / Collapse Details */}
                  <button
                    onClick={() => setExpandedProject(isExpanded ? null : project._id)}
                    className="w-full text-xs text-indigo-500 hover:text-indigo-600 font-semibold flex items-center justify-center gap-1 pt-1"
                  >
                    <span>{isExpanded ? 'Hide Pipeline & Updates' : 'View Pipeline & Post-Handover History'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {/* Expandable Content */}
                  {isExpanded && (
                    <div className={`p-3 ${innerBg} rounded-xl border space-y-3 text-xs`}>
                      <div>
                        <p className={`font-bold ${textTitle} text-[11px] mb-1 flex items-center gap-1`}>
                          <Activity className="w-3.5 h-3.5 text-pink-500" /> Post-Handover Updates & Client Change Requests:
                        </p>
                        {project.linkedUpdates && project.linkedUpdates.length > 0 ? (
                          <div className="space-y-1.5">
                            {project.linkedUpdates.map((u) => (
                              <div key={u._id} className="p-2 bg-slate-500/5 rounded-lg border border-slate-700/30 text-[10px]">
                                <div className="flex justify-between font-bold text-slate-200">
                                  <span>• {u.updateTitle}</span>
                                  <span className="text-pink-400">{u.category || 'Update'}</span>
                                </div>
                                <p className="text-slate-400 mt-0.5">{u.description}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-500 italic">No post-handover updates or change requests logged yet.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className={`grid grid-cols-2 gap-2 text-xs pt-2 border-t ${darkMode ? 'border-slate-700/60' : 'border-slate-200'}`}>
                    <div className={`flex items-center gap-1.5 ${textSub}`}>
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className={isDeadlineNear ? 'text-rose-500 font-bold' : ''}>
                        {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No Deadline'}
                      </span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${textSub} justify-end`}>
                      <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{project.budget ? `$${project.budget.toLocaleString()}` : 'N/A'}</span>
                    </div>
                  </div>

                  {/* Assigned Team */}
                  {project.assignedTeam && project.assignedTeam.length > 0 && (
                    <div className="pt-2">
                      <p className={`text-[10px] ${textSub} mb-1 font-medium`}>Assigned Team & Leaders:</p>
                      <div className="flex flex-wrap gap-1">
                        {project.assignedTeam.map((m, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 ${innerBg} ${textSub} rounded-full text-[10px] border flex items-center gap-1`}
                          >
                            {m.isTeamLeader && <span className="text-purple-400 font-bold">👑</span>}
                            <span>{m.name || 'Member'}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className={`flex items-center justify-between pt-3 border-t ${darkMode ? 'border-slate-700/60' : 'border-slate-200'}`}>
                  <button
                    onClick={() => onNavigateToTasks && onNavigateToTasks(project._id)}
                    className="px-3 py-1.5 bg-amber-600/90 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow"
                  >
                    <CheckSquare className="w-3.5 h-3.5" /> Task Board
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(project)}
                      className={`px-3 py-1.5 ${
                        darkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      } rounded-lg text-xs font-medium transition flex items-center gap-1`}
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project._id)}
                      className="p-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-500 rounded-lg text-xs transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`${cardBg} rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto`}>
            <div className={`flex items-center justify-between border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'} pb-3`}>
              <h3 className={`text-lg font-bold ${textTitle}`}>
                {editingProject ? 'Edit Project & Category' : 'Create New Project'}
              </h3>
              <button onClick={() => setShowModal(false)} className={`${textSub} hover:text-white`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className={`block ${textSub} mb-1 font-medium`}>Project Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Salon Beauty Booking App"
                  className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-indigo-500`}
                />
              </div>

              {/* Dynamic Category Selection & Custom Input */}
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <label className={`block ${textTitle} font-bold text-xs flex items-center gap-1.5`}>
                    <Tag className="w-3.5 h-3.5 text-purple-500" />
                    <span>Project Category / Industry Sector *</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomCategory(!isCustomCategory)}
                    className="text-[10px] text-purple-400 hover:underline font-bold"
                  >
                    {isCustomCategory ? 'Select from Saved Categories' : '+ Add New Custom Category'}
                  </button>
                </div>

                {isCustomCategory ? (
                  <input
                    type="text"
                    required
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    placeholder="Type new category (e.g. Saloon / Beauty Section, Auto Dealer)"
                    className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-purple-500 text-xs font-bold`}
                  />
                ) : (
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-purple-500 text-xs font-bold`}
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat._id || cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className={`block ${textSub} mb-1 font-medium`}>Client / Customer Name *</label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="e.g. Glamour Salon / Mr. Perera"
                  className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-indigo-500`}
                />
              </div>

              {/* Call Acquisition Source */}
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2">
                <label className={`flex items-center space-x-2 text-xs ${textTitle} font-bold cursor-pointer`}>
                  <input
                    type="checkbox"
                    checked={formData.acquiredViaCall}
                    onChange={(e) => setFormData({ ...formData, acquiredViaCall: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-0 cursor-pointer"
                  />
                  <span>📞 Project Acquired Via Customer Call / Inquiry?</span>
                </label>

                {formData.acquiredViaCall && (
                  <div>
                    <label className={`block ${textSub} text-[11px] mb-1`}>Link Customer Call Log:</label>
                    <select
                      value={formData.linkedCall}
                      onChange={(e) => setFormData({ ...formData, linkedCall: e.target.value })}
                      className={`w-full px-3 py-1.5 ${inputBg} rounded-lg text-xs focus:outline-none`}
                    >
                      <option value="">-- Select Linked Call --</option>
                      {calls.map((c) => (
                        <option key={c._id} value={c._id}>
                          📞 {c.clientName} ({c.outcome}) - {new Date(c.callDate).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className={`block ${textSub} mb-1 font-medium`}>Description & Scope</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key deliverables, scope, and technical requirements..."
                  className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-indigo-500`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block ${textSub} mb-1 font-medium`}>Development Stage *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-indigo-500`}
                  >
                    {PIPELINE_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block ${textSub} mb-1 font-medium`}>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-indigo-500`}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Progress Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className={`${textSub} font-medium`}>Progress %</label>
                  <span className="text-indigo-500 font-bold">{formData.progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block ${textSub} mb-1 font-medium`}>Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-indigo-500`}
                  />
                </div>
                <div>
                  <label className={`block ${textSub} mb-1 font-medium`}>Budget ($)</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-indigo-500`}
                  />
                </div>
              </div>

              {/* Assign Team Members & Leaders */}
              <div>
                <label className={`block ${textSub} mb-2 font-medium flex items-center gap-1.5`}>
                  <Users className="w-4 h-4 text-purple-500" />
                  <span>Assign Team Members & Team Leaders</span>
                </label>
                {team.length === 0 ? (
                  <p className="text-xs text-slate-500">No team members available. Add team members first.</p>
                ) : (
                  <div className={`grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 ${innerBg} rounded-xl border`}>
                    {team.map((m) => (
                      <label
                        key={m._id}
                        className={`flex items-center space-x-2 text-xs ${textSub} cursor-pointer hover:text-white`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.assignedTeam.includes(m._id)}
                          onChange={() => handleTeamCheckbox(m._id)}
                          className="rounded text-indigo-600 focus:ring-0"
                        />
                        <span className="truncate">
                          {m.isTeamLeader && '👑 '}{m.name} ({m.role})
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {!editingProject && (
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="autoOpenTasks"
                    checked={formData.autoOpenTasks}
                    onChange={(e) => setFormData({ ...formData, autoOpenTasks: e.target.checked })}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="autoOpenTasks" className={`text-xs ${textTitle} cursor-pointer font-bold`}>
                    Auto-open Task Board after creating this project to assign tasks immediately 🚀
                  </label>
                </div>
              )}

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
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30"
                >
                  {editingProject ? 'Save Changes' : 'Create & Open Task Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
