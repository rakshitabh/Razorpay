import mongoose from 'mongoose';

const agentExecutionSchema = new mongoose.Schema({
  agentName: {
    type: String,
    required: true,
    enum: ['Parser Agent', 'Correlation Engine', 'Threat Detection Agent', 'Investigation Agent', 'Response Agent', 'Report Agent'],
  },
  status: {
    type: String,
    required: true,
    enum: ['Running', 'Completed', 'Failed'],
  },
  executionTime: {
    type: Number, // duration in milliseconds
    required: true,
    default: 0,
  },
  output: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

agentExecutionSchema.index({ timestamp: -1 });

const AgentExecution = mongoose.model('AgentExecution', agentExecutionSchema);
export default AgentExecution;
