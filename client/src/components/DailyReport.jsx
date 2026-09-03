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
  CheckSquare,
} from 'lucide-react';
import axios from 'axios';

export default function DailyReport({ team = [], darkMode = true, systemName = 'Team Manager', logoUrl = '' }) {
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const cardBg = darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200 shadow-sm';
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
          {/* Executive Letterhead Header - Clean Plain Shield Icon (No Purple Box) */}
          <div className="border-b-2 border-indigo-600 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:pb-4">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
              ) : (
                <ShieldCheck className="w-9 h-9 text-indigo-600 shrink-0" />
              )}
              <div>
                <span className="text-2xl font-black text-indigo-600 tracking-tight block leading-none">
                  {systemName}
                </span>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">
                  Executive Performance & Work Audit Report
                </p>
              </div>
            </div>

            <div className="text-right text-xs text-slate-600 space-y-0.5 print:text-slate-700">
              <p>
                <strong>Report Date:</strong>{' '}
                {new Date(reportData.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p>
                <strong>Generated At:</strong> {new Date().toLocaleTimeString()}
              </p>
              <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded font-bold text-[10px] mt-1">
                Verified Official Audit Summary ✓
              </span>
            </div>
          </div>

          {/* Quick Executive Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:gap-3">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 print:bg-emerald-50 space-y-1">
              <span className="text-xs text-emerald-800 font-bold flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-600" /> Tasks Completed
              </span>
              <p className="text-2xl font-black text-emerald-700">{completedTasksCount}</p>
            </div>

            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 print:bg-blue-50 space-y-1">
              <span className="text-xs text-blue-800 font-bold flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5 text-blue-600" /> Calls Logged
              </span>
              <p className="text-2xl font-black text-blue-700">{callsList.length}</p>
            </div>

            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 print:bg-purple-50 space-y-1">
              <span className="text-xs text-purple-800 font-bold flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-purple-600" /> Milestone Updates
              </span>
              <p className="text-2xl font-black text-purple-700">{updatesList.length}</p>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 print:bg-amber-50 space-y-1">
              <span className="text-xs text-amber-800 font-bold flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-600" /> Deals Won Today
              </span>
              <p className="text-2xl font-black text-amber-700">{dealsWonCount}</p>
            </div>
          </div>

          {/* Employee-by-Employee Breakdown Section */}
          <div className="space-y-6">
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
                <div
                  key={member._id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/60 print:bg-white print:border-slate-300 space-y-4 print-avoid-break shadow-sm"
                >
                  {/* Clean Employee Header without purple background box */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-slate-900 dark:text-white print:text-slate-900 text-base leading-snug">
                          {member.name}
                        </h4>
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                          {member.role}
                        </span>
                        {member.isTeamLeader && (
                          <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full font-black">
                            👑 Team Leader
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{member.email}</p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
                      <span className="text-emerald-600 font-bold">{empTasks.length} Tasks</span>
                      <span>•</span>
                      <span className="text-blue-600 font-bold">{empCalls.length} Calls</span>
                      <span>•</span>
                      <span className="text-purple-600 font-bold">{empUpdates.length} Updates</span>
                    </div>
                  </div>

                  {/* Clean Corporate Table Layout for Employee Data */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                          <th className="py-2.5 px-3 w-1/3 border-r border-slate-200 dark:border-slate-700">
                            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Assigned / Completed Tasks ({empTasks.length})
                            </span>
                          </th>
                          <th className="py-2.5 px-3 w-1/3 border-r border-slate-200 dark:border-slate-700">
                            <span className="flex items-center gap-1 text-blue-700 dark:text-blue-400">
                              <PhoneCall className="w-3.5 h-3.5" /> Customer Calls Logged ({empCalls.length})
                            </span>
                          </th>
                          <th className="py-2.5 px-3 w-1/3">
                            <span className="flex items-center gap-1 text-purple-700 dark:text-purple-400">
                              <Activity className="w-3.5 h-3.5" /> Milestone Updates ({empUpdates.length})
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="align-top border-b border-slate-100 dark:border-slate-800">
                          {/* Column 1: Tasks */}
                          <td className="p-3 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
                            {empTasks.length > 0 ? (
                              <ul className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                                {empTasks.map((t) => (
                                  <li key={t._id} className="leading-snug">
                                    • <strong className="text-slate-900 dark:text-slate-100">{t.title}</strong>{' '}
                                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                                      ({t.status || 'In Progress'})
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-[10px] text-slate-400 italic">No tasks assigned for this date.</p>
                            )}
                          </td>

                          {/* Column 2: Calls */}
                          <td className="p-3 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
                            {empCalls.length > 0 ? (
                              <ul className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                                {empCalls.map((c) => (
                                  <li key={c._id} className="leading-snug">
                                    • <strong className="text-slate-900 dark:text-slate-100">{c.clientName}</strong>{' '}
                                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                                      ({c.outcome})
                                    </span>{' '}
                                    {c.proofFiles?.length > 0 ? <span className="text-emerald-600 font-bold">📎 Proof</span> : ''}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-[10px] text-slate-400 italic">No customer calls logged for this date.</p>
                            )}
                          </td>

                          {/* Column 3: Updates */}
                          <td className="p-3 bg-white dark:bg-slate-900/40">
                            {empUpdates.length > 0 ? (
                              <ul className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                                {empUpdates.map((u) => (
                                  <li key={u._id} className="leading-snug">
                                    • <strong className="text-slate-900 dark:text-slate-100">{u.updateTitle}</strong>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-[10px] text-slate-400 italic">No project updates posted for this date.</p>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
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
