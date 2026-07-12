const CarbonTransaction = require('../models/CarbonTransaction');
const EmissionFactor = require('../models/EmissionFactor');

// @desc    Get all carbon transactions
// @route   GET /api/environmental/carbon-transactions
// @access  Public
exports.getCarbonTransactions = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.department) {
      filter.department = req.query.department;
    }
    if (req.query.calculationType) {
      filter.calculationType = req.query.calculationType;
    }

    const transactions = await CarbonTransaction.find(filter)
      .populate('department', 'name code')
      .populate('emissionFactor', 'name unit co2eFactor sourceType status');

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single carbon transaction
// @route   GET /api/environmental/carbon-transactions/:id
// @access  Public
exports.getCarbonTransactionById = async (req, res, next) => {
  try {
    const transaction = await CarbonTransaction.findById(req.params.id)
      .populate('department', 'name code')
      .populate('emissionFactor', 'name unit co2eFactor sourceType status');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Carbon transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new carbon transaction
// @route   POST /api/environmental/carbon-transactions
// @access  Public
exports.createCarbonTransaction = async (req, res, next) => {
  try {
    const { department, sourceDocument, emissionFactor, quantity, calculationType, date } = req.body;

    // 1. Validate quantity > 0
    if (!quantity || Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    }

    // 2. Validate Emission Factor exists and is Active
    const factor = await EmissionFactor.findById(emissionFactor);
    if (!factor) {
      return res.status(400).json({
        success: false,
        message: 'Selected Emission Factor does not exist'
      });
    }
    if (factor.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'Selected Emission Factor is inactive'
      });
    }

    // 3. Backend-calculated authoritative co2eAmount (quantity * co2eFactor)
    const co2eAmount = Number(quantity) * factor.co2eFactor;

    const transaction = await CarbonTransaction.create({
      department,
      sourceDocument,
      emissionFactor,
      quantity: Number(quantity),
      co2eAmount,
      calculationType: calculationType || 'Manual',
      date: date || Date.now()
    });

    const populated = await transaction.populate([
      { path: 'department', select: 'name code' },
      { path: 'emissionFactor', select: 'name unit co2eFactor sourceType status' }
    ]);

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update carbon transaction
// @route   PUT /api/environmental/carbon-transactions/:id
// @access  Public
exports.updateCarbonTransaction = async (req, res, next) => {
  try {
    const { department, sourceDocument, emissionFactor, quantity, calculationType, date } = req.body;

    const transaction = await CarbonTransaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Carbon transaction not found'
      });
    }

    // 1. Validate quantity if provided
    if (quantity !== undefined && Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    }

    let co2eAmount = transaction.co2eAmount;

    // 2. Validate Emission Factor exists and is Active if changed
    if (emissionFactor !== undefined || quantity !== undefined) {
      const targetFactorId = emissionFactor || transaction.emissionFactor;
      const targetQuantity = quantity !== undefined ? quantity : transaction.quantity;

      const factor = await EmissionFactor.findById(targetFactorId);
      if (!factor) {
        return res.status(400).json({
          success: false,
          message: 'Selected Emission Factor does not exist'
        });
      }
      if (factor.status !== 'Active') {
        return res.status(400).json({
          success: false,
          message: 'Selected Emission Factor is inactive'
        });
      }

      // 3. Backend-calculated authoritative co2eAmount
      co2eAmount = Number(targetQuantity) * factor.co2eFactor;
      transaction.quantity = Number(targetQuantity);
      transaction.emissionFactor = targetFactorId;
    }

    if (department !== undefined) transaction.department = department;
    if (sourceDocument !== undefined) transaction.sourceDocument = sourceDocument;
    if (calculationType !== undefined) transaction.calculationType = calculationType;
    if (date !== undefined) transaction.date = date;
    transaction.co2eAmount = co2eAmount;

    await transaction.save();

    const populated = await transaction.populate([
      { path: 'department', select: 'name code' },
      { path: 'emissionFactor', select: 'name unit co2eFactor sourceType status' }
    ]);

    res.status(200).json({
      success: true,
      data: populated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete carbon transaction
// @route   DELETE /api/environmental/carbon-transactions/:id
// @access  Public
exports.deleteCarbonTransaction = async (req, res, next) => {
  try {
    const transaction = await CarbonTransaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Carbon transaction not found'
      });
    }

    await transaction.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Carbon transaction deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
