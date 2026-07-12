const Department = require('../models/Department');
const EnvironmentalGoal = require('../models/EnvironmentalGoal');
const CarbonTransaction = require('../models/CarbonTransaction');
const DepartmentScore = require('../models/DepartmentScore');
const EsgConfig = require('../models/EsgConfig');
const EsgSettings = require('../models/EsgSettings');
const EmployeeParticipation = require('../models/EmployeeParticipation');
const ChallengeParticipation = require('../models/ChallengeParticipation');
const TrainingCompletion = require('../models/TrainingCompletion');
const CsrActivity = require('../models/CsrActivity');

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
  const activeGoals = goals.filter(g => g.status !== 'Missed');

  if (activeGoals.length === 0) {
    return 100;
  }

  let totalGoalScore = 0;
  for (const goal of activeGoals) {
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
 * Calculates the social score for a department based on 4 pillars.
 */
const calculateDepartmentSocialScore = async (departmentId) => {
  try {
    const settings = await EsgSettings.findOne();
    const dept = await Department.findById(departmentId);
    if (!dept) return 0;

    const activities = await CsrActivity.find({ department: departmentId });
    const activitiesIds = activities.map(a => a._id);

    // 1. CSR participation rate
    const approvedCsrCount = await EmployeeParticipation.countDocuments({
      activity: { $in: activitiesIds },
      approvalStatus: 'Approved'
    });
    const deptEmployees = await EmployeeParticipation.find({
      activity: { $in: activitiesIds }
    }).distinct('employee');

    const denominator = Math.max(1, dept.employeeCount || deptEmployees.length);
    const csrRate = Math.min(100, (approvedCsrCount / denominator) * 100);

    // 2. Challenge completion rate (among employees who participated in the department CSR)
    let challengeRate = 100;
    if (deptEmployees.length > 0) {
      const approvedChallengeCount = await ChallengeParticipation.countDocuments({
        employee: { $in: deptEmployees },
        approvalStatus: 'Approved'
      });
      // Average completions per employee (cap at 100%)
      challengeRate = Math.min(100, (approvedChallengeCount / deptEmployees.length) * 100);
    }

    // 3. Training completion rate
    const completedTrainingCount = await TrainingCompletion.countDocuments({
      department: departmentId,
      status: 'Completed'
    });
    const trainingRate = Math.min(100, (completedTrainingCount / denominator) * 100);

    // 4. Diversity Metric attainment
    let diversityScore = 100;
    if (dept.diversityMetrics) {
      let genderRatioScore = 100;
      if (dept.diversityMetrics.genderRatio) {
        const ratioParts = dept.diversityMetrics.genderRatio.split(':').map(Number);
        if (ratioParts.length === 2 && !isNaN(ratioParts[0]) && !isNaN(ratioParts[1])) {
          const diff = Math.abs(ratioParts[0] - ratioParts[1]);
          genderRatioScore = Math.max(0, 100 - diff);
        }
      }
      let ageScore = 100;
      if (dept.diversityMetrics.ageBands) {
        const { under30, thirtyToFifty, over50 } = dept.diversityMetrics.ageBands;
        ageScore = (under30 > 0 ? 33.3 : 0) + (thirtyToFifty > 0 ? 33.3 : 0) + (over50 > 0 ? 33.4 : 0);
      }
      diversityScore = Math.round((genderRatioScore + ageScore) / 2);
    }

    // Combine using weights
    const weightCsr = settings ? settings.weightCsr : 25;
    const weightChallenge = settings ? settings.weightChallenge : 25;
    const weightTraining = settings ? settings.weightTraining : 25;
    const weightDiversity = settings ? settings.weightDiversity : 25;
    const totalWeight = weightCsr + weightChallenge + weightTraining + weightDiversity || 100;

    const finalSocialScore = Math.round(
      (csrRate * weightCsr +
       challengeRate * weightChallenge +
       trainingRate * weightTraining +
       diversityScore * weightDiversity) / totalWeight
    );

    return Math.max(0, Math.min(100, finalSocialScore));
  } catch (err) {
    console.error(`Error calculating social score for ${departmentId}:`, err);
    return 0;
  }
};

/**
 * Calculates overall ESG scores based on weighting and aggregation mode.
 */
const calculateOverallScore = (deptScores, config) => {
  const envWt = config.environmentalWeight;
  const socWt = config.socialWeight;
  const govWt = config.governanceWeight;

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
    const socScore = await calculateDepartmentSocialScore(dept._id);
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
    dept.socialScore = socScore;
    dept.totalESGScore = totalScore;
    await dept.save();
  }
};

module.exports = {
  calculateGoalAttainmentScore,
  calculateDepartmentEnvironmentalScore,
  calculateDepartmentSocialScore,
  calculateOverallScore,
  recomputeAllDepartmentScores
};
