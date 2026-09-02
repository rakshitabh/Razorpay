import React, { useEffect, useState } from 'react';
import { Shield, LogOut, Cpu, Database, BookOpen, HelpCircle, BookOpenCheck } from 'lucide-react';
import NotificationCenter from './NotificationCenter';

const HELP_CONTENT = {
  dashboard: {
    title: 'Global SOC Dashboard',
    purpose: 'Aggregates log events, security incident statistics, and server health states in a unified view.',
    why: 'Enables leadership and lead analysts to assess general security posture, track open incident queues, and check API states.',
    sop: 'Review the Critical Alerts stat card first. If count is > 0, navigate directly to the Incidents registry to begin containment.'
  },
  logs: {
    title: 'Log Ingestion Gateway',
    purpose: 'Supports manual raw log pasting and file uploads (.log, .txt, .json, .csv) for telemetric parsing.',
    why: 'Allows the SOC to manually ingest logs from servers, firewalls, and network assets that are not integrated via automated streams.',
    sop: 'Upload raw log payloads in text formats. The Parser Agent will automatically clean headers and execute signature checks.'
  },
  'event-stream': {
    title: 'Live Event Stream',
    purpose: 'Real-time syslog tracker showing live authentication and connection logs as they occur.',
    why: 'Enables security engineers to verify that ingestion tunnels are alive and watch raw syslog streams during forensic events.',
    sop: 'Use the Pause button to freeze the stream when auditing a rapid succession of failed attempts from a specific source.'
  },
  incidents: {
    title: 'Incident Manager & Workspace',
    purpose: 'Displays correlated security tickets (INC-xxxx) containing chronological attack timelines and playbooks.',
    why: 'Organizes containment workflows (e.g. blocking attacker IPs, forcing resets) and preserves note commentary databases.',
    sop: 'Open unresolved incidents, review the AI recommended plan, execute the block firewall playbooks, and log notes.'
  },
  investigations: {
    title: 'Security Investigations',
    purpose: 'Chronological review panel tracking investigation paths and root causes determined by the investigation agent.',
    why: 'Allows forensic teams to deep dive into asset vulnerabilities and identify which host nodes were scanned or targeted.',
    sop: 'Align findings with the MITRE ATT&CK framework and verify blast-radius tags on affected server logs.'
  },
  'threat-intel': {
    title: 'Threat Intelligence Feeds',
    purpose: 'TAXII/STIX database mapping reputation index records for known bad actors (e.g. APT29, Wizards).',
    why: 'Helps prevent threats by blocking malicious connections automatically based on reputation indicators.',
    sop: 'Run periodic synchronizations with global taxii relay nodes to pull fresh IP blacklists and bad hashes.'
  },
  'detection-rules': {
    title: 'Correlation Rules Manager',
    purpose: 'Registry of alert rules (Brute force limits, stuffing thresholds) with status toggles and custom editors.',
    why: 'Dictates when raw events are promoted to security incidents. Prevents alert fatigue by letting you tune parameters.',
    sop: 'Tune brute force trigger thresholds (default: 10 attempts) up or down based on your host environment baseline.'
  },
  reports: {
    title: 'Reports Registry',
    purpose: 'Technical summaries, executive briefs, and compliance reports compiled automatically by the Report Agent.',
    why: 'Provides formatted PDFs and JSON files for management audit logs and regulatory security reporting.',
    sop: 'Export compiled reports as PDF to archive incidents in external document storage repositories.'
  },
  'audit-logs': {
    title: 'Security Audit Trails',
    purpose: 'Immutable log ledger recording analyst sign-ins, logouts, playbooks runs, and account changes.',
    why: 'Provides security audits to ensure operational compliance and verify who authorized blocks or reset requests.',
    sop: 'Search logs weekly for PASSWORD_CHANGE and ACCOUNT_DELETED actions to audit credential movements.'
  },
  settings: {
    title: 'Configurations Panel',
    purpose: 'Enables toggling background attack simulation loops and manages account delete configurations.',
    why: 'Enables recruiters or testers to populate the platform with live events immediately, and resets database nodes.',
    sop: 'Turn on background simulator to test the pipeline alerts without needing manual log pastes.'
  }
};

