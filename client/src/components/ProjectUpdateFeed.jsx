import React, { useState } from 'react';
import {
  Activity,
  Plus,
  Clock,
  User,
  Trash2,
  X,
  ShieldCheck,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import axios from 'axios';

const UPDATE_CATEGORIES = [
  'Milestone Progress',
  'Post-Handover Change Request',
  'Bug Fix / Patch',
  'Maintenance Update',
  'New Feature Request',
];

export default function ProjectUpdateFeed({ updates = [], projects = [], team = [], onRefresh, darkMode = true }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');

  const [formData, setFormData] = useState({
    project: '',
    updateTitle: '',
    description: '',
    category: 'Milestone Progress',
    status: 'In Progress',
    progressPercentage: '',
    updatedBy: '',
  });

  const cardBg = darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200 shadow-sm';
  const innerBg = darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200 shadow-sm';
  const textTitle = darkMode ? 'text-white' : 'text-slate-900';
  const textSub = darkMode ? 'text-slate-400' : 'text-slate-500';
  const inputBg = darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        progressPercentage:
          formData.progressPercentage !== '' ? Number(formData.progressPercentage) : undefined,
      };

      await axios.post('/api/updates', payload);
      setShowModal(false);
      resetForm();
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to post update');
    }
  };

  const resetForm = () => {
    setFormData({
      project: projects.length > 0 ? projects[0]._id : '',
      updateTitle: '',
      description: '',
      category: 'Milestone Progress',
      status: 'In Progress',
      progressPercentage: '',
      updatedBy: team.length > 0 ? team[0]._id : '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project update?')) return;
    try {
      await axios.delete(`/api/updates/${id}`);
      onRefresh();
    } catch (err) {
      alert('Failed to delete update');
    }
  };

  const filteredUpdates = updates.filter((u) => {
    if (selectedProjectFilter && u.project?._id !== selectedProjectFilter) return false;
    if (selectedMemberFilter && u.updatedBy?._id !== selectedMemberFilter) return false;
    if (selectedCategoryFilter && u.category !== selectedCategoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${cardBg} p-6 rounded-2xl border`}>
        <div>
          <h2 className={`text-xl font-bold ${textTitle} flex items-center gap-2`}>
            <Activity className="w-6 h-6 text-pink-500" />
            <span>Project Updates & Feature Task Log</span>
          </h2>
          <p className={`${textSub} text-sm mt-1`}>
            Track milestone progress, feature updates, and client change requests. Filter by member & project.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-medium text-sm rounded-xl transition shadow-lg shadow-pink-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Post Update / Feature Task</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className={`flex flex-wrap items-center gap-3 ${cardBg} p-4 rounded-xl border text-xs`}>
        <span className={`${textSub} font-medium flex items-center gap-1`}>
          <Filter className="w-3.5 h-3.5 text-pink-500" /> Filter By:
        </span>

        <select
          value={selectedProjectFilter}
          onChange={(e) => setSelectedProjectFilter(e.target.value)}
          className={`px-3 py-1.5 ${inputBg} rounded-lg focus:outline-none font-semibold`}
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              📁 {p.title} ({p.clientName})
            </option>
          ))}
        </select>

        <select
          value={selectedMemberFilter}
          onChange={(e) => setSelectedMemberFilter(e.target.value)}
          className={`px-3 py-1.5 ${inputBg} rounded-lg focus:outline-none font-semibold`}
        >
          <option value="">All Team Members</option>
          {team.map((m) => (
            <option key={m._id} value={m._id}>
              👤 {m.name} ({m.role})
            </option>
          ))}
        </select>

        <select
          value={selectedCategoryFilter}
          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          className={`px-3 py-1.5 ${inputBg} rounded-lg focus:outline-none font-semibold`}
        >
          <option value="">All Categories</option>
          {UPDATE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {(selectedProjectFilter || selectedMemberFilter || selectedCategoryFilter) && (
          <button
            onClick={() => {
              setSelectedProjectFilter('');
              setSelectedMemberFilter('');
              setSelectedCategoryFilter('');
            }}
            className="text-pink-500 hover:underline font-bold px-2 py-1 bg-pink-500/10 rounded border border-pink-500/20"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Updates Feed */}
      <div className={`${cardBg} rounded-2xl border p-6`}>
        {filteredUpdates.length === 0 ? (
          <div className={`text-center py-12 ${textSub}`}>
            <p className="text-base font-medium">No updates found for selected filters.</p>
            <p className="text-xs mt-1">
              Log progress milestones or client post-handover change requests.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-300 dark:before:bg-slate-700">
            {filteredUpdates.map((update) => (
              <div key={update._id} className="relative group">
                <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-pink-500 ring-4 ring-white dark:ring-slate-800"></div>

                <div className={`${innerBg} rounded-2xl border p-5 space-y-3 shadow-md hover:border-pink-500/40 transition`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-pink-500 font-bold">
                          📁 {update.project?.title || 'Project'}
                        </span>
                        <span className="text-[10px] bg-purple-500/20 text-purple-500 px-2 py-0.5 rounded font-extrabold border border-purple-500/30">
                          {update.category || 'Milestone Progress'}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-extrabold ${
                            update.status === 'Done'
                              ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                          }`}
                        >
                          Status: {update.status || 'In Progress'}
                        </span>
                      </div>
                      <h3 className={`text-base font-bold ${textTitle} mt-1`}>
                        {update.updateTitle}
                      </h3>
                    </div>

                    <div className={`flex items-center gap-3 text-xs ${textSub}`}>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(update.createdAt).toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleDelete(update._id)}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className={`${textSub} text-xs leading-relaxed whitespace-pre-line`}>
                    {update.description}
                  </p>

                  {update.updatedBy && (
                    <div className={`pt-2 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'} text-[11px] ${textSub} flex items-center gap-1.5`}>
                      <User className="w-3 h-3 text-pink-500" />
                      <span>
                        Posted by: <strong className={textTitle}>{update.updatedBy.name}</strong> ({update.updatedBy.role})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`${cardBg} rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto`}>
            <div className={`flex items-center justify-between border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'} pb-3`}>
              <h3 className={`text-lg font-bold ${textTitle} flex items-center gap-2`}>
                <Activity className="w-5 h-5 text-pink-500" />
                <span>Post Project Update / Feature Task</span>
              </h3>
              <button onClick={() => setShowModal(false)} className={`${textSub} hover:text-white`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className={`block ${textSub} mb-1 font-medium`}>Select Project *</label>
                <select
                  required
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-pink-500`}
                >
                  <option value="">-- Choose Project --</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title} ({p.clientName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block ${textSub} mb-1 font-medium`}>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-pink-500`}
                  >
                    {UPDATE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block ${textSub} mb-1 font-medium`}>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-pink-500`}
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Pending">Pending</option>
                    <option value="Done">Done ✓</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block ${textSub} mb-1 font-medium`}>Update Heading *</label>
                <input
                  type="text"
                  required
                  value={formData.updateTitle}
                  onChange={(e) => setFormData({ ...formData, updateTitle: e.target.value })}
                  placeholder="e.g. Completed Salon Payment Module"
                  className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-pink-500`}
                />
              </div>

              <div>
                <label className={`block ${textSub} mb-1 font-medium`}>Detailed Description *</label>
                <textarea
                  rows="3"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explain completed work or client change request details..."
                  className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-pink-500`}
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
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-pink-600/30"
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
