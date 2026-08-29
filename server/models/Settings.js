const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema(
  {
    systemName: { type: String, default: 'Team Manager', trim: true },
    companyName: { type: String, default: 'Team Manager', trim: true },
    accentColor: { type: String, default: 'indigo' },
    showEmojis: { type: Boolean, default: false },
    logoUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', SettingsSchema);
