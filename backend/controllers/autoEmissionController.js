const EsgConfig = require('../models/EsgConfig');
const EmissionFactor = require('../models/EmissionFactor');
const { getConfig, processErpRecord } = require('../services/autoEmissionService');

// GET /api/environmental/settings
const getAutoEmissionSettings = async (req, res) => {
  try {
    const config = await getConfig();
    const activeFactors = await EmissionFactor.find({ status: 'Active' })
      .select('_id name sourceType unit co2eFactor');

    return res.status(200).json({
      success: true,
      data: {
        autoEmissionCalculation: config.autoEmissionCalculation,
        activeEmissionFactors: activeFactors
      }
    });
  } catch (err) {
    console.error('[AutoEmission] getAutoEmissionSettings error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve auto emission settings' });
  }
};

// POST /api/environmental/settings
const saveAutoEmissionSettings = async (req, res) => {
  try {
    const { autoEmissionCalculation } = req.body;
    if (typeof autoEmissionCalculation !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'autoEmissionCalculation must be a boolean (true or false)'
      });
    }

    let config = await EsgConfig.findOne();
    if (!config) {
      config = new EsgConfig({});
    }
    config.autoEmissionCalculation = autoEmissionCalculation;
    await config.save();

    return res.status(200).json({
      success: true,
      data: { autoEmissionCalculation: config.autoEmissionCalculation },
      message: `Auto Emission Calculation ${autoEmissionCalculation ? 'enabled' : 'disabled'}`
    });
  } catch (err) {
    console.error('[AutoEmission] saveAutoEmissionSettings error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update auto emission settings' });
  }
};

// POST /api/environmental/simulate-erp
const simulateErpRecord = async (req, res) => {
  try {
    const { sourceType, department, sourceDocument, items } = req.body;

    // Basic presence checks before delegating to service
    if (!sourceType || !department || !sourceDocument) {
      return res.status(400).json({
        success: false,
        message: 'sourceType, department, and sourceDocument are required'
      });
    }

    const result = await processErpRecord({ sourceType, department, sourceDocument, items });
    return res.status(200).json({ success: true, data: result });

  } catch (err) {
    console.error('[AutoEmission] simulateErpRecord error:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAutoEmissionSettings,
  saveAutoEmissionSettings,
  simulateErpRecord
};
