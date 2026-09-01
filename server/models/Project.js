const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    clientName: { type: String, required: true, trim: true },
    category: { type: String, default: 'Software & Apps', trim: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: [
        'Planning',
        'Requirements & Design',
        'In Development',
        'Testing / QA',
        'Delivered / Handed Over',
        'Maintenance & Updates',
        'On Hold',
      ],
      default: 'In Development',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    startDate: { type: Date, default: Date.now },
    deadline: { type: Date },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    budget: { type: Number, default: 0 },
    assignedTeam: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TeamMember',
        set: (v) => (v === '' || v === 'null' ? null : v),
      },
    ],
    // Acquisition & Call fields
    acquiredViaCall: { type: Boolean, default: false },
    linkedCall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CallLog',
      set: (v) => (v === '' || v === 'null' ? null : v),
    },
    // Post Handover fields
    handoverDate: { type: Date },
    warrantyEndDate: { type: Date },
    maintenanceStatus: { type: String, default: 'Active Maintenance' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', ProjectSchema);
