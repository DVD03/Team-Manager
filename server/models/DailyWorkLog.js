const mongoose = require('mongoose');

const DailyWorkLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      set: (v) => (v === '' || v === 'null' || !v ? null : v),
    },
    userName: { type: String, required: true },
    userRole: { type: String, default: 'Member' },
    logDate: { type: Date, default: Date.now },
    hoursWorked: { type: Number, default: 8 },
    workSummary: { type: String, required: true },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      set: (v) => (v === '' || v === 'null' || !v ? null : v),
    },
    attachments: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('DailyWorkLog', DailyWorkLogSchema);
