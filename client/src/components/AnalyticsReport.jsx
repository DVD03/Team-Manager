import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  PhoneCall,
  Briefcase,
  Users,
  CheckCircle2,
  DollarSign,
  Search,
  Filter,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

export default function AnalyticsReport({ projects = [], tasks = [], team = [], calls = [], darkMode = true }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedEmployee, setSelectedEmployee] = useState('All');

  const cardBg = darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200 shadow-sm';
  const innerBg = darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200';
  const textTitle = darkMode ? 'text-white' : 'text-slate-900';
  const textSub = darkMode ? 'text-slate-400' : 'text-slate-500';
  const inputBg = darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900';

  // Category Breakdown Aggregation
  const categoryStats = projects.reduce((acc, p) => {
    const cat = p.category || 'Custom / Uncategorized';
    if (!acc[cat]) {
      acc[cat] = { name: cat, count: 0, totalBudget: 0, completedCount: 0, projects: [] };
    }
    acc[cat].count += 1;
    acc[cat].totalBudget += p.budget || 0;
    if (p.status === 'Delivered / Handed Over' || p.progress === 100) {
      acc[cat].completedCount += 1;
    }
    acc[cat].projects.push(p);
    return acc;
  }, {});

  const categoryList = Object.values(categoryStats).sort((a, b) => b.count - a.count);

  // Call Conversion Aggregation
  const totalCalls = calls.length;
  const dealsWonCalls = calls.filter((c) => c.outcome === 'Deal Won').length;
  const interestedCalls = calls.filter((c) => c.outcome === 'Interested').length;
  const conversionRate = totalCalls > 0 ? Math.round((dealsWonCalls / totalCalls) * 100) : 0;
  const projectsFromCalls = projects.filter((p) => p.acquiredViaCall || p.linkedCall).length;

  // Filtered Projects by Selected Category
  const filteredCategoryProjects =
    selectedCategory === 'All'
      ? projects
      : projects.filter((p) => (p.category || 'Custom / Uncategorized') === selectedCategory);

  // Employee Output Matrix
  const employeeMatrix = team.map((m) => {
    const empTasks = tasks.filter((t) => t.assignedTo?._id === m._id || t.assignedTo === m._id);
    const empCompletedTasks = empTasks.filter((t) => t.status === 'Completed').length;
    const empCalls = calls.filter((c) => c.loggedBy?._id === m._id || c.loggedByName === m.name);
    const empDealsWon = empCalls.filter((c) => c.outcome === 'Deal Won').length;
    const empConversionRate = empCalls.length > 0 ? Math.round((empDealsWon / empCalls.length) * 100) : 0;

    return {
      member: m,
      totalTasks: empTasks.length,
      completedTasks: empCompletedTasks,
      pendingTasks: empTasks.length - empCompletedTasks,
      callsLogged: empCalls.length,
      dealsWon: empDealsWon,
      conversionRate: empConversionRate,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${cardBg} p-6 rounded-2xl border`}>
        <div>
          <h2 className={`text-xl font-bold ${textTitle} flex items-center gap-2`}>
            <BarChart3 className="w-6 h-6 text-indigo-500" />
            <span>Category Sector & Performance Analytics</span>
          </h2>
          <p className={`${textSub} text-sm mt-1`}>
            Analyze top-performing project categories (e.g. Salon, E-Commerce), call conversion rates, and employee performance matrix.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${cardBg} p-5 rounded-2xl border space-y-2`}>
          <div className="flex justify-between items-center text-xs font-semibold text-indigo-500">
            <span>Call Conversion Rate</span>
            <PhoneCall className="w-4 h-4" />
          </div>
          <p className={`text-3xl font-extrabold ${textTitle}`}>{conversionRate}%</p>
          <p className={`${textSub} text-xs`}>
            {dealsWonCalls} deals won out of {totalCalls} calls logged
          </p>
        </div>

        <div className={`${cardBg} p-5 rounded-2xl border space-y-2`}>
          <div className="flex justify-between items-center text-xs font-semibold text-emerald-500">
            <span>Projects From Calls</span>
            <Briefcase className="w-4 h-4" />
          </div>
          <p className={`text-3xl font-extrabold ${textTitle}`}>{projectsFromCalls}</p>
          <p className={`${textSub} text-xs`}>Converted from call acquisition leads</p>
        </div>

        <div className={`${cardBg} p-5 rounded-2xl border space-y-2`}>
          <div className="flex justify-between items-center text-xs font-semibold text-pink-500">
            <span>Top Category Sector</span>
            <PieChart className="w-4 h-4" />
          </div>
          <p className={`text-2xl font-extrabold ${textTitle} truncate`}>
            {categoryList.length > 0 ? categoryList[0].name : 'N/A'}
          </p>
          <p className={`${textSub} text-xs`}>
            {categoryList.length > 0 ? `${categoryList[0].count} projects` : 'No categories yet'}
          </p>
        </div>

        <div className={`${cardBg} p-5 rounded-2xl border space-y-2`}>
          <div className="flex justify-between items-center text-xs font-semibold text-purple-500">
            <span>Total Budget Volume</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <p className={`text-3xl font-extrabold ${textTitle}`}>
            ${projects.reduce((sum, p) => sum + (p.budget || 0), 0).toLocaleString()}
          </p>
          <p className={`${textSub} text-xs`}>Across all active & delivered projects</p>
        </div>
      </div>

      {/* Category / Sector Analysis Section (e.g., Saloons, E-Commerce, etc.) */}
      <div className={`${cardBg} rounded-2xl border p-6 space-y-6`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-4">
          <div>
            <h3 className={`text-lg font-bold ${textTitle} flex items-center gap-2`}>
              <PieChart className="w-5 h-5 text-indigo-500" />
              <span>Project Distribution by Industry / Category (Sector Analysis)</span>
            </h3>
            <p className={`${textSub} text-xs mt-0.5`}>
              Discover which industry sectors (e.g. Saloon, E-Commerce, Real Estate) yield the most projects & budget.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`${textSub} text-xs font-medium`}>Filter Sector:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`px-3 py-1.5 ${inputBg} rounded-xl text-xs font-bold focus:outline-none`}
            >
              <option value="All">All Categories ({categoryList.length})</option>
              {categoryList.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name} ({cat.count})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sector Grid Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryList.map((cat) => (
            <div
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`${innerBg} p-4 rounded-xl border hover:border-indigo-500/50 cursor-pointer transition space-y-2 ${
                selectedCategory === cat.name ? 'border-indigo-500 ring-2 ring-indigo-500/20' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <span className={`font-bold ${textTitle} text-sm truncate max-w-[140px]`}>{cat.name}</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-500 px-2 py-0.5 rounded font-bold">
                  {cat.count} Project(s)
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Revenue Budget:</span>
                  <span className="text-emerald-500 font-bold">${cat.totalBudget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Delivered Rate:</span>
                  <span className="text-indigo-400 font-bold">
                    {cat.count > 0 ? Math.round((cat.completedCount / cat.count) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filtered Projects List under Selected Category */}
        <div className="space-y-3 pt-2">
          <h4 className={`font-bold ${textTitle} text-sm`}>
            Projects in "{selectedCategory}" Sector ({filteredCategoryProjects.length}):
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategoryProjects.length === 0 ? (
              <p className={`text-xs ${textSub} italic col-span-full py-4`}>No projects found in this category.</p>
            ) : (
              filteredCategoryProjects.map((p) => (
                <div key={p._id} className={`${innerBg} p-4 rounded-xl border space-y-2 text-xs`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-indigo-400 font-semibold">{p.category}</span>
                      <h5 className={`font-bold ${textTitle} text-sm`}>{p.title}</h5>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded font-bold">
                      {p.status}
                    </span>
                  </div>
                  <p className={`${textSub} text-[11px]`}>Client: {p.clientName}</p>
                  <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-700/40">
                    <span>Progress: {p.progress}%</span>
                    <span className="text-emerald-400 font-bold">${p.budget ? p.budget.toLocaleString() : 0}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Employee-wise Performance Matrix Table */}
      <div className={`${cardBg} rounded-2xl border p-6 space-y-4`}>
        <h3 className={`text-lg font-bold ${textTitle} flex items-center gap-2`}>
          <Users className="w-5 h-5 text-purple-500" />
          <span>Employee Output & Call Conversion Matrix</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b ${darkMode ? 'border-slate-700/60 bg-slate-900/60 text-slate-300' : 'border-slate-200 bg-slate-100 text-slate-700'}`}>
              <tr>
                <th className="py-3 px-4 font-bold">Employee Name</th>
                <th className="py-3 px-4 font-bold">Role</th>
                <th className="py-3 px-4 font-bold">Total Tasks</th>
                <th className="py-3 px-4 font-bold">Completed Tasks</th>
                <th className="py-3 px-4 font-bold">Calls Logged</th>
                <th className="py-3 px-4 font-bold">Deals Won</th>
                <th className="py-3 px-4 font-bold">Call Conversion %</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-slate-700/60' : 'divide-slate-200'}`}>
              {employeeMatrix.map((row) => (
                <tr key={row.member._id} className="hover:bg-slate-500/5 transition">
                  <td className={`py-3 px-4 font-bold ${textTitle} flex items-center gap-2`}>
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      {row.member.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{row.member.name}</span>
                    {row.member.isTeamLeader && (
                      <span className="text-[9px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded font-extrabold">Leader</span>
                    )}
                  </td>
                  <td className={`py-3 px-4 ${textSub}`}>{row.member.role}</td>
                  <td className={`py-3 px-4 font-bold ${textTitle}`}>{row.totalTasks}</td>
                  <td className="py-3 px-4 font-bold text-emerald-500">{row.completedTasks}</td>
                  <td className={`py-3 px-4 ${textSub}`}>{row.callsLogged}</td>
                  <td className="py-3 px-4 font-bold text-blue-500">{row.dealsWon}</td>
                  <td className="py-3 px-4 font-bold">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        row.conversionRate > 50
                          ? 'bg-emerald-500/20 text-emerald-500'
                          : row.conversionRate > 20
                          ? 'bg-amber-500/20 text-amber-500'
                          : 'bg-slate-500/20 text-slate-400'
                      }`}
                    >
                      {row.conversionRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
