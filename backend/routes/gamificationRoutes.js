const express = require('express');
const router = express.Router();

const Category = require('../models/Category');
const Challenge = require('../models/Challenge');
const ChallengeParticipation = require('../models/ChallengeParticipation');

// ==========================================
// CHALLENGES CRUD & LIFECYCLE
// ==========================================

// GET all challenges
router.get('/challenges', async (req, res) => {
  try {
    const challenges = await Challenge.find().populate('category');
    res.json({ success: true, data: challenges });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create challenge (Initial status Draft by default)
router.post('/challenges', async (req, res) => {
  try {
    const challenge = await Challenge.create(req.body);
    const populated = await Challenge.findById(challenge._id).populate('category');
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update challenge & state machine transitions
router.put('/challenges/:id', async (req, res) => {
  try {
    const { title, category, description, xp, difficulty, evidenceRequired, deadline, status } = req.body;
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    // State machine check: Archived is allowed from any state
    if (status && status !== challenge.status && status !== 'Archived') {
      const allowedTransitions = {
        'Draft': ['Active'],
        'Active': ['Under Review'],
        'Under Review': ['Completed', 'Active'],
        'Completed': [],
        'Archived': []
      };

      if (!allowedTransitions[challenge.status].includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid state transition from ${challenge.status} to ${status}`
        });
      }
    }

    if (title !== undefined) challenge.title = title;
    if (category !== undefined) challenge.category = category;
    if (description !== undefined) challenge.description = description;
    if (xp !== undefined) challenge.xp = xp;
    if (difficulty !== undefined) challenge.difficulty = difficulty;
    if (evidenceRequired !== undefined) challenge.evidenceRequired = evidenceRequired;
    if (deadline !== undefined) challenge.deadline = deadline;
    if (status !== undefined) challenge.status = status;

    await challenge.save();

    const populated = await Challenge.findById(challenge._id).populate('category');
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE challenge
router.delete('/challenges/:id', async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndDelete(req.params.id);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }
    res.json({ success: true, message: 'Challenge deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// CHALLENGE PARTICIPATION CRUD
// ==========================================

// GET all challenge participations
router.get('/participations', async (req, res) => {
  try {
    const participations = await ChallengeParticipation.find()
      .populate({
        path: 'challenge',
        populate: { path: 'category' }
      });
    res.json({ success: true, data: participations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST join / participate in challenge
router.post('/participations', async (req, res) => {
  try {
    const { challenge: challengeId, employee, progress, proof } = req.body;
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    // Business Rules:
    // 1. Must be Active
    if (challenge.status !== 'Active') {
      return res.status(400).json({ success: false, message: 'Cannot join a challenge that is not Active.' });
    }
    // 2. Deadline has not passed
    if (new Date(challenge.deadline) < new Date()) {
      return res.status(400).json({ success: false, message: 'Cannot join a challenge whose deadline has passed.' });
    }

    const participation = await ChallengeParticipation.create({
      challenge: challengeId,
      employee,
      progress: progress || 0,
      proof: proof || '',
      approvalStatus: 'Pending',
      xpAwarded: 0
    });

    const populated = await ChallengeParticipation.findById(participation._id)
      .populate({
        path: 'challenge',
        populate: { path: 'category' }
      });

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update challenge progress & approval
router.put('/participations/:id', async (req, res) => {
  try {
    const { progress, proof, approvalStatus } = req.body;
    const part = await ChallengeParticipation.findById(req.params.id).populate('challenge');
    if (!part) {
      return res.status(404).json({ success: false, message: 'Participation not found' });
    }

    // Business Rule:
    // If evidenceRequired is true, cannot approve without proof
    if (approvalStatus === 'Approved') {
      if (part.challenge.evidenceRequired && (!proof || !proof.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Cannot approve this challenge participation without an attached proof file/link.'
        });
      }
    }

    if (progress !== undefined) part.progress = progress;
    if (proof !== undefined) part.proof = proof;
    
    if (approvalStatus !== undefined) {
      part.approvalStatus = approvalStatus;
      if (approvalStatus === 'Approved') {
        part.xpAwarded = part.challenge.xp || 100;
        part.progress = 100; // auto complete progress on approval
      } else {
        part.xpAwarded = 0;
      }
    }

    await part.save();

    // Auto-award badges if eligible
    if (approvalStatus === 'Approved') {
      const { checkAndAwardBadges } = require('../utils/gamificationEngine');
      await checkAndAwardBadges(part.employee);
    }

    const populated = await ChallengeParticipation.findById(part._id)
      .populate({
        path: 'challenge',
        populate: { path: 'category' }
      });

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE challenge participation
router.delete('/participations/:id', async (req, res) => {
  try {
    const part = await ChallengeParticipation.findByIdAndDelete(req.params.id);
    if (!part) {
      return res.status(404).json({ success: false, message: 'Participation not found' });
    }
    res.json({ success: true, message: 'Participation deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET categories master values (Challenges scope)
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({ type: 'Challenge' });
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Import new models and helpers
const Badge = require('../models/Badge');
const EmployeeBadge = require('../models/EmployeeBadge');
const Reward = require('../models/Reward');
const Redemption = require('../models/Redemption');
const EsgSettings = require('../models/EsgSettings');
const EmployeeParticipation = require('../models/EmployeeParticipation');
const { getEmployeeStats, checkAndAwardBadges } = require('../utils/gamificationEngine');

// ==========================================
// ESG SETTINGS ENDPOINTS
// ==========================================
router.get('/settings', async (req, res) => {
  try {
    let settings = await EsgSettings.findOne();
    if (!settings) {
      settings = await EsgSettings.create({ badgeAutoAward: true });
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const { badgeAutoAward, csrEvidenceRequired, weightCsr, weightChallenge, weightTraining, weightDiversity } = req.body;
    let settings = await EsgSettings.findOne();
    if (!settings) {
      settings = await EsgSettings.create({
        badgeAutoAward: badgeAutoAward !== undefined ? badgeAutoAward : true,
        csrEvidenceRequired: csrEvidenceRequired !== undefined ? csrEvidenceRequired : false,
        weightCsr: weightCsr !== undefined ? weightCsr : 25,
        weightChallenge: weightChallenge !== undefined ? weightChallenge : 25,
        weightTraining: weightTraining !== undefined ? weightTraining : 25,
        weightDiversity: weightDiversity !== undefined ? weightDiversity : 25
      });
    } else {
      if (badgeAutoAward !== undefined) settings.badgeAutoAward = badgeAutoAward;
      if (csrEvidenceRequired !== undefined) settings.csrEvidenceRequired = csrEvidenceRequired;
      if (weightCsr !== undefined) settings.weightCsr = weightCsr;
      if (weightChallenge !== undefined) settings.weightChallenge = weightChallenge;
      if (weightTraining !== undefined) settings.weightTraining = weightTraining;
      if (weightDiversity !== undefined) settings.weightDiversity = weightDiversity;
      await settings.save();
    }
    
    // Trigger ESG score recomputation to apply new weight values
    const { recomputeAllDepartmentScores } = require('../services/esgCalculationService');
    await recomputeAllDepartmentScores();

    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// BADGES CRUD ENDPOINTS
// ==========================================
router.get('/badges', async (req, res) => {
  try {
    const badges = await Badge.find();
    res.json({ success: true, data: badges });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/badges', async (req, res) => {
  try {
    const badge = await Badge.create(req.body);
    res.json({ success: true, data: badge });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/badges/:id', async (req, res) => {
  try {
    const badge = await Badge.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!badge) {
      return res.status(404).json({ success: false, message: 'Badge not found' });
    }
    res.json({ success: true, data: badge });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/badges/:id', async (req, res) => {
  try {
    const badge = await Badge.findByIdAndDelete(req.params.id);
    if (!badge) {
      return res.status(404).json({ success: false, message: 'Badge not found' });
    }
    // Also delete earned records for this badge
    await EmployeeBadge.deleteMany({ badge: req.params.id });
    res.json({ success: true, message: 'Badge deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// EARNED BADGES ENDPOINTS
// ==========================================
router.get('/badges/earned', async (req, res) => {
  try {
    const earned = await EmployeeBadge.find().populate('badge');
    res.json({ success: true, data: earned });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/badges/earned/:employee', async (req, res) => {
  try {
    const earned = await EmployeeBadge.find({ employee: req.params.employee }).populate('badge');
    res.json({ success: true, data: earned });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Manual award badge route (as fallback if Auto-Award is off)
router.post('/badges/award', async (req, res) => {
  try {
    const { employee, badgeId } = req.body;
    const badge = await Badge.findById(badgeId);
    if (!badge) {
      return res.status(404).json({ success: false, message: 'Badge not found' });
    }

    const earned = await EmployeeBadge.create({ employee, badge: badgeId });
    const populated = await EmployeeBadge.findById(earned._id).populate('badge');
    res.json({ success: true, data: populated });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Badge already awarded to this employee.' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// REWARDS CRUD & REDEMPTION
// ==========================================
router.get('/rewards', async (req, res) => {
  try {
    const rewards = await Reward.find();
    res.json({ success: true, data: rewards });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/rewards', async (req, res) => {
  try {
    const reward = await Reward.create(req.body);
    res.json({ success: true, data: reward });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/rewards/:id', async (req, res) => {
  try {
    const reward = await Reward.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!reward) {
      return res.status(404).json({ success: false, message: 'Reward not found' });
    }
    res.json({ success: true, data: reward });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/rewards/:id', async (req, res) => {
  try {
    const reward = await Reward.findByIdAndDelete(req.params.id);
    if (!reward) {
      return res.status(404).json({ success: false, message: 'Reward not found' });
    }
    res.json({ success: true, message: 'Reward deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/rewards/redeem', async (req, res) => {
  try {
    const { employee, rewardId } = req.body;
    if (!employee || !rewardId) {
      return res.status(400).json({ success: false, message: 'Employee name and rewardId are required.' });
    }

    const reward = await Reward.findById(rewardId);
    if (!reward) {
      return res.status(404).json({ success: false, message: 'Reward not found' });
    }

    if (reward.status === 'Inactive') {
      return res.status(400).json({ success: false, message: 'Cannot redeem inactive reward.' });
    }

    if (reward.stock <= 0) {
      return res.status(400).json({ success: false, message: 'Reward is out of stock.' });
    }

    // Points balance check
    const stats = await getEmployeeStats(employee);
    if (stats.currentPoints < reward.pointsRequired) {
      return res.status(400).json({
        success: false,
        message: `Insufficient points. Required: ${reward.pointsRequired}, Available: ${stats.currentPoints}`
      });
    }

    // Decrement stock and create redemption record
    reward.stock -= 1;
    await reward.save();

    const redemption = await Redemption.create({
      employee,
      reward: reward._id,
      pointsSpent: reward.pointsRequired
    });

    const populated = await Redemption.findById(redemption._id).populate('reward');
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/redemptions', async (req, res) => {
  try {
    const redemptions = await Redemption.find().populate('reward');
    res.json({ success: true, data: redemptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// LEADERBOARD & EMPLOYEE STATS
// ==========================================
router.get('/profile/:employee', async (req, res) => {
  try {
    const stats = await getEmployeeStats(req.params.employee);
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    const { department } = req.query;

    const employeesCsr = await EmployeeParticipation.distinct('employee');
    const employeesChallenge = await ChallengeParticipation.distinct('employee');
    const uniqueEmployees = Array.from(new Set([...employeesCsr, ...employeesChallenge]));

    const leaderboard = [];
    for (const emp of uniqueEmployees) {
      if (!emp) continue;
      const stats = await getEmployeeStats(emp);
      leaderboard.push(stats);
    }

    // Sort by totalXp descending
    let sorted = leaderboard.sort((a, b) => b.totalXp - a.totalXp);

    if (department) {
      sorted = sorted.filter(item => item.departmentName.toLowerCase() === department.toLowerCase());
    }

    res.json({ success: true, data: sorted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
