import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

export default class ReportAgent {
  static name = 'Report Agent';

  /**
   * Compiles the results of previous agents into a formatted Markdown report.
   * @param {Object} threatData - Investigated threat and response playbooks
   * @param {Array<Object>} logs - Incident evidence logs
   * @returns {Object} Markdown report content and metadata
   */
  static async run(threatData, logs) {
    const startTime = Date.now();
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

    const threatTypeStr = threatData.title || threatData.threatType || 'Unknown Incident';
    const accountsArr = threatData.affectedAccounts || [];

    console.log(`[Report Agent] Generating incident report for threat ID: ${threatData._id || 'new_threat'}...`);

    try {
      if (!apiKey) {
        console.warn('[Report Agent] No GEMINI_API_KEY found. Generating interpolated Markdown report.');
        const markdown = this.generateMockMarkdown(threatData, logs);
        return {
          status: 'Completed',
          executionTime: Date.now() - startTime,
          output: {
            summary: `Incident Report for ${threatTypeStr} from IP ${threatData.sourceIp}`,
            fullMarkdown: markdown
          }
        };
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a Lead Security Incident Manager. Write a professional, comprehensive Security Incident Report in Markdown format based on the following security telemetry:

      Threat Type: ${threatTypeStr}
      Source IP: ${threatData.sourceIp}
      Target System: ${threatData.targetSystem}
      Risk Score: ${threatData.riskScore}/100
      Severity: ${threatData.severity}
      Confidence: ${threatData.confidenceScore}%
      Detection Method: ${threatData.detectionMethod}
      Affected Accounts: ${JSON.stringify(accountsArr)}
      Root Cause: ${threatData.rootCause}
      Investigation Details: ${threatData.investigationDetails}
      Recommended Actions: ${JSON.stringify(threatData.recommendedActions)}
      Log Count: ${logs.length}
      
      Logs Timeline Example:
      ${JSON.stringify(logs.slice(0, 5).map(l => ({ timestamp: l.timestamp, event: l.event, raw: l.rawLog })))}

      The markdown report MUST be structured with these sections:
      # SECURITY INCIDENT REPORT: [Threat Type]
      
      ## 1. Executive Summary
      (Provide a high-level summary of the threat, risks, and impact for management)

      ## 2. Threat & Root Cause Analysis
      - **Incident Type:** ${threatData.threatType}
      - **Source Entity:** ${threatData.sourceIp}
      - **Target Assets:** ${threatData.targetSystem}
      - **Risk Level:** ${threatData.severity} (Score: ${threatData.riskScore}/100)
      - **Confidence Rating:** ${threatData.confidenceScore}%
      
      (Provide technical explanation of the root cause)

      ## 3. Scope & Blast Radius
      - **Target Systems:** ${threatData.targetSystem}
      - **Compromised/Targeted User Accounts:** ${threatData.affectedAccounts.join(', ') || 'None'}
      - **Log Count Flagged:** ${logs.length}

      (Describe the potential blast radius if the attack is successful)

      ## 4. Evidence & Ingestion Timeline
      (Create a Markdown table list of the timeline logs, listing Time, IP, Event Name, and Raw Log string)

      ## 5. Mitigation & Containment Playbook
      (Format a checklist with the recommended actions: ${JSON.stringify(threatData.recommendedActions)})

      Do not wrap the markdown output in any extra JSON shell, just return the raw markdown string.`;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt
      });

      const responseText = response.text;

      return {
        status: 'Completed',
        executionTime: Date.now() - startTime,
        output: {
          summary: `Incident Report for ${threatTypeStr} from IP ${threatData.sourceIp}`,
          fullMarkdown: responseText
        }
      };
    } catch (error) {
      console.error(`[Report Agent] AI Error: ${error.message}`);
      const fallbackMarkdown = this.generateMockMarkdown(threatData, logs);
      return {
        status: 'Completed',
        executionTime: Date.now() - startTime,
        output: {
          summary: `Incident Report for ${threatTypeStr} from IP ${threatData.sourceIp}`,
          fullMarkdown: fallbackMarkdown,
          note: `Recovered from AI error: ${error.message}`
        }
      };
    }
  }

  static generateMockMarkdown(threatData, logs) {
    const timeString = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const accountsStr = threatData.affectedAccounts && threatData.affectedAccounts.length > 0
      ? threatData.affectedAccounts.join(', ')
      : 'None detected';

    const actionsList = threatData.recommendedActions && threatData.recommendedActions.length > 0
      ? threatData.recommendedActions.map(act => `- [ ] **${act}**`).join('\n')
      : `- [ ] Block suspicious source IP address.\n- [ ] Inspect targeted system configurations.`;

    const logsRows = logs.slice(0, 8).map(l => {
      const ts = new Date(l.timestamp).toISOString().substring(11, 19);
      const rawCleaned = l.rawLog.replace(/\|/g, '\\|').trim();
      return `| ${ts} | ${l.ip} | ${l.event} | \`${rawCleaned}\` |`;
    }).join('\n');

    const threatTypeStr = threatData.title || threatData.threatType || 'Unknown Incident';

    return `# SECURITY INCIDENT REPORT: ${threatTypeStr.toUpperCase()}

## 1. Executive Summary
On **${timeString}**, the Security Operations Center (SOC) detected an active **${threatTypeStr}** originating from the source host at IP address **${threatData.sourceIp}**. The malicious patterns targeted key nodes within the **${threatData.targetSystem}** network layer. The event represents a **${threatData.severity}** severity risk with an overall risk priority rating of **${threatData.riskScore} / 100**. Containment protocols have been prepared. Immediate remediation actions are required to secure the environment.

---

## 2. Threat & Root Cause Analysis
- **Incident Type:** ${threatTypeStr}
- **Source Entity:** ${threatData.sourceIp}
- **Target Assets:** ${threatData.targetSystem}
- **Risk Level:** ${threatData.severity} (Score: ${threatData.riskScore}/100)
- **Confidence Rating:** ${threatData.confidenceScore}%
- **Detection Method:** ${threatData.detectionMethod}

### Root Cause Details:
${threatData.rootCause}

---

## 3. Scope & Blast Radius
- **Target Systems:** ${threatData.targetSystem}
- **Compromised/Targeted User Accounts:** ${accountsStr}
- **Log Count Flagged:** ${logs.length}

### Technical Assessment:
${threatData.investigationDetails}

---

## 4. Evidence & Ingestion Timeline
The following logs were isolated as primary evidence of this incident:

| Timestamp | Source IP | Event Details | Raw Log Data |
| :--- | :--- | :--- | :--- |
${logsRows}

---

## 5. Mitigation & Containment Playbook
The incident response team should immediately execute the following playbooks:

${actionsList}

---
*Report automatically generated by the Multi-Agent SOC AI Intelligence Layer.*`;
  }
}
