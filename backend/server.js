import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import mongoose from 'mongoose';
import memoryStore from './config/memoryStore.js';
import { GoogleGenAI } from '@google/genai';
import AgentManager from './agents/AgentManager.js';

// Import controllers & middlewares
import { 
  registerUser, 
  loginUser, 
  verifyOTP, 
  resendOTP, 
  forgotPassword, 
  resetPassword, 
  getAllUsers, 
  protect,
  logoutUser,
  deleteAccount
} from './controllers/authController.js';

import { 
  uploadLogs, 
  getLogs, 
  getExecutions, 
  upload 
} from './controllers/logController.js';

import { 
  getIncidents, 
  getIncidentById, 
  updateIncidentStatus, 
  mitigateIncident,
  getIncidentNotes,
  addIncidentNote
} from './controllers/incidentController.js';

import { 
  getReports, 
  getReportById, 
  getReportByThreatId 
} from './controllers/reportController.js';

import { getAuditLogs } from './controllers/auditController.js';

import { 
  authorizeAdmin, 
  authorizeAnalyst, 
  authorizeViewer 
} from './middleware/rbac.js';

dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false // Avoid blocking inline UI designs
}));
app.use(cors({ origin: '*' }));
app.use(express.json());

// API Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  message: { message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', apiLimiter);

// ---------------------------------------------
// Authentication & Registration Routes
// ---------------------------------------------
app.post('/api/auth/register', registerUser);
app.post('/api/auth/login', loginUser);
app.post('/api/auth/verify-otp', verifyOTP);
app.post('/api/auth/resend-otp', resendOTP);
app.post('/api/auth/forgot-password', forgotPassword);
app.post('/api/auth/reset-password', resetPassword);
app.post('/api/auth/logout', protect, logoutUser);
app.delete('/api/auth/delete-account', protect, deleteAccount);

// User Management (Admin Only)
app.get('/api/auth/users', protect, authorizeAdmin, getAllUsers);

// ---------------------------------------------
// Log Ingestion & Query Routes (Protected)
// ---------------------------------------------
app.post('/api/logs/upload', protect, authorizeAnalyst, upload.single('file'), uploadLogs);
app.get('/api/logs', protect, authorizeViewer, getLogs);
app.get('/api/logs/executions', protect, authorizeViewer, getExecutions);

// ---------------------------------------------
// Incident Management Routes (Protected)
// ---------------------------------------------
app.get('/api/threats', protect, authorizeViewer, getIncidents);
app.get('/api/threats/:id', protect, authorizeViewer, getIncidentById);
app.put('/api/threats/:id/status', protect, authorizeAnalyst, updateIncidentStatus);
app.post('/api/threats/:id/mitigate', protect, authorizeAnalyst, mitigateIncident);

// Note Comments Routes
app.get('/api/incidents/:incidentId/notes', protect, authorizeViewer, getIncidentNotes);
app.post('/api/incidents/:incidentId/notes', protect, authorizeAnalyst, addIncidentNote);

// Security Audit Logs
app.get('/api/audit-logs', protect, authorizeAnalyst, getAuditLogs);

// Reset System Database Route (Admin Only)
app.post('/api/threats/clear-all', protect, authorizeAdmin, async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      await mongoose.connection.db.collection('logs').deleteMany({});
      await mongoose.connection.db.collection('incidents').deleteMany({});
      await mongoose.connection.db.collection('reports').deleteMany({});
      await mongoose.connection.db.collection('notes').deleteMany({});
      await mongoose.connection.db.collection('auditlogs').deleteMany({});
      await mongoose.connection.db.collection('agentexecutions').deleteMany({});
    }
    
    memoryStore.clear();
    res.json({ success: true, message: 'All telemetry logs, incidents, agent executions, comments, and reports have been cleared.' });
  } catch (err) {
    res.status(500).json({ success: false, message: `System clear failed: ${err.message}` });
  }
});

