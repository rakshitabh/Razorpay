import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Terminal, 
  Play, 
  RefreshCw, 
  ChevronRight,
  TrendingUp,
  Brain,
  Layers,
  Database,
  Users
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import KPIGrid from './KPIGrid';

const MOCK_SECURITY_THREATS = [
  {
    _id: 'mock-sec-1',
    incidentId: 'INC-2001',
    title: 'SSH Brute Force Attack',
    severity: 'Critical',
    riskScore: 92,
    status: 'Open',
    sourceIp: '198.51.100.12',
    targetSystem: 'Auth Server Node 2',
    category: 'Authentication',
    detectionMethod: 'Correlation Rules Match',
    timeline: [
      { timestamp: new Date(Date.now() - 3600000).toISOString(), event: 'Raw password failures detected' },
      { timestamp: new Date(Date.now() - 3000000).toISOString(), event: 'Rule threshold breached: T1110' }
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    mode: 'security'
  },
  {
    _id: 'mock-sec-2',
    incidentId: 'INC-2002',
    title: 'Credential Stuffing Attack',
    severity: 'High',
    riskScore: 78,
    status: 'Investigating',
    sourceIp: '198.51.100.15',
    targetSystem: 'API Gateway Server',
    category: 'Authentication',
    detectionMethod: 'Correlation Rules Match',
    timeline: [
      { timestamp: new Date(Date.now() - 7200000).toISOString(), event: 'Parallel user authorization calls log' }
    ],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    mode: 'security'
  },
  {
    _id: 'mock-sec-3',
    incidentId: 'INC-2003',
    title: 'Port Scan Reconnaissance',
    severity: 'Medium',
    riskScore: 55,
    status: 'Mitigated',
    sourceIp: '198.51.100.18',
    targetSystem: 'Internal Database Cluster',
    category: 'Network Recon',
    detectionMethod: 'Correlation Rules Match',
    timeline: [
      { timestamp: new Date(Date.now() - 14400000).toISOString(), event: 'Firewall ports connection block' }
    ],
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    mode: 'security'
  }
];

const MOCK_FINTECH_THREATS = [
  {
    _id: 'mock-fin-1',
    incidentId: 'INC-3001',
    title: 'UPI Fraud Violation',
    severity: 'Critical',
    riskScore: 94,
    status: 'Open',
    financialImpact: 1250000,
    targetSystem: 'UPI Gateway API',
    affectedCustomers: 1,
    affectedAccounts: ['rakshita_wallet'],
    category: 'Transaction Fraud',
    detectionMethod: 'Correlation Rules Match',
    fraudIndicators: ['Device Shift', 'Geographic Anomaly', 'Velocity Limit Violation'],
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    mode: 'fintech'
  },
  {
    _id: 'mock-fin-2',
    incidentId: 'INC-3002',
    title: 'Card Testing Botnet',
    severity: 'High',
    riskScore: 82,
    status: 'Investigating',
    financialImpact: 240000,
    targetSystem: 'Checkout Payments Gateway',
    affectedCustomers: 6,
    affectedAccounts: ['rahul_user_card'],
    category: 'Velocity Abuse',
    detectionMethod: 'Correlation Rules Match',
    fraudIndicators: ['Incorrect CVV Velocity', 'Gateway Probe'],
    createdAt: new Date(Date.now() - 5400000).toISOString(),
    mode: 'fintech'
  },
  {
    _id: 'mock-fin-3',
    incidentId: 'INC-3003',
    title: 'Refund Abuse Exploit',
    severity: 'High',
    riskScore: 80,
    status: 'Mitigated',
    financialImpact: 4575000,
    targetSystem: 'Merchant Settlements Portal',
    affectedCustomers: 2,
    affectedAccounts: ['merchant_99'],
    category: 'Refund Abuse',
    detectionMethod: 'Correlation Rules Match',
    fraudIndicators: ['Duplicate Refunds Request', 'Threshold Violation'],
    createdAt: new Date(Date.now() - 9800000).toISOString(),
    mode: 'fintech'
  }
];

export default function Dashboard({ token, user, onNavigateToTab, onSelectIncident, mode, onOpenDemoLauncher }) {
  const [logsCount, setLogsCount] = useState(0);
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const logsRes = await fetch('/api/logs?limit=1', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let logsTotal = 0;
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        logsTotal = logsData.total || 0;
        setLogsCount(logsTotal);
      }

      const threatsRes = await fetch(`/api/threats?mode=${mode}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (threatsRes.ok) {
        const threatsData = await threatsRes.json();
        
        if (threatsData && threatsData.length > 0) {
          setThreats(threatsData);
        } else {
          setThreats([]);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 15000);
    return () => clearInterval(interval);
  }, [mode]);

  const isFintech = mode === 'fintech';

  // Compute metric calculations
  const targets = new Set(threats.map(t => t.targetSystem));
  const assetsCount = targets.size || 1;

  const refundAbuseVolume = threats
    .filter(t => t.mode === 'fintech')
    .reduce((acc, curr) => acc + (curr.financialImpact || 0), 0);

  const criticalIncidents = threats.filter(t => t.severity === 'Critical').length;
  const highIncidents = threats.filter(t => t.severity === 'High').length;
  const avgRisk = threats.length > 0 ? Math.round(threats.reduce((acc, curr) => acc + (curr.riskScore || 0), 0) / threats.length) : 0;
  const openCases = threats.filter(t => t.status === 'Open').length;
  
  const cardTestingCases = threats.filter(t => t.category === 'Velocity Abuse' || t.title.includes('Card Testing')).length;
  const totalAffectedAccounts = threats.reduce((acc, curr) => acc + (curr.affectedAccounts ? curr.affectedAccounts.length : 0), 0);

  const stats = {
    criticalIncidents,
    highIncidents,
    eventsProcessed: (logsCount + threats.length * 150),
    assetsCount,
    avgRisk,
    openCases,
    cardTestingCases,
    fraudAttempts: threats.length,
    transactionsScanned: (logsCount + threats.length * 150),
    affectedAccounts: totalAffectedAccounts,
    financialImpact: refundAbuseVolume,
  };

  // Severity Breakdown
  const severityCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  threats.forEach(t => {
    if (severityCounts[t.severity] !== undefined) {
      severityCounts[t.severity]++;
    }
  });

  const pieData = Object.keys(severityCounts)
    .map(key => ({ name: key, value: severityCounts[key] }))
    .filter(d => d.value > 0);

  const severityColors = {
    Critical: '#EF4444',
    High: '#F59E0B',
    Medium: '#38BDF8',
    Low: '#22C55E'
  };

  // Chart Data: Trend Line
  const trendData = threats.slice(0, 10).map((t) => ({
    name: new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    score: t.riskScore
  })).reverse();

  // AI Insights
  // AI Insights
  let insights = [];
  if (threats.length === 0) {
    insights.push({ id: 'in-empty', text: 'Telemetry pipelines operational. No active anomalies detected.', type: 'info' });
  } else {
    // Generate dynamic insights based on recent threats
    const recentCritical = threats.filter(t => t.severity === 'Critical' || t.severity === 'High');
    if (recentCritical.length > 0) {
      insights.push({ 
        id: 'in-dyn-1', 
        text: `${recentCritical[0].severity} anomaly detected: ${recentCritical[0].title} on ${recentCritical[0].targetSystem}.`, 
        type: recentCritical[0].severity === 'Critical' ? 'critical' : 'high'
      });
    }
    
    if (isFintech) {
      const refundAbuseCount = threats.filter(t => t.category === 'Refund Abuse' || t.title.includes('Refund')).length;
      if (refundAbuseCount > 0) {
        insights.push({ id: 'in-dyn-2', text: `${refundAbuseCount} refund abuse vector(s) identified in recent ledger updates.`, type: 'high' });
      }
      
      const atoCount = threats.filter(t => t.category === 'Account Takeover' || t.title.includes('Takeover')).length;
      if (atoCount > 0) {
        insights.push({ id: 'in-dyn-3', text: `Account Takeover (ATO) signals detected affecting ${totalAffectedAccounts} accounts.`, type: 'high' });
      }
    } else {
      const bruteCount = threats.filter(t => t.title.includes('Brute') || t.title.includes('Stuffing')).length;
      if (bruteCount > 0) {
        insights.push({ id: 'in-dyn-2', text: `${bruteCount} brute-force/credential stuffing attack sequences detected.`, type: 'high' });
      }
      
      const scanCount = threats.filter(t => t.category === 'Network Recon' || t.title.includes('Scan')).length;
      if (scanCount > 0) {
         insights.push({ id: 'in-dyn-3', text: `Reconnaissance scanning identified targeting internal infrastructure.`, type: 'medium' });
      }
    }

    if (insights.length < 3 && threats.length > 0) {
      insights.push({ id: 'in-dyn-4', text: `System processed ${logsCount} recent events resulting in ${threats.length} correlated tickets.`, type: 'medium' });
    }
  }

  return (
    <div className="space-y-4 font-sans text-xs">
      
      {/* Upper header action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white uppercase font-sans">
            AI Risk Intelligence Platform
          </h1>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            Unified Security & Fintech Risk Operations Center
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="run-demo-btn"
            onClick={onOpenDemoLauncher}
            className="flex items-center space-x-1.5 bg-[#38BDF8] hover:bg-[#38BDF8]/85 text-[#0B1220] px-4 py-2 rounded text-xs font-sans font-bold transition cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>TRIGGER MOCK SIMULATOR</span>
          </button>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-2 border border-[#2A3A52] bg-[#131C2E] hover:bg-[#1B263B] rounded text-[#9CA3AF] hover:text-white transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Empty State */}
      {threats.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center bg-[#111827] border border-slate-700 rounded-lg p-16 text-center h-[50vh]">
          <ShieldAlert className="w-16 h-16 text-slate-500 mb-4" />
          <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-2">No Incidents Yet</h2>
          <p className="text-slate-400 max-w-md mx-auto mb-6">
            The platform has not ingested any data or detected any threats. Run the mock scenario to populate the dashboard or ingest data manually.
          </p>
          <button
            onClick={onOpenDemoLauncher}
            className="flex items-center space-x-2 bg-[#38BDF8] hover:bg-[#38BDF8]/80 text-[#0F172A] px-6 py-3 rounded font-sans font-bold transition cursor-pointer"
          >
            <Play className="w-4 h-4" />
            <span>RUN DEMO SCENARIO</span>
          </button>
        </div>
      )}

      {/* Main Dashboard Content */}
      {threats.length > 0 && (
        <>
          {/* Row 1: Executive KPI Metrics Grid */}
          <KPIGrid mode={mode} stats={stats} loading={loading} />

      {/* Row 2: Split Charts, Distribution & Event Ingestion Status */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 select-none">
        
        {/* Incident Trend Graph */}
        <div className="bg-[#131C2E] border border-[#2A3A52] p-4 rounded-lg space-y-3 col-span-1 lg:col-span-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center font-sans">
            <TrendingUp className="w-4 h-4 mr-1.5 text-[#38BDF8]" /> Risk & Severity Trends
          </h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis dataKey="name" stroke="#475569" fontSize={8} />
                <YAxis stroke="#475569" fontSize={8} />
                <Tooltip contentStyle={{ backgroundColor: '#131C2E', border: '1px solid #2A3A52', fontSize: 9 }} />
                <Line type="monotone" dataKey="score" stroke="#38BDF8" strokeWidth={1.5} dot={{ fill: '#38BDF8' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution Pie */}
        <div className="bg-[#131C2E] border border-[#2A3A52] p-4 rounded-lg space-y-3 col-span-1">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-sans">Severity Breakdown</h3>
          <div className="h-44 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={58}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={severityColors[entry.name] || '#64748B'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#131C2E', border: '1px solid #2A3A52', fontSize: 9 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event Sources Status */}
        <div className="bg-[#131C2E] border border-[#2A3A52] p-4 rounded-lg space-y-3 col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-sans">
              Data Ingestion Feeds
            </h3>
            <p className="text-[9px] text-[#9CA3AF] mt-0.5">Active ingestion gateways status.</p>
          </div>

          <div className="space-y-1.5 flex-grow flex flex-col justify-center">
            {[
              { name: 'Mock Simulator', status: 'READY', color: 'text-[#38BDF8]' },
              { name: 'File Upload (CSV/JSON)', status: 'ACTIVE', color: 'text-[#22C55E]' },
              { name: 'API Stream /ingest', status: 'ACTIVE', color: 'text-[#22C55E]' },
              { name: 'MongoDB Data Store', status: 'CONNECTED', color: 'text-[#22C55E]' },
              { name: 'Gemini LLM Integration', status: 'ONLINE', color: 'text-[#10B981]' }
            ].map(src => (
              <div key={src.name} className="flex items-center justify-between bg-[#0B1220] border border-[#2A3A52] px-2.5 py-1 rounded">
                <span className="font-mono text-[9px] text-[#E5E7EB]">{src.name}</span>
                <span className={`font-bold font-mono text-[8px] flex items-center ${src.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1 ${src.color.replace('text-', 'bg-')}`}></span>
                  {src.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 4: Recent Incidents & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Recent Incidents Table */}
        <div className="bg-[#131C2E] border border-[#2A3A52] p-4 rounded-lg space-y-3 lg:col-span-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-sans select-none">
            {isFintech ? 'Recent Fraud Violations' : 'Recent Telemetry Incidents'}
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#0B1220] border-b border-[#2A3A52] text-[9px] text-[#9CA3AF] uppercase font-bold select-none">
                  <th className="p-2.5">ID</th>
                  <th className="p-2.5">Tactic</th>
                  <th className="p-2.5">Severity</th>
                  {isFintech && <th className="p-2.5">Impact</th>}
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3A52]/40 font-sans">
                {threats.map(inc => (
                  <tr key={inc._id} className="hover:bg-[#1B263B]/20 transition">
                    <td className="p-2.5 font-bold text-white font-mono">{inc.incidentId}</td>
                    <td className="p-2.5 text-[#E5E7EB]">{inc.title}</td>
                    <td className="p-2.5 select-none">
                      <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase ${
                        inc.severity === 'Critical' ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30' :
                        inc.severity === 'High' ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30' :
                        'bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/30'
                      }`}>
                        {inc.severity}
                      </span>
                    </td>
                    {isFintech && (
                      <td className="p-2.5 text-white font-semibold font-mono">
                        ₹ {(inc.financialImpact || 0).toLocaleString('en-IN')}
                      </td>
                    )}
                    <td className="p-2.5 text-[#9CA3AF] select-none">{inc.status}</td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => onSelectIncident(inc.incidentId || inc._id)}
                        className="text-[#38BDF8] hover:text-[#38BDF8]/80 transition cursor-pointer flex items-center justify-end space-x-0.5 ml-auto font-sans font-bold"
                      >
                        <span>INSPECT</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="bg-[#131C2E] border border-[#2A3A52] p-4 rounded-lg space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center font-sans select-none">
            <Brain className="w-4 h-4 mr-1.5 text-[#38BDF8]" /> AI Anomaly Insights
          </h3>
          
          <div className="space-y-2.5">
            {insights.map((ins) => (
              <div 
                key={ins.id} 
                className="bg-[#0B1220] border border-[#2A3A52] p-2.5 rounded border-l-2 text-[#E5E7EB] leading-relaxed text-[10px]"
                style={{ borderLeftColor: ins.type === 'critical' ? '#EF4444' : ins.type === 'high' ? '#F59E0B' : '#38BDF8' }}
              >
                {ins.text}
              </div>
            ))}
          </div>
        </div>

      </div>
      </>
      )}

    </div>
  );
}
