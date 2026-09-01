const express = require('express');
const router = express.Router();
const ProjectUpdate = require('../models/ProjectUpdate');
const Project = require('../models/Project');
const logAudit = require('../utils/auditLogger');
const getMemberScope = require('../utils/memberScope');
const { protect } = require('../middleware/auth');

// Get updates (Admin sees all; Member sees own / assigned project updates)
router.get('/', protect, async (req, res) => {
  try {
    const { project, category } = req.query;
    const scope = await getMemberScope(req.user);

    const filter = {};
    if (project) filter.project = project;
    if (category) filter.category = category;

    if (!scope.isAdmin) {
      const memberProjects = await Project.find({ assignedTeam: { $in: scope.allowedMemberIds } }).select('_id');
      const memberProjectIds = memberProjects.map((p) => p._id);

      filter.$or = [
        { updatedBy: { $in: scope.allowedMemberIds } },
        { project: { $in: memberProjectIds } },
      ];
    }

    const updates = await ProjectUpdate.find(filter)
      .populate('project', 'title clientName progress status')
      .populate('updatedBy', 'name role avatar')
      .sort({ createdAt: -1 });

    res.json(updates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post a new project update / post-handover change request
router.post('/', protect, async (req, res) => {
  try {
    const { project, updateTitle, description, category, requestStatus, progressPercentage, updatedBy } = req.body;
    const update = new ProjectUpdate({
      project,
      updateTitle,
      description,
      category: category || 'Milestone Progress',
      requestStatus: requestStatus || 'In Development',
      progressPercentage,
      updatedBy: updatedBy || req.user.teamMemberId || req.user.id,
    });
    await update.save();

    if (progressPercentage !== undefined && progressPercentage !== null) {
      await Project.findByIdAndUpdate(project, { progress: progressPercentage });
    }

    const populated = await ProjectUpdate.findById(update._id)
      .populate('project', 'title clientName progress status')
      .populate('updatedBy', 'name role avatar');

    await logAudit({
      userName: req.user.name,
      userRole: req.user.role,
      userEmail: req.user.email,
      action: 'CREATE',
      module: 'UPDATE',
      details: `Logged ${category || 'update'} "${updateTitle}" for project "${populated && populated.project ? populated.project.title : 'Project'}"`,
    });

    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete an update
router.delete('/:id', protect, async (req, res) => {
  try {
    const update = await ProjectUpdate.findById(req.params.id);
    if (!update) {
      return res.status(404).json({ error: 'Update not found' });
    }
    await ProjectUpdate.findByIdAndDelete(req.params.id);

    await logAudit({
      userName: req.user.name,
      userRole: req.user.role,
      userEmail: req.user.email,
      action: 'DELETE',
      module: 'UPDATE',
      details: `Deleted update "${update.updateTitle}"`,
    });

    res.json({ message: 'Update removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
