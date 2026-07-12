const mongoose = require('mongoose');
//challenges
const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: { type: String },
  xp: { type: Number, required: true, default: 100 },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  evidenceRequired: { type: Boolean, default: false },
  deadline: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Under Review', 'Completed', 'Archived'],
    default: 'Draft'
  }
}, { timestamps: true });

module.exports = mongoose.model('Challenge', challengeSchema);
