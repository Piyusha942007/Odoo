const mongoose = require('mongoose');

const EnvironmentalGoalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  metric: {
    type: String,
    default: 'CO2e Emissions Limit',
    trim: true
  },
  baseline: {
    type: Number,
    required: [true, 'Baseline emissions are required'],
    min: [0, 'Baseline emissions cannot be negative']
  },
  targetValue: {
    type: Number,
    required: [true, 'Target limit value is required'],
    min: [0.0001, 'Target limit must be greater than 0']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline date is required']
  },
  status: {
    type: String,
    enum: ['On Track', 'At Risk', 'Missed'],
    default: 'On Track'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EnvironmentalGoal', EnvironmentalGoalSchema);
