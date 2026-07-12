const express = require('express');
const router = express.Router();

const Category = require('../models/Category');
const CsrActivity = require('../models/CsrActivity');
const Department = require('../models/Department');
const EmployeeParticipation = require('../models/EmployeeParticipation');

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

// ==========================================
// EMPLOYEE PARTICIPATION CRUD
// ==========================================

// GET all participations
router.get('/participations', async (req, res) => {
  try {
    const participations = await EmployeeParticipation.find()
      .populate('department')
      .populate({
        path: 'activity',
        populate: [
          { path: 'category' },
          { path: 'department' }
        ]
      });
    res.json({ success: true, data: participations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create participation
router.post('/participations', async (req, res) => {
  try {
    const { employee, activity, proof, completionDate, department } = req.body;
    
    // Find the activity to check default points
    const act = await CsrActivity.findById(activity);
    if (!act) {
      return res.status(404).json({ success: false, message: 'CSR Activity not found' });
    }

    const participation = await EmployeeParticipation.create({
      employee,
      activity,
      proof,
      department: department || act.department, // default to activity's department if not provided
      completionDate: completionDate || new Date(),
      approvalStatus: 'Pending',
      pointsEarned: 0 // Zero until approved
    });

    const populated = await EmployeeParticipation.findById(participation._id)
      .populate('department')
      .populate({
        path: 'activity',
        populate: [
          { path: 'category' },
          { path: 'department' }
        ]
      });

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update participation (including approval and awarding points)
router.put('/participations/:id', async (req, res) => {
  try {
    const { employee, proof, approvalStatus, completionDate, department } = req.body;
    const part = await EmployeeParticipation.findById(req.params.id).populate('activity');
    if (!part) {
      return res.status(404).json({ success: false, message: 'Participation not found' });
    }

    // Business Rule check:
    // If approvalStatus is being set to Approved, check if proof is present and required.
    if (approvalStatus === 'Approved') {
      const EsgSettings = require('../models/EsgSettings');
      const settings = await EsgSettings.findOne();
      const evidenceRequired = settings ? settings.csrEvidenceRequired : false;
      if (evidenceRequired && (!proof || !proof.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Cannot approve participation without an attached proof file/link.'
        });
      }
    }

    part.employee = employee !== undefined ? employee : part.employee;
    part.proof = proof !== undefined ? proof : part.proof;
    part.completionDate = completionDate !== undefined ? completionDate : part.completionDate;
    part.department = department !== undefined ? department : part.department;
    
    if (approvalStatus !== undefined) {
      part.approvalStatus = approvalStatus;
      if (approvalStatus === 'Approved') {
        part.pointsEarned = part.activity.points || 50;
      } else {
        part.pointsEarned = 0;
      }
    }

    await part.save();

    // Auto-award badges if eligible
    if (approvalStatus === 'Approved') {
      const { checkAndAwardBadges } = require('../utils/gamificationEngine');
      await checkAndAwardBadges(part.employee);
      
      // Trigger ESG score recomputation
      const { recomputeAllDepartmentScores } = require('../services/esgCalculationService');
      await recomputeAllDepartmentScores();
    }
    
    const populated = await EmployeeParticipation.findById(part._id)
      .populate('department')
      .populate({
        path: 'activity',
        populate: [
          { path: 'category' },
          { path: 'department' }
        ]
      });
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE participation
router.delete('/participations/:id', async (req, res) => {
  try {
    const part = await EmployeeParticipation.findByIdAndDelete(req.params.id);
    if (!part) {
      return res.status(404).json({ success: false, message: 'Participation not found' });
    }
    // Trigger ESG score recomputation
    const { recomputeAllDepartmentScores } = require('../services/esgCalculationService');
    await recomputeAllDepartmentScores();

    res.json({ success: true, message: 'Participation deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// TRAINING COMPLETION CRUD
// ==========================================
const TrainingCompletion = require('../models/TrainingCompletion');

// GET training completions
router.get('/training', async (req, res) => {
  try {
    const completions = await TrainingCompletion.find().populate('department');
    res.json({ success: true, data: completions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create training completion
router.post('/training', async (req, res) => {
  try {
    const completion = await TrainingCompletion.create(req.body);
    const populated = await TrainingCompletion.findById(completion._id).populate('department');
    
    // Trigger ESG score recomputation
    const { recomputeAllDepartmentScores } = require('../services/esgCalculationService');
    await recomputeAllDepartmentScores();

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE training completion
router.delete('/training/:id', async (req, res) => {
  try {
    const deleted = await TrainingCompletion.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Training completion record not found' });
    }

    // Trigger ESG score recomputation
    const { recomputeAllDepartmentScores } = require('../services/esgCalculationService');
    await recomputeAllDepartmentScores();

    res.json({ success: true, message: 'Training completion record deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// DIVERSITY METRICS CONFIGURATION
// ==========================================
router.put('/departments/:id/diversity', async (req, res) => {
  try {
    const { genderRatio, ageBands } = req.body;
    const dept = await Department.findById(req.params.id);
    if (!dept) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    if (genderRatio) dept.diversityMetrics.genderRatio = genderRatio;
    if (ageBands) {
      if (ageBands.under30 !== undefined) dept.diversityMetrics.ageBands.under30 = ageBands.under30;
      if (ageBands.thirtyToFifty !== undefined) dept.diversityMetrics.ageBands.thirtyToFifty = ageBands.thirtyToFifty;
      if (ageBands.over50 !== undefined) dept.diversityMetrics.ageBands.over50 = ageBands.over50;
    }

    await dept.save();

    // Trigger ESG score recomputation
    const { recomputeAllDepartmentScores } = require('../services/esgCalculationService');
    await recomputeAllDepartmentScores();

    res.json({ success: true, data: dept });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// SOCIAL DASHBOARD METRICS
// ==========================================
router.get('/dashboard-metrics', async (req, res) => {
  try {
    const depts = await Department.find();
    const trainingCount = await TrainingCompletion.countDocuments({ status: 'Completed' });
    const activeCsrCount = await CsrActivity.countDocuments({ status: 'Active' });
    const totalParticipations = await EmployeeParticipation.countDocuments();
    const approvedParticipations = await EmployeeParticipation.countDocuments({ approvalStatus: 'Approved' });

    // Average social score
    const avgSocialScore = depts.length > 0
      ? Math.round(depts.reduce((sum, d) => sum + (d.socialScore || 0), 0) / depts.length)
      : 0;

    res.json({
      success: true,
      data: {
        trainingCount,
        activeCsrCount,
        totalParticipations,
        approvedParticipations,
        avgSocialScore,
        departments: depts.map(d => ({
          name: d.name,
          employeeCount: d.employeeCount,
          socialScore: d.socialScore || 0,
          diversityMetrics: d.diversityMetrics
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
