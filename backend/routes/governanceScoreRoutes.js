const express = require('express');
const router = express.Router();
const { calculateAndUpdateGovernanceScore } = require('../services/governanceScoreService');

// GET calculated Governance Score and metrics breakdown
router.get('/', async (req, res, next) => {
  try {
    const scoreData = await calculateAndUpdateGovernanceScore();
    res.json({ success: true, data: scoreData });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
