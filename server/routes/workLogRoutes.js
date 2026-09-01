const express = require('express');
const router = express.Router();
const DailyWorkLog = require('../models/DailyWorkLog');
const User = require('../models/User');
const upload = require('../middleware/upload');
const logAudit = require('../utils/auditLogger');
const getMemberScope = require('../utils/memberScope');
const { protect } = require('../middleware/auth');

// Get daily work logs (Admin sees all; Member sees own / team leader logs)
router.get('/', protect, async (req, res) => {
  try {
    const { date, user } = req.query;
    const scope = await getMemberScope(req.user);

    const filter = {};
    if (user) filter.user = user;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.logDate = { $gte: startOfDay, $lte: endOfDay };
    }

    if (!scope.isAdmin) {
      const allowedUsers = await User.find({
        $or: [
          { _id: req.user.id },
          { teamMember: { $in: scope.allowedMemberIds } },
          { email: req.user.email },
        ],
      }).select('_id');
      const allowedUserIds = allowedUsers.map((u) => u._id);

      filter.$or = [
        { user: { $in: allowedUserIds } },
        { user: req.user.id },
      ];
    }

    const logs = await DailyWorkLog.find(filter)
      .populate('user', 'name email role')
      .populate('project', 'title clientName')
      .sort({ logDate: -1, createdAt: -1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit daily work log entry with file uploads
router.post('/', protect, upload.array('attachments', 5), async (req, res) => {
  try {
    const filePaths = req.files ? req.files.map((file) => `/uploads/${file.filename}`) : [];

    const workLog = new DailyWorkLog({
      user: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      logDate: req.body.logDate || new Date(),
      hoursWorked: req.body.hoursWorked ? Number(req.body.hoursWorked) : 8,
      workSummary: req.body.workSummary,
      project: req.body.project || null,
      attachments: filePaths,
    });

    await workLog.save();

    const populated = await DailyWorkLog.findById(workLog._id)
      .populate('user', 'name email role')
      .populate('project', 'title clientName');

    await logAudit({
      userName: req.user.name,
      userRole: req.user.role,
      userEmail: req.user.email,
      action: filePaths.length > 0 ? 'UPLOAD' : 'CREATE',
      module: 'UPDATE',
      details: `Submitted daily work log for ${new Date(workLog.logDate).toLocaleDateString()} (${workLog.hoursWorked} hrs, ${filePaths.length} file attachments)`,
    });

    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete daily work log entry
router.delete('/:id', protect, async (req, res) => {
  try {
    const log = await DailyWorkLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ error: 'Work log not found' });
    }
    await DailyWorkLog.findByIdAndDelete(req.params.id);

    await logAudit({
      userName: req.user.name,
      userRole: req.user.role,
      userEmail: req.user.email,
      action: 'DELETE',
      module: 'UPDATE',
      details: `Deleted daily work log entry of ${log.userName}`,
    });

    res.json({ message: 'Daily work log deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
