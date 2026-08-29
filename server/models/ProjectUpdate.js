const mongoose = require('mongoose');

const ProjectUpdateSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    updateTitle: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['Milestone Progress', 'Post-Handover Change Request', 'Bug Fix / Patch', 'Maintenance Update', 'New Feature Request'],
      default: 'Milestone Progress',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Done'],
      default: 'In Progress',
    },
    requestStatus: {
      type: String,
      enum: ['Requested by Client', 'Approved', 'In Development', 'Deployed & Handed Over'],
      default: 'In Development',
    },
    progressPercentage: { type: Number },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'TeamMember' },
    attachments: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProjectUpdate', ProjectUpdateSchema);
