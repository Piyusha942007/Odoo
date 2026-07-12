const express = require('express');
const router = express.Router();

const Category = require('../models/Category');
const CsrActivity = require('../models/CsrActivity');
const Department = require('../models/Department');

// ==========================================
// CATEGORIES CRUD
// ==========================================

// GET all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create category
router.post('/categories', async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update category
router.put('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE category
router.delete('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// CSR ACTIVITIES CRUD
// ==========================================

// GET all CSR activities
router.get('/csr-activities', async (req, res) => {
  try {
    const activities = await CsrActivity.find()
      .populate('category')
      .populate('department');
    res.json({ success: true, data: activities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create CSR activity
router.post('/csr-activities', async (req, res) => {
  try {
    const activity = await CsrActivity.create(req.body);
    // Populate before response for consistent frontend display
    const populated = await CsrActivity.findById(activity._id)
      .populate('category')
      .populate('department');
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update CSR activity
router.put('/csr-activities/:id', async (req, res) => {
  try {
    const activity = await CsrActivity.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('category')
      .populate('department');
    if (!activity) {
      return res.status(404).json({ success: false, message: 'CSR Activity not found' });
    }
    res.json({ success: true, data: activity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE CSR activity
router.delete('/csr-activities/:id', async (req, res) => {
  try {
    const activity = await CsrActivity.findByIdAndDelete(req.params.id);
    if (!activity) {
      return res.status(404).json({ success: false, message: 'CSR Activity not found' });
    }
    res.json({ success: true, message: 'CSR Activity deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET all departments (Master Data consumption)
router.get('/departments', async (req, res) => {
  try {
    const departments = await Department.find();
    res.json({ success: true, data: departments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