// ---------------------------------------------
// System Stats Route (Protected)
// ---------------------------------------------
app.get('/api/stats', protect, authorizeViewer, async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    let ingestedEvents, suspiciousPatterns, incidentsGenerated, agentExecutions;
    
    if (isDbConnected) {
      ingestedEvents = await mongoose.connection.db.collection('logs').countDocuments();
      suspiciousPatterns = await mongoose.connection.db.collection('incidents').countDocuments();
      incidentsGenerated = suspiciousPatterns; // 1-to-1 mapping for now
      agentExecutions = await mongoose.connection.db.collection('agentexecutions').countDocuments();
    } else {
      ingestedEvents = memoryStore.logs.length;
      suspiciousPatterns = memoryStore.threats.length;
      incidentsGenerated = suspiciousPatterns;
      agentExecutions = memoryStore.agentExecutions.length;
    }
    
    return res.json({
      ingestedEvents,
      suspiciousPatterns,
      incidentsGenerated,
      agentExecutions,
      aiModel: process.env.GEMINI_MODEL ? process.env.GEMINI_MODEL.trim() : 'gemini-3.6-flash',
      avgLatency: '1.2s'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: `Stats fetch failed: ${err.message}` });
  }
});

// ---------------------------------------------
// Incident Report Routes (Protected)
// ---------------------------------------------
app.get('/api/reports', protect, authorizeViewer, getReports);
app.get('/api/reports/:id', protect, authorizeViewer, getReportById);
app.get('/api/reports/threat/:threatId', protect, authorizeViewer, getReportByThreatId);

