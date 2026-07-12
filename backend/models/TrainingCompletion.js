const mongoose = require('mongoose');

const TrainingCompletionSchema = new mongoose.Schema({
  employee: {
    type: String,
    required: true,
    trim: true
  },
  trainingName: {
    type: String,
    required: true,
    trim: true
  },
  completionDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['In Progress', 'Completed'],
    default: 'Completed'
  },
  score: {
    type: Number,
    default: 100
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TrainingCompletion', TrainingCompletionSchema);
