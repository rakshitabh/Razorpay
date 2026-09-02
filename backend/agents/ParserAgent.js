/**
 * Log Parser Agent - Rule Based
 * Deterministic parser using regular expressions to extract structured fields.
 */
export default class ParserAgent {
  static name = 'Parser Agent';

  /**
   * Parses a raw log string into a structured object.
   * @param {string} rawLog 
   * @returns {Object} Structured log details
   */
  static parse(rawLog) {
    const logStr = rawLog.trim();
    if (!logStr) return null;

    // 1. Check for UPI Gateway Transactions
    // Format: "2026-08-23T22:00:00.000Z UPI_GATEWAY Request user=rakshita device=Pixel8 location=Bangalore amount=50000 status=FAIL"
    const upiRegex = /UPI_GATEWAY\s+(?:Request|Alert)?\s*user=(\S+)\s+device=(\S+)\s+location=(\S+)\s+amount=(\d+)\s+status=(\S+)/i;
    let match = logStr.match(upiRegex);
    if (match) {
      const username = match[1];
      const device = match[2];
      const location = match[3];
      const amount = Number(match[4]);
      const status = match[5];
      const timestamp = this.extractTimestamp(logStr);
      
      return {
        rawLog,
        timestamp,
        ip: logStr.match(/IP=(\S+)/)?.[1] || '198.51.100.42',
        event: status.toUpperCase() === 'FAIL' ? 'Failed UPI Payout' : 'Successful UPI Payout',
        severity: amount >= 100000 ? 'High' : 'Medium',
        details: {
          username,
          device,
          location,
          amount,
          status,
          service: 'UPI Gateway',
          reason: status.toUpperCase() === 'FAIL' ? 'Gateway decline' : null
        }
      };
    }

    // 2. Check for Card Gateway Transaction
    // Format: "2026-08-23T22:00:00.000Z CARD_GATEWAY transaction FAIL user=john card=411111XXXXXX1111 amount=500"
    const cardRegex = /CARD_GATEWAY\s+transaction\s+(\S+)\s+user=(\S+)\s+card=(\S+)\s+amount=(\d+)/i;
    match = logStr.match(cardRegex);
    if (match) {
      const status = match[1];
      const username = match[2];
      const card = match[3];
      const amount = Number(match[4]);
      const timestamp = this.extractTimestamp(logStr);
      
      return {
        rawLog,
        timestamp,
        ip: logStr.match(/IP=(\S+)/)?.[1] || '198.51.100.45',
        event: status.toUpperCase() === 'FAIL' ? 'Failed Card Transaction' : 'Successful Card Transaction',
        severity: amount >= 50000 ? 'High' : 'Low',
        details: {
          username,
          card,
          amount,
          status,
          service: 'Card Gateway',
          reason: status.toUpperCase() === 'FAIL' ? 'Incorrect CVV / PIN' : null
        }
      };
    }

    // 3. Check for Refund Gateway request
    // Format: "2026-08-23T22:00:00.000Z REFUND_API Request user=peter order=ORD9923 amount=120000 status=FAIL"
    const refundRegex = /REFUND_API\s+Request\s+user=(\S+)\s+order=(\S+)\s+amount=(\d+)\s+status=(\S+)/i;
    match = logStr.match(refundRegex);
    if (match) {
      const username = match[1];
      const order = match[2];
      const amount = Number(match[3]);
      const status = match[4];
      const timestamp = this.extractTimestamp(logStr);
      
      return {
        rawLog,
        timestamp,
        ip: logStr.match(/IP=(\S+)/)?.[1] || '198.51.100.50',
        event: status.toUpperCase() === 'FAIL' ? 'Failed Refund Request' : 'Successful Refund Request',
        severity: amount >= 100000 ? 'High' : 'Medium',
        details: {
          username,
          order,
          amount,
          status,
          service: 'Refund API'
        }
      };
    }

    // 4. Check for SSH Authentication Failures
    const sshFailedRegex = /(?:sshd\[\d+\]: )?Failed password for (?:invalid user )?(\S+) from (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}) port (\d+) ssh2/i;
    match = logStr.match(sshFailedRegex);
    if (match) {
      const username = match[1];
      const ip = match[2];
      const port = match[3];
      const timestamp = this.extractTimestamp(logStr);
      return {
        rawLog,
        timestamp,
        ip,
        event: 'Failed Login',
        severity: username === 'root' || username === 'admin' ? 'Medium' : 'Low',
        details: {
          username,
          port,
          service: 'SSH',
          reason: 'Failed credentials',
          attempts: 1
        }
      };
    }

