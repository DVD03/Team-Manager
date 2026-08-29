const express = require('express');
const router = express.Router();
const ProjectUpdate = require('../models/ProjectUpdate');
const Project = require('../models/Project');
const logAudit = require('../utils/auditLogger');
const { protect } = require('../middleware/auth');

// Get all updates or by project
router.get('/', protect, async (req, res) => {
  try {
    const { project, category } = req.query;
    const filter = {};
    if (project) filter.project = project;
    if (category) filter.category = category;

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
      updatedBy: updatedBy || req.user.id,
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
      details: `Logged ${category || 'update'} "${updateTitle}" for project "${populated.project ? populated.project.title : 'Project'}"`,
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
    await ProjectUpdate.findByIdAndDelete(req.params.id);

    await logAudit({
      userName: req.user.name,
      userRole: req.user.role,
      userEmail: req.user.email,
      action: 'DELETE',
      module: 'UPDATE',
      details: `Deleted update "${update ? update.updateTitle : req.params.id}"`,
    });

    res.json({ message: 'Update removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
