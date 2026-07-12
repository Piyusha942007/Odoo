const mongoose = require('mongoose');

const employeeParticipationSchema = new mongoose.Schema({
  employee: { type: String, required: true },
  activity: { type: mongoose.Schema.Types.ObjectId, ref: 'CsrActivity', required: true },
  proof: { type: String }, // link or text description of proof
  approvalStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  pointsEarned: { type: Number, default: 0 },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  completionDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('EmployeeParticipation', employeeParticipationSchema);