// ---------------------------------------------
// Rich Demo Scenario Seeder Route (Protected)
// ---------------------------------------------
app.post('/api/simulator/generate-scenario', protect, authorizeAnalyst, async (req, res) => {
  const { scenario } = req.body;
  
  if (!scenario) {
    return res.status(400).json({ message: 'Scenario name is required.' });
  }

  const timestampStr = new Date().toISOString();
  let generatedLogs = [];

  switch (scenario) {
    // SECURITY SCENARIOS
    case 'brute_force':
      for (let i = 0; i < 12; i++) {
        generatedLogs.push(`${timestampStr} AUTH_SRV Failed password attempt for user admin from IP 198.51.100.12 port 22`);
      }
      break;

    case 'credential_stuffing':
      const users = ['root', 'admin', 'operator', 'webmaster', 'support', 'guest'];
      users.forEach((u, idx) => {
        generatedLogs.push(`${timestampStr} AUTH_SRV Failed password attempt for user ${u} from IP 198.51.100.15 port 22`);
      });
      break;

    case 'port_scan':
      const ports = [21, 22, 23, 25, 53, 80, 443, 3389, 8080];
      ports.forEach(port => {
        generatedLogs.push(`${timestampStr} SRC=198.51.100.18 DST=10.0.0.1 PROTO=TCP SPT=49120 DPT=${port} ACTION=BLOCK`);
      });
      break;

    case 'unauthorized_access':
      const paths = ['/.env', '/wp-admin/index.php', '/admin/config.php', '/config/db.js'];
      paths.forEach(path => {
        generatedLogs.push(`198.51.100.22 - - [27/Aug/2026:10:00:00 +0000] "GET ${path} HTTP/1.1" 401 220`);
      });
      break;

    case 'privilege_escalation':
      generatedLogs.push(`${timestampStr} AUTH_SRV Failed password attempt for user root from IP 198.51.100.120 port 22`);
      generatedLogs.push(`198.51.100.120 - - [27/Aug/2026:10:00:00 +0000] "GET /etc/passwd HTTP/1.1" 403 220`);
      generatedLogs.push(`198.51.100.120 - - [27/Aug/2026:10:02:00 +0000] "GET /.git/config HTTP/1.1" 403 220`);
      break;

    case 'lateral_movement':
      generatedLogs.push(`198.51.100.130 - - [27/Aug/2026:10:00:00 +0000] "GET /admin/shell.php HTTP/1.1" 401 220`);
      generatedLogs.push(`198.51.100.130 - - [27/Aug/2026:10:01:00 +0000] "GET /admin/config.php HTTP/1.1" 401 220`);
      generatedLogs.push(`${timestampStr} AUTH_SRV Failed password attempt for user system_svc from IP 198.51.100.130 port 22`);
      break;

    case 'suspicious_powershell':
      generatedLogs.push(`${timestampStr} SRC=198.51.100.140 DST=10.0.0.5 PROTO=TCP SPT=49120 DPT=3389 ACTION=BLOCK`);
      generatedLogs.push(`${timestampStr} SRC=198.51.100.140 DST=10.0.0.5 PROTO=TCP SPT=49120 DPT=5985 ACTION=BLOCK`);
      break;

    case 'web_exploitation':
      generatedLogs.push(`198.51.100.150 - - [27/Aug/2026:10:00:00 +0000] "GET /index.php?id=1%20UNION%20SELECT HTTP/1.1" 403 220`);
      generatedLogs.push(`198.51.100.150 - - [27/Aug/2026:10:00:10 +0000] "GET /etc/passwd HTTP/1.1" 403 220`);
      break;

    // FINTECH SCENARIOS
    case 'upi_fraud':
      generatedLogs.push(`${timestampStr} UPI_GATEWAY Request user=rakshita device=iPhone15 location=Delhi amount=125000 status=SUCCESS IP=198.51.100.80`);
      generatedLogs.push(`${timestampStr} UPI_GATEWAY Request user=rakshita device=Pixel8 location=Bangalore amount=250000 status=FAIL IP=198.51.100.80`);
      generatedLogs.push(`${timestampStr} UPI_GATEWAY Request user=rakshita device=OnePlus location=Mumbai amount=100000 status=SUCCESS IP=198.51.100.80`);
      break;

    case 'card_testing':
      for (let i = 0; i < 4; i++) {
        generatedLogs.push(`${timestampStr} CARD_GATEWAY transaction FAIL user=rahul card=411111XXXXXX908${i} amount=100 IP=198.51.100.32`);
      }
      break;

    case 'refund_abuse':
      generatedLogs.push(`${timestampStr} REFUND_API Request user=merchant_99 order=ORD9912 amount=150000 status=SUCCESS IP=198.51.100.35`);
      generatedLogs.push(`${timestampStr} REFUND_API Request user=merchant_99 order=ORD9912 amount=150000 status=FAIL IP=198.51.100.35`);
      break;

    case 'account_takeover':
      generatedLogs.push(`${timestampStr} AUTH_SRV Failed password attempt for user deepak from IP 198.51.100.44 port 22`);
      generatedLogs.push(`${timestampStr} AUTH_SRV Failed password attempt for user deepak from IP 198.51.100.44 port 22`);
      generatedLogs.push(`${timestampStr} CARD_GATEWAY transaction SUCCESS user=deepak card=411111XXXXXX1234 amount=50000 IP=198.51.100.44`);
      break;

    case 'velocity_abuse':
      for (let i = 0; i < 6; i++) {
        generatedLogs.push(`${timestampStr} CARD_GATEWAY transaction SUCCESS user=neha card=411111XXXXXX9930 amount=85000 IP=198.51.100.40`);
      }
      break;

    case 'merchant_abuse':
      generatedLogs.push(`${timestampStr} REFUND_API Request user=merchant_55 order=ORD8876 amount=250000 status=FAIL IP=198.51.100.50`);
      generatedLogs.push(`${timestampStr} REFUND_API Request user=merchant_55 order=ORD8877 amount=240000 status=FAIL IP=198.51.100.50`);
      break;

    case 'chargeback_spike':
      generatedLogs.push(`${timestampStr} UPI_GATEWAY Request user=retailer_92 device=web location=Mumbai amount=150000 status=FAIL IP=198.51.100.99`);
      generatedLogs.push(`${timestampStr} UPI_GATEWAY Request user=retailer_92 device=web location=Mumbai amount=200000 status=FAIL IP=198.51.100.99`);
      generatedLogs.push(`${timestampStr} UPI_GATEWAY Request user=retailer_92 device=web location=Mumbai amount=250000 status=FAIL IP=198.51.100.99`);
      break;

    case 'payout_abuse':
      generatedLogs.push(`${timestampStr} UPI_GATEWAY Request user=payout_bot device=desktop location=Delhi amount=1200000 status=FAIL IP=198.51.100.101`);
      generatedLogs.push(`${timestampStr} UPI_GATEWAY Request user=payout_bot device=desktop location=Delhi amount=1200000 status=FAIL IP=198.51.100.101`);
      break;

    case 'synthetic_identity':
      generatedLogs.push(`${timestampStr} UPI_GATEWAY Request user=synthetic_user device=emu_android location=Kolkata amount=10000 status=FAIL IP=198.51.100.105`);
      generatedLogs.push(`${timestampStr} UPI_GATEWAY Request user=synthetic_user device=emu_android location=Kolkata amount=10000 status=FAIL IP=198.51.100.105`);
      break;

    case 'settlement_manipulation':
      generatedLogs.push(`${timestampStr} REFUND_API Request user=settlement_admin order=MANIP_99 amount=4500000 status=FAIL IP=198.51.100.110`);
      generatedLogs.push(`${timestampStr} REFUND_API Request user=settlement_admin order=MANIP_99 amount=4500000 status=FAIL IP=198.51.100.110`);
      break;

    default:
      return res.status(400).json({ message: `Unknown scenario: ${scenario}` });
  }

  try {
    const rawLogsText = generatedLogs.join('\n');
    const pipelineResults = await AgentManager.processLogs(rawLogsText, req.user ? req.user._id : null);
    
    let incidentId = null;
    if (pipelineResults && pipelineResults.threats && pipelineResults.threats.length > 0) {
      incidentId = pipelineResults.threats[0].incidentId || pipelineResults.threats[0]._id;
    }
    
    return res.json({
      success: true,
      message: `Demo scenario "${scenario}" executed. Logs and incidents populated.`,
      incidentId: incidentId,
      results: pipelineResults
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: `Failed to execute demo scenario: ${err.message}` });
  }
});

