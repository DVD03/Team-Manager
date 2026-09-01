const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const logAudit = require('../utils/auditLogger');
const getMemberScope = require('../utils/memberScope');
const { protect } = require('../middleware/auth');

// Helper to recalculate and sync Project progress % based on tasks
const syncProjectProgress = async (projectId) => {
  if (!projectId) return;
  try {
    const totalTasks = await Task.countDocuments({ project: projectId });
    if (totalTasks > 0) {
      const completedTasks = await Task.countDocuments({ project: projectId, status: 'Completed' });
      const progressPercent = Math.round((completedTasks / totalTasks) * 100);
      await Project.findByIdAndUpdate(projectId, { progress: progressPercent });
    }
  } catch (err) {
    console.error('[Sync Progress Error]:', err.message);
  }
};

const normalizeStatus = (status) => {
  if (status === 'In Progress') return 'In Development';
  if (status === 'In Review') return 'Client Review';
  return status || 'To Do';
};

// Get tasks (Admin sees all; Member sees assigned / team leader tasks)
router.get('/', protect, async (req, res) => {
  try {
    const { project, assignedTo, status } = req.query;
    const scope = await getMemberScope(req.user);

    const filter = {};
    if (project) filter.project = project;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (status) filter.status = status;

    if (!scope.isAdmin) {
      // Get member's assigned projects as well
      const memberProjects = await Project.find({ assignedTeam: { $in: scope.allowedMemberIds } }).select('_id');
      const memberProjectIds = memberProjects.map((p) => p._id);

      filter.$or = [
        { assignedTo: { $in: scope.allowedMemberIds } },
        { project: { $in: memberProjectIds } },
      ];
    }

    const rawTasks = await Task.find(filter)
      .populate('project', 'title clientName progress')
      .populate('assignedTo', 'name email role avatar')
      .sort({ deadline: 1, createdAt: -1 });

    const tasks = rawTasks.map((t) => {
      const normalized = normalizeStatus(t.status);
      if (normalized !== t.status) {
        t.status = normalized;
        t.save().catch(() => {});
      }
      return t;
    });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create task & sync project progress
router.post('/', protect, async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      status: normalizeStatus(req.body.status),
    };
    const task = new Task(taskData);
    await task.save();

    await syncProjectProgress(task.project);

    const populated = await Task.findById(task._id)
      .populate('project', 'title clientName progress')
      .populate('assignedTo', 'name email role avatar');

    await logAudit({
      userName: req.user.name,
      userRole: req.user.role,
      userEmail: req.user.email,
      action: 'CREATE',
      module: 'TASK',
      details: `Created task "${task.title}" under project "${populated && populated.project ? populated.project.title : 'Project'}" (Assigned to: ${populated && populated.assignedTo ? populated.assignedTo.name : 'Unassigned'})`,
    });

    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update task status & sync project progress
router.put('/:id', protect, async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      status: normalizeStatus(req.body.status),
    };
    if (updateData.status === 'Completed' && !req.body.completedAt) {
      updateData.completedAt = new Date();
    }
    const updated = await Task.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('project', 'title clientName progress')
      .populate('assignedTo', 'name email role avatar');

    if (!updated) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (updated.project) {
      await syncProjectProgress(updated.project._id || updated.project);
    }

    await logAudit({
      userName: req.user.name,
      userRole: req.user.role,
      userEmail: req.user.email,
      action: req.body.status ? 'STATUS_CHANGE' : 'UPDATE',
      module: 'TASK',
      details: `Task "${updated.title}" updated to status: "${updated.status}"`,
    });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete task & sync project progress
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    await Task.findByIdAndDelete(req.params.id);

    if (task.project) {
      await syncProjectProgress(task.project);
    }

    await logAudit({
      userName: req.user.name,
      userRole: req.user.role,
      userEmail: req.user.email,
      action: 'DELETE',
      module: 'TASK',
      details: `Deleted task "${task.title}"`,
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
