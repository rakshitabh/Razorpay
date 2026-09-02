import AgentManager from './agents/AgentManager.js';
import connectDB from './config/db.js';
import mongoose from 'mongoose';

// Attempt to connect to DB (falls back to mock if no connection is active)
await connectDB();

const sampleLogs = `
2026-08-22 21:13:01 Failed password for invalid user root from 203.0.113.15 port 49152 ssh2
2026-08-22 21:13:03 Failed password for invalid user root from 203.0.113.15 port 49154 ssh2
2026-08-22 21:13:06 Failed password for root from 203.0.113.15 port 49158 ssh2
2026-08-22 21:13:09 Failed password for admin from 203.0.113.15 port 49162 ssh2
2026-08-22 21:13:12 Failed password for invalid user operator from 203.0.113.15 port 49166 ssh2
2026-08-22 21:13:15 Failed password for admin from 203.0.113.15 port 49170 ssh2
2026-08-22 21:13:18 Failed password for root from 203.0.113.15 port 49174 ssh2
2026-08-22 21:13:20 SRC=198.51.100.42 DST=10.0.0.15 PROTO=TCP SPT=55310 DPT=80 ACTION=BLOCK
2026-08-22 21:13:22 SRC=198.51.100.42 DST=10.0.0.15 PROTO=TCP SPT=55312 DPT=22 ACTION=BLOCK
2026-08-22 21:13:24 SRC=198.51.100.42 DST=10.0.0.15 PROTO=TCP SPT=55314 DPT=443 ACTION=BLOCK
2026-08-22 21:13:26 SRC=198.51.100.42 DST=10.0.0.15 PROTO=TCP SPT=55316 DPT=3389 ACTION=BLOCK
2026-08-22 21:13:28 SRC=198.51.100.42 DST=10.0.0.15 PROTO=TCP SPT=55318 DPT=3306 ACTION=BLOCK
2026-08-22 21:13:30 198.51.100.99 - - [22/Aug/2026:21:13:30 +0530] "GET /admin/config.php HTTP/1.1" 403 345
2026-08-22 21:13:32 198.51.100.99 - - [22/Aug/2026:21:13:32 +0530] "GET /setup.env HTTP/1.1" 401 241
2026-08-22 21:13:34 198.51.100.99 - - [22/Aug/2026:21:13:34 +0530] "GET /wp-admin/index.php HTTP/1.1" 401 241
`.trim();

console.log('\n--- STARTING PIPELINE TEST SIMULATION ---');
console.log('Ingesting raw attack logs...');

const results = await AgentManager.processLogs(sampleLogs);

console.log('\n--- SIMULATION RESULTS ---');
console.log(`Logs Parsed: ${results.logsParsed}`);
console.log(`Threats Flagged: ${results.threatsDetected}`);

results.threats.forEach((threat, idx) => {
  console.log(`\nThreat #${idx + 1}: [${threat.threatType}]`);
  console.log(`- Source IP: ${threat.sourceIp}`);
  console.log(`- Severity: ${threat.severity}`);
  console.log(`- Risk Score: ${threat.riskScore} / 100`);
  console.log(`- Confidence Rating: ${threat.confidenceScore}%`);
  console.log(`- Target Asset: ${threat.targetSystem}`);
  console.log(`- Detection Method: ${threat.detectionMethod}`);
  console.log(`- Affected User Profiles: ${threat.affectedAccounts.join(', ') || 'None'}`);
  console.log(`- AI Root Cause Analysis: ${threat.rootCause}`);
  console.log(`- Recommended Mitigation Playbooks:\n  ${threat.recommendedActions.map((a, i) => `${i+1}. ${a}`).join('\n  ')}`);
});

console.log('\nClosing connections...');
mongoose.connection.close();
console.log('--- TEST COMPLETED ---');
process.exit(0);