export default function Navbar({ user, onLogout, activeTab, setActiveTab, onOpenTour }) {
  const [health, setHealth] = useState({
    database: 'disconnected',
    ai: 'offline',
    uptime: null
  });
  
  const [showHelpModal, setShowHelpModal] = useState(false);

  const queryHealthStatus = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealth({
          database: data.database || 'disconnected',
          ai: data.ai || 'offline',
          uptime: data.uptime || null
        });
      } else {
        setHealth({ database: 'disconnected', ai: 'offline', uptime: null });
      }
    } catch (err) {
      setHealth({ database: 'disconnected', ai: 'offline', uptime: null });
    }
  };

  useEffect(() => {
    queryHealthStatus();
    const timer = setInterval(queryHealthStatus, 15000);
    return () => clearInterval(timer);
  }, []);

  const activeHelp = HELP_CONTENT[activeTab] || {
    title: 'Help Center',
    purpose: 'Platform workspace navigation guide.',
    why: 'Enables analyst productivity.',
    sop: 'Navigate between the sidebar tabs to investigate alerts.'
  };

  return (
    <header className="border-b border-[#2A3A52] bg-[#131C2E] sticky top-0 z-50 px-4 md:px-6 py-2.5 no-print select-none font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Context / Section Breadcrumb */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-xs font-sans">
            <span className="text-slate-400 font-medium">Aegis</span>
            <span className="text-slate-600">/</span>
            <span className="text-white font-semibold tracking-wide">
              {activeHelp?.title || 'Risk Intelligence'}
            </span>
          </div>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono font-semibold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30">
            SECURE
          </span>
        </div>

        {/* Right Status Panel */}
        <div className="flex items-center justify-between md:justify-end space-x-6">
          


          {/* Toast/Bell notification center */}
          <NotificationCenter />

          {/* User Profile Menu */}
          <div className="flex items-center space-x-3 bg-[#0B1220] px-3 py-1.5 rounded border border-[#2A3A52]">
            <div className="flex items-center space-x-2">
              <div className="w-5.5 h-5.5 rounded-full bg-[#38BDF8]/25 border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8] font-bold text-[9px]">
                {user?.name?.substring(0, 1).toUpperCase()}
              </div>
              <span className="text-xs text-white max-w-[90px] truncate font-medium">{user?.name || 'Analyst'}</span>
            </div>
            
            <button
              onClick={() => setShowHelpModal(true)}
              title="Contextual Help Guide"
              className="text-[#9CA3AF] hover:text-[#38BDF8] transition cursor-pointer pl-2 border-l border-[#2A3A52]"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onOpenTour}
              title="Launch System Tour Guide"
              className="text-[#9CA3AF] hover:text-[#38BDF8] transition cursor-pointer pl-2 border-l border-[#2A3A52]"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
            
            <button
              onClick={onLogout}
              title="Terminate Secure Session"
              className="text-[#9CA3AF] hover:text-[#EF4444] transition cursor-pointer pl-2 border-l border-[#2A3A52]"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Contextual Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-left">
          <div className="bg-[#131C2E] border border-[#2A3A52] p-6 rounded-lg max-w-md w-full relative space-y-4 shadow-xl">
            
            <div className="border-b border-[#2A3A52] pb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center">
                <BookOpenCheck className="w-4.5 h-4.5 mr-2 text-[#38BDF8]" /> PAGE_HELP_RESOURCES
              </h3>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="text-[#9CA3AF] hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[9px] text-[#9CA3AF] uppercase">Active Workspace</span>
                <h4 className="text-sm font-bold text-white uppercase mt-0.5">{activeHelp.title}</h4>
              </div>

              <div className="space-y-3 bg-[#0B1220]/50 border border-[#2A3A52] p-4 rounded text-slate-300 leading-relaxed text-xs">
                <div>
                  <strong className="text-white block mb-0.5 font-semibold">PURPOSE:</strong>
                  {activeHelp.purpose}
                </div>
                <div>
                  <strong className="text-white block mb-0.5 font-semibold">WHY IT MATTERS:</strong>
                  {activeHelp.why}
                </div>
                <div>
                  <strong className="text-white block mb-0.5 font-semibold">BEST PRACTICES (SOP):</strong>
                  {activeHelp.sop}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#2A3A52]">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-1.5 bg-[#0B1220] border border-[#2A3A52] rounded text-[#9CA3AF] hover:text-white transition cursor-pointer font-bold"
              >
                DISMISS
              </button>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
