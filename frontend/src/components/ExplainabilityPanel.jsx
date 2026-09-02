import React from 'react';
import { Percent, Cpu, ShieldAlert, ListFilter, Files, Info } from 'lucide-react';

export default function ExplainabilityPanel({ incident }) {
  if (!incident) return null;

  const isFintech = incident.mode === 'fintech';
  
  // Custom weights mapping
  const weights = isFintech
    ? [
        { label: 'Failed Payments Weight', value: 30, desc: 'Repetitive transaction failure responses.' },
        { label: 'Velocity Abuse Weight', value: 25, desc: 'Payout velocity exceeding limits bounds.' },
        { label: 'Target Sensitivity', value: 20, desc: 'Gateway settlement API security tier.' },
        { label: 'AI Confidence Factor', value: 17, desc: 'Trust alignment of Gemini reasoning.' }
      ]
    : [
        { label: 'Ingress Failures Weight', value: 30, desc: 'Syslog password failure attempts count.' },
        { label: 'Credential Stuffing Weight', value: 25, desc: 'Authentication attempts on distinct profiles.' },
        { label: 'Host Scan Probes Weight', value: 20, desc: 'Firewall connections count on closed ports.' },
        { label: 'Target Sensitivity', value: 17, desc: 'Target host administrative privilege tier.' }
      ];

  const totalCalculated = weights.reduce((acc, curr) => acc + curr.value, 0);

  // Triggered Rules list
  const triggeredRules = isFintech
    ? ['VELOCITY-PAY-04 (Velocity Threshold Exceeded)', 'UPI-DEVICE-09 (Device Shift Alert)', 'GEOLOC-ANOMALY-02 (Geographic Shift)']
    : ['T1110 (Brute Force Ingress)', 'T1110.001 (Credential Stuffing)', 'T1046 (Network Service Discovery Scan)'];

  // Matched Indicators list
  const matchedIndicators = isFintech
    ? ['High-frequency API requests', 'Geographical velocity boundary failure', 'Device identity spoofing signature']
    : ['Multiple login attempts from single IP', 'Parallel username authorization attempts', 'Sequential TCP ping connection scans'];

  // Evidence Sources list
  const evidenceSources = [
    `Ingested telemetry log trail (${(incident.evidenceLogs || []).length || 8} entries)`,
    `Malicious source IP node (${incident.sourceIp || '198.51.100.12'})`,
    `Target systems network endpoints (${incident.targetSystem || 'Internal Gateway API'})`
  ];

  return (
    <div className="bg-[#131C2E] border border-[#2A3A52] p-4 rounded-lg space-y-4 font-sans text-xs text-left select-none">
      
      {/* Header */}
      <div className="border-b border-[#2A3A52] pb-1.5 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
            <Cpu className="w-4 h-4 mr-1.5 text-[#38BDF8]" /> EXPLAINABILITY_POSTURE
          </h3>
          <p className="text-[9px] text-[#9CA3AF] mt-0.5 font-normal">Deterministic weights showing base indicators metrics.</p>
        </div>
        <div className="flex items-center space-x-1 text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded border border-[#22C55E]/20">
          <Percent className="w-3 h-3" />
          <span className="font-bold text-[9px] font-mono">{incident.confidenceScore || 95}% Trust</span>
        </div>
      </div>

      {/* Grid of rules, indicators, sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[9px]">
        
        {/* Triggered Rules */}
        <div className="bg-[#0B1220] border border-[#2A3A52] p-3 rounded space-y-2">
          <span className="font-bold text-white uppercase flex items-center tracking-wide text-[9px]">
            <ShieldAlert className="w-3.5 h-3.5 mr-1 text-[#F59E0B]" /> Triggered Rules
          </span>
          <ul className="space-y-1 font-mono text-[#9CA3AF]">
            {triggeredRules.map((rule, idx) => (
              <li key={idx} className="flex items-center space-x-1.5">
                <span className="text-[#F59E0B]">↳</span>
                <span className="truncate">{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Matched Indicators */}
        <div className="bg-[#0B1220] border border-[#2A3A52] p-3 rounded space-y-2">
          <span className="font-bold text-white uppercase flex items-center tracking-wide text-[9px]">
            <ListFilter className="w-3.5 h-3.5 mr-1 text-[#38BDF8]" /> Matched Indicators
          </span>
          <ul className="space-y-1 font-mono text-[#9CA3AF]">
            {matchedIndicators.map((ind, idx) => (
              <li key={idx} className="flex items-center space-x-1.5">
                <span className="text-[#38BDF8]">↳</span>
                <span className="truncate">{ind}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Evidence Sources */}
        <div className="bg-[#0B1220] border border-[#2A3A52] p-3 rounded space-y-2 md:col-span-2">
          <span className="font-bold text-white uppercase flex items-center tracking-wide text-[9px]">
            <Files className="w-3.5 h-3.5 mr-1 text-[#A855F7]" /> Evidence Sources
          </span>
          <ul className="space-y-1 font-mono text-[#9CA3AF] grid grid-cols-1 sm:grid-cols-3 gap-2">
            {evidenceSources.map((src, idx) => (
              <li key={idx} className="flex items-center space-x-1.5 bg-[#131C2E]/40 px-2 py-1 rounded border border-[#2A3A52]/40">
                <span className="text-[#A855F7] font-bold">#</span>
                <span className="truncate">{src}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Calculations Breakdown */}
      <div className="bg-[#0B1220] border border-[#2A3A52] p-3.5 rounded space-y-3">
        <span className="font-bold text-white uppercase tracking-wide flex items-center text-[9px]">
          <Info className="w-3.5 h-3.5 mr-1.5 text-[#22C55E]" /> Risk Calculation Logic
        </span>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {weights.map((w, idx) => (
            <div key={idx} className="bg-[#131C2E] border border-[#2A3A52] p-2 rounded text-left">
              <span className="block text-[8px] text-[#9CA3AF] uppercase font-bold truncate">{w.label}</span>
              <span className="block font-bold text-white font-mono text-xs mt-0.5">+{w.value}</span>
              <span className="block text-[7px] text-[#9CA3AF] mt-0.5 truncate leading-none">{w.desc}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-[#2A3A52] pt-2 mt-2">
          <span className="text-[#9CA3AF] font-bold tracking-wider text-[8px] uppercase">Formula consolidated score:</span>
          <span className="font-bold font-mono text-xs text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/25 px-2.5 py-0.5 rounded">
            {totalCalculated} / 100 Risk Priority
          </span>
        </div>
      </div>

    </div>
  );
}
