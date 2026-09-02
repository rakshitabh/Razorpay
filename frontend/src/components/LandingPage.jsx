import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Cpu, 
  RefreshCw, 
  BarChart3, 
  Database, 
  FileText, 
  ArrowRight, 
  HelpCircle, 
  Server, 
  Zap, 
  Activity, 
  Lock, 
  Radio, 
  CheckCircle2, 
  Terminal,
  ShieldCheck,
  Flame
} from 'lucide-react';

const LIVE_EVENTS_FEED = [
  { id: 1, time: '10:42:15', type: 'BRUTE_FORCE', target: 'auth.gateway:22', status: 'Blocked', ip: '194.26.29.112' },
  { id: 2, time: '10:42:18', type: 'CRED_STUFFING', target: 'api.razorpay/v1/auth', status: 'Correlated (INC-4810)', ip: '45.154.255.89' },
  { id: 3, time: '10:42:21', type: 'PORT_SWEEP', target: 'vpc-internal-10.0.4.1', status: 'Flagged', ip: '185.220.101.5' },
  { id: 4, time: '10:42:25', type: 'SQL_INJECTION', target: 'checkout/orders', status: 'Mitigated (WAF)', ip: '103.251.167.20' }
];

export default function LandingPage({ onNavigateToAuth }) {
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeLogIdx, setActiveLogIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveLogIdx(prev => (prev + 1) % LIVE_EVENTS_FEED.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="bg-[#0F172A] text-slate-100 min-h-screen font-sans selection:bg-[#38BDF8]/40 selection:text-white relative overflow-hidden">
      
      {/* Dynamic Animated Ambient Background */}
      <div className="absolute inset-0 cyber-grid-animate opacity-40 pointer-events-none"></div>
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-[#38BDF8]/15 via-[#0284C7]/5 to-transparent rounded-full blur-3xl pointer-events-none animate-beam"></div>

      {/* 1. NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-[#0F172A]/85 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#38BDF8]/25 to-[#0284C7]/20 border border-[#38BDF8]/50 flex items-center justify-center text-[#38BDF8] shadow-lg shadow-[#38BDF8]/20">
                <Shield className="w-5 h-5" />
              </div>
              <div className="absolute inset-0 rounded-lg bg-[#38BDF8] animate-pulse-ring pointer-events-none"></div>
            </div>
            <div>
              <span className="font-sans text-base font-extrabold tracking-wider text-white block leading-none">Aegis</span>
              <span className="font-mono text-[9px] text-[#38BDF8] tracking-widest uppercase block mt-0.5">AI Risk Intelligence</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-medium text-slate-400">
            <a href="#features" className="hover:text-[#38BDF8] transition">Platform</a>
            <a href="#live-demo" className="hover:text-[#38BDF8] transition flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping"></span>
              Live Pipeline
            </a>
            <a href="#workflow" className="hover:text-[#38BDF8] transition">Agent Architecture</a>
            <a href="#faq" className="hover:text-[#38BDF8] transition">FAQs</a>
          </nav>

          {/* Auth Action Buttons */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => onNavigateToAuth && onNavigateToAuth('login')}
              className="text-xs font-semibold text-slate-300 hover:text-white transition font-mono px-3.5 py-1.5 rounded hover:bg-slate-800/60 cursor-pointer"
            >
              SIGN_IN
            </button>
            <button 
              onClick={() => onNavigateToAuth && onNavigateToAuth('register')}
              className="bg-gradient-to-r from-[#38BDF8] to-[#0284C7] hover:from-[#38BDF8]/90 hover:to-[#0284C7]/90 active:scale-95 transition text-xs font-mono text-[#0F172A] font-bold px-4 py-2 rounded shadow-lg shadow-[#38BDF8]/20 cursor-pointer flex items-center gap-1.5"
            >
              <span>ACCESS WORKSTATION</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION WITH ANIMATED TELEMETRY */}
      <section className="relative pt-16 pb-20 border-b border-slate-800/60">
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10 space-y-6">
          
          {/* Top Status Pill */}
          <div className="inline-flex items-center space-x-2 bg-[#38BDF8]/10 border border-[#38BDF8]/30 rounded-full px-4 py-1.5 text-[11px] font-mono text-[#38BDF8] uppercase tracking-wider shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            <span>Aegis Multi-Agent Autonomous Defense Engine</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">v2.4 Production Ready</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans max-w-4xl mx-auto">
            Autonomous AI Risk Intelligence & Threat Defense
          </h1>

          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Ingest raw telemetric syslogs, correlate anomalies across ports and transactions, and deploy Google Gemini agent investigations to isolate cyber threats before impact.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button 
              onClick={() => onNavigateToAuth && onNavigateToAuth('register')}
              className="flex items-center justify-center space-x-2 bg-[#38BDF8] hover:bg-[#38BDF8]/85 transition text-xs font-bold font-mono text-[#0F172A] px-7 py-3 rounded-lg w-full sm:w-auto shadow-xl shadow-[#38BDF8]/20 cursor-pointer group"
            >
              <span>LAUNCH AEGIS WORKSTATION</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a 
              href="#live-demo"
              className="flex items-center justify-center space-x-2 border border-slate-700 bg-[#111827]/80 hover:bg-slate-800/80 transition text-xs font-semibold font-mono text-slate-300 px-6 py-3 rounded-lg w-full sm:w-auto cursor-pointer"
            >
              <Activity className="w-4 h-4 text-[#38BDF8]" />
              <span>INSPECT PIPELINE</span>
            </a>
          </div>

          {/* 3. LIVE INTERACTIVE TELEMETRY SIMULATION DOCK */}
          <div id="live-demo" className="pt-10 max-w-4xl mx-auto text-left">
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-sm">
              
              {/* Terminal Window Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                  <span className="text-[11px] font-mono text-slate-400 font-semibold ml-2 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-[#38BDF8]" />
                    aegis-telemetry-stream // port-443-live
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-[10px] font-mono">
                  <span className="text-slate-500">CORRELATION: <strong className="text-[#10B981]">ONLINE</strong></span>
                  <span className="text-slate-500">GEMINI AGENT: <strong className="text-[#38BDF8]">REASONING</strong></span>
                </div>
              </div>

              {/* Real-time Ticker */}
              <div className="space-y-2 font-mono text-xs">
                {LIVE_EVENTS_FEED.map((event, idx) => {
                  const isActive = idx === activeLogIdx;
                  return (
                    <div 
                      key={event.id}
                      className={`p-2.5 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2 border transition-all duration-300 ${
                        isActive 
                          ? 'bg-[#38BDF8]/10 border-[#38BDF8]/40 shadow-sm text-white' 
                          : 'bg-[#0B1220]/40 border-slate-800/60 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-[10px] text-slate-500">{event.time}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 border border-slate-700 text-[#38BDF8]">
                          {event.type}
                        </span>
                        <span className="text-[11px] text-slate-300 truncate max-w-[200px]">{event.target}</span>
                      </div>

                      <div className="flex items-center space-x-4 text-[10px]">
                        <span className="text-slate-400">SRC: <span className="text-slate-200">{event.ip}</span></span>
                        <span className="px-2 py-0.5 rounded font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {event.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Floating Live Badge Overlays */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-400 gap-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping"></span>
                  <span>Autonomous Ingestion Rate: <strong className="text-white">1,480 EPS</strong></span>
                </div>
                <div>
                  <span>Active Agent: <strong className="text-[#38BDF8]">Parser & Correlation Node</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. KEY METRICS STATS BAR */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 max-w-4xl mx-auto">
            <div className="bg-[#111827] border border-slate-800/80 p-4 rounded-lg text-center hover:border-slate-700 transition">
              <div className="text-2xl font-extrabold text-white font-mono">99.98%</div>
              <div className="text-[10px] text-slate-400 uppercase font-mono mt-1">Correlation Accuracy</div>
            </div>
            <div className="bg-[#111827] border border-slate-800/80 p-4 rounded-lg text-center hover:border-slate-700 transition">
              <div className="text-2xl font-extrabold text-[#38BDF8] font-mono">&lt; 180ms</div>
              <div className="text-[10px] text-slate-400 uppercase font-mono mt-1">AI Root Cause Latency</div>
            </div>
            <div className="bg-[#111827] border border-slate-800/80 p-4 rounded-lg text-center hover:border-slate-700 transition">
              <div className="text-2xl font-extrabold text-[#10B981] font-mono">5 Agents</div>
              <div className="text-[10px] text-slate-400 uppercase font-mono mt-1">Autonomous Cores</div>
            </div>
            <div className="bg-[#111827] border border-slate-800/80 p-4 rounded-lg text-center hover:border-slate-700 transition">
              <div className="text-2xl font-extrabold text-amber-400 font-mono">Zero Trust</div>
              <div className="text-[10px] text-slate-400 uppercase font-mono mt-1">Strict RBAC & Audit</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. AGENT WORKFLOW PIPELINE */}
      <section id="workflow" className="py-20 max-w-7xl mx-auto px-6 border-b border-slate-800/50 relative">
        <div className="text-center max-w-xl mx-auto mb-14 space-y-2">
          <span className="text-[10px] font-mono text-[#38BDF8] uppercase tracking-widest bg-[#38BDF8]/10 px-3 py-1 rounded-full border border-[#38BDF8]/30">
            PIPELINE ORCHESTRATION
          </span>
          <h2 className="text-2xl font-bold text-white tracking-wide font-sans">
            End-to-End Autonomous Incident Lifecycle
          </h2>
          <p className="text-xs text-slate-400">
            From raw telemetric syslog arrival to automated firewall containment and compliance export.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative">
          {[
            { step: '01', title: 'Data Ingestion', desc: 'Manual logs upload (.log, .json, .csv) and dynamic simulated event generation.', icon: Server, color: '#38BDF8' },
            { step: '02', title: 'Parser Agent', desc: 'Sanitizes raw lines into structured JSON with port, timestamp, and signature extraction.', icon: Cpu, color: '#10B981' },
            { step: '03', title: 'Rule Engine', desc: 'Detects brute force (10+ fails), credential stuffing, port scans, and directory traversal.', icon: Flame, color: '#F59E0B' },
            { step: '04', title: 'Gemini AI Agent', desc: 'Deep contextual investigation attributing MITRE techniques, blast radius, and root cause.', icon: Zap, color: '#38BDF8' },
            { step: '05', title: 'Mitigation Plan', desc: 'Auto-executes IP drop playbooks, forces password resets, and compiles audit reports.', icon: ShieldCheck, color: '#22C55E' }
          ].map((w, idx) => {
            const Icon = w.icon;
            return (
              <div 
                key={idx} 
                className="bg-[#111827] border border-slate-800 p-6 rounded-xl relative hover:border-[#38BDF8]/40 hover:-translate-y-1 transition-all duration-300 group shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center border"
                    style={{ backgroundColor: `${w.color}15`, borderColor: `${w.color}35` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: w.color }} />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500 group-hover:text-[#38BDF8] transition">
                    {w.step}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white font-sans">{w.title}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{w.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. CORE PLATFORM CAPABILITIES */}
      <section id="features" className="py-20 bg-[#111827]/30 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto space-y-3 mb-16">
            <h2 className="text-2xl font-bold text-white tracking-tight font-sans">Aegis Core Defense Modules</h2>
            <p className="text-xs text-slate-400">Enterprise security intelligence built for modern threat detection.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#111827] border border-slate-800 p-6 rounded-xl space-y-4 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-lg bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8]">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-sans">Correlation & Detection Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Stateful sliding window algorithms correlate high-frequency authentication failures and transaction flags across distributed endpoints.
              </p>
            </div>

            <div className="bg-[#111827] border border-slate-800 p-6 rounded-xl space-y-4 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-sans">Gemini Flash Reasoning Core</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Processes full log context through multi-shot security reasoning prompt pipelines to determine threat actors, confidence ratings, and blast radius.
              </p>
            </div>

            <div className="bg-[#111827] border border-slate-800 p-6 rounded-xl space-y-4 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-sans">Automated Response Playbooks</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Execute one-click containment: block attacker IP addresses via firewall rules, revoke compromised tokens, and trigger security alerts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-6">
        <h2 className="text-xl font-bold text-center text-white tracking-wide font-sans uppercase mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {[
            { q: "What is Aegis and how does it correlate events?", a: "Aegis is an AI-powered Risk Intelligence and SOC platform. It parses raw application, server, and firewall logs into structured telemetry, running continuous correlation rules (such as brute force, port scans, and credential stuffing) to group suspicious signals into unified incident tickets." },
            { q: "How is Google Gemini integrated into the platform?", a: "When an incident ticket is generated, the Investigation Agent dispatches the full contextual log payload to Google's Gemini Flash model. Gemini correlates historical attack signatures, identifies MITRE ATT&CK techniques, and drafts recommended containment steps." },
            { q: "Can I test the platform without uploading real production logs?", a: "Yes! Aegis comes equipped with a built-in attack simulator and sample data loaders. You can load simulated brute force and stuffing scenarios with a single click in the Data Ingestion and Demo Scenario panels." }
          ].map((f, idx) => (
            <div key={idx} className="bg-[#111827] border border-slate-800 rounded-lg overflow-hidden transition">
              <button 
                onClick={() => toggleFaq(idx)}
                className="w-full text-left px-6 py-4 flex items-center justify-between text-xs font-semibold font-sans tracking-wide text-white hover:bg-slate-800/40 transition cursor-pointer"
              >
                <span>{f.q}</span>
                <HelpCircle className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180 text-[#38BDF8]' : ''}`} />
              </button>
              {activeFaq === idx && (
                <div className="px-6 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/40 pt-3">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="border-t border-slate-800 bg-[#111827] py-10 text-center text-[11px] text-slate-500 font-mono tracking-wider space-y-3">
        <div className="flex items-center justify-center space-x-2 text-slate-400">
          <Shield className="w-4 h-4 text-[#38BDF8]" />
          <span className="font-bold text-white">Aegis AI Risk Intelligence Platform</span>
        </div>
        <div>
          © 2026 Aegis Systems. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
