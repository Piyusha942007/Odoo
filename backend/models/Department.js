const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Department code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  head: {
    type: String,
    trim: true
  },
  parentDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  employeeCount: {
    type: Number,
    default: 0,
    min: [0, 'Employee count cannot be negative']
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  socialScore: {
    type: Number,
    default: 0
  },
  environmentalScore: {
    type: Number,
    default: 0
  },
  governanceScore: {
    type: Number,
    default: 0
  },
  totalESGScore: {
    type: Number,
    default: 0
  },
  diversityMetrics: {
    genderRatio: {
      type: String,
      default: "50:50"
    },
    ageBands: {
      under30: { type: Number, default: 30 },
      thirtyToFifty: { type: Number, default: 50 },
      over50: { type: Number, default: 20 }
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Department', DepartmentSchema);
