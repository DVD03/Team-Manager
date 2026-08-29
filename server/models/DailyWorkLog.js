const mongoose = require('mongoose');

const DailyWorkLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userRole: { type: String, default: 'Member' },
    logDate: { type: Date, default: Date.now },
    hoursWorked: { type: Number, default: 8 },
    workSummary: { type: String, required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    attachments: [{ type: String }], // Array of uploaded document/image file paths
  },
  { timestamps: true }
);

module.exports = mongoose.model('DailyWorkLog', DailyWorkLogSchema);
