const mongoose = require('mongoose');

const csrActivitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  description: { type: String },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  points: { type: Number, default: 50 } // Points awarded for completion
}, { timestamps: true });

module.exports = mongoose.model('CsrActivity', csrActivitySchema);
