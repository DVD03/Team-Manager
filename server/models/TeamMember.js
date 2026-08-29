const mongoose = require('mongoose');

const TeamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: '' },
    role: { type: String, required: true, default: 'Developer' },
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Inactive'],
      default: 'Active',
    },
    skills: [{ type: String }],
    avatar: { type: String, default: '' },
    // Team Leader & Hierarchy fields
    isTeamLeader: { type: Boolean, default: false },
    teamLeader: { type: mongoose.Schema.Types.ObjectId, ref: 'TeamMember' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TeamMember', TeamMemberSchema);
