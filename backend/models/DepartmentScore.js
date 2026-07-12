const mongoose = require('mongoose');

const DepartmentScoreSchema = new mongoose.Schema({
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  environmentalScore: {
    type: Number,
    required: true,
    default: 0
  },
  socialScore: {
    type: Number,
    required: true,
    default: 0
  },
  governanceScore: {
    type: Number,
    required: true,
    default: 0
  },
  totalScore: {
    type: Number,
    required: true,
    default: 0
  },
  period: {
    type: String,
    required: true
  },
  year: {
    type: Number
  },
  quarter: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DepartmentScore', DepartmentScoreSchema);
