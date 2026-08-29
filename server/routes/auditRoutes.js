const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { protect, adminOnly } = require('../middleware/auth');

// Get audit logs with filter (Admin only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { module, action } = req.query;
    const filter = {};
    if (module) filter.module = module;
    if (action) filter.action = action;

    const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
