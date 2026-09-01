const mongoose = require('mongoose');

const TeamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: '', trim: true },
    role: { type: String, required: true, default: 'Developer' },
    status: { type: String, enum: ['Active', 'On Leave', 'Inactive'], default: 'Active' },
    avatar: { type: String, default: '' },
    skills: [{ type: String }],
    isTeamLeader: { type: Boolean, default: false },
    teamLeader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeamMember',
      set: (v) => (v === '' || v === 'null' ? null : v),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TeamMember', TeamMemberSchema);
