import mongoose from 'mongoose';
import Log from '../models/Log.js';
import Incident from '../models/Incident.js';
import AgentExecution from '../models/AgentExecution.js';
import Report from '../models/Report.js';
import AuditLog from '../models/AuditLog.js';
import memoryStore from '../config/memoryStore.js';

import ParserAgent from './ParserAgent.js';
import CorrelationEngine from './CorrelationEngine.js';
import ThreatDetectionAgent from './ThreatDetectionAgent.js';
import InvestigationAgent from './InvestigationAgent.js';
import ResponseAgent from './ResponseAgent.js';
import ReportAgent from './ReportAgent.js';

export default class AgentManager {
  /**
   * Helper to write execution records to DB or memory fallback.
   */
  static async logExecution(agentName, status, executionTime, output) {
    const data = {
      agentName,
      status,
      executionTime,
      output,
      timestamp: new Date()
    };

    if (mongoose.connection.readyState === 1) {
      try {
        return await AgentExecution.create(data);
      } catch (err) {
        console.error(`Error saving agent execution log: ${err.message}`);
      }
    }
    
    // Fallback to memory
    const mockRecord = { ...data, _id: new mongoose.Types.ObjectId().toString() };
    memoryStore.agentExecutions.push(mockRecord);
    return mockRecord;
  }

  /**
   * Helper to save parsed logs.
   */
  static async saveParsedLog(logData) {
    if (mongoose.connection.readyState === 1) {
      try {
        return await Log.create(logData);
      } catch (err) {
        console.error(`Error saving log: ${err.message}`);
      }
    }
    
    const mockLog = { 
      ...logData, 
      _id: new mongoose.Types.ObjectId().toString(), 
      createdAt: new Date() 
    };
    memoryStore.logs.push(mockLog);
    return mockLog;
  }

  /**
   * Helper to save an Incident.
   */
  static async saveIncident(incidentData) {
    if (mongoose.connection.readyState === 1) {
      try {
        const count = await Incident.countDocuments();
        incidentData.incidentId = `INC-${1001 + count}`;
        return await Incident.create(incidentData);
      } catch (err) {
        console.error(`Error saving incident: ${err.message}`);
      }
    }
    
    const count = memoryStore.threats.length;
    const mockIncident = { 
      ...incidentData, 
      incidentId: `INC-${1001 + count}`,
      _id: new mongoose.Types.ObjectId().toString(), 
      createdAt: new Date(),
      status: 'Open'
    };
    memoryStore.threats.push(mockIncident);
    return mockIncident;
  }

  /**
   * Helper to update an Incident.
   */
  static async updateIncident(id, updates) {
    if (mongoose.connection.readyState === 1) {
      try {
        return await Incident.findByIdAndUpdate(id, updates, { new: true });
      } catch (err) {
        console.error(`Error updating incident: ${err.message}`);
      }
    }
    
    const index = memoryStore.threats.findIndex(t => t._id.toString() === id.toString());
    if (index !== -1) {
      memoryStore.threats[index] = { ...memoryStore.threats[index], ...updates };
      return memoryStore.threats[index];
    }
    return null;
  }

  /**
   * Helper to save a Report.
   */
  static async saveReport(reportData) {
    if (mongoose.connection.readyState === 1) {
      try {
        return await Report.create(reportData);
      } catch (err) {
        console.error(`Error saving report: ${err.message}`);
      }
    }
    
    const mockReport = { 
      ...reportData, 
      _id: new mongoose.Types.ObjectId().toString(), 
      createdAt: new Date() 
    };
    memoryStore.reports.push(mockReport);
    return mockReport;
  }

