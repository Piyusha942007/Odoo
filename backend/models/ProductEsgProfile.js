const mongoose = require('mongoose');

const ProductEsgProfileSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    unique: true,
    trim: true
  },
  defaultEmissionFactor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmissionFactor',
    required: [true, 'Default emission factor is required']
  },
  category: {
    type: String,
    enum: ['Purchase', 'Manufacturing', 'Expense', 'Fleet'],
    default: 'Purchase'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ProductEsgProfile', ProductEsgProfileSchema);
