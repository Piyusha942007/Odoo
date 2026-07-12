const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  auditor: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  findings: [{
    type: String
  }]
}, { timestamps: true });

const complianceIssueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  audit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Audit'
  },
  policy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Policy'
  },
  owner: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Open', 'Under Review', 'Resolved', 'Overdue'],
    default: 'Open'
  },
  resolvedAt: {
    type: Date
  }
}, { timestamps: true });

const Audit = mongoose.models.Audit || mongoose.model('Audit', auditSchema);
const ComplianceIssue = mongoose.models.ComplianceIssue || mongoose.model('ComplianceIssue', complianceIssueSchema);

module.exports = {
  Audit,
  ComplianceIssue
};
