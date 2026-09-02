/**
 * Correlation Engine Agent - Rule & Pattern Based
 * Inspects multiple event logs sequentially to identify patterns, group events,
 * and calculate risk scores before detection triggers are evaluated.
 */
export default class CorrelationEngine {
  static name = 'Correlation Engine';

  /**
   * Correlates parsed logs by grouping and calculating traffic patterns.
   * @param {Array<Object>} parsedLogs - Structured logs from ParserAgent
   * @returns {Object} Correlated events grouped by source (IP / User Session)
   */
  static run(parsedLogs) {
    const startTime = Date.now();
    const correlatedGroups = {};

    try {
      if (!parsedLogs || parsedLogs.length === 0) {
        return {
          status: 'Completed',
          executionTime: Date.now() - startTime,
          output: { groups: {} }
        };
      }

      // Group logs by source identity: IP Address or User Identity if available
      parsedLogs.forEach((log) => {
        const sourceKey = log.ip || log.details?.userId || 'unknown';
        if (!correlatedGroups[sourceKey]) {
          correlatedGroups[sourceKey] = {
            source: sourceKey,
            events: [],
            uniqueTargets: new Set(),
            uniquePorts: new Set(),
            uniqueDevices: new Set(),
            locations: new Set(),
            totalVolume: 0,
            failures: 0,
            successes: 0,
            financialVolume: 0
          };
        }

        const group = correlatedGroups[sourceKey];
        group.events.push(log);
        group.totalVolume += 1;

        // Track targets
        if (log.details?.destPort) group.uniquePorts.add(log.details.destPort);
        if (log.details?.service) group.uniqueTargets.add(log.details.service);
        if (log.details?.targetSystem) group.uniqueTargets.add(log.details.targetSystem);
        if (log.details?.username) group.uniqueTargets.add(log.details.username);
        
        // Track Device Fingerprints & Locations for Fintech
        if (log.details?.device) group.uniqueDevices.add(log.details.device);
        if (log.details?.location) group.locations.add(log.details.location);
        if (log.details?.amount) group.financialVolume += Number(log.details.amount) || 0;

        // Track counts
        if (
          log.event.toLowerCase().includes('fail') || 
          log.event.toLowerCase().includes('block') || 
          log.event.toLowerCase().includes('unauthorized')
        ) {
          group.failures += 1;
        } else {
          group.successes += 1;
        }
      });

      // Convert Set properties to Arrays for JSON serialization
      const finalGroups = {};
      for (const [key, group] of Object.entries(correlatedGroups)) {
        finalGroups[key] = {
          source: group.source,
          logCount: group.events.length,
          uniqueTargets: Array.from(group.uniqueTargets),
          uniquePorts: Array.from(group.uniquePorts),
          uniqueDevices: Array.from(group.uniqueDevices),
          locations: Array.from(group.locations),
          totalVolume: group.totalVolume,
          failures: group.failures,
          successes: group.successes,
          financialVolume: group.financialVolume,
          events: group.events
        };
      }

      return {
        status: 'Completed',
        executionTime: Date.now() - startTime,
        output: { groups: finalGroups }
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
