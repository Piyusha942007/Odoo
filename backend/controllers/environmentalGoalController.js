const EnvironmentalGoal = require('../models/EnvironmentalGoal');
const CarbonTransaction = require('../models/CarbonTransaction');
const Department = require('../models/Department');

// Helper to compute goal values dynamically
const computeGoalProgress = async (goal) => {
  // Sum carbon transactions for this department within the goal's date range
  const transactions = await CarbonTransaction.find({
    department: goal.department,
    date: {
      $gte: new Date(goal.startDate),
      $lte: new Date(goal.deadline)
    }
  });

  const actualValue = transactions.reduce((sum, tx) => sum + tx.co2eAmount, 0);

  // Authoritative status evaluation
  let status = 'On Track';
  if (actualValue > goal.targetValue) {
    const isDeadlinePassed = new Date() > new Date(goal.deadline);
    status = isDeadlinePassed ? 'Missed' : 'At Risk';
  }

  const progressPercent = goal.targetValue > 0 ? (actualValue / goal.targetValue) * 100 : 0;

  return {
    ...goal.toObject(),
    actualValue,
    progressPercent,
    status
  };
};

// @desc    Get all environmental goals with progress
// @route   GET /api/environmental/goals
// @access  Public
exports.getEnvironmentalGoals = async (req, res, next) => {
  try {
    const goals = await EnvironmentalGoal.find()
      .populate('department', 'name code');

    const calculatedGoals = await Promise.all(
      goals.map(async (goal) => await computeGoalProgress(goal))
    );

    res.status(200).json({
      success: true,
      count: calculatedGoals.length,
      data: calculatedGoals
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single environmental goal
// @route   GET /api/environmental/goals/:id
// @access  Public
exports.getEnvironmentalGoalById = async (req, res, next) => {
  try {
    const goal = await EnvironmentalGoal.findById(req.params.id)
      .populate('department', 'name code');

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    const calculated = await computeGoalProgress(goal);

    res.status(200).json({
      success: true,
      data: calculated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new environmental goal
// @route   POST /api/environmental/goals
// @access  Public
exports.createEnvironmentalGoal = async (req, res, next) => {
  try {
    const { title, department, metric, baseline, targetValue, startDate, deadline } = req.body;

    // 1. Validation: targetValue > 0, baseline >= 0
    if (targetValue === undefined || Number(targetValue) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Target emission limit must be greater than 0'
      });
    }
    if (baseline === undefined || Number(baseline) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Baseline emissions cannot be negative'
      });
    }

    // 2. Validation: department exists
    const dept = await Department.findById(department);
    if (!dept) {
      return res.status(400).json({
        success: false,
        message: 'Selected department does not exist'
      });
    }

    // 3. Validation: date range is valid
    if (!startDate || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Start date and deadline are required'
      });
    }
    if (new Date(startDate) > new Date(deadline)) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be after deadline date'
      });
    }

    const goal = await EnvironmentalGoal.create({
      title,
      department,
      metric: metric || 'CO2e Emissions Limit',
      baseline: Number(baseline),
      targetValue: Number(targetValue),
      startDate,
      deadline
    });

    const populated = await goal.populate('department', 'name code');
    const calculated = await computeGoalProgress(populated);

    res.status(201).json({
      success: true,
      data: calculated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update environmental goal
// @route   PUT /api/environmental/goals/:id
// @access  Public
exports.updateEnvironmentalGoal = async (req, res, next) => {
  try {
    const { title, department, metric, baseline, targetValue, startDate, deadline } = req.body;

    const goal = await EnvironmentalGoal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // 1. Validation if provided
    if (targetValue !== undefined && Number(targetValue) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Target emission limit must be greater than 0'
      });
    }
    if (baseline !== undefined && Number(baseline) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Baseline emissions cannot be negative'
      });
    }

    if (department !== undefined) {
      const dept = await Department.findById(department);
      if (!dept) {
        return res.status(400).json({
          success: false,
          message: 'Selected department does not exist'
        });
      }
      goal.department = department;
    }

    const newStart = startDate || goal.startDate;
    const newDeadline = deadline || goal.deadline;
    if (new Date(newStart) > new Date(newDeadline)) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be after deadline date'
      });
    }

    if (title !== undefined) goal.title = title;
    if (metric !== undefined) goal.metric = metric;
    if (baseline !== undefined) goal.baseline = Number(baseline);
    if (targetValue !== undefined) goal.targetValue = Number(targetValue);
    if (startDate !== undefined) goal.startDate = startDate;
    if (deadline !== undefined) goal.deadline = deadline;

    await goal.save();

    const populated = await goal.populate('department', 'name code');
    const calculated = await computeGoalProgress(populated);

    res.status(200).json({
      success: true,
      data: calculated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete environmental goal
// @route   DELETE /api/environmental/goals/:id
// @access  Public
exports.deleteEnvironmentalGoal = async (req, res, next) => {
  try {
    const goal = await EnvironmentalGoal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    await goal.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
