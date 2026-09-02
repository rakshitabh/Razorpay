import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  threatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident',
    required: true,
  },
  reportDate: {
    type: Date,
    default: Date.now,
  },
  summary: {
    type: String,
    required: true,
  },
  fullMarkdown: {
    type: String,
    required: true,
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
}, {
  timestamps: true,
});

reportSchema.index({ createdAt: -1 });

const Report = mongoose.model('Report', reportSchema);
export default Report;
