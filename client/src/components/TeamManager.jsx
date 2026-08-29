import React, { useState } from 'react';
import { Users, Plus, Mail, Phone, Trash2, Edit2, UserPlus, Key, X, Lock, CheckCircle2, Shield, Crown, UserCheck } from 'lucide-react';
import axios from 'axios';

export default function TeamManager({ team = [], onRefresh, darkMode = true }) {
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Developer',
    status: 'Active',
    skills: '',
    password: '',
    isTeamLeader: false,
    teamLeader: '',
  });

  const cardBg = darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200 shadow-sm';
  const innerBg = darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200';
  const textTitle = darkMode ? 'text-white' : 'text-slate-900';
  const textSub = darkMode ? 'text-slate-400' : 'text-slate-500';
  const inputBg = darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900';

  const teamLeaders = team.filter((m) => m.isTeamLeader);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = formData.skills
        ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const payload = { ...formData, skills: skillsArray };

      if (editingMember) {
        await axios.put(`/api/team/${editingMember._id}`, payload);
      } else {
        await axios.post('/api/team', payload);
      }

      setShowModal(false);
      setEditingMember(null);
      resetForm();
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save team member');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'Developer',
      status: 'Active',
      skills: '',
      password: '',
      isTeamLeader: false,
      teamLeader: '',
    });
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      role: member.role,
      status: member.status || 'Active',
      skills: member.skills ? member.skills.join(', ') : '',
      password: '',
      isTeamLeader: !!member.isTeamLeader,
      teamLeader: member.teamLeader ? (member.teamLeader._id || member.teamLeader) : '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this team member and their login access?')) return;
    try {
      await axios.delete(`/api/team/${id}`);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete team member');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${cardBg} p-6 rounded-2xl border`}>
        <div>
          <h2 className={`text-xl font-bold ${textTitle} flex items-center gap-2`}>
            <Users className="w-6 h-6 text-purple-500" />
            <span>Team Hierarchy & Leader Management</span>
          </h2>
          <p className={`${textSub} text-sm mt-1`}>
            Appoint Team Leaders, assign members under leaders, and manage login access & workloads.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingMember(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm rounded-xl transition shadow-lg shadow-purple-600/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Team Member & Login</span>
        </button>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.length === 0 ? (
          <div className={`col-span-full text-center py-12 ${cardBg} rounded-2xl border ${textSub}`}>
            <p className="text-base font-medium">No team members added yet.</p>
            <p className="text-xs mt-1">Click "Add Team Member & Login" to get started.</p>
          </div>
        ) : (
          team.map((member) => (
            <div
              key={member._id}
              className={`${cardBg} rounded-2xl border p-5 space-y-4 hover:border-purple-500/50 transition shadow-lg relative group flex flex-col justify-between`}
            >
              <div className="space-y-3">
                {/* Top Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white text-lg shadow-md relative">
                      {member.name.charAt(0).toUpperCase()}
                      {member.isTeamLeader && (
                        <span className="absolute -top-1.5 -right-1.5 text-amber-400 bg-slate-900 rounded-full p-0.5 shadow">
                          <Crown className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className={`font-bold ${textTitle} text-base`}>{member.name}</h3>
                        {member.isTeamLeader && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-extrabold border border-amber-500/30">
                            Team Leader
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-purple-500 font-medium">{member.role}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                      member.status === 'Active'
                        ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                        : member.status === 'On Leave'
                        ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                    }`}
                  >
                    {member.status}
                  </span>
                </div>

                {/* Team Hierarchy Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {member.isTeamLeader ? (
                    <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 font-bold flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Managing {member.subMembersCount || 0} Member(s)
                    </span>
                  ) : member.teamLeader ? (
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 font-medium flex items-center gap-1">
                      <UserCheck className="w-3 h-3" /> Reports to: {member.teamLeader.name}
                    </span>
                  ) : null}

                  {member.hasLogin ? (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                      <CheckCircle2 className="w-3 h-3" /> Active Login
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20 font-medium">
                      <Lock className="w-3 h-3" /> No Login Set
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className={`space-y-2 text-xs ${textSub}`}>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                </div>

                {/* Skills Tags */}
                {member.skills && member.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {member.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-0.5 ${innerBg} ${textSub} rounded text-[10px] border`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Task Workload & Actions */}
              <div className="space-y-2 pt-3 border-t border-slate-700/60">
                <div className={`flex items-center justify-between text-xs ${textSub}`}>
                  <span>
                    Workload: <strong className={textTitle}>{member.totalTasks || 0} tasks</strong>
                  </span>
                  <span className="text-emerald-500 font-medium">
                    {member.completedTasks || 0} completed
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleEdit(member)}
                    className={`px-3 py-1.5 ${
                      darkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    } rounded-lg transition text-xs flex items-center gap-1 font-medium`}
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit / Leader
                  </button>

                  <button
                    onClick={() => handleDelete(member._id)}
                    className="p-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-500 rounded-lg transition text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Member Add & Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`${cardBg} rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto`}>
            <div className={`flex items-center justify-between border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'} pb-3`}>
              <h3 className={`text-lg font-bold ${textTitle}`}>
                {editingMember ? 'Edit Member & Leader Role' : 'Add Team Member & Create Login'}
              </h3>
              <button onClick={() => setShowModal(false)} className={`${textSub} hover:text-white`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className={`block ${textSub} mb-1 font-medium`}>Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Kasun Perera"
                  className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-purple-500`}
                />
              </div>

              <div>
                <label className={`block ${textSub} mb-1 font-medium`}>Email Address (Login Email) *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="kasun@example.com"
                  className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-purple-500`}
                />
              </div>

              {/* Password Field */}
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-1">
                <label className={`block ${textTitle} font-bold text-xs flex items-center gap-1.5`}>
                  <Key className="w-4 h-4 text-purple-500" />
                  <span>{editingMember ? 'Update Login Password (Optional)' : 'Set Login Password for Member *'}</span>
                </label>
                <input
                  type="password"
                  required={!editingMember}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingMember ? 'Leave empty to keep current password' : 'Set password (e.g. member123)'}
                  className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-purple-500 text-xs`}
                />
              </div>

              {/* Team Leader Toggle & Hierarchy Selection */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-3">
                <label className={`flex items-center space-x-2 text-xs ${textTitle} font-bold cursor-pointer`}>
                  <input
                    type="checkbox"
                    checked={formData.isTeamLeader}
                    onChange={(e) => setFormData({ ...formData, isTeamLeader: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <span className="flex items-center gap-1">
                    <Crown className="w-4 h-4 text-amber-400" /> Appoint as Team Leader
                  </span>
                </label>

                {!formData.isTeamLeader && (
                  <div>
                    <label className={`block ${textSub} text-[11px] mb-1`}>Assign under Team Leader:</label>
                    <select
                      value={formData.teamLeader}
                      onChange={(e) => setFormData({ ...formData, teamLeader: e.target.value })}
                      className={`w-full px-3 py-1.5 ${inputBg} rounded-lg text-xs focus:outline-none`}
                    >
                      <option value="">-- No Direct Team Leader --</option>
                      {teamLeaders
                        .filter((tl) => !editingMember || tl._id !== editingMember._id)
                        .map((tl) => (
                          <option key={tl._id} value={tl._id}>
                            👑 {tl.name} ({tl.role})
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block ${textSub} mb-1 font-medium`}>Role *</label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="UI Designer / Dev Lead"
                    className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-purple-500`}
                  />
                </div>
                <div>
                  <label className={`block ${textSub} mb-1 font-medium`}>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-purple-500`}
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block ${textSub} mb-1 font-medium`}>Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+94 77 123 4567"
                  className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-purple-500`}
                />
              </div>

              <div>
                <label className={`block ${textSub} mb-1 font-medium`}>Skills (comma separated)</label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="React, Node.js, Design, Testing"
                  className={`w-full px-3 py-2 ${inputBg} rounded-xl focus:outline-none focus:border-purple-500`}
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
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-600/30"
                >
                  {editingMember ? 'Save Changes' : 'Save Member & Create Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
