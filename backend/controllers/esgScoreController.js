const EsgConfig = require('../models/EsgConfig');
const DepartmentScore = require('../models/DepartmentScore');
const Department = require('../models/Department');
const EnvironmentalGoal = require('../models/EnvironmentalGoal');
const CarbonTransaction = require('../models/CarbonTransaction');
const {
  calculateOverallScore,
  recomputeAllDepartmentScores
} = require('../services/esgCalculationService');

// GET /api/environmental/config
const getEsgConfig = async (req, res) => {
  try {
    let config = await EsgConfig.findOne();
    if (!config) {
      config = await EsgConfig.create({
        environmentalWeight: 40,
        socialWeight: 30,
        governanceWeight: 30,
        aggregationMode: 'simple_average'
      });
    }
    return res.status(200).json({ success: true, data: config });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve ESG configuration' });
  }
};

// POST /api/environmental/config
const saveEsgConfig = async (req, res) => {
  try {
    const { environmentalWeight, socialWeight, governanceWeight, aggregationMode } = req.body;

    if (environmentalWeight + socialWeight + governanceWeight !== 100) {
      return res.status(400).json({ 
        success: false, 
        message: 'Weights must sum exactly to 100%' 
      });
    }

    let config = await EsgConfig.findOne();
    if (!config) {
      config = new EsgConfig({});
    }

    config.environmentalWeight = environmentalWeight;
    config.socialWeight = socialWeight;
    config.governanceWeight = governanceWeight;
    config.aggregationMode = aggregationMode;

    await config.save();
    return res.status(200).json({ success: true, data: config });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed to save ESG configuration' });
  }
};

