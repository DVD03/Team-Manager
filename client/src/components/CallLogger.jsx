import React, { useState } from 'react';
import {
  PhoneCall,
  Plus,
  Paperclip,
  ShieldCheck,
  Calendar,
  Phone,
  ExternalLink,
  Trash2,
  X,
  FileText,
  Image as ImageIcon,
  Layers,
  Briefcase,
  User,
} from 'lucide-react';
import axios from 'axios';

export default function CallLogger({ calls = [], projects = [], team = [], onRefresh, darkMode = true }) {
  const [showModal, setShowModal] = useState(false);
  const [logMode, setLogMode] = useState('single');
  const [previewProof, setPreviewProof] = useState(null);

  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertData, setConvertData] = useState({
    title: '',
    clientName: '',
    description: '',
    budget: 0,
    deadline: '',
    assignedTeam: [],
  });

  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    project: '',
    durationMinutes: 15,
    notes: '',
    outcome: 'Lead / New Inquiry',
  });

  const [bulkFormData, setBulkFormData] = useState({
    clientList: '',
    project: '',
    durationMinutes: 10,
    notes: 'Bulk client outreach call',
    outcome: 'Lead / New Inquiry',
  });

  const [proofFiles, setProofFiles] = useState([]);

  const cardBg = darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200 shadow-sm';
  const innerBg = darkMode ? 'bg-slate-900/60 border-slate-700/60' : 'bg-slate-50 border-slate-200';
  const textTitle = darkMode ? 'text-white' : 'text-slate-900';
  const textSub = darkMode ? 'text-slate-400' : 'text-slate-500';
  const inputBg = darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900';

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('clientName', formData.clientName);
      data.append('clientPhone', formData.clientPhone);
      data.append('clientEmail', formData.clientEmail);
      if (formData.project) data.append('project', formData.project);
      data.append('durationMinutes', formData.durationMinutes);
      data.append('notes', formData.notes);
      data.append('outcome', formData.outcome);

      for (let i = 0; i < proofFiles.length; i++) {
        data.append('proofFiles', proofFiles[i]);
      }

      await axios.post('/api/calls', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setShowModal(false);
      resetForm();
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to log customer call');
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('clientList', bulkFormData.clientList);
      if (bulkFormData.project) data.append('project', bulkFormData.project);
      data.append('durationMinutes', bulkFormData.durationMinutes);
      data.append('notes', bulkFormData.notes);
      data.append('outcome', bulkFormData.outcome);

      for (let i = 0; i < proofFiles.length; i++) {
        data.append('proofFiles', proofFiles[i]);
      }

      const res = await axios.post('/api/calls/bulk', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert(res.data.message || 'Bulk calls logged successfully!');
      setShowModal(false);
      resetForm();
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to log bulk customer calls');
    }
  };

  const handleConvertCallToProject = (call) => {
    setConvertData({
      title: `${call.clientName} - New Project`,
      clientName: call.clientName,
      description: `Acquired via customer call on ${new Date(call.callDate).toLocaleDateString()}.\nCall Notes: ${call.notes}`,
      budget: 0,
      deadline: '',
      assignedTeam: [],
    });
    setShowConvertModal(true);
  };

  const handleCreateProjectFromCall = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/projects', {
        ...convertData,
        status: 'In Development',
        priority: 'High',
        progress: 0,
      });
      alert(`Successfully converted call lead into project "${convertData.title}"!`);
      setShowConvertModal(false);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create project from call');
    }
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      project: '',
      durationMinutes: 15,
      notes: '',
      outcome: 'Lead / New Inquiry',
    });
    setBulkFormData({
      clientList: '',
      project: '',
      durationMinutes: 10,
      notes: 'Bulk client outreach call',
      outcome: 'Lead / New Inquiry',
    });
    setProofFiles([]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this call log record?')) return;
    try {
      await axios.delete(`/api/calls/${id}`);
      onRefresh();
    } catch (err) {
      alert('Failed to delete call record');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${cardBg} p-6 rounded-2xl border`}>
        <div>
          <h2 className={`text-xl font-bold ${textTitle} flex items-center gap-2`}>
            <PhoneCall className="w-6 h-6 text-emerald-500" />
            <span>Customer Calls & Lead Acquisition</span>
          </h2>
          <p className={`${textSub} text-sm mt-1`}>
            Log individual or bulk client calls, attach proofs, and convert won deals into projects with 1 click!
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setLogMode('single');
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl transition shadow-lg shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Log Single Call</span>
          </button>

          <button
            onClick={() => {
              setLogMode('bulk');
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition shadow-lg shadow-indigo-600/20"
          >
            <Layers className="w-4 h-4" />
            <span>Log Bulk Client Calls</span>
          </button>
        </div>
      </div>

      {/* Call Logs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {calls.length === 0 ? (
          <div className={`col-span-full text-center py-12 ${cardBg} rounded-2xl border ${textSub}`}>
            <p className="text-base font-medium">No customer call logs yet.</p>
            <p className="text-xs mt-1">
              Click "Log Single Call" or "Log Bulk Client Calls" to save communication details & proof attachments.
            </p>
          </div>
        ) : (
          calls.map((call) => (
            <div
              key={call._id}
              className={`${cardBg} rounded-2xl border p-5 space-y-4 hover:border-emerald-500/50 transition shadow-xl relative flex flex-col justify-between`}
            >
              <div className="space-y-3">
                {/* Header line */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className={`font-bold ${textTitle} text-base leading-tight`}>
                      {call.clientName}
                    </h3>
                    <div className={`flex items-center gap-2 text-xs ${textSub} mt-1`}>
                      {call.clientPhone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" /> {call.clientPhone}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                      call.outcome === 'Deal Won'
                        ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                        : call.outcome === 'Interested'
                        ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                        : call.outcome === 'Follow-up Scheduled'
                        ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {call.outcome}
                  </span>
                </div>

                {/* Linked Project */}
                {call.project ? (
                  <div className="text-xs text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 font-medium flex items-center justify-between">
                    <span>📁 Linked Project: {call.project.title}</span>
                    <span className="text-[10px] bg-indigo-500/20 px-1.5 py-0.5 rounded font-bold">
                      {call.project.progress || 0}% Progress
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConvertCallToProject(call)}
                    className="w-full text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1.5 rounded-lg border border-emerald-500/30 font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Convert Call Lead to Project 🚀</span>
                  </button>
                )}

                {/* Call Notes */}
                <div className={`${innerBg} p-3 rounded-xl border text-xs text-slate-700 dark:text-slate-300 space-y-1`}>
                  <p className={`font-medium ${textSub}`}>Call Summary & Notes:</p>
                  <p className="whitespace-pre-line leading-relaxed">{call.notes}</p>
                </div>

                {/* Proof Attachments Section */}
                {call.proofFiles && call.proofFiles.length > 0 ? (
                  <div className="space-y-1.5 pt-2">
                    <p className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Proof Attachments ({call.proofFiles.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {call.proofFiles.map((file, idx) => {
                        const isImg = /\.(jpg|jpeg|png|webp|gif)$/i.test(file);
                        return (
                          <div
                            key={idx}
                            onClick={() => setPreviewProof(file)}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 ${innerBg} border hover:border-emerald-500/50 rounded-lg text-[11px] cursor-pointer transition`}
                          >
                            {isImg ? (
                              <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <FileText className="w-3.5 h-3.5 text-indigo-500" />
                            )}
                            <span className="truncate max-w-[120px]">Proof {idx + 1}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500 italic">No proof attached for this call log.</p>
                )}
              </div>

              {/* Footer displaying exact logged-by user */}
              <div className={`flex items-center justify-between pt-3 border-t ${darkMode ? 'border-slate-700/60' : 'border-slate-200'} text-xs ${textSub}`}>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(call.callDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px]">
                  <User className="w-3 h-3 text-emerald-500" />
                  <span>By: <strong className={textTitle}>{call.loggedByName || call.loggedBy?.name || 'Logged User'}</strong></span>
                </div>
                <button
                  onClick={() => handleDelete(call._id)}
                  className="p-1 hover:text-rose-500 text-slate-400 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Convert Call to Project Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`${cardBg} rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative`}>
            <div className={`flex items-center justify-between border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'} pb-3`}>
              <h3 className={`text-lg font-bold ${textTitle} flex items-center gap-2`}>
                <Briefcase className="w-5 h-5 text-emerald-500" />
                <span>Convert Call Lead to Project</span>
              </h3>
              <button onClick={() => setShowConvertModal(false)} className={`${textSub} hover:text-white`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProjectFromCall} className="space-y-4 text-sm">
              <div>
                <label className={`block ${textSub} mb-1 font-medium`}>Project Title *</label>
                <input
                  type="text"
                  required
                  value={convertData.title}
                  onChange={(e) => setConvertData({ ...convertData, title: e.target.value })}
                  className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none`}
                />
              </div>

              <div>
                <label className={`block ${textSub} mb-1 font-medium`}>Client Name *</label>
                <input
                  type="text"
                  required
                  value={convertData.clientName}
                  onChange={(e) => setConvertData({ ...convertData, clientName: e.target.value })}
                  className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none`}
                />
              </div>

              <div>
                <label className={`block ${textSub} mb-1 font-medium`}>Description & Scope</label>
                <textarea
                  rows="3"
                  value={convertData.description}
                  onChange={(e) => setConvertData({ ...convertData, description: e.target.value })}
                  className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block ${textSub} mb-1 font-medium`}>Agreed Budget ($)</label>
                  <input
                    type="number"
                    value={convertData.budget}
                    onChange={(e) => setConvertData({ ...convertData, budget: Number(e.target.value) })}
                    className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none`}
                  />
                </div>
                <div>
                  <label className={`block ${textSub} mb-1 font-medium`}>Deadline</label>
                  <input
                    type="date"
                    value={convertData.deadline}
                    onChange={(e) => setConvertData({ ...convertData, deadline: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none`}
                  />
                </div>
              </div>

              <div className={`flex justify-end gap-2 pt-3 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setShowConvertModal(false)}
                  className={`px-4 py-2 ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'} rounded-xl text-xs font-semibold`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/30"
                >
                  Create Linked Project 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Proof Preview Modal */}
      {previewProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className={`${cardBg} rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative`}>
            <div className={`flex items-center justify-between border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'} pb-3`}>
              <h3 className={`text-lg font-bold ${textTitle} flex items-center gap-2`}>
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span>Proof Attachment View</span>
              </h3>
              <button onClick={() => setPreviewProof(null)} className={`${textSub} hover:text-white`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`flex justify-center items-center ${innerBg} p-4 rounded-xl max-h-[60vh] overflow-auto`}>
              {/\.(jpg|jpeg|png|webp|gif)$/i.test(previewProof) ? (
                <img src={previewProof} alt="Proof Document" className="max-h-[50vh] object-contain rounded-lg shadow" />
              ) : (
                <div className="text-center py-10 space-y-3">
                  <FileText className="w-12 h-12 text-indigo-500 mx-auto" />
                  <p className={`${textTitle} text-sm`}>Document File</p>
                  <a href={previewProof} target="_blank" rel="noreferrer" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
                    Open / Download File
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <a href={previewProof} target="_blank" rel="noreferrer" className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" /> Open Full Screen
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Log Call Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`${cardBg} rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto`}>
            <div className={`flex items-center justify-between border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'} pb-3`}>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setLogMode('single')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    logMode === 'single'
                      ? 'bg-emerald-600 text-white'
                      : darkMode
                      ? 'bg-slate-700 text-slate-300'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  Single Call Log
                </button>
                <button
                  type="button"
                  onClick={() => setLogMode('bulk')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    logMode === 'bulk'
                      ? 'bg-indigo-600 text-white'
                      : darkMode
                      ? 'bg-slate-700 text-slate-300'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  Bulk Call Campaign 🚀
                </button>
              </div>

              <button onClick={() => setShowModal(false)} className={`${textSub} hover:text-white`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {logMode === 'single' ? (
              <form onSubmit={handleSingleSubmit} className="space-y-4 text-sm">
                <div>
                  <label className={`block ${textSub} mb-1 font-medium`}>Customer / Client Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="e.g. Mr. Suneth Bandara"
                    className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-emerald-500`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block ${textSub} mb-1 font-medium`}>Phone Number</label>
                    <input
                      type="text"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                      placeholder="+94 71 234 5678"
                      className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-emerald-500`}
                    />
                  </div>
                  <div>
                    <label className={`block ${textSub} mb-1 font-medium`}>Email Address</label>
                    <input
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                      placeholder="client@company.com"
                      className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-emerald-500`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block ${textSub} mb-1 font-medium`}>Outcome / Lead Status *</label>
                    <select
                      value={formData.outcome}
                      onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                      className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-emerald-500`}
                    >
                      <option value="Lead / New Inquiry">Lead / New Inquiry</option>
                      <option value="Interested">Interested</option>
                      <option value="Follow-up Scheduled">Follow-up Scheduled</option>
                      <option value="Deal Won">Deal Won 🎉</option>
                      <option value="Deal Lost">Deal Lost</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block ${textSub} mb-1 font-medium`}>Link To Project (Optional)</label>
                    <select
                      value={formData.project}
                      onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                      className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-emerald-500`}
                    >
                      <option value="">-- No Specific Project --</option>
                      {projects.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.title} ({p.clientName})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block ${textSub} mb-1 font-medium`}>Call Notes & Key Discussion *</label>
                  <textarea
                    rows="3"
                    required
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Summarize call requirements, agreed budget, next steps..."
                    className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-emerald-500`}
                  />
                </div>

                <div>
                  <label className={`block ${textSub} mb-1 font-medium flex items-center gap-1.5`}>
                    <Paperclip className="w-4 h-4 text-emerald-500" />
                    <span>Attach Proof Documents / Screenshots</span>
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setProofFiles(e.target.files)}
                    className={`w-full text-xs ${textSub} file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer`}
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
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/30"
                  >
                    Save Single Call Log
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleBulkSubmit} className="space-y-4 text-sm">
                <div>
                  <label className={`block ${textSub} mb-1 font-medium`}>
                    Enter Multiple Clients (1 per line) *
                  </label>
                  <textarea
                    rows="4"
                    required
                    value={bulkFormData.clientList}
                    onChange={(e) => setBulkFormData({ ...bulkFormData, clientList: e.target.value })}
                    placeholder={`e.g.\nMr. Kamal Perera, 0771234567, kamal@gmail.com\nMs. Nimali Fernando, 0719876543\nABC Traders, 0112345678`}
                    className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-indigo-500 font-mono text-xs`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block ${textSub} mb-1 font-medium`}>Outcome / Campaign Status *</label>
                    <select
                      value={bulkFormData.outcome}
                      onChange={(e) => setBulkFormData({ ...bulkFormData, outcome: e.target.value })}
                      className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-indigo-500`}
                    >
                      <option value="Lead / New Inquiry">Lead / New Inquiry</option>
                      <option value="Interested">Interested</option>
                      <option value="Follow-up Scheduled">Follow-up Scheduled</option>
                      <option value="Deal Won">Deal Won 🎉</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block ${textSub} mb-1 font-medium`}>Link To Project (Optional)</label>
                    <select
                      value={bulkFormData.project}
                      onChange={(e) => setBulkFormData({ ...bulkFormData, project: e.target.value })}
                      className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-indigo-500`}
                    >
                      <option value="">-- No Specific Project --</option>
                      {projects.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.title} ({p.clientName})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block ${textSub} mb-1 font-medium`}>Common Call Script / Notes</label>
                  <textarea
                    rows="2"
                    value={bulkFormData.notes}
                    onChange={(e) => setBulkFormData({ ...bulkFormData, notes: e.target.value })}
                    placeholder="Outreach details, campaign pitch summary..."
                    className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-indigo-500`}
                  />
                </div>

                <div>
                  <label className={`block ${textSub} mb-1 font-medium flex items-center gap-1.5`}>
                    <Paperclip className="w-4 h-4 text-indigo-500" />
                    <span>Attach Shared Campaign Proof / Proposal File</span>
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setProofFiles(e.target.files)}
                    className={`w-full text-xs ${textSub} file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer`}
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
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30"
                  >
                    Log Bulk Calls
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
