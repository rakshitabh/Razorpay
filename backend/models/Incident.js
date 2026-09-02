import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  incidentId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Open', 'Investigating', 'Mitigated', 'Closed'],
    default: 'Open',
  },
  mode: {
    type: String,
    enum: ['security', 'fintech'],
    default: 'security',
  },
  category: {
    type: String,
    required: true,
    default: 'Authentication',
  },
  financialImpact: {
    type: Number,
    default: 0,
  },
  affectedCustomers: {
    type: Number,
    default: 0,
  },
  fraudIndicators: {
    type: [String],
    default: [],
  },
  affectedAccounts: {
    type: [String],
    default: [],
  },
  assignedTo: {
    type: String,
    default: 'Unassigned',
  },
  riskScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 80,
  },
  sourceIp: {
    type: String,
    required: true,
  },
  targetSystem: {
    type: String,
    required: true,
  },
  detectionMethod: {
    type: String,
    enum: ['Rule Engine', 'AI Analysis', 'Hybrid Engine', 'Correlation Engine'],
    default: 'Rule Engine',
  },
  rootCause: {
    type: String,
    default: 'Under Investigation',
  },
  investigationDetails: {
    type: String,
    default: '',
  },
  recommendedActions: {
    type: [String],
    default: [],
  },
  evidenceLogs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Log',
  }],
  timeline: [{
    timestamp: {
      type: Date,
      default: Date.now,
    },
    event: {
      type: String,
      required: true,
    }
  }]
}, {
  timestamps: true,
});

// Indexes for sorting/filtering
incidentSchema.index({ severity: 1 });
incidentSchema.index({ status: 1 });
incidentSchema.index({ createdAt: -1 });

const Incident = mongoose.model('Incident', incidentSchema);
export default Incident;