    // 5. Check for SSH Authentication Success
    const sshSuccessRegex = /(?:sshd\[\d+\]: )?Accepted password for (\S+) from (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}) port (\d+) ssh2/i;
    match = logStr.match(sshSuccessRegex);
    if (match) {
      const username = match[1];
      const ip = match[2];
      const port = match[3];
      const timestamp = this.extractTimestamp(logStr);
      return {
        rawLog,
        timestamp,
        ip,
        event: 'Successful Login',
        severity: 'Low',
        details: {
          username,
          port,
          service: 'SSH'
        }
      };
    }

    // 6. Check for Firewall Blocks (Port Scans / Block actions)
    const firewallRegex = /SRC=(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\s+DST=(\S+)\s+PROTO=(\S+)\s+SPT=(\d+)\s+DPT=(\d+)\s+ACTION=(\S+)/i;
    match = logStr.match(firewallRegex);
    if (match) {
      const ip = match[1];
      const destination = match[2];
      const protocol = match[3];
      const srcPort = match[4];
      const destPort = match[5];
      const action = match[6];
      const timestamp = this.extractTimestamp(logStr);
      
      const isSensitivePort = ['22', '23', '3389', '445', '80', '443'].includes(destPort);
      return {
        rawLog,
        timestamp,
        ip,
        event: action === 'BLOCK' ? 'Firewall Connection Blocked' : 'Firewall Connection Allowed',
        severity: isSensitivePort && action === 'BLOCK' ? 'Medium' : 'Low',
        details: {
          destination,
          protocol,
          srcPort,
          destPort,
          action,
          service: this.mapPortToService(destPort)
        }
      };
    }

    // 7. Check for Web Server Access Logs
    const webLogRegex = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\s+-\s+-\s+\[([^\]]+)\]\s+"([A-Z]+)\s+(\S+)\s+[^"]+"\s+(\d{3})\s+(\d+)/;
    match = logStr.match(webLogRegex);
    if (match) {
      const ip = match[1];
      const timeStr = match[2];
      const method = match[3];
      const path = match[4];
      const statusCode = match[5];
      const size = match[6];
      
      let event = 'Web Access';
      let severity = 'Low';
      
      if (statusCode === '401' || statusCode === '403') {
        event = 'Unauthorized Web Request';
        severity = 'Medium';
      } else if (path.includes('admin') || path.includes('config') || path.includes('.env')) {
        event = 'Sensitive Directory Scan';
        severity = 'Medium';
      }

      return {
        rawLog,
        timestamp: this.parseWebTime(timeStr),
        ip,
        event,
        severity,
        details: {
          method,
          path,
          statusCode,
          size,
          service: 'HTTP'
        }
      };
    }

    // 8. General parsing fallback
    const generalIpRegex = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/;
    const ipMatch = logStr.match(generalIpRegex);
    const ip = ipMatch ? ipMatch[1] : '0.0.0.0';
    const timestamp = this.extractTimestamp(logStr);
    
    let event = 'General Event';
    let severity = 'Low';
    
    if (logStr.toLowerCase().includes('fail') || logStr.toLowerCase().includes('reject')) {
      event = 'Failed Action';
      severity = 'Medium';
    }

    return {
      rawLog,
      timestamp,
      ip,
      event,
      severity,
      details: {
        description: logStr
      }
    };
  }

  static extractTimestamp(logStr) {
    const isoRegex = /(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)/;
    let match = logStr.match(isoRegex);
    if (match) {
      const d = new Date(match[1]);
      if (!isNaN(d.getTime())) return d;
    }
    
    const syslogRegex = /^([A-Z][a-z]{2}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})/;
    match = logStr.match(syslogRegex);
    if (match) {
      const currentYear = new Date().getFullYear();
      const d = new Date(`${match[1]} ${currentYear}`);
      if (!isNaN(d.getTime())) return d;
    }

    return new Date();
  }

  static parseWebTime(timeStr) {
    const parts = timeStr.match(/^(\d{2})\/([A-Za-z]{3})\/(\d{4}):(\d{2}):(\d{2}):(\d{2})\s+([+-]\d{4})$/);
    if (parts) {
      const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
      const d = new Date(
        parseInt(parts[3]),
        months[parts[2]],
        parseInt(parts[1]),
        parseInt(parts[4]),
        parseInt(parts[5]),
        parseInt(parts[6])
      );
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  }

  static mapPortToService(port) {
    const ports = {
      '22': 'SSH',
      '80': 'HTTP',
      '443': 'HTTPS',
      '3389': 'RDP'
    };
    return ports[port] || `Port ${port}`;
  }

  static async run(rawLogs) {
    const startTime = Date.now();
    const parsedLogs = [];
    
    try {
      const lines = Array.isArray(rawLogs) ? rawLogs : rawLogs.split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        const parsed = this.parse(line);
        if (parsed) parsedLogs.push(parsed);
      }
      
      const executionTime = Date.now() - startTime;
      return {
        status: 'Completed',
        executionTime,
        output: {
          count: parsedLogs.length,
          logs: parsedLogs
        }
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        status: 'Failed',
        executionTime,
        output: { error: error.message }
      };
    }
  }
}
