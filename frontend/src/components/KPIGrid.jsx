import React from 'react';
import { HelpCircle, AlertOctagon, ShieldAlert, Cpu, Activity, FolderOpen, CreditCard, Users, BadgeCent, Database } from 'lucide-react';

export default function KPIGrid({ mode, stats, loading }) {
  const isFintech = mode === 'fintech';

  const securityItems = [
    {
      id: 'critical-incidents',
      label: 'Critical Incidents',
      value: stats.criticalIncidents || 0,
      color: 'text-[#EF4444]',
      icon: AlertOctagon,
      desc: 'Active critical security alerts.',
      help: 'Number of critical security incidents currently in the system.'
    },
    {
      id: 'high-incidents',
      label: 'High Risk Incidents',
      value: stats.highIncidents || 0,
      color: 'text-[#F59E0B]',
      icon: ShieldAlert,
      desc: 'High severity security anomalies.',
      help: 'Number of high severity security incidents currently in the system.'
    },
    {
      id: 'events-processed',
      label: 'Events Processed',
      value: stats.eventsProcessed || 0,
      color: 'text-[#38BDF8]',
      icon: Cpu,
      desc: 'Total security events parsed.',
      help: 'Sum of all ingested telemetry logs processed by the correlation engine.'
    },
    {
      id: 'assets-monitored',
      label: 'Assets Monitored',
      value: stats.assetsCount || 0,
      color: 'text-[#A855F7]',
      icon: Database,
      desc: 'Unique endpoints under review.',
      help: 'Distinct backend clusters, API endpoints, or user workspaces monitored.'
    },
    {
      id: 'average-risk',
      label: 'Average Risk',
      value: `${stats.avgRisk || 0}/100`,
      color: 'text-[#F97316]',
      icon: Activity,
      desc: 'Mean risk score of anomalies.',
      help: 'The average calculated risk score across all active incidents.'
    },
    {
      id: 'open-cases',
      label: 'Open Cases',
      value: stats.openCases || 0,
      color: 'text-[#22C55E]',
      icon: FolderOpen,
      desc: 'Security tickets pending review.',
      help: 'Number of incidents with status "Open" requiring analyst attention.'
    }
  ];

  const fintechItems = [
    {
      id: 'card-testing',
      label: 'Card Testing Cases',
      value: stats.cardTestingCases || 0,
      color: 'text-[#F59E0B]',
      icon: CreditCard,
      desc: 'Velocity abuse botnets.',
      help: 'Number of detected botnet attacks testing credit card numbers.'
    },
    {
      id: 'fraud-attempts',
      label: 'Fraud Attempts',
      value: stats.fraudAttempts || 0,
      color: 'text-[#EF4444]',
      icon: AlertOctagon,
      desc: 'Total financial fraud incidents.',
      help: 'Total number of fraud incidents currently tracked.'
    },
    {
      id: 'transactions-scanned',
      label: 'Transactions Scanned',
      value: stats.transactionsScanned || 0,
      color: 'text-[#38BDF8]',
      icon: Cpu,
      desc: 'Total payment telemetry processed.',
      help: 'Sum of all ingested transactions processed by the fraud engine.'
    },
    {
      id: 'affected-accounts',
      label: 'Affected Accounts',
      value: stats.affectedAccounts || 0,
      color: 'text-[#A855F7]',
      icon: Users,
      desc: 'Compromised user wallets/accounts.',
      help: 'Count of unique user accounts affected by active fraud cases.'
    },
    {
      id: 'financial-impact',
      label: 'Financial Impact',
      value: `₹ ${(stats.financialImpact || 0).toLocaleString('en-IN')}`,
      color: 'text-[#10B981]',
      icon: BadgeCent,
      desc: 'Aggregate value under risk.',
      help: 'Total monetary exposure calculated from flagged transactions.'
    },
    {
      id: 'open-cases',
      label: 'Open Cases',
      value: stats.openCases || 0,
      color: 'text-[#22C55E]',
      icon: FolderOpen,
      desc: 'Fraud tickets pending review.',
      help: 'Number of incidents with status "Open" requiring analyst attention.'
    }
  ];

  const items = isFintech ? fintechItems : securityItems;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 select-none font-sans">
      {items.map((item) => (
        <div 
          key={item.id} 
          id={`kpi-card-${item.id}`} 
          className="bg-[#131C2E] border border-[#2A3A52] p-4 rounded-lg space-y-1 relative group hover:border-[#38BDF8]/40 transition duration-155 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-wider flex items-center">
                <item.icon className="w-3.5 h-3.5 mr-1 text-[#9CA3AF]" />
                {item.label}
              </span>
              <div className="relative">
                <HelpCircle className="w-3.5 h-3.5 text-[#9CA3AF]/65 hover:text-white cursor-help transition" />
                <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-[#1B263B] border border-[#2A3A52] text-[10px] text-slate-350 p-2.5 rounded shadow-2xl w-48 leading-relaxed z-50 text-center">
                  {item.help}
                </div>
              </div>
            </div>
            
            <div className="flex items-baseline space-x-2 mt-2">
              <span className={`text-xl font-bold font-mono tracking-tight ${item.color}`}>
                {loading ? (
                  <span className="inline-block w-8 h-6 bg-[#1B263B] animate-pulse rounded"></span>
                ) : (
                  item.value
                )}
              </span>
            </div>
          </div>
          <p className="text-[9px] text-[#9CA3AF] leading-tight mt-2">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}
