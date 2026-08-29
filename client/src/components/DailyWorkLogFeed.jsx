import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Paperclip,
  Clock,
  User,
  Calendar,
  ExternalLink,
  Trash2,
  X,
  Image as ImageIcon,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import axios from 'axios';

export default function DailyWorkLogFeed({ projects = [], currentUser, darkMode = true }) {
  const [workLogs, setWorkLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const [formData, setFormData] = useState({
    logDate: new Date().toISOString().split('T')[0],
    hoursWorked: 8,
    workSummary: '',
    project: '',
  });

  const [attachments, setAttachments] = useState([]);

  const cardBg = darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200 shadow-sm';
  const innerBg = darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200';
  const textTitle = darkMode ? 'text-white' : 'text-slate-900';
  const textSub = darkMode ? 'text-slate-400' : 'text-slate-500';
  const inputBg = darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900';

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/worklogs');
      setWorkLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('logDate', formData.logDate);
      data.append('hoursWorked', formData.hoursWorked);
      data.append('workSummary', formData.workSummary);
      if (formData.project) data.append('project', formData.project);

      for (let i = 0; i < attachments.length; i++) {
        data.append('attachments', attachments[i]);
      }

      await axios.post('/api/worklogs', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setShowModal(false);
      setFormData({
        logDate: new Date().toISOString().split('T')[0],
        hoursWorked: 8,
        workSummary: '',
        project: '',
      });
      setAttachments([]);
      fetchLogs();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit daily work log');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this daily work log entry?')) return;
    try {
      await axios.delete(`/api/worklogs/${id}`);
      fetchLogs();
    } catch (err) {
      alert('Failed to delete entry');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${cardBg} p-6 rounded-2xl border`}>
        <div>
          <h2 className={`text-xl font-bold ${textTitle} flex items-center gap-2`}>
            <FileText className="w-6 h-6 text-indigo-500" />
            <span>Daily Work Logs & Proof Uploads</span>
          </h2>
          <p className={`${textSub} text-sm mt-1`}>
            Submit daily work summaries, hours worked, and upload work proof documents/reports.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Daily Work Log</span>
        </button>
      </div>

      {/* Daily Work Logs Feed */}
      <div className={`${cardBg} rounded-2xl border p-6`}>
        {loading ? (
          <div className={`py-12 text-center ${textSub}`}>Loading daily work logs...</div>
        ) : workLogs.length === 0 ? (
          <div className={`text-center py-12 ${textSub}`}>
            <p className="text-base font-medium">No daily work logs submitted yet.</p>
            <p className="text-xs mt-1">Click "Upload Daily Work Log" to submit your daily progress & files.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {workLogs.map((log) => (
              <div
                key={log._id}
                className={`${innerBg} rounded-2xl border p-5 space-y-3 hover:border-indigo-500/40 transition shadow-sm`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow">
                      {log.userName ? log.userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`font-bold ${textTitle} text-sm`}>{log.userName}</h4>
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-500 px-2 py-0.5 rounded font-bold">
                          {log.hoursWorked} Hours Worked
                        </span>
                      </div>
                      <div className={`flex items-center gap-2 text-xs ${textSub} mt-0.5`}>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(log.logDate).toLocaleDateString()}
                        </span>
                        {log.project && (
                          <span className="text-indigo-400 font-medium">
                            • Project: {log.project.title}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {(currentUser?.role === 'Admin' || currentUser?.id === log.user?._id) && (
                    <button
                      onClick={() => handleDelete(log._id)}
                      className="text-slate-400 hover:text-rose-500 p-1 self-start sm:self-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Work Summary text */}
                <p className={`${textTitle} text-xs leading-relaxed whitespace-pre-line bg-slate-500/5 p-3 rounded-xl border border-slate-700/30`}>
                  {log.workSummary}
                </p>

                {/* Uploaded File Attachments */}
                {log.attachments && log.attachments.length > 0 && (
                  <div className="pt-2 border-t border-slate-700/40 space-y-1.5">
                    <p className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Work Proof Files ({log.attachments.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {log.attachments.map((file, idx) => {
                        const isImg = /\.(jpg|jpeg|png|webp|gif)$/i.test(file);
                        return (
                          <div
                            key={idx}
                            onClick={() => setPreviewFile(file)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 ${cardBg} border hover:border-emerald-500/50 rounded-lg text-xs cursor-pointer transition`}
                          >
                            {isImg ? (
                              <ImageIcon className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <FileText className="w-4 h-4 text-indigo-500" />
                            )}
                            <span className="font-medium truncate max-w-[150px]">
                              File Attachment {idx + 1}
                            </span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className={`${cardBg} rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative`}>
            <div className={`flex items-center justify-between border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'} pb-3`}>
              <h3 className={`text-lg font-bold ${textTitle} flex items-center gap-2`}>
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span>Daily Work Proof Preview</span>
              </h3>
              <button onClick={() => setPreviewFile(null)} className={`${textSub} hover:text-white`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`flex justify-center items-center ${innerBg} p-4 rounded-xl max-h-[60vh] overflow-auto`}>
              {/\.(jpg|jpeg|png|webp|gif)$/i.test(previewFile) ? (
                <img src={previewFile} alt="Work Proof" className="max-h-[50vh] object-contain rounded-lg shadow" />
              ) : (
                <div className="text-center py-10 space-y-3">
                  <FileText className="w-12 h-12 text-indigo-500 mx-auto" />
                  <p className={`${textTitle} text-sm`}>Document File</p>
                  <a href={previewFile} target="_blank" rel="noreferrer" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
                    Open / Download Document
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <a href={previewFile} target="_blank" rel="noreferrer" className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" /> Open Full Screen
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Upload Daily Work Log Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`${cardBg} rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto`}>
            <div className={`flex items-center justify-between border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'} pb-3`}>
              <h3 className={`text-lg font-bold ${textTitle} flex items-center gap-2`}>
                <FileText className="w-5 h-5 text-indigo-500" />
                <span>Submit Daily Work Log & Upload Proof</span>
              </h3>
              <button onClick={() => setShowModal(false)} className={`${textSub} hover:text-white`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block ${textSub} mb-1 font-medium`}>Work Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.logDate}
                    onChange={(e) => setFormData({ ...formData, logDate: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-indigo-500`}
                  />
                </div>
                <div>
                  <label className={`block ${textSub} mb-1 font-medium`}>Hours Worked *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="24"
                    value={formData.hoursWorked}
                    onChange={(e) => setFormData({ ...formData, hoursWorked: Number(e.target.value) })}
                    className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-indigo-500`}
                  />
                </div>
              </div>

              <div>
                <label className={`block ${textSub} mb-1 font-medium`}>Associated Project (Optional)</label>
                <select
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-indigo-500`}
                >
                  <option value="">-- General Work --</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title} ({p.clientName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block ${textSub} mb-1 font-medium`}>Daily Work Summary & Achievements *</label>
                <textarea
                  rows="4"
                  required
                  value={formData.workSummary}
                  onChange={(e) => setFormData({ ...formData, workSummary: e.target.value })}
                  placeholder="Detail completed modules, bug fixes, client calls, code pushes today..."
                  className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-indigo-500`}
                />
              </div>

              {/* Upload Work Proof Files */}
              <div>
                <label className={`block ${textSub} mb-1 font-medium flex items-center gap-1.5`}>
                  <Paperclip className="w-4 h-4 text-indigo-500" />
                  <span>Upload Daily Work Proof Documents / Screenshots</span>
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setAttachments(e.target.files)}
                  className={`w-full text-xs ${textSub} file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer`}
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Upload daily report PDFs, screenshots of completed work, code logs, or receipts.
                </p>
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
                  Submit Daily Work Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
