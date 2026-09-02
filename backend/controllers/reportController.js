import mongoose from 'mongoose';
import Report from '../models/Report.js';
import memoryStore from '../config/memoryStore.js';

/**
 * Get All Incident Reports
 * GET /api/reports
 */
export const getReports = async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const reports = await Report.find()
        .populate('threatId')
        .sort({ createdAt: -1 });
      return res.json(reports);
    } else {
      // Memory Store logic
      const reports = [...memoryStore.reports].map(rep => {
        const threat = memoryStore.threats.find(t => t._id.toString() === rep.threatId.toString());
        return { ...rep, threatId: threat };
      });
      reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(reports);
    }
  } catch (error) {
    console.error(`Get Reports Error: ${error.message}`);
    return res.status(500).json({ message: 'Failed to fetch incident reports.' });
  }
};

/**
 * Get Report by Threat ID
 * GET /api/reports/threat/:threatId
 */
export const getReportByThreatId = async (req, res) => {
  const { threatId } = req.params;

  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const report = await Report.findOne({ threatId }).populate('threatId');
      if (!report) {
        return res.status(404).json({ message: 'No incident report found for this threat.' });
      }
      return res.json(report);
    } else {
      // Memory Store logic
      const report = memoryStore.reports.find(r => r.threatId.toString() === threatId.toString());
      if (!report) {
        return res.status(404).json({ message: 'No incident report found for this threat.' });
      }

      const threat = memoryStore.threats.find(t => t._id.toString() === threatId.toString());
      return res.json({ ...report, threatId: threat });
    }
  } catch (error) {
    console.error(`Get Threat Report Error: ${error.message}`);
    return res.status(500).json({ message: 'Failed to fetch incident report.' });
  }
};

/**
 * Get Report by ID
 * GET /api/reports/:id
 */
export const getReportById = async (req, res) => {
  const { id } = req.params;

  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const report = await Report.findById(id).populate('threatId');
      if (!report) {
        return res.status(404).json({ message: 'Incident report not found.' });
      }
      return res.json(report);
    } else {
      // Memory Store logic
      const report = memoryStore.reports.find(r => r._id.toString() === id.toString());
      if (!report) {
        return res.status(404).json({ message: 'Incident report not found.' });
      }

      const threat = memoryStore.threats.find(t => t._id.toString() === report.threatId.toString());
      return res.json({ ...report, threatId: threat });
    }
  } catch (error) {
    console.error(`Get Report ID Error: ${error.message}`);
    return res.status(500).json({ message: 'Failed to fetch report details.' });
  }
};
