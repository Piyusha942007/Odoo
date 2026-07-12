const mongoose = require('mongoose');

const CarbonTransactionSchema = new mongoose.Schema({
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  sourceDocument: {
    type: String,
    required: [true, 'Source document identifier is required'],
    trim: true
  },
  emissionFactor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmissionFactor',
    required: [true, 'Emission factor is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0.0001, 'Quantity must be greater than 0']
  },
  co2eAmount: {
    type: Number,
    required: [true, 'CO2e amount is required'],
    min: [0, 'CO2e amount cannot be negative']
  },
  calculationType: {
    type: String,
    enum: ['Manual', 'Auto'],
    default: 'Manual'
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CarbonTransaction', CarbonTransactionSchema);
