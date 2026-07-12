const mongoose = require('mongoose');

const policyAcknowledgementSchema = new mongoose.Schema({
  policy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Policy',
    required: true
  },
  employee: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Acknowledged'],
    default: 'Pending'
  },
  acknowledgedAt: {
    type: Date
  }
}, { timestamps: true });

const policySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Environmental', 'Social', 'Governance'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Archived'],
    default: 'Draft'
  },
  version: {
    type: String,
    default: '1.0'
  },
  effectiveDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Check if models exist already before creating to avoid duplication in development/reloading
const PolicyAcknowledgement = mongoose.models.PolicyAcknowledgement || mongoose.model('PolicyAcknowledgement', policyAcknowledgementSchema);
const Policy = mongoose.models.Policy || mongoose.model('Policy', policySchema);

module.exports = {
  Policy,
  PolicyAcknowledgement
};
