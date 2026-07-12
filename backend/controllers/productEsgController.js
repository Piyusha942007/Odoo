const ProductEsgProfile = require('../models/ProductEsgProfile');
const EmissionFactor = require('../models/EmissionFactor');

// Get all profiles
exports.getProductEsgProfiles = async (req, res, next) => {
  try {
    const profiles = await ProductEsgProfile.find()
      .populate('defaultEmissionFactor', 'name unit co2eFactor sourceType status');

    res.status(200).json({
      success: true,
      count: profiles.length,
      data: profiles
    });
  } catch (err) {
    next(err);
  }
};

// Get single profile
exports.getProductEsgProfileById = async (req, res, next) => {
  try {
    const profile = await ProductEsgProfile.findById(req.params.id)
      .populate('defaultEmissionFactor', 'name unit co2eFactor sourceType status');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Product ESG profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (err) {
    next(err);
  }
};

// Create profile
exports.createProductEsgProfile = async (req, res, next) => {
  try {
    const { productName, defaultEmissionFactor, category, notes } = req.body;

    // Check if emission factor exists
    const factor = await EmissionFactor.findById(defaultEmissionFactor);
    if (!factor) {
      return res.status(400).json({
        success: false,
        message: 'Selected Emission Factor does not exist'
      });
    }

    const profile = await ProductEsgProfile.create({
      productName,
      defaultEmissionFactor,
      category: category || 'Purchase',
      notes
    });

    const populated = await profile.populate('defaultEmissionFactor', 'name unit co2eFactor sourceType status');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (err) {
    next(err);
  }
};

// Update profile
exports.updateProductEsgProfile = async (req, res, next) => {
  try {
    const { productName, defaultEmissionFactor, category, notes } = req.body;

    const profile = await ProductEsgProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Product ESG profile not found'
      });
    }

    if (defaultEmissionFactor !== undefined) {
      const factor = await EmissionFactor.findById(defaultEmissionFactor);
      if (!factor) {
        return res.status(400).json({
          success: false,
          message: 'Selected Emission Factor does not exist'
        });
      }
      profile.defaultEmissionFactor = defaultEmissionFactor;
    }

    if (productName !== undefined) profile.productName = productName;
    if (category !== undefined) profile.category = category;
    if (notes !== undefined) profile.notes = notes;

    await profile.save();

    const populated = await profile.populate('defaultEmissionFactor', 'name unit co2eFactor sourceType status');

    res.status(200).json({
      success: true,
      data: populated
    });
  } catch (err) {
    next(err);
  }
};

// Delete profile
exports.deleteProductEsgProfile = async (req, res, next) => {
  try {
    const profile = await ProductEsgProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Product ESG profile not found'
      });
    }

    await profile.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product ESG profile deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