// Helper function to build dashboard payload
const buildDashboardPayload = async () => {
  let config = await EsgConfig.findOne();
  if (!config) {
    config = { environmentalWeight: 40, socialWeight: 30, governanceWeight: 30, aggregationMode: 'simple_average' };
  }

  const departments = await Department.find();
  const transactions = await CarbonTransaction.find().populate('emissionFactor');
  const goals = await EnvironmentalGoal.find();

  const totalEmission = transactions.reduce((sum, tx) => sum + (tx.co2eAmount || 0), 0);
  const carbonReduction = goals.reduce((sum, g) => sum + Math.max(0, g.baseline - g.targetValue), 0);
  const activeGoals = goals.length;
  const departmentCount = departments.length;

  const departmentScores = departments.map(d => ({
    _id: d._id,
    name: d.name,
    code: d.code,
    employeeCount: d.employeeCount || 0,
    environmentalScore: d.environmentalScore || 0,
    socialScore: d.socialScore || 0,
    governanceScore: d.governanceScore || 0,
    totalScore: d.totalESGScore || 0
  }));

  // Scope emissions distribution logic
  let scope1 = 0;
  let scope2 = 0;
  let scope3 = 0;

  transactions.forEach(tx => {
    const type = tx.emissionFactor?.sourceType || 'Purchase';
    const amount = tx.co2eAmount || 0;
    if (type === 'Manufacturing' || type === 'Fleet') {
      scope1 += amount;
    } else if (type === 'Expense') {
      scope2 += amount;
    } else {
      scope3 += amount;
    }
  });

  const distributionData = [
    { name: 'Scope 1 (Direct)', value: Math.round(scope1), color: '#06b6d4' },
    { name: 'Scope 2 (Indirect)', value: Math.round(scope2), color: '#8b5cf6' },
    { name: 'Scope 3 (Value Chain)', value: Math.round(scope3), color: '#10b981' },
  ];

  // Monthly trend stack data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  const trendMap = {};
  
  months.forEach(m => {
    trendMap[m] = { name: m, 'Scope 1': 0, 'Scope 2': 0, 'Scope 3': 0 };
  });

  transactions.forEach(tx => {
    const txDate = tx.date ? new Date(tx.date) : new Date();
    if (txDate.getFullYear() === currentYear) {
      const mName = months[txDate.getMonth()];
      const type = tx.emissionFactor?.sourceType || 'Purchase';
      const amount = Math.round(tx.co2eAmount || 0);

      if (type === 'Manufacturing' || type === 'Fleet') {
        trendMap[mName]['Scope 1'] += amount;
      } else if (type === 'Expense') {
        trendMap[mName]['Scope 2'] += amount;
      } else {
        trendMap[mName]['Scope 3'] += amount;
      }
    }
  });

  const trendData = Object.values(trendMap);

  // Calculate overall scores
  let overallESGScore = 0;
  let overallEnv = 0;
  let overallSoc = 0;
  let overallGov = 0;

  if (departmentScores.length > 0) {
    if (config.aggregationMode === 'headcount_weighted') {
      let totalEmployees = 0;
      let weightedEscSum = 0;
      let weightedSscSum = 0;
      let weightedGscSum = 0;
      let weightedTotSum = 0;

      departmentScores.forEach(d => {
        const count = d.employeeCount || 0;
        weightedEscSum += d.environmentalScore * count;
        weightedSscSum += d.socialScore * count;
        weightedGscSum += d.governanceScore * count;
        weightedTotSum += d.totalScore * count;
        totalEmployees += count;
      });

      if (totalEmployees > 0) {
        overallEnv = Math.round(weightedEscSum / totalEmployees);
        overallSoc = Math.round(weightedSscSum / totalEmployees);
        overallGov = Math.round(weightedGscSum / totalEmployees);
        overallESGScore = Math.round(weightedTotSum / totalEmployees);
      } else {
        const sumEnv = departmentScores.reduce((acc, d) => acc + d.environmentalScore, 0);
        const sumSoc = departmentScores.reduce((acc, d) => acc + d.socialScore, 0);
        const sumGov = departmentScores.reduce((acc, d) => acc + d.governanceScore, 0);
        const sumTot = departmentScores.reduce((acc, d) => acc + d.totalScore, 0);

        overallEnv = Math.round(sumEnv / departmentScores.length);
        overallSoc = Math.round(sumSoc / departmentScores.length);
        overallGov = Math.round(sumGov / departmentScores.length);
        overallESGScore = Math.round(sumTot / departmentScores.length);
      }
    } else {
      // simple_average
      const sumEnv = departmentScores.reduce((acc, d) => acc + d.environmentalScore, 0);
      const sumSoc = departmentScores.reduce((acc, d) => acc + d.socialScore, 0);
      const sumGov = departmentScores.reduce((acc, d) => acc + d.governanceScore, 0);
      const sumTot = departmentScores.reduce((acc, d) => acc + d.totalScore, 0);

      overallEnv = Math.round(sumEnv / departmentScores.length);
      overallSoc = Math.round(sumSoc / departmentScores.length);
      overallGov = Math.round(sumGov / departmentScores.length);
      overallESGScore = Math.round(sumTot / departmentScores.length);
    }
  }

  return {
    overallESGScore,
    environmentalScore: overallEnv,
    socialScore: overallSoc,
    governanceScore: overallGov,
    totalEmission: Math.round(totalEmission),
    carbonReduction: Math.round(carbonReduction),
    activeGoals,
    departmentCount,
    departmentScores,
    distributionData,
    trendData
  };
};

// GET /api/environmental/dashboard
const getEsgDashboard = async (req, res) => {
  try {
    const payload = await buildDashboardPayload();
    return res.status(200).json({ success: true, data: payload });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed to compile dashboard analytics' });
  }
};

// POST /api/environmental/recompute-scores
const recomputeEsgScores = async (req, res) => {
  try {
    const period = req.body.period || '2026';
    const quarter = req.body.quarter || 'Q3';

    await recomputeAllDepartmentScores(period, quarter);

    // Return the updated dashboard payload
    const payload = await buildDashboardPayload();
    return res.status(200).json({ success: true, data: payload });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Recomputation execution failed' });
  }
};

