const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const CallLog = require('../models/CallLog');
const ProjectUpdate = require('../models/ProjectUpdate');
const logAudit = require('../utils/auditLogger');
const getMemberScope = require('../utils/memberScope');
const { protect, adminOnly } = require('../middleware/auth');

const cleanPayload = (data) => {
  const payload = { ...data };
  if (payload.linkedCall === '' || payload.linkedCall === 'null') {
    payload.linkedCall = null;
  }
  return payload;
};

// Get projects (Admin sees all; Member sees assigned / team leader projects)
router.get('/', protect, async (req, res) => {
  try {
    const scope = await getMemberScope(req.user);
    const filter = scope.isAdmin
      ? {}
      : { assignedTeam: { $in: scope.allowedMemberIds } };

    const projects = await Project.find(filter)
      .populate('assignedTeam', 'name email role avatar status isTeamLeader')
      .sort({ createdAt: -1 });

    const projectsWithLinkedData = await Promise.all(
      projects.map(async (p) => {
        const tasks = await Task.find({ project: p._id }).populate('assignedTo', 'name role');
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
        const pendingTasks = tasks.filter((t) => t.status !== 'Completed').length;

        const linkedCalls = await CallLog.find({ project: p._id }).sort({ callDate: -1 });
        const linkedUpdates = await ProjectUpdate.find({ project: p._id }).sort({ createdAt: -1 });

        return {
          ...p.toObject(),
          tasks,
          totalTasks,
          completedTasks,
          pendingTasks,
          progress: p.progress !== undefined && p.progress !== null ? p.progress : (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0),
          linkedCalls,
          linkedUpdates,
        };
      })
    );

    res.json(projectsWithLinkedData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create project (Admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const payload = cleanPayload(req.body);
    const project = new Project(payload);
    await project.save();

    await logAudit({
      userName: req.user.name,
      userRole: req.user.role,
      userEmail: req.user.email,
      action: 'CREATE',
      module: 'PROJECT',
      details: `Created new project: "${project.title}" for client: ${project.clientName}`,
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update project (Progress slider / title / budget / status)
router.put('/:id', protect, async (req, res) => {
  try {
    const payload = cleanPayload(req.body);
    const updated = await Project.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true }).populate('assignedTeam');

    if (!updated) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await logAudit({
      userName: req.user.name,
      userRole: req.user.role,
      userEmail: req.user.email,
      action: 'UPDATE',
      module: 'PROJECT',
      details: `Updated project "${updated.title}" progress to ${updated.progress}% (Status: ${updated.status})`,
    });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete project (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    await Project.findByIdAndDelete(req.params.id);
    await Task.deleteMany({ project: req.params.id });
    await CallLog.updateMany({ project: req.params.id }, { $unset: { project: 1 } });
    await ProjectUpdate.deleteMany({ project: req.params.id });

    await logAudit({
      userName: req.user.name,
      userRole: req.user.role,
      userEmail: req.user.email,
      action: 'DELETE',
      module: 'PROJECT',
      details: `Deleted project "${project.title}" and associated data`,
    });

    res.json({ message: 'Project and associated data deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
