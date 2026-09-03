import React, { useState, useEffect } from 'react';
import {
  FileText,
  Calendar,
  Users,
  CheckCircle2,
  PhoneCall,
  Activity,
  ShieldCheck,
  Printer,
  Award,
  Clock,
  CheckSquare,
} from 'lucide-react';
import axios from 'axios';

export default function DailyReport({ team = [], darkMode = true, systemName = 'Team Manager', logoUrl = '' }) {
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

  const tasksList = reportData?.tasks || [];
  const callsList = reportData?.calls || [];
  const updatesList = reportData?.updates || [];

  const completedTasksCount = tasksList.filter((t) => t.status === 'Completed').length;
  const dealsWonCount = callsList.filter((c) => c.outcome === 'Deal Won').length;

  return (
    <div className="space-y-6">
      {/* Header & Date Selector - Hidden during print */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${cardBg} p-6 rounded-2xl border print:hidden`}>
        <div>
          <h2 className={`text-xl font-bold ${textTitle} flex items-center gap-2`}>
            <FileText className="w-6 h-6 text-indigo-500" />
            <span>Comprehensive Executive Daily Audit Report (A-Z)</span>
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
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow shadow-indigo-600/30"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Executive Report Document */}
      {loading ? (
        <div className={`py-24 text-center ${cardBg} rounded-2xl border ${textSub}`}>
          Loading daily report data...
        </div>
      ) : !reportData ? (
        <div className={`py-12 text-center ${cardBg} rounded-2xl border ${textSub}`}>
          No data available for selected date.
        </div>
      ) : (
        <div className={`${cardBg} rounded-2xl border p-8 space-y-8 print:border-none print:shadow-none print:p-0 print:bg-white print:text-slate-900`}>
          {/* Executive Letterhead Header */}
          <div className="border-b-2 border-indigo-500 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:pb-4">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl print:border print:border-indigo-700">
                  {systemName.charAt(0)}
                </div>
              )}
              <div>
                <span className="text-2xl font-black text-indigo-600 tracking-tight">
                  {systemName}
                </span>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                  Executive Performance & Work Audit Report
                </p>
              </div>
            </div>

            <div className="text-right text-xs text-slate-500 space-y-1 print:text-slate-700">
              <p>
                <strong>Report Date:</strong>{' '}
                {new Date(reportData.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p>
                <strong>Generated At:</strong> {new Date().toLocaleTimeString()}
              </p>
              <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-bold text-[10px]">
                Verified Official Summary ✓
              </span>
            </div>
          </div>

          {/* Quick Executive Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:gap-3">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 print:bg-emerald-50 space-y-1">
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5" /> Tasks Completed
              </span>
              <p className="text-2xl font-black text-emerald-700">{completedTasksCount}</p>
            </div>

            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 print:bg-blue-50 space-y-1">
              <span className="text-xs text-blue-700 font-bold flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5" /> Calls Logged
              </span>
              <p className="text-2xl font-black text-blue-700">{callsList.length}</p>
            </div>

            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/60 print:bg-purple-50 space-y-1">
              <span className="text-xs text-purple-700 font-bold flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" /> Milestone Updates
              </span>
              <p className="text-2xl font-black text-purple-700">{updatesList.length}</p>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 print:bg-amber-50 space-y-1">
              <span className="text-xs text-amber-700 font-bold flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> Deals Won Today
              </span>
              <p className="text-2xl font-black text-amber-700">{dealsWonCount}</p>
            </div>
          </div>

          {/* Employee-by-Employee Breakdown Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white print:text-slate-900 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Employee Output & Activity Breakdown (A-Z)</span>
            </h3>

            {(team || []).map((member) => {
              const empTasks = tasksList.filter(
                (t) => t.assignedTo?._id === member._id || t.assignedTo === member._id
              );
              const empCalls = callsList.filter(
                (c) => c.loggedBy?._id === member._id || c.loggedByName === member.name
              );
              const empUpdates = updatesList.filter(
                (u) => u.updatedBy?._id === member._id
              );

              return (
                <div key={member._id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/60 print:bg-white print:border-slate-300 space-y-3 print-avoid-break">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow shrink-0">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white print:text-slate-900 text-sm flex items-center gap-2">
                          <span>{member.name}</span>
                          <span className="text-xs text-indigo-600 font-semibold">({member.role})</span>
                          {member.isTeamLeader && (
                            <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded font-black">👑 Team Leader</span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-500">{member.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2">
                    {/* Tasks Completed */}
                    <div className="p-3 bg-white dark:bg-slate-800/80 print:bg-slate-50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Tasks ({empTasks.length}):
                      </span>
                      {empTasks.length > 0 ? (
                        <ul className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                          {empTasks.map((t) => (
                            <li key={t._id}>• {t.title} ({t.status || 'In Progress'})</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic">No tasks assigned today.</p>
                      )}
                    </div>

                    {/* Calls Logged */}
                    <div className="p-3 bg-white dark:bg-slate-800/80 print:bg-slate-50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                      <span className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1">
                        <PhoneCall className="w-3.5 h-3.5" /> Calls ({empCalls.length}):
                      </span>
                      {empCalls.length > 0 ? (
                        <ul className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                          {empCalls.map((c) => (
                            <li key={c._id}>
                              • {c.clientName} ({c.outcome}) {c.proofFiles?.length > 0 ? '📎 Proof' : ''}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic">No customer calls logged today.</p>
                      )}
                    </div>

                    {/* Updates Posted */}
                    <div className="p-3 bg-white dark:bg-slate-800/80 print:bg-slate-50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                      <span className="font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5" /> Milestone Updates ({empUpdates.length}):
                      </span>
                      {empUpdates.length > 0 ? (
                        <ul className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                          {empUpdates.map((u) => (
                            <li key={u._id}>• {u.updateTitle}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic">No project updates posted today.</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Corporate Executive Sign-off Footer (Appears on print) */}
          <div className="hidden print:flex justify-between items-end pt-12 border-t border-slate-300 text-xs text-slate-600">
            <div className="space-y-6">
              <div className="w-48 border-b border-slate-400"></div>
              <p className="font-bold">Prepared By: Operations Manager</p>
            </div>
            <div className="space-y-6 text-right">
              <div className="w-48 border-b border-slate-400 ml-auto"></div>
              <p className="font-bold">Approved By: Executive Board</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
