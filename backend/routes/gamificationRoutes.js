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

module.exports = router;
