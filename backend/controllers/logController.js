import multer from 'multer';
import mongoose from 'mongoose';
import Log from '../models/Log.js';
import AgentExecution from '../models/AgentExecution.js';
import AgentManager from '../agents/AgentManager.js';
import memoryStore from '../config/memoryStore.js';

// Multer memory storage configuration for file uploads
const storage = multer.memoryStorage();
export const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 } // Limit: 2MB
});

/**
 * Upload Logs (as file or raw text)
 * POST /api/logs/upload
 */
export const uploadLogs = async (req, res) => {
  try {
    let rawText = '';

    if (req.file) {
      rawText = req.file.buffer.toString('utf-8');
    } else if (req.body.rawLogs) {
      rawText = req.body.rawLogs;
    } else {
      return res.status(400).json({ message: 'No logs provided. Upload a file or send rawLogs text.' });
    }

    if (!rawText.trim()) {
      return res.status(400).json({ message: 'Log content is empty.' });
    }

    const userId = req.user ? req.user._id : null;
    
    // Process logs through the Multi-Agent pipeline
    const pipelineResults = await AgentManager.processLogs(rawText, userId);

    return res.status(200).json({
      message: 'Logs processed through multi-agent pipeline.',
      results: pipelineResults
    });
  } catch (error) {
    console.error(`Log Ingestion Error: ${error.message}`);
    return res.status(500).json({ message: 'Failed to process logs through agent pipeline.' });
  }
};

/**
 * Get Ingested Logs (Filtered and Paginated)
 * GET /api/logs
 */
export const getLogs = async (req, res) => {
  const { ip, event, severity, search, page = 1, limit = 50 } = req.query;

  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum - 1) * limitNum;

    if (isDbConnected) {
      // Build MongoDB query
      const query = {};
      if (ip) query.ip = ip;
      if (event) query.event = event;
      if (severity) query.severity = severity;
      if (search) {
        query.$or = [
          { rawLog: { $regex: search, $options: 'i' } },
          { event: { $regex: search, $options: 'i' } }
        ];
      }

      const total = await Log.countDocuments(query);
      const logs = await Log.find(query)
        .sort({ timestamp: -1 })
        .skip(skipNum)
        .limit(limitNum);

      return res.json({
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        logs
      });
    } else {
      // Memory Store logic
      let filteredLogs = [...memoryStore.logs];

      if (ip) filteredLogs = filteredLogs.filter(l => l.ip === ip);
      if (event) filteredLogs = filteredLogs.filter(l => l.event === event);
      if (severity) filteredLogs = filteredLogs.filter(l => l.severity === severity);
      if (search) {
        const searchLower = search.toLowerCase();
        filteredLogs = filteredLogs.filter(
          l => l.rawLog.toLowerCase().includes(searchLower) || l.event.toLowerCase().includes(searchLower)
        );
      }

      // Sort by timestamp desc
      filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      const total = filteredLogs.length;
      const paginatedLogs = filteredLogs.slice(skipNum, skipNum + limitNum);

      return res.json({
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        logs: paginatedLogs
      });
    }
  } catch (error) {
    console.error(`Get Logs Error: ${error.message}`);
    return res.status(500).json({ message: 'Failed to fetch logs.' });
  }
};

/**
 * Get Agent Execution Logs (For live status console feed)
 * GET /api/logs/executions
 */
export const getExecutions = async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const executions = await AgentExecution.find()
        .sort({ timestamp: 1 }); // Ascending order to show pipeline flow sequence
      return res.json(executions);
    } else {
      return res.json(memoryStore.agentExecutions);
    }
  } catch (error) {
    console.error(`Get Executions Error: ${error.message}`);
    return res.status(500).json({ message: 'Failed to fetch agent execution logs.' });
  }
};
