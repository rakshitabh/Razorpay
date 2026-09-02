import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  action: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  ipAddress: {
    type: String,
    required: true,
  },
  result: {
    type: String,
    enum: ['success', 'failure'],
    default: 'success',
  }
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
