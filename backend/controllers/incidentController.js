import mongoose from 'mongoose';
import Incident from '../models/Incident.js';
import Log from '../models/Log.js';
import Note from '../models/Note.js';
import AuditLog from '../models/AuditLog.js';
import Report from '../models/Report.js';
import memoryStore from '../config/memoryStore.js';

/**
 * Get Incidents (Search, Filter, Paginate)
 * GET /api/threats
 */
export const getIncidents = async (req, res) => {
  const { status, severity, threatType, ipAddress, search, mode, assignedTo } = req.query;

  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const query = {};
      if (status) query.status = status;
      if (severity) query.severity = severity;
      if (mode) query.mode = mode;
      if (threatType) query.title = new RegExp(threatType, 'i');
      if (ipAddress) query.sourceIp = ipAddress;
      if (assignedTo) query.assignedTo = assignedTo;
      
      if (search) {
        query.$or = [
          { incidentId: new RegExp(search, 'i') },
          { title: new RegExp(search, 'i') },
          { sourceIp: new RegExp(search, 'i') },
          { targetSystem: new RegExp(search, 'i') },
          { category: new RegExp(search, 'i') },
          { affectedAccounts: new RegExp(search, 'i') }
        ];
      }

      const incidents = await Incident.find(query).sort({ createdAt: -1 });
      return res.json(incidents);
    } else {
      // Memory Store logic
      let list = [...memoryStore.threats];

      if (status) list = list.filter(t => t.status === status);
      if (severity) list = list.filter(t => t.severity === severity);
      if (mode) list = list.filter(t => t.mode === mode);
      if (threatType) list = list.filter(t => t.title.toLowerCase().includes(threatType.toLowerCase()));
      if (ipAddress) list = list.filter(t => t.sourceIp === ipAddress);
      if (assignedTo) list = list.filter(t => t.assignedTo === assignedTo);
      
      if (search) {
        const s = search.toLowerCase();
        list = list.filter(t => 
          (t.incidentId || '').toLowerCase().includes(s) ||
          t.title.toLowerCase().includes(s) ||
          t.sourceIp.toLowerCase().includes(s) ||
          t.targetSystem.toLowerCase().includes(s) ||
          (t.category || '').toLowerCase().includes(s) ||
          (t.affectedAccounts || []).some(acc => acc.toLowerCase().includes(s))
        );
      }

      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(list);
    }
  } catch (error) {
    console.error(`Get Incidents Error: ${error.message}`);
    return res.status(500).json({ message: 'Failed to fetch incidents.' });
  }
};

/**
 * Get Specific Incident Detail
 * GET /api/threats/:id
 */
export const getIncidentById = async (req, res) => {
  const { id } = req.params;

  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      // Allow searching by ObjectId OR incidentId string (e.g. INC-1001)
      let incident;
      if (mongoose.Types.ObjectId.isValid(id)) {
        incident = await Incident.findById(id).populate('evidenceLogs');
      } else {
        incident = await Incident.findOne({ incidentId: id }).populate('evidenceLogs');
      }

      if (!incident) {
        return res.status(404).json({ message: 'Incident not found.' });
      }

      // Fetch related Report if any
      const report = await Report.findOne({ threatId: incident._id });
      const incidentObj = incident.toObject();
      if (report) {
        incidentObj.markdownReport = report.fullMarkdown;
      }

      return res.json(incidentObj);
    } else {
      // Memory Store logic
      const incident = memoryStore.threats.find(t => t._id.toString() === id.toString() || t.incidentId === id);
      if (!incident) {
        return res.status(404).json({ message: 'Incident not found.' });
      }

      const evidence = memoryStore.logs.filter(l => 
        incident.evidenceLogs.map(elId => elId.toString()).includes(l._id.toString())
      );

      const report = memoryStore.reports.find(r => r.threatId.toString() === incident._id.toString());
      
      return res.json({ 
        ...incident, 
        evidenceLogs: evidence,
        markdownReport: report ? report.fullMarkdown : null 
      });
    }
  } catch (error) {
    console.error(`Get Incident ID Error: ${error.message}`);
    return res.status(500).json({ message: 'Failed to fetch incident details.' });
  }
};

/**
 * Update Incident Status
 * PUT /api/threats/:id/status
 */
