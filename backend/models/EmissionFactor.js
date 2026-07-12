const mongoose = require('mongoose');

const EmissionFactorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Emission factor name/source type is required'],
    trim: true
  },
  sourceType: {
    type: String,
    required: [true, 'Source type is required'],
    enum: ['Purchase', 'Manufacturing', 'Expense', 'Fleet']
  },
  unit: {
    type: String,
    required: [true, 'Unit of measurement is required'],
    trim: true
  },
  co2eFactor: {
    type: Number,
    required: [true, 'CO2e factor value is required'],
    min: [0, 'CO2e factor cannot be negative']
  },
  effectiveDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EmissionFactor', EmissionFactorSchema);
