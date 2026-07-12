const Department = require('../models/Department');
const EnvironmentalGoal = require('../models/EnvironmentalGoal');
const CarbonTransaction = require('../models/CarbonTransaction');
const DepartmentScore = require('../models/DepartmentScore');
const EsgConfig = require('../models/EsgConfig');

/**
 * Calculates a goal attainment score.
 * If actual <= target, returns 100.
 * Else, returns (target / actual) * 100 (capped at 0).
 */
const calculateGoalAttainmentScore = (actualEmission, targetCap) => {
  if (actualEmission <= targetCap) {
    return 100;
  }
  return Math.max(0, Math.round((targetCap / actualEmission) * 100));
};

/**
 * Calculates the environmental score for a department based on its goals and transactions.
 * If there are no goals configured, returns 100.
 */
const calculateDepartmentEnvironmentalScore = async (departmentId) => {
  const goals = await EnvironmentalGoal.find({ department: departmentId });
  const activeGoals = goals.filter(g => g.status !== 'Missed'); // or select all goals

  if (activeGoals.length === 0) {
    return 100;
  }

  let totalGoalScore = 0;
  for (const goal of activeGoals) {
    // Find all carbon transactions within the goal's timeframe for this department
    const transactions = await CarbonTransaction.find({
      department: departmentId,
      date: {
        $gte: new Date(goal.startDate),
        $lte: new Date(goal.deadline)
      }
    });

    const actualEmission = transactions.reduce((sum, tx) => sum + (tx.co2eAmount || 0), 0);
    const score = calculateGoalAttainmentScore(actualEmission, goal.targetValue);
    totalGoalScore += score;
  }

  return Math.round(totalGoalScore / activeGoals.length);
};

/**
 * Calculates overall ESG scores based on weighting and aggregation mode.
 */
const calculateOverallScore = (deptScores, config) => {
  const envWt = config.environmentalWeight;
  const socWt = config.socialWeight;
  const govWt = config.governanceWeight;

  // Calculate total score for each department score
  const computedDeptScores = deptScores.map(d => {
    const total = Math.round(
      ((d.environmentalScore * envWt) + 
       (d.socialScore * socWt) + 
       (d.governanceScore * govWt)) / 100
    );
    return { ...d, totalScore: total };
  });

  let overallESGScore = 0;

  if (config.aggregationMode === 'headcount_weighted') {
    let totalEmployees = 0;
    let weightedScoreSum = 0;

    computedDeptScores.forEach(d => {
      const empCount = d.employeeCount || 0;
      weightedScoreSum += d.totalScore * empCount;
      totalEmployees += empCount;
    });

    if (totalEmployees > 0) {
      overallESGScore = Math.round(weightedScoreSum / totalEmployees);
    } else {
      const sum = computedDeptScores.reduce((acc, d) => acc + d.totalScore, 0);
      overallESGScore = computedDeptScores.length > 0 ? Math.round(sum / computedDeptScores.length) : 0;
    }
  } else {
    // simple_average
    const sum = computedDeptScores.reduce((acc, d) => acc + d.totalScore, 0);
    overallESGScore = computedDeptScores.length > 0 ? Math.round(sum / computedDeptScores.length) : 0;
  }

  return {
    overallESGScore,
    computedDeptScores
  };
};

/**
 * Core business logic to run ESG department scoring calculations.
 */
const recomputeAllDepartmentScores = async (period = '2026', quarter = 'Q3') => {
  let config = await EsgConfig.findOne();
  if (!config) {
    config = await EsgConfig.create({
      environmentalWeight: 40,
      socialWeight: 30,
      governanceWeight: 30,
      aggregationMode: 'simple_average'
    });
  }

  const year = Number(period.slice(0, 4)) || 2026;
  const departments = await Department.find();

  for (const dept of departments) {
    const envScore = await calculateDepartmentEnvironmentalScore(dept._id);
    const socScore = dept.socialScore || 0;
    const govScore = dept.governanceScore || 0;

    const totalScore = Math.round(
      ((envScore * config.environmentalWeight) + 
       (socScore * config.socialWeight) + 
       (govScore * config.governanceWeight)) / 100
    );

    await DepartmentScore.findOneAndUpdate(
      { department: dept._id, period },
      { 
        environmentalScore: envScore,
        socialScore: socScore,
        governanceScore: govScore,
        totalScore,
        year,
        quarter
      },
      { upsert: true, new: true }
    );

    dept.environmentalScore = envScore;
    dept.totalESGScore = totalScore;
    await dept.save();
  }
};

module.exports = {
  calculateGoalAttainmentScore,
  calculateDepartmentEnvironmentalScore,
  calculateOverallScore,
  recomputeAllDepartmentScores
};
