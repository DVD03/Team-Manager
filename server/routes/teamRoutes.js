const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const TeamMember = require('../models/TeamMember');
const User = require('../models/User');
const Task = require('../models/Task');
const logAudit = require('../utils/auditLogger');
const { protect, adminOnly } = require('../middleware/auth');

// Get all team members with hierarchy details
router.get('/', protect, async (req, res) => {
  try {
    const members = await TeamMember.find()
      .populate('teamLeader', 'name role email')
      .sort({ isTeamLeader: -1, createdAt: -1 });

    const membersWithStats = await Promise.all(
      members.map(async (m) => {
        const totalTasks = await Task.countDocuments({ assignedTo: m._id });
        const completedTasks = await Task.countDocuments({ assignedTo: m._id, status: 'Completed' });
        const pendingTasks = await Task.countDocuments({ assignedTo: m._id, status: { $ne: 'Completed' } });
        const hasLogin = await User.exists({ teamMember: m._id });

        // If team leader, count sub-members
        let subMembersCount = 0;
        if (m.isTeamLeader) {
          subMembersCount = await TeamMember.countDocuments({ teamLeader: m._id });
        }

        return {
          ...m.toObject(),
          totalTasks,
          completedTasks,
          pendingTasks,
          hasLogin: !!hasLogin,
          subMembersCount,
        };
      })
    );
    res.json(membersWithStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new team member (with Team Leader hierarchy support)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, email, phone, role, status, skills, password, isTeamLeader, teamLeader } = req.body;

    const newMember = new TeamMember({
      name,
      email,
      phone,
      role,
      status,
      skills,
      isTeamLeader: !!isTeamLeader,
      teamLeader: teamLeader || null,
    });
    await newMember.save();

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new User({
        name: name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'Member',
        teamMember: newMember._id,
      });
      await newUser.save();
    }

    await logAudit({
      userName: req.user.name,
      userRole: req.user.role,
      userEmail: req.user.email,
      action: 'CREATE',
      module: 'TEAM',
      details: `Added new team member: "${newMember.name}" (${newMember.role})${isTeamLeader ? ' [Team Leader]' : ''}`,
    });

    res.status(201).json(newMember);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update team member
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { password, ...memberData } = req.body;
    const updated = await TeamMember.findByIdAndUpdate(req.params.id, memberData, { new: true })
      .populate('teamLeader', 'name role email');

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      let user = await User.findOne({ teamMember: req.params.id });
      if (!user) {
        user = new User({
          name: updated.name,
          email: updated.email.toLowerCase(),
          password: hashedPassword,
          role: 'Member',
          teamMember: updated._id,
        });
      } else {
        user.password = hashedPassword;
        user.email = updated.email.toLowerCase();
      }
      await user.save();
    }

    await logAudit({
      userName: req.user.name,
      userRole: req.user.role,
      userEmail: req.user.email,
      action: 'UPDATE',
      module: 'TEAM',
      details: `Updated team member profile: "${updated.name}"`,
    });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete team member
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    await TeamMember.findByIdAndDelete(req.params.id);
    await User.deleteMany({ teamMember: req.params.id });
    await TeamMember.updateMany({ teamLeader: req.params.id }, { $unset: { teamLeader: 1 } });

    await logAudit({
      userName: req.user.name,
      userRole: req.user.role,
      userEmail: req.user.email,
      action: 'DELETE',
      module: 'TEAM',
      details: `Removed team member and updated hierarchy: ${member ? member.name : req.params.id}`,
    });

    res.json({ message: 'Team member deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
