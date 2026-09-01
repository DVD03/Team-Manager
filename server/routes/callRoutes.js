const express = require('express');
const router = express.Router();
const CallLog = require('../models/CallLog');
const upload = require('../middleware/upload');
const logAudit = require('../utils/auditLogger');
const getMemberScope = require('../utils/memberScope');
const { protect } = require('../middleware/auth');

// Get customer calls (Admin sees all; Member sees own / team leader calls)
router.get('/', protect, async (req, res) => {
  try {
    const scope = await getMemberScope(req.user);
    const filter = scope.isAdmin
      ? {}
      : {
          $or: [
            { loggedBy: { $in: scope.allowedMemberIds } },
            { loggedByEmail: req.user.email },
          ],
        };

    const calls = await CallLog.find(filter)
      .populate('project', 'title clientName progress')
      .populate('loggedBy', 'name role email')
      .sort({ callDate: -1 });

    res.json(calls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create single customer call log with proof file upload
router.post('/', protect, upload.array('proofFiles', 5), async (req, res) => {
  try {
    const filePaths = req.files ? req.files.map((file) => `/uploads/${file.filename}`) : [];

    const callLogData = {
      clientName: req.body.clientName,
      clientPhone: req.body.clientPhone,
      clientEmail: req.body.clientEmail,
      project: req.body.project || null,
      callDate: req.body.callDate || new Date(),
      durationMinutes: req.body.durationMinutes || 0,
      notes: req.body.notes,
      outcome: req.body.outcome || 'Lead / New Inquiry',
      loggedBy: req.body.loggedBy || req.user.teamMemberId || null,
      loggedByName: req.user.name,
      loggedByEmail: req.user.email,
      proofFiles: filePaths,
    };

    const newCall = new CallLog(callLogData);
    await newCall.save();

    const populated = await CallLog.findById(newCall._id)
      .populate('project', 'title clientName progress')
      .populate('loggedBy', 'name role email');

    await logAudit({
      userName: req.user.name,
      userRole: req.user.role,
      userEmail: req.user.email,
      action: filePaths.length > 0 ? 'UPLOAD' : 'CREATE',
      module: 'CALL',
      details: `Logged customer call with "${newCall.clientName}" (Outcome: ${newCall.outcome})`,
    });

    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create BULK customer call logs
router.post('/bulk', protect, upload.array('proofFiles', 5), async (req, res) => {
  try {
    const filePaths = req.files ? req.files.map((file) => `/uploads/${file.filename}`) : [];
    
    let clientList = [];
    if (typeof req.body.clientList === 'string') {
      clientList = req.body.clientList
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const parts = line.split(',');
          return {
            clientName: parts[0]?.trim() || line,
            clientPhone: parts[1]?.trim() || '',
            clientEmail: parts[2]?.trim() || '',
          };
        });
    } else if (Array.isArray(req.body.clientList)) {
      clientList = req.body.clientList;
    }

    if (clientList.length === 0) {
      return res.status(400).json({ error: 'Please provide at least one client' });
    }

    const createdLogs = await Promise.all(
      clientList.map(async (client) => {
        const log = new CallLog({
          clientName: client.clientName,
          clientPhone: client.clientPhone || '',
          clientEmail: client.clientEmail || '',
          project: req.body.project || null,
          callDate: req.body.callDate || new Date(),
          durationMinutes: req.body.durationMinutes || 10,
          notes: req.body.notes || 'Bulk outreach call',
          outcome: req.body.outcome || 'Lead / New Inquiry',
          loggedBy: req.body.loggedBy || req.user.teamMemberId || null,
          loggedByName: req.user.name,
          loggedByEmail: req.user.email,
          proofFiles: filePaths,
        });
        return await log.save();
      })
    );

    await logAudit({
      userName: req.user.name,
      userRole: req.user.role,
      userEmail: req.user.email,
      action: 'CREATE',
      module: 'CALL',
      details: `Logged bulk customer call campaign for ${createdLogs.length} clients (Outcome: ${req.body.outcome})`,
    });

    res.status(201).json({ message: `Successfully logged ${createdLogs.length} call records`, count: createdLogs.length });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete call log
router.delete('/:id', protect, async (req, res) => {
  try {
    const call = await CallLog.findById(req.params.id);
    if (!call) {
      return res.status(404).json({ error: 'Call log not found' });
    }
    await CallLog.findByIdAndDelete(req.params.id);

    await logAudit({
      userName: req.user.name,
      userRole: req.user.role,
      userEmail: req.user.email,
      action: 'DELETE',
      module: 'CALL',
      details: `Deleted call record for client: ${call.clientName}`,
    });

    res.json({ message: 'Call log deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
