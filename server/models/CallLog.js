const mongoose = require('mongoose');

const CallLogSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true, trim: true },
    clientPhone: { type: String, trim: true, default: '' },
    clientEmail: { type: String, trim: true, default: '' },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      set: (v) => (v === '' || v === 'null' || !v ? null : v),
    },
    callDate: { type: Date, default: Date.now },
    durationMinutes: { type: Number, default: 0 },
    notes: { type: String, required: true },
    outcome: {
      type: String,
      enum: ['Lead / New Inquiry', 'Interested', 'Follow-up Scheduled', 'Deal Won', 'Deal Lost'],
      default: 'Lead / New Inquiry',
    },
    proofFiles: [{ type: String }],
    loggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeamMember',
      set: (v) => (v === '' || v === 'null' || !v ? null : v),
    },
    loggedByName: { type: String, default: 'System' },
    loggedByEmail: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CallLog', CallLogSchema);
