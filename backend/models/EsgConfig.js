const mongoose = require('mongoose');

const EsgConfigSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    default: () => new mongoose.Types.ObjectId('6691456789abcdef12345678')
  },
  environmentalWeight: {
    type: Number,
    required: true,
    default: 40,
    min: 0,
    max: 100
  },
  socialWeight: {
    type: Number,
    required: true,
    default: 30,
    min: 0,
    max: 100
  },
  governanceWeight: {
    type: Number,
    required: true,
    default: 30,
    min: 0,
    max: 100
  },
  aggregationMode: {
    type: String,
    required: true,
    enum: ['simple_average', 'headcount_weighted'],
    default: 'simple_average'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EsgConfig', EsgConfigSchema);
