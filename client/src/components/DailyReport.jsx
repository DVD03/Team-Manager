import React, { useState, useEffect } from 'react';
import {
  FileText,
  Calendar,
  Download,
  Users,
  CheckCircle2,
  PhoneCall,
  Briefcase,
  Activity,
  ShieldCheck,
  Clock,
  Printer,
  ExternalLink,
} from 'lucide-react';
import axios from 'axios';

export default function DailyReport({ team = [], darkMode = true }) {
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const cardBg = darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200 shadow-sm';
  const innerBg = darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200';
  const textTitle = darkMode ? 'text-white' : 'text-slate-900';
  const textSub = darkMode ? 'text-slate-400' : 'text-slate-500';

  const fetchReport = async (date) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/reports/daily?date=${date}`);
      setReportData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(reportDate);
  }, [reportDate]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Date Selector */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${cardBg} p-6 rounded-2xl border print:hidden`}>
        <div>
          <h2 className={`text-xl font-bold ${textTitle} flex items-center gap-2`}>
            <FileText className="w-6 h-6 text-indigo-500" />
            <span>Comprehensive In-Detail Daily Report (A-Z)</span>
          </h2>
          <p className={`${textSub} text-sm mt-1`}>
            Full breakdown of Employee Outputs, Tasks, Customer Calls & Proofs, Project Updates, & Work Hours.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className={`px-3 py-2 ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'} rounded-xl text-xs font-bold focus:outline-none`}
            />
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document */}
      {loading ? (
        <div className={`py-24 text-center ${cardBg} rounded-2xl border ${textSub}`}>
          Loading daily report data...
        </div>
      ) : !reportData ? (
        <div className={`py-12 text-center ${cardBg} rounded-2xl border ${textSub}`}>
          No data available for selected date.
        </div>
      ) : (
        <div className={`${cardBg} rounded-2xl border p-8 space-y-8 print:border-none print:shadow-none print:p-0`}>
          {/* Document Title Header */}
          <div className="border-b border-slate-700/60 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  ProManager A-Z
                </span>
                <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-bold">
                  Daily Work Audit
                </span>
              </div>
              <h1 className={`text-2xl font-bold ${textTitle} mt-1`}>
                Daily Executive Report: {new Date(reportData.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h1>
            </div>

            <div className={`text-right text-xs ${textSub}`}>
              <p>Generated At: {new Date().toLocaleTimeString()}</p>
              <p className="font-bold text-indigo-400">Status: Verified Official Summary</p>
            </div>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`${innerBg} p-4 rounded-xl border space-y-1`}>
              <span className={`text-xs ${textSub} font-medium`}>Total Tasks Completed</span>
              <p className="text-2xl font-black text-emerald-500">{reportData.summary.completedTasksToday}</p>
            </div>
            <div className={`${innerBg} p-4 rounded-xl border space-y-1`}>
              <span className={`text-xs ${textSub} font-medium`}>Customer Calls Logged</span>
              <p className="text-2xl font-black text-blue-500">{reportData.summary.callsToday}</p>
            </div>
            <div className={`${innerBg} p-4 rounded-xl border space-y-1`}>
              <span className={`text-xs ${textSub} font-medium`}>Project Updates Posted</span>
              <p className="text-2xl font-black text-pink-500">{reportData.summary.updatesToday}</p>
            </div>
            <div className={`${innerBg} p-4 rounded-xl border space-y-1`}>
              <span className={`text-xs ${textSub} font-medium`}>Deals Won Today</span>
              <p className="text-2xl font-black text-amber-500">
                {reportData.callsToday.filter((c) => c.outcome === 'Deal Won').length}
              </p>
            </div>
          </div>

          {/* Employee-by-Employee Breakdown Section */}
          <div className="space-y-4">
            <h3 className={`text-lg font-bold ${textTitle} flex items-center gap-2 border-b border-slate-700/60 pb-2`}>
              <Users className="w-5 h-5 text-purple-500" />
              <span>1. Employee-wise Output & Activities (A-Z)</span>
            </h3>

            {team.map((member) => {
              const empTasksCompleted = reportData.completedTasksToday.filter(
                (t) => t.assignedTo?._id === member._id || t.assignedTo === member._id
              );
              const empCalls = reportData.callsToday.filter(
                (c) => c.loggedBy?._id === member._id || c.loggedByName === member.name
              );
              const empUpdates = reportData.updatesToday.filter(
                (u) => u.updatedBy?._id === member._id
              );

              return (
                <div key={member._id} className={`${innerBg} p-5 rounded-2xl border space-y-3`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className={`font-bold ${textTitle} text-sm flex items-center gap-2`}>
                          <span>{member.name}</span>
                          <span className="text-xs text-purple-400">({member.role})</span>
                          {member.isTeamLeader && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-extrabold">Team Leader</span>
                          )}
                        </h4>
                        <p className={`text-xs ${textSub}`}>{member.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2">
                    {/* Tasks Completed */}
                    <div className="p-3 bg-slate-500/5 rounded-xl border border-slate-700/30 space-y-1">
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed Tasks ({empTasksCompleted.length}):
                      </span>
                      {empTasksCompleted.length > 0 ? (
                        <ul className="space-y-1 text-[11px] text-slate-300">
                          {empTasksCompleted.map((t) => (
                            <li key={t._id}>• {t.title} ({t.project?.title || 'Project'})</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[10px] text-slate-500 italic">No tasks completed today.</p>
                      )}
                    </div>

                    {/* Calls Logged */}
                    <div className="p-3 bg-slate-500/5 rounded-xl border border-slate-700/30 space-y-1">
                      <span className="font-bold text-blue-400 flex items-center gap-1">
                        <PhoneCall className="w-3.5 h-3.5" /> Customer Calls ({empCalls.length}):
                      </span>
                      {empCalls.length > 0 ? (
                        <ul className="space-y-1 text-[11px] text-slate-300">
                          {empCalls.map((c) => (
                            <li key={c._id}>
                              • {c.clientName} ({c.outcome}) {c.proofFiles?.length > 0 ? '📎 Proof Attached' : ''}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[10px] text-slate-500 italic">No customer calls logged today.</p>
                      )}
                    </div>

                    {/* Updates Posted */}
                    <div className="p-3 bg-slate-500/5 rounded-xl border border-slate-700/30 space-y-1">
                      <span className="font-bold text-pink-400 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5" /> Milestone Updates ({empUpdates.length}):
                      </span>
                      {empUpdates.length > 0 ? (
                        <ul className="space-y-1 text-[11px] text-slate-300">
                          {empUpdates.map((u) => (
                            <li key={u._id}>• {u.updateTitle}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[10px] text-slate-500 italic">No project updates posted today.</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Audit Logs Trail Today */}
          <div className="space-y-3 pt-4">
            <h3 className={`text-lg font-bold ${textTitle} flex items-center gap-2 border-b border-slate-700/60 pb-2`}>
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              <span>2. System Audit Log Entries Today ({reportData.auditLogsToday?.length || 0})</span>
            </h3>
            {reportData.auditLogsToday && reportData.auditLogsToday.length > 0 ? (
              <div className="space-y-1.5 text-xs">
                {reportData.auditLogsToday.map((log) => (
                  <div key={log._id} className="flex justify-between items-center p-2 bg-slate-500/5 rounded-lg border border-slate-700/30">
                    <div>
                      <span className="font-bold text-indigo-400">{log.userName}: </span>
                      <span className={textSub}>{log.details}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-xs ${textSub} italic`}>No audit logs recorded for this date.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
