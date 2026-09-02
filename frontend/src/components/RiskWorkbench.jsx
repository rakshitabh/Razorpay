import React, { useState, useEffect } from 'react';
import { Database, Sliders, Shield, Terminal, ArrowRight, Info, Compass, HelpCircle, Activity, Workflow } from 'lucide-react';

export default function RiskWorkbench({ token: propToken }) {
  const [activeNode, setActiveNode] = useState('correlation-engine');
  
  const [ingestedEvents, setIngestedEvents] = useState(0);
  const [suspiciousPatterns, setSuspiciousPatterns] = useState(0);
  const [incidentsGenerated, setIncidentsGenerated] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = propToken || localStorage.getItem('soc_token');
        if (!token) return;
        const res = await fetch('/api/stats', { headers: { 'Authorization': `Bearer ${token}` }});
        if (res.ok) {
          const data = await res.json();
          setIngestedEvents(data.ingestedEvents || 0);
          setSuspiciousPatterns(data.suspiciousPatterns || 0);
          setIncidentsGenerated(data.incidentsGenerated || 0);
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [propToken]);

  const nodes = {
    'system-inputs': {
      title: '1. Ingestion Telemetry Inputs',
      desc: 'Heterogeneous logging telemetry streams ingested from infrastructure channels.',
      details: [
        'Security Logs: SSH authentication failures, firewall blocked connections, traversal footprints.',
        'Transaction Events: UPI payments, merchant settlements, checkout authorization APIs.',
        'User Activity: Session location shifts, browser agent indicators, multi-factor logins.',
        'Threat Intelligence: Synchronized bad IP lists and suspicious BIN card numbers.'
      ]
    },
    'correlation-engine': {
      title: '2. Multi-Event Correlation Engine',
      desc: 'Stateful aggregation layer matching velocity parameters and geographical anomalies.',
      details: [
        'Event Correlation: Groups logs by user keys and IP targets to track parallel actions.',
        'Risk Scoring: Computes weights matching financial volume and failure patterns.',
        'Pattern Matching: Audits geographical changes (e.g. Delhi to Mumbai shifts) and device ID shifts.',
        'Pipeline Flow: Normalizes fields before passing telemetry to threat checkers.'
      ]
    },
    'security-mode': {
      title: '3A. Threat Detection (Security Mode)',
      desc: 'Signature matches evaluating infrastructure scanning and brute force queries.',
      details: [
        'Brute Force (T1110): Flags failed password attempts exceeding baseline averages.',
        'Credential Stuffing: Flags single source IP querying multiple username combinations.',
        'Port Scan (T1046): Captures Firewall blocks targeting closed system ports.',
        'PowerShell Execution: Identifies lateral server traversal attempts.'
      ]
    },
    'fintech-mode': {
      title: '3B. Fraud Correlation (Fintech Mode)',
      desc: 'Transaction rules checking merchant ledger patterns and payout velocity caps.',
      details: [
        'Card Testing: Automated micro-charges matching CVV errors.',
        'Refund Abuse: High-value payout refunds exceeding merchant checkout totals.',
        'Account Takeover (ATO): Logins IP geo-shifting directly preceding beneficiary additions.',
        'UPI Fraud: Payout velocity spikes on new device configurations.'
      ]
    },
    'ai-orchestrator': {
      title: '4. AI Orchestrator & Investigation',
      desc: 'Gemini-powered reasoning explaining root causes and calculating trust levels.',
      details: [
        'Parser Agent: Normalizes unstructured log text into clean schemas.',
        'Detection Agent: Promotes rule matches to incident alerts.',
        'Investigation Agent: Audits log contexts using Gemini models.',
        'Response Agent: Compiles containment playbook actions.',
        'Report Agent: Synthesizes regulatory PDF and markdown briefs.'
      ]
    },
    'system-outputs': {
      title: '5. Workstation Outputs',
      desc: 'Structured artifacts logged to the security workstation and audit ledger.',
      details: [
        'Incident: Correlated ticket (INC-xxxx) tracking status and risk scores.',
        'Timeline: Visual chronological path showing logs to mitigation steps.',
        'Response Plan: Execute-ready playbooks allowing instant quarantine actions.',
        'Executive Report: Printed markdown summary for audits.'
      ]
    }
  };

  const selectedNode = nodes[activeNode];

  return (
    <div className="space-y-4 font-sans text-xs text-left select-none">
      
      {/* Header section */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center">
          <Workflow className="w-5 h-5 mr-2 text-[#38BDF8]" /> RISK_INTELLIGENCE_WORKBENCH
        </h1>
        <p className="text-xs text-[#9CA3AF] mt-0.5">Interactive visual map tracing data ingestion pathways through our correlation engine and AI agent pipelines.</p>
      </div>

      {/* Consolidation pipeline animation row */}
      <div className="bg-[#111827] border border-[#2A3A52] p-4 rounded-lg space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Stateful Aggregation Pipeline</h3>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-2 font-mono">
          
          <div className="flex-1 bg-[#0F172A] border border-[#2A3A52] p-3 rounded text-center relative overflow-hidden group hover:border-[#38BDF8]/40 transition">
            <span className="text-[20px] font-bold text-white block">{ingestedEvents}</span>
            <span className="text-[9px] text-[#9CA3AF] block uppercase tracking-wider font-sans mt-0.5">Ingested Events</span>
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-[#38BDF8] ${ingestedEvents === 100 ? 'animate-pulse' : ''}`}></div>
          </div>
          
          <div className="text-[#2A3A52] font-bold rotate-90 md:rotate-0">➔</div>
          
          <div className="flex-grow flex-shrink bg-[#0F172A] border border-[#2A3A52] p-3 rounded text-center relative overflow-hidden group hover:border-[#38BDF8]/40 transition md:w-64">
            <span className="text-[20px] font-bold text-[#F59E0B] block">{suspiciousPatterns}</span>
            <span className="text-[9px] text-[#9CA3AF] block uppercase tracking-wider font-sans mt-0.5">Suspicious Patterns</span>
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-[#F59E0B] ${suspiciousPatterns === 4 ? 'animate-pulse' : ''}`}></div>
          </div>

          <div className="text-[#2A3A52] font-bold rotate-90 md:rotate-0">➔</div>

          <div className="flex-1 bg-[#0F172A] border border-[#EF4444]/30 p-3 rounded text-center relative overflow-hidden group hover:border-[#EF4444]/65 transition">
            <span className="text-[20px] font-bold text-[#EF4444] block">{incidentsGenerated}</span>
            <span className="text-[9px] text-[#9CA3AF] block uppercase tracking-wider font-sans mt-0.5">Incident Generated</span>
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-[#EF4444] ${incidentsGenerated === 1 ? 'animate-pulse' : ''}`}></div>
          </div>

        </div>
      </div>

      {/* Main split canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        
        {/* Interactive Diagram (Left Columns) */}
        <div className="lg:col-span-2 bg-[#131C2E] border border-[#2A3A52] p-5 rounded-lg space-y-6 relative overflow-hidden">
          <div className="text-[9px] text-[#9CA3AF] uppercase tracking-widest font-bold select-none text-right">
            Click blocks to inspect parameters
          </div>

          <div className="flex flex-col space-y-4">
            
            {/* Top: System Inputs */}
            <div className="flex justify-center">
              <button
                onClick={() => setActiveNode('system-inputs')}
                className={`p-3.5 border rounded-lg w-72 text-center transition cursor-pointer ${
                  activeNode === 'system-inputs' 
                    ? 'bg-[#38BDF8]/10 border-[#38BDF8] text-white shadow-lg' 
                    : 'bg-[#0B1220] border-[#2A3A52] text-[#9CA3AF] hover:border-slate-600'
                }`}
              >
                <Database className="w-5 h-5 mx-auto mb-1.5 text-[#38BDF8]" />
                <span className="font-bold font-sans text-xs block">1. Ingestion Telemetry Inputs</span>
                <span className="text-[9px] text-[#9CA3AF] block mt-0.5">Logs, Transaction events, IP lists</span>
              </button>
            </div>

            {/* Connecting Arrow */}
            <div className="flex justify-center text-[#2A3A52] font-bold">
              <span>↓</span>
            </div>

            {/* Middle: Correlation Engine */}
            <div className="flex justify-center">
              <button
                onClick={() => setActiveNode('correlation-engine')}
                className={`p-3.5 border rounded-lg w-76 text-center transition cursor-pointer ${
                  activeNode === 'correlation-engine' 
                    ? 'bg-[#38BDF8]/10 border-[#38BDF8] text-white shadow-lg' 
                    : 'bg-[#0B1220] border-[#2A3A52] text-[#9CA3AF] hover:border-slate-600'
                }`}
              >
                <Sliders className="w-5 h-5 mx-auto mb-1.5 text-[#38BDF8]" />
                <span className="font-bold font-sans text-xs block">2. Multi-Event Correlation</span>
                <span className="text-[9px] text-[#9CA3AF] block mt-0.5">Geographic Shifts, Velocity limits, Scoring</span>
              </button>
            </div>

            {/* Split arrows */}
            <div className="flex justify-center text-[#2A3A52] relative h-3">
              <div className="absolute left-[38%] top-0.5 w-12 border-t border-[#2A3A52] border-dashed"></div>
              <div className="absolute right-[38%] top-0.5 w-12 border-t border-[#2A3A52] border-dashed"></div>
            </div>

            {/* Split Nodes: Security vs Fintech */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setActiveNode('security-mode')}
                className={`p-3 border rounded-lg text-center transition cursor-pointer ${
                  activeNode === 'security-mode' 
                    ? 'bg-[#38BDF8]/10 border-[#38BDF8] text-white shadow-lg' 
                    : 'bg-[#0B1220] border-[#2A3A52] text-[#9CA3AF] hover:border-slate-600'
                }`}
              >
                <Shield className="w-4 h-4 mx-auto mb-1 text-[#EF4444]" />
                <span className="font-bold block text-[10px]">3A. Security Operations Mode</span>
                <span className="text-[9px] text-[#9CA3AF] block mt-0.5">Brute Force, Scans, Privilege escalation</span>
              </button>

              <button
                onClick={() => setActiveNode('fintech-mode')}
                className={`p-3 border rounded-lg text-center transition cursor-pointer ${
                  activeNode === 'fintech-mode' 
                    ? 'bg-[#38BDF8]/10 border-[#38BDF8] text-white shadow-lg' 
                    : 'bg-[#0B1220] border-[#2A3A52] text-[#9CA3AF] hover:border-slate-600'
                }`}
              >
                <Shield className="w-4 h-4 mx-auto mb-1 text-[#F59E0B]" />
                <span className="font-bold block text-[10px]">3B. Fintech Fraud Mode</span>
                <span className="text-[9px] text-[#9CA3AF] block mt-0.5">UPI Fraud, Card Testing, Refund Abuse</span>
              </button>
            </div>

            {/* Reconnect arrows */}
            <div className="flex justify-center text-[#2A3A52] font-bold">
              <span>↓</span>
            </div>

            {/* Bottom-2: AI Agent Orchestrator */}
            <div className="flex justify-center">
              <button
                onClick={() => setActiveNode('ai-orchestrator')}
                className={`p-3.5 border rounded-lg w-72 text-center transition cursor-pointer ${
                  activeNode === 'ai-orchestrator' 
                    ? 'bg-[#38BDF8]/10 border-[#38BDF8] text-white shadow-lg' 
                    : 'bg-[#0B1220] border-[#2A3A52] text-[#9CA3AF] hover:border-slate-600'
                }`}
              >
                <Terminal className="w-5 h-5 mx-auto mb-1.5 text-[#38BDF8]" />
                <span className="font-bold font-sans text-xs block">4. Multi-Agent AI Pipeline</span>
                <span className="text-[9px] text-[#9CA3AF] block mt-0.5">Parser, Investigator, Responder, Reporter</span>
              </button>
            </div>

            {/* Connect to outputs */}
            <div className="flex justify-center text-[#2A3A52] font-bold">
              <span>↓</span>
            </div>

            {/* Outputs */}
            <div className="flex justify-center">
              <button
                onClick={() => setActiveNode('system-outputs')}
                className={`p-3.5 border rounded-lg w-72 text-center transition cursor-pointer ${
                  activeNode === 'system-outputs' 
                    ? 'bg-[#38BDF8]/10 border-[#38BDF8] text-white shadow-lg' 
                    : 'bg-[#0B1220] border-[#2A3A52] text-[#9CA3AF] hover:border-slate-600'
                }`}
              >
                <CheckCircle className="w-5 h-5 mx-auto mb-1.5 text-[#22C55E]" />
                <span className="font-bold font-sans text-xs block">5. Workstation Outputs</span>
                <span className="text-[9px] text-[#9CA3AF] block mt-0.5">Timeline, Case Notes, PDF Report</span>
              </button>
            </div>

          </div>

        </div>

        {/* Explainability Inspector Panel (Right Column) */}
        <div className="bg-[#131C2E] border border-[#2A3A52] p-5 rounded-lg space-y-4 min-h-[480px]">
          <div className="border-b border-[#2A3A52] pb-1.5 flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
              <Info className="w-4 h-4 mr-1.5 text-[#38BDF8]" /> Node Inspector
            </h3>
            <span className="text-[8px] bg-[#0B1220] text-[#9CA3AF] px-2 py-0.5 rounded font-bold">INFO</span>
          </div>

          {selectedNode ? (
            <div className="space-y-3.5">
              <div>
                <span className="text-[8px] text-[#9CA3AF] uppercase block font-bold">Node Identifier</span>
                <h4 className="text-sm font-bold text-white uppercase mt-0.5 font-sans">{selectedNode.title}</h4>
              </div>

              <p className="text-[#9CA3AF] leading-relaxed leading-normal">{selectedNode.desc}</p>

              <div className="space-y-2 pt-2">
                <span className="text-[8px] text-[#9CA3AF] uppercase tracking-wider block font-bold">Operations Parameters</span>
                <ul className="space-y-1.5">
                  {selectedNode.details.map((detail, idx) => (
                    <li key={idx} className="bg-[#0B1220] border border-[#2A3A52] p-2 rounded text-[#E5E7EB] leading-relaxed">
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-[#9CA3AF] py-12 text-center">
              Select a node in the diagram map to inspect its data properties and operations parameters.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

const CheckCircle = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);
