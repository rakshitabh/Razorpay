import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

export default class ResponseAgent {
  static name = 'Response Agent';

  /**
   * Generates custom containment and mitigation steps for the investigated threat.
   * @param {Object} threatData - Threat metadata after investigation
   * @returns {Object} List of recommended action playbooks
   */
  static async run(threatData) {
    const startTime = Date.now();
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

    const threatTypeStr = threatData.title || threatData.threatType || 'Unknown Incident';
    const accountsArr = threatData.affectedAccounts || [];

    console.log(`[Response Agent] Compiling response plan for ${threatTypeStr} (Risk: ${threatData.riskScore})...`);

    try {
      if (!apiKey) {
        console.warn('[Response Agent] No GEMINI_API_KEY found. Using Mock AI playbook.');
        const mockActions = this.generateMockActions(threatData);
        return {
          status: 'Completed',
          executionTime: Date.now() - startTime,
          output: { recommendedActions: mockActions }
        };
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a Tier-3 Incident Response Handler. Formulate a list of 4 specific containment and eradication steps for the following threat:
      
      Threat Type: ${threatTypeStr}
      Source IP: ${threatData.sourceIp}
      Target System: ${threatData.targetSystem}
      Severity: ${threatData.severity}
      Risk Score: ${threatData.riskScore}/100
      Affected Accounts: ${JSON.stringify(accountsArr)}
      Root Cause: ${threatData.rootCause}

      Return a JSON array of strings containing actionable, specific remediation steps. Do not include markdown wraps or anything outside the raw JSON.
      Format:
      [
        "Step 1...",
        "Step 2...",
        "Step 3...",
        "Step 4..."
      ]`;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text;
      const parsedActions = JSON.parse(responseText);

      return {
        status: 'Completed',
        executionTime: Date.now() - startTime,
        output: { recommendedActions: parsedActions }
      };
    } catch (error) {
      console.error(`[Response Agent] AI Error: ${error.message}`);
      const fallbackActions = this.generateMockActions(threatData);
      return {
        status: 'Completed',
        executionTime: Date.now() - startTime,
        output: { 
          recommendedActions: fallbackActions,
          note: `Recovered from AI error: ${error.message}`
        }
      };
    }
  }

  static generateMockActions(threatData) {
    const ip = threatData.sourceIp || 'unknown';
    const accounts = threatData.affectedAccounts && threatData.affectedAccounts.length > 0
      ? threatData.affectedAccounts.join(', ')
      : 'targeted portals';

    switch (threatData.title || threatData.threatType) {
      case 'Brute Force':
        return [
          `Block source IP address ${ip} at the edge firewall and reverse proxy level.`,
          `Initiate password reset requirements for the targeted accounts: ${accounts}.`,
          `Enable Multi-Factor Authentication (MFA) requirements for all administrative sessions on ${threatData.targetSystem}.`,
          `Analyze log files for any successful logins originating from IP ${ip} immediately preceding this block.`
        ];

      case 'Port Scan':
        return [
          `Blacklist scanning host IP ${ip} on corporate intrusion prevention systems (IPS) for 48 hours.`,
          `Audit active listening services on targeted nodes within ${threatData.targetSystem} to close unnecessary open ports.`,
          `Enable TCP/UDP connection threshold limits to block source IPs exhibiting automatic scan signatures in the future.`,
          `Verify network-level isolation between administrative ports (e.g. SSH, RDP) and public networks.`
        ];

      case 'Credential Stuffing':
        return [
          `Temporarily blacklist source IP ${ip} across all external application endpoints.`,
          `Suspend accounts exhibiting anomalous rate failures: ${accounts} until credentials can be rotated.`,
          `Inject CAPTCHA challenges onto authentication portals to prevent automated API auth submissions.`,
          `Notify users associated with the targeted profiles: [${accounts}] of the unauthorized credential attempt.`
        ];

      case 'Unauthorized Access':
        return [
          `Block host IP ${ip} from web server routers to prevent further endpoint probing.`,
          `Review access control list permissions and configuration settings on targeted system: ${threatData.targetSystem}.`,
          `Scan web application logs for path traversal attempts, SQL injections, or directory enumeration tools.`,
          `Verify application session state tokens and invalidate any open active sessions from untrusted networks.`
        ];

      default:
        return [
          `Perform quarantine checks on systems interacting with source IP ${ip}.`,
          `Enforce stricter access credential parameters on targeted servers.`,
          `Inspect gateway traffic flow charts to check for data exfiltration signs.`,
          `Log this incident in the security registry and monitor for related alerts.`
        ];
    }
  }
}
