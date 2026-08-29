const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const upload = require('../middleware/upload');
const logAudit = require('../utils/auditLogger');
const { protect, adminOnly } = require('../middleware/auth');

// Get current system settings
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({ systemName: 'Team Manager', companyName: 'Team Manager' });
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update system settings + logo upload (Admin only)
router.post('/', protect, adminOnly, upload.single('logo'), async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({});
    }

    if (req.body.systemName) settings.systemName = req.body.systemName;
    if (req.body.companyName) settings.companyName = req.body.companyName;
    if (req.body.accentColor) settings.accentColor = req.body.accentColor;
    if (req.body.showEmojis !== undefined) settings.showEmojis = req.body.showEmojis === 'true' || req.body.showEmojis === true;

    if (req.file) {
      settings.logoUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.removeLogo === 'true') {
      settings.logoUrl = '';
    }

    await settings.save();

    await logAudit({
      userName: req.user.name,
      userRole: req.user.role,
      userEmail: req.user.email,
      action: req.file ? 'UPLOAD' : 'UPDATE',
      module: 'AUTH',
      details: `Updated system branding settings (${settings.systemName})${req.file ? ' with new logo image' : ''}`,
    });

    res.json(settings);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