// ---------------------------------------------
// Data Ingestion API Endpoints (Protected)
// ---------------------------------------------
app.post('/api/ingest/security', protect, authorizeAnalyst, async (req, res) => {
  try {
    let rawLogs = '';
    if (typeof req.body.logs === 'string') {
      rawLogs = req.body.logs;
    } else if (Array.isArray(req.body.logs)) {
      rawLogs = req.body.logs.join('\n');
    } else if (req.body.rawLog) {
      rawLogs = req.body.rawLog;
    } else if (req.body.logs && typeof req.body.logs === 'object') {
      rawLogs = JSON.stringify(req.body.logs);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid payload. Provide logs string, logs array, or rawLog.' });
    }

    const results = await AgentManager.processLogs(rawLogs, req.user ? req.user._id : null);
    return res.json({ success: true, message: 'Security logs ingested and parsed.', results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: `Ingestion failed: ${err.message}` });
  }
});

app.post('/api/ingest/fintech', protect, authorizeAnalyst, async (req, res) => {
  try {
    let rawLogs = '';
    if (typeof req.body.logs === 'string') {
      rawLogs = req.body.logs;
    } else if (Array.isArray(req.body.logs)) {
      rawLogs = req.body.logs.join('\n');
    } else if (req.body.rawLog) {
      rawLogs = req.body.rawLog;
    } else if (req.body.logs && typeof req.body.logs === 'object') {
      rawLogs = JSON.stringify(req.body.logs);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid payload. Provide logs string, logs array, or rawLog.' });
    }

    const results = await AgentManager.processLogs(rawLogs, req.user ? req.user._id : null);
    return res.json({ success: true, message: 'Fintech transaction logs ingested and parsed.', results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: `Ingestion failed: ${err.message}` });
  }
});

