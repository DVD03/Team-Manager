import React, { useState, useEffect } from 'react';
import { ShieldCheck, Filter, Search, Clock, User, Activity, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function AuditLogViewer({ darkMode = true }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const cardBg = darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200 shadow-sm';
  const innerBg = darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200';
  const textTitle = darkMode ? 'text-white' : 'text-slate-900';
  const textSub = darkMode ? 'text-slate-400' : 'text-slate-500';
  const inputBg = darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900';

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/audit', {
        params: { module: moduleFilter, action: actionFilter },
      });
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [moduleFilter, actionFilter]);

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.userName.toLowerCase().includes(term) ||
      log.details.toLowerCase().includes(term) ||
      log.module.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${cardBg} p-6 rounded-2xl border`}>
        <div>
          <h2 className={`text-xl font-bold ${textTitle} flex items-center gap-2`}>
            <ShieldCheck className="w-6 h-6 text-indigo-500" />
            <span>System Audit Logs</span>
          </h2>
          <p className={`${textSub} text-sm mt-1`}>
            Track all system activities, task updates, user logins, call uploads, and project changes.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className={`flex flex-wrap items-center justify-between gap-4 ${cardBg} p-4 rounded-xl border text-xs`}>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`${textSub} flex items-center gap-1 font-medium`}>
            <Filter className="w-3.5 h-3.5 text-indigo-500" /> Filter By:
          </span>

          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className={`px-3 py-1.5 ${inputBg} rounded-lg focus:outline-none`}
          >
            <option value="">All Modules</option>
            <option value="PROJECT">Projects</option>
            <option value="TASK">Tasks</option>
            <option value="CALL">Customer Calls</option>
            <option value="TEAM">Team Members</option>
            <option value="UPDATE">Project Updates</option>
            <option value="AUTH">Authentication</option>
          </select>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className={`px-3 py-1.5 ${inputBg} rounded-lg focus:outline-none`}
          >
            <option value="">All Action Types</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="STATUS_CHANGE">Status Change</option>
            <option value="LOGIN">Login</option>
            <option value="UPLOAD">File Upload</option>
          </select>

          {(moduleFilter || actionFilter) && (
            <button
              onClick={() => {
                setModuleFilter('');
                setActionFilter('');
              }}
              className="text-indigo-500 hover:underline font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit logs..."
            className={`pl-8 pr-3 py-1.5 ${inputBg} rounded-lg text-xs focus:outline-none`}
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className={`${cardBg} rounded-2xl border p-6`}>
        {loading ? (
          <div className={`py-12 text-center ${textSub}`}>Loading audit history...</div>
        ) : filteredLogs.length === 0 ? (
          <div className={`py-12 text-center ${textSub}`}>No audit log entries found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`${innerBg} ${textTitle} border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Module</th>
                  <th className="p-3">Activity Details</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-slate-700/60' : 'divide-slate-200'}`}>
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-500/5 transition">
                    <td className={`p-3 whitespace-nowrap ${textSub}`}>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                        <User className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{log.userName}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-normal">
                          {log.userRole}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          log.action === 'CREATE'
                            ? 'bg-emerald-500/20 text-emerald-500'
                            : log.action === 'DELETE'
                            ? 'bg-rose-500/20 text-rose-500'
                            : log.action === 'LOGIN'
                            ? 'bg-purple-500/20 text-purple-500'
                            : log.action === 'STATUS_CHANGE'
                            ? 'bg-amber-500/20 text-amber-500'
                            : 'bg-blue-500/20 text-blue-500'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap font-semibold text-indigo-500">
                      {log.module}
                    </td>
                    <td className={`p-3 ${textTitle} max-w-md`}>
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
