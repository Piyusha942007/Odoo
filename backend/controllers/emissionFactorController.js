const EmissionFactor = require('../models/EmissionFactor');

// @desc    Get all emission factors
// @route   GET /api/environmental/emission-factors
// @access  Public
exports.getEmissionFactors = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.sourceType) {
      filter.sourceType = req.query.sourceType;
    }

    const factors = await EmissionFactor.find(filter);
    res.status(200).json({
      success: true,
      count: factors.length,
      data: factors
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single emission factor
// @route   GET /api/environmental/emission-factors/:id
// @access  Public
exports.getEmissionFactorById = async (req, res, next) => {
  try {
    const factor = await EmissionFactor.findById(req.params.id);
    if (!factor) {
      return res.status(404).json({
        success: false,
        message: 'Emission factor not found'
      });
    }
    res.status(200).json({
      success: true,
      data: factor
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new emission factor
// @route   POST /api/environmental/emission-factors
// @access  Public
exports.createEmissionFactor = async (req, res, next) => {
  try {
    const factor = await EmissionFactor.create(req.body);
    res.status(201).json({
      success: true,
      data: factor
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update emission factor
// @route   PUT /api/environmental/emission-factors/:id
// @access  Public
exports.updateEmissionFactor = async (req, res, next) => {
  try {
    const factor = await EmissionFactor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!factor) {
      return res.status(404).json({
        success: false,
        message: 'Emission factor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: factor
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete emission factor
// @route   DELETE /api/environmental/emission-factors/:id
// @access  Public
exports.deleteEmissionFactor = async (req, res, next) => {
  try {
    const factor = await EmissionFactor.findById(req.params.id);
    if (!factor) {
      return res.status(404).json({
        success: false,
        message: 'Emission factor not found'
      });
    }

    await factor.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Emission factor deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
