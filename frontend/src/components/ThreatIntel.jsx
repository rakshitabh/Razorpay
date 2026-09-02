import React, { useState } from 'react';
import { Globe, ShieldAlert, Plus, Check, RefreshCw, Flame, ExternalLink } from 'lucide-react';

export default function ThreatIntel({ mode }) {
  const [loading, setLoading] = useState(false);

  const securityFeed = [
    { id: 'intel-1', indicator: '198.51.100.42', type: 'Malicious IP', source: 'Botnet Watch (APT29)', severity: 'Critical', score: 98, status: 'Blocked', updated: '12 minutes ago' },
    { id: 'intel-2', indicator: 'T1110 - Brute Force', type: 'MITRE ATT&CK', source: 'CISA Global Feed', severity: 'High', score: 88, status: 'Active', updated: '2 hours ago' },
    { id: 'intel-3', indicator: 'CVE-2026-9912', type: 'CVE Feed', source: 'NVD Registry', severity: 'Critical', score: 95, status: 'Patching', updated: '4 hours ago' },
    { id: 'intel-4', indicator: '203.0.113.110', type: 'Botnet Node', source: 'Lazarus Group', severity: 'High', score: 85, status: 'Blocked', updated: '12 hours ago' }
  ];

  const fintechFeed = [
    { id: 'intel-1', indicator: '411111XXXXXX1020', type: 'Fraud BIN Range', source: 'Card Testing Botnet', severity: 'Critical', score: 92, status: 'Quarantined', updated: '5 minutes ago' },
    { id: 'intel-2', indicator: 'Device_IMEI_9981', type: 'Suspicious Device', source: 'Known Fraud Ring', severity: 'High', score: 89, status: 'Blocked', updated: '1 hour ago' },
    { id: 'intel-3', indicator: 'Refund > ₹50,000', type: 'Refund Abuse Pattern', source: 'Internal Risk ML', severity: 'High', score: 85, status: 'Flagged', updated: '12 hours ago' },
    { id: 'intel-4', indicator: 'Velocity > 100/min', type: 'Velocity Indicator', source: 'Gateway Sensor', severity: 'Critical', score: 95, status: 'Active', updated: '1 day ago' }
  ];

  const handleSync = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Threat Intelligence Feeds synchronized successfully with TAXII/STIX endpoints.');
    }, 1200);
  };

  const isFintech = mode === 'fintech';
  const feed = isFintech ? fintechFeed : securityFeed;

  return (
    <div className="space-y-6 text-left font-mono text-xs select-none">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center">
            <Globe className="w-5 h-5 mr-2 text-[#06B6D4]" /> 
            {isFintech ? 'FRAUD_INTELLIGENCE_FEEDS' : 'THREAT_INTELLIGENCE_FEEDS'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isFintech 
              ? 'Ingest active card BIN testing blacklists, UPI fraud device groups, and refund signatures.'
              : 'Ingest active Indicators of Compromise (IOCs) from TAXII servers and malicious IP blocklists.'
            }
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSync}
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-850 border border-slate-800 px-3.5 py-2 rounded font-semibold text-slate-300 hover:text-white transition disabled:opacity-50 cursor-pointer flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>SYNC FEEDS</span>
          </button>
        </div>
      </div>

      {/* Grid: Indicators Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111827] border border-slate-800 p-4 rounded-lg flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded bg-[#DC2626]/10 border border-[#DC2626]/30 flex items-center justify-center text-[#DC2626]">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Critical Threats</span>
            <span className="text-lg font-bold text-white block mt-0.5">3 Active Indicators</span>
          </div>
        </div>
        <div className="bg-[#111827] border border-slate-800 p-4 rounded-lg flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded bg-[#06B6D4]/10 border border-[#06B6D4]/30 flex items-center justify-center text-[#06B6D4]">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Feed Sources</span>
            <span className="text-lg font-bold text-white block mt-0.5">Global TAXII / STIX</span>
          </div>
        </div>
        <div className="bg-[#111827] border border-slate-800 p-4 rounded-lg flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Database Status</span>
            <span className="text-lg font-bold text-[#10B981] block mt-0.5">Synced / Online</span>
          </div>
        </div>
      </div>

      {/* IOCs registry list table */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            {isFintech ? 'Fraud Indicator Ledger' : 'Threat Indicator Ledger'}
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase text-[9px] font-bold bg-slate-900/40">
                <th className="py-3 px-4">Indicator Pattern</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Source Category</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Risk Rating</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Updated</th>
              </tr>
            </thead>
            <tbody>
              {feed.map((ioc) => (
                <tr key={ioc.id} className="border-b border-slate-800/40 hover:bg-slate-800/10 transition">
                  <td className="py-4 px-4 text-white font-bold flex items-center space-x-1.5">
                    <span>{ioc.indicator}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-550 hover:text-white cursor-pointer" />
                  </td>
                  <td className="py-4 px-4 text-slate-400">
                    {ioc.type}
                  </td>
                  <td className="py-4 px-4 text-[#06B6D4] font-semibold">
                    {ioc.source}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase ${
                      ioc.severity === 'Critical' ? 'bg-[#DC2626]/20 text-[#DC2626] border border-[#DC2626]/30' :
                      'bg-[#F97316]/20 text-[#F97316] border border-[#F97316]/30'
                    }`}>
                      {ioc.severity}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#DC2626] h-full" 
                          style={{ width: `${ioc.score}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-bold">{ioc.score}/100</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-[#10B981] font-bold">
                      {ioc.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right text-slate-500">
                    {ioc.updated}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
