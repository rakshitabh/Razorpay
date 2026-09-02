import mongoose from 'mongoose';
import AuditLog from '../models/AuditLog.js';
import memoryStore from '../config/memoryStore.js';

/**
 * Get Security Audit Logs
 * GET /api/audit-logs
 */
export const getAuditLogs = async (req, res) => {
  const { action, search } = req.query;

  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const query = {};
      if (action) query.action = action;
      if (search) {
        query.$or = [
          { action: new RegExp(search, 'i') },
          { user: new RegExp(search, 'i') },
          { ipAddress: new RegExp(search, 'i') }
        ];
      }

      const logs = await AuditLog.find(query).sort({ timestamp: -1 });
      return res.json(logs);
    } else {
      // Memory Store logic
      if (!memoryStore.auditLogs) memoryStore.auditLogs = [];
      let list = [...memoryStore.auditLogs];

      if (action) list = list.filter(l => l.action === action);
      if (search) {
        const s = search.toLowerCase();
        list = list.filter(l => 
          l.action.toLowerCase().includes(s) ||
          l.user.toLowerCase().includes(s) ||
          l.ipAddress.toLowerCase().includes(s)
        );
      }

      list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return res.json(list);
    }
  } catch (error) {
    console.error(`Get Audit Logs Error: ${error.message}`);
    return res.status(500).json({ message: 'Failed to fetch security audit logs.' });
  }
};
