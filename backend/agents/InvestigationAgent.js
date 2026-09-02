import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

export default class InvestigationAgent {
  static name = 'Investigation Agent';

  /**
   * Performs root cause and threat investigation on a flagged incident.
   * @param {Object} threatData - Default threat metadata from ThreatDetectionAgent
   * @param {Array<Object>} logs - Associated raw and structured logs
   * @returns {Object} Deep investigation details, severity, confidence, and computed risk score
   */
  static async run(threatData, logs) {
    const startTime = Date.now();
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

    console.log(`[Investigation Agent] Initiating investigation for ${threatData.threatType} from IP ${threatData.sourceIp}...`);

    try {
      const calculatedRisk = this.calculateDeterministicRisk(threatData, logs);

      if (!apiKey) {
        console.warn('[Investigation Agent] No GEMINI_API_KEY found. Using Mock AI for analysis.');
        const mockResult = this.generateMockInvestigation(threatData, logs, calculatedRisk);
        return {
          status: 'Completed',
          executionTime: Date.now() - startTime,
          output: mockResult
        };
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = this.buildPrompt(threatData, logs, calculatedRisk);

      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const parsedResult = JSON.parse(response.text);
      parsedResult.riskScore = calculatedRisk;

      return {
        status: 'Completed',
        executionTime: Date.now() - startTime,
        output: parsedResult
      };
    } catch (error) {
      console.error(`[Investigation Agent] AI Error: ${error.message}`);
      const fallbackRisk = this.calculateDeterministicRisk(threatData, logs);
      const fallbackResult = this.generateMockInvestigation(threatData, logs, fallbackRisk);
      
      return {
        status: 'Completed',
        executionTime: Date.now() - startTime,
        output: {
          ...fallbackResult,
          note: `Recovered from AI error: ${error.message}`
        }
      };
    }
  }

  /**
   * Deterministically computes the transparent audit Risk Score
   */
  static calculateDeterministicRisk(threatData, logs) {
    const isFintech = threatData.mode === 'fintech';
    let total = 0;

    if (isFintech) {
      // Fintech Risk Math (total max 100)
      // 1. Financial Impact Weight (30 pts max)
      const impact = Number(threatData.financialImpact) || 0;
      let impactScore = 10;
      if (impact >= 100000) impactScore = 30;
      else if (impact >= 50000) impactScore = 20;

      // 2. Failure/Transaction counts (30 pts max)
      let countScore = 10;
      if (logs.length >= 5) countScore = 30;
      else if (logs.length >= 3) countScore = 20;

      // 3. Fraud Indicators Alert count (20 pts max)
      const indicators = threatData.fraudIndicators || [];
      const indicatorScore = Math.min(20, indicators.length * 10);

      // 4. Affected Customer profile shift (20 pts max)
      const customerScore = threatData.affectedCustomers > 0 ? 20 : 0;

      total = impactScore + countScore + indicatorScore + customerScore;
    } else {
      // Security Risk Math (total max 100)
      let frequencyScore = logs.length >= 10 ? 30 : (logs.length >= 5 ? 15 : 5);
      let accountsScore = (threatData.affectedAccounts || []).length > 1 ? 20 : 10;
      let historyScore = 20;
      let targetScore = 30;
      total = frequencyScore + accountsScore + historyScore + targetScore;
    }

    return Math.min(100, total);
  }

  static buildPrompt(threatData, logs, calculatedRisk) {
    return `You are a Tier-3 Security & Fintech Fraud Analyst Agent. Investigate this incident:
    
    Tactic/Type: ${threatData.threatType}
    Operational Mode: ${threatData.mode}
    Category: ${threatData.category}
    Source: ${threatData.sourceIp}
    Target System: ${threatData.targetSystem}
    Financial Impact Volume: INR ${threatData.financialImpact || 0}
    Calculated Deterministic Risk: ${calculatedRisk} / 100
    Raw logs ingested: ${logs.length}

    Return a structured JSON response containing:
    1. executiveSummary: Short summary of the risk activity. MUST be a readable, high-quality analyst narrative (e.g. "The platform detected 28 failed authentication attempts from a single IP within 4 minutes. Correlation analysis identified credential stuffing behavior affecting 12 accounts. Business Impact: High.")
    2. rootCause: Detailed technical or procedural cause.
    3. evidence: Explanation of logs indicating manipulation.
    4. indicatorsOfCompromise: Array of strings detailing malicious indicators.
    5. affectedAssets: Array of strings detailing systems/users hit.
    6. threatClassification: Group classification descriptor.
    7. mitreMapping: Tactic ID/Tactic Name matching the behavior (e.g. T1110 for SSH Brute Force).
    8. confidenceScore: Confidence score (0-100).
    9. recommendations: Array of analyst instructions.
    10. containmentPlan: Step-by-step instructions to block/stop this attack immediately.
    11. recoveryPlan: Step-by-step restore guidelines.

    Return ONLY raw JSON matching the schema below. No markdown wrappers.
    {
      "executiveSummary": "string",
      "rootCause": "string",
      "evidence": "string",
      "indicatorsOfCompromise": ["string"],
      "affectedAssets": ["string"],
      "threatClassification": "string",
      "mitreMapping": "string",
      "confidenceScore": 95,
      "recommendations": ["string"],
      "containmentPlan": ["string"],
      "recoveryPlan": ["string"]
    }`;
  }

  static generateMockInvestigation(threatData, logs, calculatedRisk) {
    let rootCause = '';
    let executiveSummary = '';
    let evidence = '';
    let indicators = [];
    let assets = [];
    let mitre = '';
    let recommendations = [];
    let containment = [];
    let recovery = [];
    
    const formattedAmount = `₹ ${(threatData.financialImpact || 0).toLocaleString('en-IN')}`;

    switch (threatData.threatType) {
      case 'UPI Fraud Investigation':
        executiveSummary = `Suspicious multi-device payout requests executed on UPI gateways from localized IP address clusters.`;
        rootCause = `Unauthorized payout attempts exploiting stolen active session credentials, accompanied by geographic anomalies.`;
        evidence = `Ingress volume indicates multiple payments requested in rapid succession. Rapid device shift occurred between Pixel8 and iPhone15.`;
        indicators = ['UPI Device Change Alert', 'Geo-shift velocity limit hit', 'Fast beneficiary additions'];
        assets = ['UPI Payout Portal', 'rakshita_wallet'];
        mitre = 'T1110.004 - UPI Fraud Verification';
        recommendations = ['Hold beneficiary payout immediately', 'Flag UPI ID for validation'];
        containment = ['Freeze target wallet payouts', 'Invalidate active customer device tokens'];
        recovery = ['Prompt customer to authenticate via secure voice OTP', 'Reset UPI credentials'];
        break;

      case 'Card Testing':
        executiveSummary = `High volume automated micro-charge authorization requests targeting multiple card BIN identifiers.`;
        rootCause = `Merchant checkout form exposed to automated script validation checks of leaked card databases.`;
        evidence = `Received ${logs.length} failed card authorization events with CVV mismatch codes in short sequence.`;
        indicators = ['BIN Testing Signature', 'CVV Decline Spikes'];
        assets = ['Checkout API endpoint', 'Payment gateway tunnel'];
        mitre = 'T1110 - Brute Force Credit Verification';
        recommendations = ['Enable Google reCAPTCHA v3 on checkouts', 'Enforce transactional rate limits per session'];
        containment = ['Quarantine host IP address in WAF rules', 'Block target card numbers'];
        recovery = ['Review refund logs for any unauthorized micro-transactions', 'Re-allow checkout for validated users'];
        break;

      case 'Refund Abuse':
        executiveSummary = `High value refund transactions requested against recently created payment profiles.`;
        rootCause = `Exploitation of double-refund window or merchant configuration bypass parameters.`;
        evidence = `Request total amount ${formattedAmount} exceeds authorized merchant refund caps.`;
        indicators = ['High refund value trigger', 'Payment-refund double dip attempt'];
        assets = ['Refund Dashboard Interface', 'Merchant Ledger Account'];
        mitre = 'T1190 - Exploit Public-Facing Application';
        recommendations = ['Hold refund releases for manual risk verification', 'Audit double-dip validation parameters'];
        containment = ['Suspend merchant dashboard payout permissions', 'Recall refund status in payment tunnel'];
        recovery = ['Update API transaction locks', 'Notify merchant services team'];
        break;

      case 'Brute Force':
      case 'Brute Force Attack':
        executiveSummary = `Automated SSH/auth guessing attempts seeking to gain privileged command line console access.`;
        rootCause = `SSHD port exposed to public queries with weak password policies.`;
        evidence = `IP address ${threatData.sourceIp} generated ${logs.length} login failures targeting root credentials.`;
        indicators = ['SSH brute force pattern', 'Admin credentials guessing'];
        assets = ['SSH server terminal', 'Security gateway'];
        mitre = 'T1110 - Brute Force Credential Guessing';
        recommendations = ['Disable SSH password authentication', 'Install Fail2ban service'];
        containment = ['Add IP ${threatData.sourceIp} to local iptables blocklist', 'Disconnect active root sessions'];
        recovery = ['Rotate system root passwords', 'Inspect bash history logs for indicators of compromise'];
        break;

      default:
        executiveSummary = `Anomalous logs correlated for ${threatData.threatType}. Risk ratings generated successfully.`;
        rootCause = `Correlation patterns identified logs matching rule boundaries.`;
        evidence = `${logs.length} events logged. Details contain: ${threatData.description}`;
        indicators = ['Anomalous volume spike'];
        assets = [threatData.targetSystem || 'Internal server'];
        mitre = 'T1046 - Network Reconnaissance';
        recommendations = ['Monitor log trends for persistent spikes'];
        containment = ['Verify firewall rules block active IP anomalies'];
        recovery = ['Verify system patches are fully updated'];
        break;
    }

    return {
      executiveSummary,
      rootCause,
      evidence,
      indicatorsOfCompromise: indicators,
      affectedAssets: assets,
      threatClassification: threatData.category || 'General Risk',
      mitreMapping: mitre,
      confidenceScore: threatData.confidenceScore || 90,
      riskScore: calculatedRisk,
      recommendations,
      containmentPlan: containment,
      recoveryPlan: recovery
    };
  }
}
