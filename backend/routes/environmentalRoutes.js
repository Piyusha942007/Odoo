const express = require('express');
const router = express.Router();
const {
  getEmissionFactors,
  getEmissionFactorById,
  createEmissionFactor,
  updateEmissionFactor,
  deleteEmissionFactor
} = require('../controllers/emissionFactorController');

const {
  getCarbonTransactions,
  getCarbonTransactionById,
  createCarbonTransaction,
  updateCarbonTransaction,
  deleteCarbonTransaction
} = require('../controllers/carbonTransactionController');

const {
  getProductEsgProfiles,
  getProductEsgProfileById,
  createProductEsgProfile,
  updateProductEsgProfile,
  deleteProductEsgProfile
} = require('../controllers/productEsgController');

const {
  getEnvironmentalGoals,
  getEnvironmentalGoalById,
  createEnvironmentalGoal,
  updateEnvironmentalGoal,
  deleteEnvironmentalGoal
} = require('../controllers/environmentalGoalController');

const {
  getEsgConfig,
  saveEsgConfig,
  getEsgDashboard,
  recomputeEsgScores,
  getDepartmentTracking
} = require('../controllers/esgScoreController');

router.route('/emission-factors')
  .get(getEmissionFactors)
  .post(createEmissionFactor);

router.route('/emission-factors/:id')
  .get(getEmissionFactorById)
  .put(updateEmissionFactor)
  .delete(deleteEmissionFactor);

router.route('/carbon-transactions')
  .get(getCarbonTransactions)
  .post(createCarbonTransaction);

router.route('/carbon-transactions/:id')
  .get(getCarbonTransactionById)
  .put(updateCarbonTransaction)
  .delete(deleteCarbonTransaction);

router.route('/product-esg')
  .get(getProductEsgProfiles)
  .post(createProductEsgProfile);

router.route('/product-esg/:id')
  .get(getProductEsgProfileById)
  .put(updateProductEsgProfile)
  .delete(deleteProductEsgProfile);

router.route('/goals')
  .get(getEnvironmentalGoals)
  .post(createEnvironmentalGoal);

router.route('/goals/:id')
  .get(getEnvironmentalGoalById)
  .put(updateEnvironmentalGoal)
  .delete(deleteEnvironmentalGoal);

router.route('/config')
  .get(getEsgConfig)
  .post(saveEsgConfig);

router.route('/dashboard')
  .get(getEsgDashboard);

router.route('/recompute-scores')
  .post(recomputeEsgScores);

router.route('/departments/:id/tracking')
  .get(getDepartmentTracking);

module.exports = router;