  /**
   * Main Pipeline Execution
   * Ingests raw logs and executes Parser -> Correlation -> Detector -> Investigator -> Responder -> Reporter
   */
  static async processLogs(rawLogs, userId = null) {
    console.log('[Agent Pipeline] Initializing Multi-Agent Risk Analysis Pipeline...');
    
    if (mongoose.connection.readyState !== 1) {
      memoryStore.agentExecutions = [];
    }

    const overallStart = Date.now();
    const pipelineResults = {
      logsParsed: 0,
      threatsDetected: 0,
      threats: [],
      executionLogs: []
    };

    // ============================================
    // STEP 1: Log Parser Agent (Regex Clean)
    // ============================================
    const parserResult = await ParserAgent.run(rawLogs);
    await this.logExecution(
      ParserAgent.name, 
      parserResult.status, 
      parserResult.executionTime, 
      { message: `Parsed ${parserResult.output?.count || 0} raw log entries.` }
    );

    if (parserResult.status === 'Failed' || !parserResult.output?.logs) {
      console.error('[Agent Pipeline] Parser Agent failed. Terminating pipeline.');
      return pipelineResults;
    }

    // Save parsed logs into database
    const savedLogs = [];
    for (const parsedLog of parserResult.output.logs) {
      if (userId) parsedLog.uploadedBy = userId;
      const saved = await this.saveParsedLog(parsedLog);
      savedLogs.push(saved);
    }
    pipelineResults.logsParsed = savedLogs.length;

    // ============================================
    // STEP 2: Correlation Engine (Grouping & Anomaly Map)
    // ============================================
    const correlationResult = CorrelationEngine.run(savedLogs);
    await this.logExecution(
      CorrelationEngine.name,
      correlationResult.status,
      correlationResult.executionTime,
      { message: `Correlated events into ${Object.keys(correlationResult.output?.groups || {}).length} host clusters.` }
    );

    if (correlationResult.status === 'Failed' || !correlationResult.output?.groups) {
      console.error('[Agent Pipeline] Correlation Engine failed. Terminating pipeline.');
      return pipelineResults;
    }

    // ============================================
    // STEP 3: Detection Agent (Anomaly Rules Matches)
    // ============================================
    const detectionResult = ThreatDetectionAgent.run(correlationResult.output);
    await this.logExecution(
      ThreatDetectionAgent.name,
      detectionResult.status,
      detectionResult.executionTime,
      { message: `Correlation check matched ${detectionResult.output?.threats?.length || 0} threat signatures.` }
    );

    if (detectionResult.status === 'Failed' || !detectionResult.output?.threats) {
      console.error('[Agent Pipeline] Threat Detection Agent failed. Terminating pipeline.');
      return pipelineResults;
    }

    const detectedThreats = detectionResult.output.threats;
    pipelineResults.threatsDetected = detectedThreats.length;

    if (detectedThreats.length === 0) {
      console.log('[Agent Pipeline] No risk anomalies identified. Pipeline ended.');
      return pipelineResults;
    }

    // ============================================
    // RUN AI PIPELINE ON DETECTED THREATS
    // ============================================
    for (const threatData of detectedThreats) {
      const rawMatches = threatData.evidenceLogs.map(el => el.rawLog);
      const savedEvidenceLogIds = savedLogs
        .filter(sl => rawMatches.includes(sl.rawLog))
        .map(sl => sl._id);

      // Create initial timeline
      const timeline = [
        { timestamp: new Date(Date.now() - 5000), event: 'Telemetry logs ingested' },
        { timestamp: new Date(Date.now() - 4000), event: `Correlation check matched: ${threatData.threatType}` },
        { timestamp: new Date(Date.now() - 3000), event: 'Risk incident ticket created' }
      ];

      // Save initial Incident document
      const initialIncident = await this.saveIncident({
        title: threatData.threatType,
        mode: threatData.mode || 'security',
        category: threatData.category || 'Authentication',
        severity: threatData.severity,
        status: 'Open',
        assignedTo: 'Unassigned',
        riskScore: threatData.riskScore,
        confidenceScore: threatData.confidenceScore,
        sourceIp: threatData.sourceIp,
        targetSystem: threatData.targetSystem,
        detectionMethod: threatData.detectionMethod,
        evidenceLogs: savedEvidenceLogIds,
        financialImpact: threatData.financialImpact || 0,
        affectedCustomers: threatData.affectedCustomers || 0,
        fraudIndicators: threatData.fraudIndicators || [],
        timeline
      });

      const evidenceLogsForPrompt = savedLogs.filter(sl => savedEvidenceLogIds.includes(sl._id));

      // Append AI started to timeline
      if (mongoose.connection.readyState === 1) {
        await Incident.findByIdAndUpdate(initialIncident._id, {
          $push: { timeline: { timestamp: new Date(), event: 'AI Investigation started' } }
        });
      } else {
        const idx = memoryStore.threats.findIndex(t => t._id.toString() === initialIncident._id.toString());
        if (idx !== -1) memoryStore.threats[idx].timeline.push({ timestamp: new Date(), event: 'AI Investigation started' });
      }

      // ============================================
      // STEP 4: Investigation Agent (Gemini)
      // ============================================
      const aiInputThreat = {
        threatType: threatData.threatType,
        mode: threatData.mode || 'security',
        category: threatData.category || 'Authentication',
        sourceIp: threatData.sourceIp,
        targetSystem: threatData.targetSystem,
        riskScore: threatData.riskScore,
        severity: threatData.severity,
        confidenceScore: threatData.confidenceScore,
        financialImpact: threatData.financialImpact || 0,
        affectedCustomers: threatData.affectedCustomers || 0,
        fraudIndicators: threatData.fraudIndicators || [],
        description: threatData.description
      };
      
      const investigationResult = await InvestigationAgent.run(aiInputThreat, evidenceLogsForPrompt);
      await this.logExecution(
        InvestigationAgent.name,
        investigationResult.status,
        investigationResult.executionTime,
        { 
          threatId: initialIncident._id,
          rootCause: investigationResult.output?.rootCause,
          riskScore: investigationResult.output?.riskScore 
        }
      );

      let updatedIncident = initialIncident;
      if (investigationResult.status === 'Completed' && investigationResult.output) {
        const out = investigationResult.output;
        updatedIncident = await this.updateIncident(initialIncident._id, {
          rootCause: out.rootCause,
          investigationDetails: out.investigationDetails,
          severity: out.severity,
          confidenceScore: out.confidenceScore,
          riskScore: out.riskScore,
          threatClassification: out.threatClassification,
          mitreMapping: out.mitreMapping,
          $push: { timeline: { timestamp: new Date(), event: `AI Investigation completed. Risk Rating: ${out.riskScore}` } }
        });
      } else {
        updatedIncident = await this.updateIncident(initialIncident._id, {
          $push: { timeline: { timestamp: new Date(), event: 'AI Investigation finished with rule fallback' } }
        });
      }

      // ============================================
      // STEP 5: Response Agent (Gemini)
      // ============================================
      const responseResult = await ResponseAgent.run(updatedIncident);
      await this.logExecution(
        ResponseAgent.name,
        responseResult.status,
        responseResult.executionTime,
        { 
          threatId: updatedIncident._id,
          remediationsCount: responseResult.output?.recommendedActions?.length || 0 
        }
      );

      if (responseResult.status === 'Completed' && responseResult.output?.recommendedActions) {
        updatedIncident = await this.updateIncident(updatedIncident._id, {
          recommendedActions: responseResult.output.recommendedActions,
          $push: { timeline: { timestamp: new Date(), event: 'Remediation containment playbooks generated' } }
        });
      }

      // ============================================
      // STEP 6: Report Agent (Gemini)
      // ============================================
      const reportResult = await ReportAgent.run(updatedIncident, evidenceLogsForPrompt);
      await this.logExecution(
        ReportAgent.name,
        reportResult.status,
        reportResult.executionTime,
        { 
          threatId: updatedIncident._id,
          reportSummary: reportResult.output?.summary 
        }
      );

      if (reportResult.status === 'Completed' && reportResult.output) {
        await this.saveReport({
          threatId: updatedIncident._id,
          summary: reportResult.output.summary,
          fullMarkdown: reportResult.output.fullMarkdown,
          generatedBy: userId
        });

        updatedIncident = await this.updateIncident(updatedIncident._id, {
          $push: { timeline: { timestamp: new Date(), event: 'Incident Report successfully compiled' } }
        });

        const auditAction = threatData.mode === 'fintech' ? 'FRAUD_DETECTED' : 'INCIDENT_CREATED';
        const clientIp = threatData.sourceIp || '127.0.0.1';

        if (mongoose.connection.readyState === 1) {
          await AuditLog.create({
            action: 'REPORT_GENERATED',
            user: 'System Engine',
            ipAddress: clientIp,
            result: 'success'
          });
          await AuditLog.create({
            action: auditAction,
            user: 'System Engine',
            ipAddress: clientIp,
            result: 'success'
          });
        } else {
          memoryStore.auditLogs.push({
            timestamp: new Date(),
            action: 'REPORT_GENERATED',
            user: 'System Engine',
            ipAddress: clientIp,
            result: 'success'
          });
          memoryStore.auditLogs.push({
            timestamp: new Date(),
            action: auditAction,
            user: 'System Engine',
            ipAddress: clientIp,
            result: 'success'
          });
        }
      }

      pipelineResults.threats.push(updatedIncident);
    }

    console.log(`[Agent Pipeline] Process completed successfully in ${Date.now() - overallStart}ms.`);
    return pipelineResults;
  }
}
