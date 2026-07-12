const Department = require('../models/Department');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().populate('parentDepartment', 'name code');
    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Public
exports.getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id).populate('parentDepartment', 'name code');
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    res.status(200).json({
      success: true,
      data: department
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new department
// @route   POST /api/departments
// @access  Public
exports.createDepartment = async (req, res, next) => {
  try {
    // If parentDepartment is empty string, convert it to null
    if (req.body.parentDepartment === '') {
      req.body.parentDepartment = null;
    }
    const department = await Department.create(req.body);
    res.status(201).json({
      success: true,
      data: department
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Department code must be unique'
      });
    }
    next(err);
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Public
exports.updateDepartment = async (req, res, next) => {
  try {
    // Prevent self-referencing loop
    if (req.body.parentDepartment === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'A department cannot be its own parent'
      });
    }
    if (req.body.parentDepartment === '') {
      req.body.parentDepartment = null;
    }
    
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.status(200).json({
      success: true,
      data: department
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Department code must be unique'
      });
    }
    next(err);
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Public
exports.deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Set children's parentDepartment to null or handle reference cleanup
    await Department.updateMany(
      { parentDepartment: req.params.id },
      { parentDepartment: null }
    );

    await department.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
