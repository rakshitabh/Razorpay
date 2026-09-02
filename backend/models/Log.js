import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  rawLog: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  ip: {
    type: String,
    default: '0.0.0.0',
  },
  event: {
    type: String,
    required: true,
    default: 'Unknown Event',
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Low',
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
}, {
  timestamps: true,
});

// Index common query fields for fast dashboard querying
logSchema.index({ timestamp: -1 });
logSchema.index({ ip: 1 });
logSchema.index({ event: 1 });

const Log = mongoose.model('Log', logSchema);
export default Log;
