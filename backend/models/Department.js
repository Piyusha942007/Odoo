const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true }, // unique department code (e.g. ENG)
  socialScore: { type: Number, default: 0 },
  environmentalScore: { type: Number, default: 0 },
  governanceScore: { type: Number, default: 0 },
  totalESGScore: { type: Number, default: 0 },
  diversityMetrics: {
    genderRatio: { type: String, default: "50:50" }, // e.g. "45:55"
    ageBands: {
      under30: { type: Number, default: 30 },
      thirtyToFifty: { type: Number, default: 50 },
      over50: { type: Number, default: 20 }
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
