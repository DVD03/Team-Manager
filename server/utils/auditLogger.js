const AuditLog = require('../models/AuditLog');

const logAudit = async ({ userName = 'System', userRole = 'System', userEmail = '', action, module, details }) => {
  try {
    const log = new AuditLog({
      userName,
      userRole,
      userEmail,
      action,
      module,
      details,
    });
    await log.save();
  } catch (err) {
    console.error('[Audit Log Error]:', err.message);
  }
};

module.exports = logAudit;
