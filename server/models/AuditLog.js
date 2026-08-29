const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    userRole: { type: String, required: true },
    userEmail: { type: String, default: '' },
    action: {
      type: String,
      required: true,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'STATUS_CHANGE', 'UPLOAD'],
    },
    module: {
      type: String,
      required: true,
      enum: ['PROJECT', 'TASK', 'CALL', 'TEAM', 'UPDATE', 'AUTH'],
    },
    details: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', AuditLogSchema);
