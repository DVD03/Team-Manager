const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const CallLog = require('../models/CallLog');
const ProjectUpdate = require('../models/ProjectUpdate');
const TeamMember = require('../models/TeamMember');
const { protect } = require('../middleware/auth');

// Get daily report for a specific date
router.get('/daily', protect, async (req, res) => {
  try {
    const { date, memberId } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const taskFilter = {
      $or: [
        { updatedAt: { $gte: startOfDay, $lte: endOfDay } },
        { completedAt: { $gte: startOfDay, $lte: endOfDay } },
        { createdAt: { $gte: startOfDay, $lte: endOfDay } }
      ]
    };
    if (memberId) taskFilter.assignedTo = memberId;

    const callFilter = { callDate: { $gte: startOfDay, $lte: endOfDay } };
    if (memberId) callFilter.loggedBy = memberId;

    const updateFilter = { createdAt: { $gte: startOfDay, $lte: endOfDay } };
    if (memberId) updateFilter.updatedBy = memberId;

    const tasks = await Task.find(taskFilter)
      .populate('project', 'title clientName')
      .populate('assignedTo', 'name role');

    const calls = await CallLog.find(callFilter)
      .populate('project', 'title clientName')
      .populate('loggedBy', 'name role');

    const updates = await ProjectUpdate.find(updateFilter)
      .populate('project', 'title clientName')
      .populate('updatedBy', 'name role');

    const teamMembers = await TeamMember.find({ status: 'Active' });

    res.json({
      date: startOfDay.toISOString().split('T')[0],
      summary: {
        totalTasksWorkedOn: tasks.length,
        completedTasksCount: tasks.filter((t) => t.status === 'Completed').length,
        totalCallsLogged: calls.length,
        dealsWonCount: calls.filter((c) => c.outcome === 'Deal Won').length,
        projectUpdatesCount: updates.length,
      },
      tasks,
      calls,
      updates,
      activeTeamCount: teamMembers.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
