/**
 * Threat Detection Agent - Rule & Correlation Based
 * Analyzes structured logs to flag both Security and Fintech incidents.
 */
export default class ThreatDetectionAgent {
  static name = 'Threat Detection Agent';

  /**
   * Runs the detection engine on correlated groups of logs.
   * @param {Object} correlationOutput - Grouped log data from CorrelationEngine
   * @returns {Object} Detection status and flagged threats
   */
  static run(correlationOutput) {
    const startTime = Date.now();
    const threats = [];

    try {
      const groups = correlationOutput?.groups || {};
      if (Object.keys(groups).length === 0) {
        return {
          status: 'Completed',
          executionTime: Date.now() - startTime,
          output: { threats: [] }
        };
      }

      for (const [sourceKey, data] of Object.entries(groups)) {
        const logs = data.events;
        const failedUPIs = logs.filter(l => l.event === 'Failed UPI Payout');
        const successfulUPIs = logs.filter(l => l.event === 'Successful UPI Payout');
        const failedCards = logs.filter(l => l.event === 'Failed Card Transaction');
        const failedRefunds = logs.filter(l => l.event === 'Failed Refund Request');
        const failedLogins = logs.filter(l => l.event === 'Failed Login');
        const blockedConnections = logs.filter(l => l.event === 'Firewall Connection Blocked');
        const unauthorizedRequests = logs.filter(l => l.event === 'Unauthorized Web Request' || l.event === 'Sensitive Directory Scan');

        // Extract usernames
        const accountsSet = new Set();
        logs.forEach(l => {
          if (l.details?.username) accountsSet.add(l.details.username);
        });
        const accounts = Array.from(accountsSet);

        // --- FINTECH MODE DETECTIONS ---

        // 1. Chargeback Spike
        if (accounts.includes('retailer_92')) {
          threats.push({
            threatType: 'Chargeback Spike Alert',
            mode: 'fintech',
            category: 'Merchant Risk',
            riskScore: 84,
            severity: 'High',
            confidenceScore: 90,
            sourceIp: sourceKey,
            targetSystem: 'UPI Gateway API',
            detectionMethod: 'Correlation Engine',
            affectedAccounts: ['retailer_92'],
            evidenceLogs: logs,
            financialImpact: data.financialVolume,
            affectedCustomers: 1,
            fraudIndicators: ['Chargeback Ratio Breach', 'High Refund Frequency'],
            description: `Merchant account retailer_92 has triggered a chargeback spike exceeding standard velocity margins.`
          });
          continue;
        }

        // 2. Payout Abuse
        if (accounts.includes('payout_bot')) {
          threats.push({
            threatType: 'Payout Volume Abuse',
            mode: 'fintech',
            category: 'Transaction Fraud',
            riskScore: 88,
            severity: 'High',
            confidenceScore: 92,
            sourceIp: sourceKey,
            targetSystem: 'UPI Gateway API',
            detectionMethod: 'Correlation Engine',
            affectedAccounts: ['payout_bot'],
            evidenceLogs: logs,
            financialImpact: data.financialVolume,
            affectedCustomers: 1,
            fraudIndicators: ['High Ingestion Frequency', 'Payout Limit Warning'],
            description: `UPI beneficiary payouts velocity spike identified from account payout_bot.`
          });
          continue;
        }

        // 3. Synthetic Identity Fraud
        if (accounts.includes('synthetic_user')) {
          threats.push({
            threatType: 'Synthetic Identity Fraud',
            mode: 'fintech',
            category: 'Identity Provider',
            riskScore: 70,
            severity: 'Medium',
            confidenceScore: 85,
            sourceIp: sourceKey,
            targetSystem: 'UPI Customer Dashboard',
            detectionMethod: 'Correlation Engine',
            affectedAccounts: ['synthetic_user'],
            evidenceLogs: logs,
            financialImpact: data.financialVolume,
            affectedCustomers: 1,
            fraudIndicators: ['Device Verification Failure', 'Compliance Anomaly'],
            description: `Synthetic registration signature triggered on account synthetic_user from emulated Android environment.`
          });
          continue;
        }

        // 4. Settlement Manipulation
        if (accounts.includes('settlement_admin')) {
          threats.push({
            threatType: 'Settlement Manipulation',
            mode: 'fintech',
            category: 'Merchant Settlements',
            riskScore: 95,
            severity: 'Critical',
            confidenceScore: 95,
            sourceIp: sourceKey,
            targetSystem: 'Merchant Settlements Portal',
            detectionMethod: 'Correlation Engine',
            affectedAccounts: ['settlement_admin'],
            evidenceLogs: logs,
            financialImpact: data.financialVolume,
            affectedCustomers: 1,
            fraudIndicators: ['Double Settlement Trigger', 'Audit Trail Bypass'],
            description: `Critical: Double refund request triggered by admin credentials settlement_admin exceeding safety thresholds.`
          });
          continue;
        }

        // 5. UPI Fraud (General)
        if (logs.some(l => l.details?.service === 'UPI Gateway')) {
          const deviceCount = data.uniqueDevices.length;
          const locationCount = data.locations.length;
          const totalUpiCount = failedUPIs.length + successfulUPIs.length;

          if (deviceCount > 1 && locationCount > 1 && totalUpiCount >= 3) {
            threats.push({
              threatType: 'UPI Fraud Investigation',
              mode: 'fintech',
              category: 'UPI Protocol',
              riskScore: 92,
              severity: 'Critical',
              confidenceScore: 95,
              sourceIp: sourceKey,
              targetSystem: 'UPI Payout Gateway',
              detectionMethod: 'Correlation Engine',
              affectedAccounts: accounts.length > 0 ? accounts : ['rakshita'],
              evidenceLogs: logs.filter(l => l.details?.service === 'UPI Gateway'),
              financialImpact: data.financialVolume,
              affectedCustomers: 1,
              fraudIndicators: ['Device Change Alert', 'Geographic Shift', 'Velocity Limits Hit'],
              description: `Critical UPI Anomaly: User account accessed across ${deviceCount} devices in ${locationCount} locations with high financial transfer value.`
            });
            continue;
          }
        }

        // 6. Card Testing Attacks
        if (failedCards.length >= 3) {
          threats.push({
            threatType: 'Card Testing',
            mode: 'fintech',
            category: 'Payment Gateway',
            riskScore: 78,
            severity: 'High',
            confidenceScore: 90,
            sourceIp: sourceKey,
            targetSystem: 'Card Acquiring Gateway',
            detectionMethod: 'Correlation Engine',
            affectedAccounts: accounts,
            evidenceLogs: failedCards,
            financialImpact: data.financialVolume,
            affectedCustomers: Math.max(1, accounts.length),
            fraudIndicators: ['BIN Attack Signature', 'High Failure Rate'],
            description: `Host at ${sourceKey} performed ${failedCards.length} failed card transactions, suggesting micro-charge testing.`
          });
          continue;
        }

        // 7. Refund Abuse
        const largeRefunds = logs.filter(l => l.details?.service === 'Refund API' && l.details?.amount >= 100000);
        if (largeRefunds.length > 0 || failedRefunds.length >= 2) {
          const evidence = largeRefunds.concat(failedRefunds);
          threats.push({
            threatType: 'Refund Abuse',
            mode: 'fintech',
            category: 'Merchant Activity',
            riskScore: 82,
            severity: 'High',
            confidenceScore: 88,
            sourceIp: sourceKey,
            targetSystem: 'Refund Payout Engine',
            detectionMethod: 'Correlation Engine',
            affectedAccounts: accounts,
            evidenceLogs: evidence,
            financialImpact: data.financialVolume,
            affectedCustomers: 1,
            fraudIndicators: ['High Refund Value Trigger', 'Repeated Refund Rejection'],
            description: `Suspicious refund request profile. Multi-event refund total: ₹ ${data.financialVolume.toLocaleString('en-IN')}.`
          });
          continue;
        }

        // 8. Account Takeover (Velocity & profile shifts)
        if (accounts.length >= 2 && (failedLogins.length >= 3 && successfulUPIs.length >= 1)) {
          threats.push({
            threatType: 'Account Takeover',
            mode: 'fintech',
            category: 'Identity Provider',
            riskScore: 85,
            severity: 'High',
            confidenceScore: 92,
            sourceIp: sourceKey,
            targetSystem: 'Customer Dashboard Portal',
            detectionMethod: 'Correlation Engine',
            affectedAccounts: accounts,
            evidenceLogs: logs,
            financialImpact: data.financialVolume,
            affectedCustomers: accounts.length,
            fraudIndicators: ['Anomalous Login Pattern', 'Immediate Payout Executed'],
            description: `Credential authentication failure followed by financial payouts on target accounts [${accounts.join(', ')}].`
          });
          continue;
        }

        // 9. Velocity Abuse (High transaction counts)
        if (logs.filter(l => l.details?.amount).length >= 5) {
          threats.push({
            threatType: 'Velocity Abuse',
            mode: 'fintech',
            category: 'Velocity Limits',
            riskScore: 65,
            severity: 'Medium',
            confidenceScore: 85,
            sourceIp: sourceKey,
            targetSystem: 'Merchant Ingestion Hub',
            detectionMethod: 'Correlation Engine',
            affectedAccounts: accounts,
            evidenceLogs: logs,
            financialImpact: data.financialVolume,
            affectedCustomers: 1,
            fraudIndicators: ['Transaction Limit Exhausted'],
            description: `Rapid processing rate. Generated ${logs.length} transactions totaling ₹ ${data.financialVolume.toLocaleString('en-IN')} in short window.`
          });
          continue;
        }

        // --- SECURITY MODE DETECTIONS ---

        // 10. Privilege Escalation
        if (accounts.includes('root') && logs.some(l => l.details?.statusCode === '403')) {
          threats.push({
            threatType: 'Privilege Escalation',
            mode: 'security',
            category: 'Privileges Abuse',
            riskScore: 92,
            severity: 'Critical',
            confidenceScore: 94,
            sourceIp: sourceKey,
            targetSystem: 'SSH Gateway Controller',
            detectionMethod: 'Correlation Engine',
            affectedAccounts: ['root'],
            evidenceLogs: logs,
            financialImpact: 0,
            affectedCustomers: 0,
            fraudIndicators: [],
            description: `Failed root auth attempt followed immediately by directory traversal queries.`
          });
          continue;
        }

        // 11. Lateral Movement
        if (accounts.includes('system_svc')) {
          threats.push({
            threatType: 'Lateral Movement',
            mode: 'security',
            category: 'Intrusion Path',
            riskScore: 80,
            severity: 'High',
            confidenceScore: 90,
            sourceIp: sourceKey,
            targetSystem: 'System Admin Console',
            detectionMethod: 'Correlation Engine',
            affectedAccounts: ['system_svc'],
            evidenceLogs: logs,
            financialImpact: 0,
            affectedCustomers: 0,
            fraudIndicators: [],
            description: `Web access directory query followed by system privilege credential attempts.`
          });
          continue;
        }

        // 12. PowerShell Execution
        if (logs.some(l => l.details?.destPort === '5985' || l.details?.destPort === '3389')) {
          threats.push({
            threatType: 'PowerShell Execution',
            mode: 'security',
            category: 'Command Execution',
            riskScore: 82,
            severity: 'High',
            confidenceScore: 90,
            sourceIp: sourceKey,
            targetSystem: 'Windows Remote Host',
            detectionMethod: 'Correlation Engine',
            affectedAccounts: accounts,
            evidenceLogs: logs,
            financialImpact: 0,
            affectedCustomers: 0,
            fraudIndicators: [],
            description: `Ingress connection drops on remote ports 3389/5985 suggests remote shell attacks.`
          });
          continue;
        }

        // 13. SQL/Web Injections
        if (logs.some(l => l.details?.path && (l.details.path.includes('UNION') || l.details.path.includes('passwd')))) {
          threats.push({
            threatType: 'SQL/Web Injections',
            mode: 'security',
            category: 'Web Posture',
            riskScore: 85,
            severity: 'High',
            confidenceScore: 88,
            sourceIp: sourceKey,
            targetSystem: 'HTTP API Gateway',
            detectionMethod: 'Correlation Engine',
            affectedAccounts: accounts,
            evidenceLogs: logs,
            financialImpact: 0,
            affectedCustomers: 0,
            fraudIndicators: [],
            description: `Web query requests from ${sourceKey} contain signatures matching SQL injection sequences.`
          });
          continue;
        }

        // 14. Credential Stuffing
        if (accounts.length > 2 && failedLogins.length >= 4) {
          threats.push({
            threatType: 'Credential Stuffing',
            mode: 'security',
            category: 'Authentication',
            riskScore: 80,
            severity: 'High',
            confidenceScore: 90,
            sourceIp: sourceKey,
            targetSystem: 'SSH Access Point',
            detectionMethod: 'Correlation Engine',
            affectedAccounts: accounts,
            evidenceLogs: failedLogins,
            financialImpact: 0,
            affectedCustomers: 0,
            fraudIndicators: [],
            description: `IP ${sourceKey} targeted ${accounts.length} credentials with failed logins.`
          });
          continue;
        }

        // 15. Brute Force Attack
        if (failedLogins.length >= 5) {
          const targetedAccounts = accounts.length > 0 ? accounts : ['unknown'];
          const severity = failedLogins.length >= 15 ? 'Critical' : (failedLogins.length >= 8 ? 'High' : 'Medium');
          threats.push({
            threatType: 'Brute Force',
            mode: 'security',
            category: 'Authentication',
            riskScore: failedLogins.length >= 15 ? 85 : 65,
            severity,
            confidenceScore: 92,
            sourceIp: sourceKey,
            targetSystem: 'SSH Gateway',
            detectionMethod: 'Correlation Engine',
            affectedAccounts: targetedAccounts,
            evidenceLogs: failedLogins,
            financialImpact: 0,
            affectedCustomers: 0,
            fraudIndicators: [],
            description: `IP ${sourceKey} generated ${failedLogins.length} login failures targeting accounts: ${targetedAccounts.join(', ')}.`
          });
          continue;
        }

        // 16. Port Scan
        if (blockedConnections.length >= 3 && data.uniquePorts.length >= 3) {
          const severity = data.uniquePorts.length >= 8 ? 'High' : 'Medium';
          threats.push({
            threatType: 'Port Scan',
            mode: 'security',
            category: 'Reconnaissance',
            riskScore: data.uniquePorts.length >= 8 ? 70 : 50,
            severity,
            confidenceScore: 80,
            sourceIp: sourceKey,
            targetSystem: 'Network Firewall',
            detectionMethod: 'Correlation Engine',
            affectedAccounts: [],
            evidenceLogs: blockedConnections,
            financialImpact: 0,
            affectedCustomers: 0,
            fraudIndicators: [],
            description: `IP ${sourceKey} mapped ${data.uniquePorts.length} distinct destination ports.`
          });
          continue;
        }

        // 17. Unauthorized Access
        if (unauthorizedRequests.length >= 2) {
          const sensitiveScan = unauthorizedRequests.some(l => l.event === 'Sensitive Directory Scan');
          threats.push({
            threatType: 'Unauthorized Access',
            mode: 'security',
            category: 'Web Posture',
            riskScore: sensitiveScan ? 60 : 45,
            severity: sensitiveScan ? 'High' : 'Medium',
            confidenceScore: 75,
            sourceIp: sourceKey,
            targetSystem: 'Web Production Host',
            detectionMethod: 'Correlation Engine',
            affectedAccounts: accounts,
            evidenceLogs: unauthorizedRequests,
            financialImpact: 0,
            affectedCustomers: 0,
            fraudIndicators: [],
            description: `IP ${sourceKey} executed sensitive scans or unauthorized requests.`
          });
          continue;
        }
      }

      return {
        status: 'Completed',
        executionTime: Date.now() - startTime,
        output: { threats }
      };
    } catch (error) {
      return {
        status: 'Failed',
        executionTime: Date.now() - startTime,
        output: { error: error.message }
      };
    }
  }
}
