const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Environmental', 'Social', 'Governance', 'ESG Summary', 'Custom'],
    required: true
  },
  filters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdBy: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);

module.exports = {
  Report
};