// GET /api/environmental/departments/:id/tracking
const getDepartmentTracking = async (req, res) => {
  try {
    const departmentId = req.params.id;
    const year = Number(req.query.year) || new Date().getFullYear();

    const dept = await Department.findById(departmentId);
    if (!dept) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    // Timezone-safe UTC boundaries:
    // We use a full year window from Jan 1 00:00 UTC to Jan 1 next year 00:00 UTC (exclusive).
    // This ensures transactions entered in IST (which shift to prev UTC day) are still captured.
    const startOfCurrentYear = new Date(Date.UTC(year, 0, 1));       // Jan 1 00:00 UTC
    const endOfCurrentYear   = new Date(Date.UTC(year + 1, 0, 1));   // Jan 1 next yr 00:00 UTC (exclusive)

    const startOfPriorYear = new Date(Date.UTC(year - 1, 0, 1));
    const endOfPriorYear   = new Date(Date.UTC(year, 0, 1));

    // Fetch transactions using $lt for end boundary (exclusive)
    const currentTransactions = await CarbonTransaction.find({
      department: departmentId,
      date: { $gte: startOfCurrentYear, $lt: endOfCurrentYear }
    }).populate('emissionFactor');

    const priorTransactions = await CarbonTransaction.find({
      department: departmentId,
      date: { $gte: startOfPriorYear, $lt: endOfPriorYear }
    });

    const currentEmission  = currentTransactions.reduce((sum, tx) => sum + (tx.co2eAmount || 0), 0);
    const previousEmission = priorTransactions.reduce((sum, tx) => sum + (tx.co2eAmount || 0), 0);
    const difference       = currentEmission - previousEmission;
    const percentageChange = previousEmission > 0
      ? parseFloat(((difference / previousEmission) * 100).toFixed(1))
      : 0;

    // Fetch goals for this department
    const deptGoals = await EnvironmentalGoal.find({ department: departmentId });

    // Goal compliance: compare actual emissions within each goal's date range
    let goalList = [];
    if (deptGoals.length > 0) {
      for (const g of deptGoals) {
        const goalStart = new Date(g.startDate);
        const goalEnd   = new Date(g.deadline);
        // Extend goal end to include the full deadline day (add 1 day)
        const goalEndInclusive = new Date(goalEnd.getTime() + 24 * 60 * 60 * 1000);

        const txs = await CarbonTransaction.find({
          department: departmentId,
          date: { $gte: goalStart, $lt: goalEndInclusive }
        });
        const actualVal = txs.reduce((sum, tx) => sum + (tx.co2eAmount || 0), 0);
        goalList.push({
          name:   g.title,
          target: g.targetValue,
          actual: Math.round(actualVal),
          status: actualVal <= g.targetValue ? 'achieved' : 'at_risk'
        });
      }
    } else {
      goalList.push({
        name:   'No Active Goals Configured',
        target: 0,
        actual: 0,
        status: 'no_goals_configured'
      });
    }

    // Monthly bucketing — use UTC month from each transaction's stored date
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Build a map: UTC month index → actual emissions
    const monthActuals = Array(12).fill(0);
    currentTransactions.forEach(tx => {
      if (tx.date) {
        const utcMonth = new Date(tx.date).getUTCMonth(); // 0–11
        monthActuals[utcMonth] += tx.co2eAmount || 0;
      }
    });

    const monthlyData = monthNames.map((month, mIdx) => {
      // Target: distribute each overlapping goal's target evenly across its active months
      const monthUTCStart = new Date(Date.UTC(year, mIdx, 1));
      const monthUTCEnd   = new Date(Date.UTC(year, mIdx + 1, 1)); // exclusive

      const overlappingGoals = deptGoals.filter(g => {
        const gs = new Date(g.startDate);
        const ge = new Date(new Date(g.deadline).getTime() + 24 * 60 * 60 * 1000);
        return gs < monthUTCEnd && ge > monthUTCStart;
      });

      let targetM = 0;
      if (overlappingGoals.length > 0) {
        overlappingGoals.forEach(g => {
          // Calculate how many months this goal spans
          const gs     = new Date(g.startDate);
          const ge     = new Date(g.deadline);
          const spanMs = ge.getTime() - gs.getTime();
          const spanMonths = Math.max(1, Math.round(spanMs / (30 * 24 * 60 * 60 * 1000)));
          targetM += g.targetValue / spanMonths;
        });
        targetM = Math.round(targetM);
      }

      return {
        month: month,
        actualEmission: Math.round(monthActuals[mIdx]),
        targetEmission: targetM
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        department: { id: dept._id, name: dept.name },
        period:     { year },
        carbon: {
          currentEmission:  Math.round(currentEmission),
          previousEmission: Math.round(previousEmission),
          difference:       Math.round(difference),
          percentageChange
        },
        monthlyData,
        goals:        goalList,
        transactions: currentTransactions
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve department tracking metrics' });
  }
};

module.exports = {
  getEsgConfig,
  saveEsgConfig,
  getEsgDashboard,
  recomputeEsgScores,
  getDepartmentTracking
};
