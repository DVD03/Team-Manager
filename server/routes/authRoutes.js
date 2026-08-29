const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const TeamMember = require('../models/TeamMember');
const logAudit = require('../utils/auditLogger');
const { protect, adminOnly } = require('../middleware/auth');

// Seed / Reset default Admin user to guarantee admin@promanager.com / admin123
const seedDefaultAdmin = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    let admin = await User.findOne({ email: 'admin@promanager.com' });
    if (!admin) {
      admin = new User({
        name: 'Project Manager (Admin)',
        email: 'admin@promanager.com',
        password: hashedPassword,
        role: 'Admin',
      });
      await admin.save();
      console.log('[Auth] Admin account created: admin@promanager.com / admin123');
    } else {
      admin.password = hashedPassword;
      admin.role = 'Admin';
      await admin.save();
      console.log('[Auth] Admin password verified/reset: admin@promanager.com / admin123');
    }
  } catch (err) {
    console.error('[Auth Seed Error]:', err.message);
  }
};

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail }).populate('teamMember');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials. Password incorrect.' });
    }

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        teamMemberId: user.teamMember ? user.teamMember._id : null,
      },
      process.env.JWT_SECRET || 'promanager_secret',
      { expiresIn: '7d' }
    );

    await logAudit({
      userName: user.name,
      userRole: user.role,
      userEmail: user.email,
      action: 'LOGIN',
      module: 'AUTH',
      details: `User logged in successfully (${user.role})`,
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        teamMemberId: user.teamMember ? user.teamMember._id : null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user info
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('teamMember');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin sets / updates password for a team member
router.post('/set-member-password', protect, adminOnly, async (req, res) => {
  try {
    const { memberId, email, password } = req.body;

    const teamMember = await TeamMember.findById(memberId);
    if (!teamMember) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let user = await User.findOne({ teamMember: memberId });
    if (!user) {
      user = new User({
        name: teamMember.name,
        email: (email || teamMember.email).toLowerCase(),
        password: hashedPassword,
        role: 'Member',
        teamMember: memberId,
      });
    } else {
      user.password = hashedPassword;
      if (email) user.email = email.toLowerCase();
    }

    await user.save();

    await logAudit({
      userName: req.user.name,
      userRole: req.user.role,
      userEmail: req.user.email,
      action: 'UPDATE',
      module: 'AUTH',
      details: `Set login credentials for team member: ${teamMember.name} (${user.email})`,
    });

    res.json({ message: `Credentials saved for ${teamMember.name}`, email: user.email });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = { router, seedDefaultAdmin };
