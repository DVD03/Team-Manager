const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const logAudit = require('../utils/auditLogger');
const { protect } = require('../middleware/auth');

const seedCategories = async () => {
  try {
    const defaults = [
      'Salon / Beauty',
      'E-Commerce & Retail',
      'Construction & Real Estate',
      'Software & Mobile Apps',
      'Healthcare & Medical',
      'Financial & Accounting',
      'Education & E-Learning',
      'Hospitality & Tourism',
    ];
    for (const catName of defaults) {
      const exists = await Category.findOne({ name: catName });
      if (!exists) {
        await Category.create({ name: catName, isDefault: true });
      }
    }
  } catch (err) {
    console.error('[Category Seed Error]:', err.message);
  }
};

// Get all categories
router.get('/', protect, async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new custom category
router.post('/', protect, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const cleanName = name.trim();
    let category = await Category.findOne({ name: { $regex: new RegExp(`^${cleanName}$`, 'i') } });

    if (!category) {
      category = new Category({ name: cleanName, description: description || '' });
      await category.save();

      await logAudit({
        userName: req.user.name,
        userRole: req.user.role,
        userEmail: req.user.email,
        action: 'CREATE',
        module: 'PROJECT',
        details: `Added new custom category: "${category.name}"`,
      });
    }

    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = { router, seedCategories };
