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
  // sourceType is set only for Auto-calculated transactions (Purchase/Manufacturing/Expense/Fleet)
  // Optional for backwards compatibility with existing manual transactions
  sourceType: {
    type: String,
    enum: ['Purchase', 'Manufacturing', 'Expense', 'Fleet', null],
    default: null
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

// Compound sparse unique index for idempotent auto-emission deduplication.
// sparse: true means documents with sourceType=null (manual transactions) are excluded
// — so existing manually-created transactions are completely unaffected.
CarbonTransactionSchema.index(
  { sourceType: 1, sourceDocument: 1, department: 1, emissionFactor: 1 },
  { unique: true, sparse: true, name: 'idempotent_auto_emission' }
);

module.exports = mongoose.model('CarbonTransaction', CarbonTransactionSchema);