export const updateIncidentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Please specify status.' });
  }

  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    const clientIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const auditorName = req.user ? req.user.name : 'Analyst';

    if (isDbConnected) {
      let incident;
      if (mongoose.Types.ObjectId.isValid(id)) {
        incident = await Incident.findById(id);
      } else {
        incident = await Incident.findOne({ incidentId: id });
      }

      if (!incident) {
        return res.status(404).json({ message: 'Incident not found.' });
      }

      incident.status = status;
      incident.timeline.push({
        timestamp: new Date(),
        event: `Incident status updated to ${status} by ${auditorName}`
      });
      await incident.save();

      // Log Security Audit Event
      await AuditLog.create({
        action: status === 'Closed' ? 'INCIDENT_CLOSED' : 'INCIDENT_UPDATED',
        user: auditorName,
        ipAddress: clientIp,
        result: 'success'
      });

      const populated = await Incident.findById(incident._id).populate('evidenceLogs');
      return res.json(populated);
    } else {
      // Memory Store logic
      const index = memoryStore.threats.findIndex(t => t._id.toString() === id.toString() || t.incidentId === id);
      if (index === -1) {
        return res.status(404).json({ message: 'Incident not found.' });
      }

      memoryStore.threats[index].status = status;
      if (!memoryStore.threats[index].timeline) memoryStore.threats[index].timeline = [];
      
      memoryStore.threats[index].timeline.push({
        timestamp: new Date(),
        event: `Incident status updated to ${status} by ${auditorName}`
      });

      const incident = memoryStore.threats[index];
      const evidence = memoryStore.logs.filter(l => 
        incident.evidenceLogs.map(elId => elId.toString()).includes(l._id.toString())
      );

      // Memory audit trace
      memoryStore.auditLogs.push({
        timestamp: new Date(),
        action: status === 'Closed' ? 'INCIDENT_CLOSED' : 'INCIDENT_UPDATED',
        user: auditorName,
        ipAddress: clientIp,
        result: 'success'
      });

      return res.json({ ...incident, evidenceLogs: evidence });
    }
  } catch (error) {
    console.error(`Update Status Error: ${error.message}`);
    return res.status(500).json({ message: 'Failed to update status.' });
  }
};

/**
 * Execute Mitigation Action
 * POST /api/threats/:id/mitigate
 */
export const mitigateIncident = async (req, res) => {
  const { id } = req.params;
  const { actionName } = req.body;

  if (!actionName) {
    return res.status(400).json({ message: 'Please specify actionName.' });
  }

  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    const clientIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const auditorName = req.user ? req.user.name : 'Analyst';
    let incident;

    if (isDbConnected) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        incident = await Incident.findById(id);
      } else {
        incident = await Incident.findOne({ incidentId: id });
      }
    } else {
      incident = memoryStore.threats.find(t => t._id.toString() === id.toString() || t.incidentId === id);
    }

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found.' });
    }

    // Simulate containment delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (isDbConnected) {
      incident.status = 'Mitigated';
      incident.timeline.push({
        timestamp: new Date(),
        event: `Mitigation playbook executed: "${actionName}"`
      });
      await incident.save();

      // Log Security Audit Event
      await AuditLog.create({
        action: 'INCIDENT_UPDATED',
        user: auditorName,
        ipAddress: clientIp,
        result: 'success'
      });

      const populated = await Incident.findById(incident._id).populate('evidenceLogs');
      return res.json({
        success: true,
        message: `Containment playbook "${actionName}" executed successfully. IP session blocked.`,
        updatedThreat: populated
      });
    } else {
      const idx = memoryStore.threats.findIndex(t => t._id.toString() === id.toString() || t.incidentId === id);
      memoryStore.threats[idx].status = 'Mitigated';
      if (!memoryStore.threats[idx].timeline) memoryStore.threats[idx].timeline = [];
      
      memoryStore.threats[idx].timeline.push({
        timestamp: new Date(),
        event: `Mitigation playbook executed: "${actionName}"`
      });

      const updated = memoryStore.threats[idx];
      const evidence = memoryStore.logs.filter(l => 
        updated.evidenceLogs.map(elId => elId.toString()).includes(l._id.toString())
      );

      // Memory audit trace
      memoryStore.auditLogs.push({
        timestamp: new Date(),
        action: 'INCIDENT_UPDATED',
        user: auditorName,
        ipAddress: clientIp,
        result: 'success'
      });

      return res.json({
        success: true,
        message: `Containment playbook "${actionName}" executed successfully. IP session blocked.`,
        updatedThreat: { ...updated, evidenceLogs: evidence }
      });
    }
  } catch (error) {
    console.error(`Mitigation Error: ${error.message}`);
    return res.status(500).json({ message: 'Failed to run playbook.' });
  }
};

/**
 * Get Incident Notes
 * GET /api/incidents/:incidentId/notes
 */
export const getIncidentNotes = async (req, res) => {
  const { incidentId } = req.params;

  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const notes = await Note.find({ incidentId }).sort({ timestamp: 1 });
      return res.json(notes);
    } else {
      const notes = (memoryStore.notes || []).filter(n => n.incidentId === incidentId);
      return res.json(notes);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve notes.' });
  }
};

/**
 * Add Incident Note
 * POST /api/incidents/:incidentId/notes
 */
export const addIncidentNote = async (req, res) => {
  const { incidentId } = req.params;
  const { comment } = req.body;
  const authorName = req.user ? req.user.name : 'Analyst';

  if (!comment) {
    return res.status(400).json({ message: 'Please provide comment text.' });
  }

  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const note = await Note.create({
        incidentId,
        author: authorName,
        comment,
        timestamp: new Date()
      });
      return res.status(201).json(note);
    } else {
      if (!memoryStore.notes) memoryStore.notes = [];
      const note = {
        _id: new mongoose.Types.ObjectId().toString(),
        incidentId,
        author: authorName,
        comment,
        timestamp: new Date()
      };
      memoryStore.notes.push(note);
      return res.status(201).json(note);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add note comment.' });
  }
};
