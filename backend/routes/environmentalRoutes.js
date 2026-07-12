const express = require('express');
const router = express.Router();
const {
  getEmissionFactors,
  getEmissionFactorById,
  createEmissionFactor,
  updateEmissionFactor,
  deleteEmissionFactor
} = require('../controllers/emissionFactorController');

router.route('/emission-factors')
  .get(getEmissionFactors)
  .post(createEmissionFactor);

router.route('/emission-factors/:id')
  .get(getEmissionFactorById)
  .put(updateEmissionFactor)
  .delete(deleteEmissionFactor);

module.exports = router;