// ---------------------------------------------
// Live Event Generator (Source B)
// ---------------------------------------------
let liveSimulationActive = false;
let liveSimulationInterval = null;

const generateSimulatedEventStream = () => {
  const types = ['brute_force', 'port_scan', 'unauthorized_access', 'credential_stuffing'];
  const selected = types[Math.floor(Math.random() * types.length)];
  const ip = `198.51.100.${Math.floor(Math.random() * 254) + 1}`;
  
  let logs = [];
  if (selected === 'brute_force') {
    const user = 'admin';
    for (let i = 0; i < 11; i++) {
      const time = new Date(Date.now() - i * 5000).toISOString();
      logs.push(`${time} AUTH_SRV Failed password attempt for user ${user} from IP ${ip} on port 22`);
    }
  } else if (selected === 'credential_stuffing') {
    const users = ['root', 'admin', 'operator', 'test', 'guest', 'user1'];
    users.forEach((user, idx) => {
      const time = new Date(Date.now() - idx * 2000).toISOString();
      logs.push(`${time} AUTH_SRV Failed Login for user ${user} from IP ${ip} on port 22`);
    });
  } else if (selected === 'port_scan') {
    const ports = [21, 22, 23, 25, 80, 110, 143, 443, 3389, 8080];
    ports.forEach((port, idx) => {
      const time = new Date(Date.now() - idx * 1000).toISOString();
      logs.push(`${time} FIREWALL Connection from IP ${ip} to Port ${port} - STATUS: BLOCKED`);
    });
  } else {
    const endpoints = ['/setup.env', '/admin/config.php', '/wp-admin/index.php', '/.git/config'];
    endpoints.forEach((ep, idx) => {
      const time = new Date(Date.now() - idx * 1000).toISOString();
      logs.push(`${time} WEB_SRV Connection from IP ${ip} - GET ${ep} - STATUS: 401 Unauthorized`);
    });
  }
  return logs.join('\n');
};

app.get('/api/simulator/status', protect, authorizeViewer, (req, res) => {
  res.json({ active: liveSimulationActive });
});

app.post('/api/simulator/toggle', protect, authorizeAnalyst, (req, res) => {
  liveSimulationActive = !liveSimulationActive;
  
  if (liveSimulationActive) {
    if (liveSimulationInterval) clearInterval(liveSimulationInterval);
    
    liveSimulationInterval = setInterval(async () => {
      try {
        const simulatedLogs = generateSimulatedEventStream();
        await AgentManager.processLogs(simulatedLogs, null);
      } catch (err) {
        console.error(`[Simulator Engine] Live Ingestion failure: ${err.message}`);
      }
    }, 10000);
    
    console.log('[Simulator Engine] Background Live Event Generator active.');
  } else {
    if (liveSimulationInterval) {
      clearInterval(liveSimulationInterval);
      liveSimulationInterval = null;
    }
    console.log('[Simulator Engine] Background Live Event Generator suspended.');
  }
  
  res.json({ success: true, active: liveSimulationActive });
});

app.get('/api/health', async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  // To avoid burning the Gemini Free Tier quota (15 RPM), we just verify the key exists.
  let cachedAiStatus = process.env.GEMINI_API_KEY ? 'online' : 'offline';

  const pad = (s) => (s < 10 ? '0' : '') + s;
  const uptimeSeconds = process.uptime();
  const hours = Math.floor(uptimeSeconds / (60 * 60));
  const minutes = Math.floor((uptimeSeconds % (60 * 60)) / 60);
  const formattedUptime = `${pad(hours)}h ${pad(minutes)}m`;

  res.json({
    status: 'healthy',
    database: isDbConnected ? 'connected' : 'disconnected',
    ai: cachedAiStatus,
    uptime: formattedUptime,
    version: '1.0.0',
    environment: 'production'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Risk Platform Backend] Service operational on port ${PORT}`);
});
