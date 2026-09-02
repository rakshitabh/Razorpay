import React, { useState } from 'react';
import { Shield, Cpu, RefreshCw, BarChart3, Database, FileText, ArrowRight, HelpCircle, Server } from 'lucide-react';

export default function LandingPage({ onNavigateToAuth }) {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="bg-[#0F172A] text-slate-100 min-h-screen font-sans selection:bg-[#2563EB]/40 selection:text-white">
      {/* 1. NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-[#111827]/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="bg-[#2563EB]/15 p-2 rounded border border-[#2563EB]/35">
              <Shield className="w-5 h-5 text-[#2563EB]" />
            </div>
            <span className="font-mono text-sm font-bold tracking-wider text-white">AI_SOC // SECURE_OPS</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition">Product</a>
            <a href="#workflow" className="hover:text-white transition">Workflow</a>
            <a href="#architecture" className="hover:text-white transition">Architecture</a>
            <span className="text-slate-600 cursor-not-allowed select-none">Pricing <span className="text-[9px] font-mono border border-slate-700 px-1 rounded">SOON</span></span>
            <a href="#faq" className="hover:text-white transition">FAQs</a>
          </nav>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => onNavigateToAuth && onNavigateToAuth('login')}
              className="text-xs font-semibold text-slate-400 hover:text-white transition font-mono px-3 py-1.5 cursor-pointer"
            >
              LOGIN
            </button>
            <button 
              onClick={() => onNavigateToAuth && onNavigateToAuth('register')}
              className="bg-[#2563EB] hover:bg-[#2563EB]/85 active:scale-95 transition text-xs font-mono text-white font-semibold px-4 py-2 rounded cursor-pointer"
            >
              GET_STARTED
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-24 border-b border-slate-800/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2563EB]/10 via-transparent to-transparent opacity-60"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-[#2563EB]/10 border border-[#2563EB]/30 rounded-full px-3 py-1 text-[10px] font-mono text-[#2563EB] uppercase tracking-wider">
            <span>[+] v2.0 Enterprise Release</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight font-mono">
            AI-Powered Security Operations Center
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Detect, investigate and respond to security incidents using intelligent agents and real-time telemetry. Continuous event correlation engineered for corporate defense.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={() => onNavigateToAuth && onNavigateToAuth('register')}
              className="flex items-center justify-center space-x-2 bg-[#2563EB] hover:bg-[#2563EB]/85 transition text-xs font-semibold font-mono text-white px-6 py-3 rounded w-full sm:w-auto shadow-lg shadow-[#2563EB]/15 cursor-pointer"
            >
              <span>GET STARTED NOW</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <a 
              href="#architecture"
              className="flex items-center justify-center space-x-2 border border-slate-700 bg-slate-800/20 hover:bg-slate-800/50 transition text-xs font-semibold font-mono text-slate-300 px-6 py-3 rounded w-full sm:w-auto cursor-pointer"
            >
              <span>VIEW ARCHITECTURE</span>
            </a>
          </div>
        </div>
      </section>

      {/* 3. PRODUCT WORKFLOW DIAGRAM */}
      <section id="workflow" className="py-20 max-w-7xl mx-auto px-6 border-b border-slate-800/50">
        <h2 className="text-xl font-bold text-center text-white tracking-wide font-mono uppercase mb-12">
          System Core Pipeline Workflow
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 relative">
          {[
            { step: '01', title: 'Data Sources', desc: 'Ingest firewall logs, server logins, API streams manually or using background event generator.', icon: Server },
            { step: '02', title: 'Rule Engine', desc: 'Continuous correlation parsing for scans, brute force attempts, stuffing, and traversal flags.', icon: Cpu },
            { step: '03', title: 'Incident Engine', desc: 'Groups correlated alerts into structured INC-xxxx incident tickets ready for analysis.', icon: Shield },
            { step: '04', title: 'AI Investigation', desc: 'Gemini Agent audits log context, behavior patterns, and determines root cause automatically.', icon: Cpu },
            { step: '05', title: 'Reports & Actions', desc: 'Export PDF summaries, markdown checklists, and trigger containment containment scripts.', icon: FileText }
          ].map((w, idx) => {
            const Icon = w.icon;
            return (
              <div key={idx} className="bg-[#111827] border border-slate-800/60 p-6 rounded relative hover:border-slate-700 transition">
                <div className="absolute top-4 right-4 text-xs font-mono text-[#2563EB]/40 font-bold">{w.step}</div>
                <div className="bg-[#2563EB]/10 w-9 h-9 rounded flex items-center justify-center border border-[#2563EB]/20 mb-4">
                  <Icon className="w-4 h-4 text-[#2563EB]" />
                </div>
                <h3 className="text-sm font-semibold text-white font-mono">{w.title}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{w.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. FEATURES GRID */}
      <section id="features" className="py-20 bg-[#111827]/40 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto space-y-3 mb-16">
            <h2 className="text-2xl font-bold text-white tracking-tight font-mono">SOC Automation Capabilities</h2>
            <p className="text-xs text-slate-400">Multi-agent architecture crafted to accelerate incident containment.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#111827] border border-slate-800 p-6 rounded space-y-4">
              <Cpu className="w-6 h-6 text-[#2563EB]" />
              <h3 className="text-sm font-bold text-white font-mono">1. Parser Agent</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cleanses unstructured CLI and application syslog streams into indexed JSON objects mapping ports, operations, and protocol actions.
              </p>
            </div>
            <div className="bg-[#111827] border border-slate-800 p-6 rounded space-y-4">
              <Shield className="w-6 h-6 text-[#10B981]" />
              <h3 className="text-sm font-bold text-white font-mono">2. Detection Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Executes correlation logic detecting brute force password guessing, credential stuffing profiles, port probes, and restricted URL scans.
              </p>
            </div>
            <div className="bg-[#111827] border border-slate-800 p-6 rounded space-y-4">
              <RefreshCw className="w-6 h-6 text-[#F59E0B]" />
              <h3 className="text-sm font-bold text-white font-mono">3. Agentic Investigation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Gemini processes parsed contexts to identify the likely root cause, attacker profiles, affected systems, and confidence ratings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ARCHITECTURE SECTION */}
      <section id="architecture" className="py-20 max-w-7xl mx-auto px-6 border-b border-slate-800/50">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex bg-[#2563EB]/15 text-[#2563EB] text-[10px] font-mono px-3 py-1 rounded border border-[#2563EB]/35">
              SYSTEM_SCHEMA // SECURE_FLOW
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">How the Platform Works</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              When log data is uploaded (Source A) or dynamically streamed (Source B), the parser sanitizes the payload into the database. 
              The Rule Engine continuously scans these logs for threat configurations, spawning incidents immediately. 
              The AI Core calls Gemini APIs to perform audits, generating mitigation plans, playbooks, and incidents summaries.
            </p>
            <ul className="space-y-3 text-xs text-slate-300 font-mono">
              <li className="flex items-center"><Database className="w-3.5 h-3.5 text-[#2563EB] mr-2" /> MongoDB Atlas persistent data storage</li>
              <li className="flex items-center"><Cpu className="w-3.5 h-3.5 text-[#10B981] mr-2" /> Google Gemini API model reasoning</li>
              <li className="flex items-center"><Shield className="w-3.5 h-3.5 text-[#EF4444] mr-2" /> Strict RBAC user access control</li>
            </ul>
          </div>
          
          {/* Interactive SVG Diagram */}
          <div className="bg-[#111827] border border-slate-800 p-8 rounded-lg relative overflow-hidden flex justify-center">
            <svg width="400" height="260" viewBox="0 0 400 260" className="w-full h-auto text-slate-500 font-mono">
              <rect x="10" y="20" width="80" height="50" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1"/>
              <text x="50" y="50" fill="#94a3b8" fontSize="9" textAnchor="middle">Log Streams</text>

              <line x1="90" y1="45" x2="140" y2="45" stroke="#334155" strokeWidth="2" strokeDasharray="3,3"/>
              
              <rect x="140" y="20" width="100" height="50" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1"/>
              <text x="190" y="45" fill="#94a3b8" fontSize="9" textAnchor="middle">Rule Engine</text>
              <text x="190" y="58" fill="#10B981" fontSize="8" textAnchor="middle">[Detections]</text>

              <line x1="240" y1="45" x2="290" y2="45" stroke="#334155" strokeWidth="2"/>

              <rect x="290" y="20" width="100" height="50" rx="4" fill="#1e293b" stroke="#2563EB" strokeWidth="1.5"/>
              <text x="340" y="45" fill="#ffffff" fontSize="9" textAnchor="middle">Incident (INC)</text>
              <text x="340" y="58" fill="#2563EB" fontSize="8" textAnchor="middle">[Database]</text>

              {/* Arrow down to AI */}
              <path d="M 340 70 L 340 130" stroke="#334155" strokeWidth="2" fill="none"/>
              
              <rect x="290" y="130" width="100" height="50" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1"/>
              <text x="340" y="155" fill="#94a3b8" fontSize="9" textAnchor="middle">AI Agent</text>
              <text x="340" y="168" fill="#94a3b8" fontSize="8" textAnchor="middle">Gemini Flash</text>

              <line x1="290" y1="155" x2="220" y2="155" stroke="#334155" strokeWidth="2"/>

              <rect x="110" y="130" width="110" height="50" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1"/>
              <text x="165" y="155" fill="#94a3b8" fontSize="9" textAnchor="middle">Mitigation Plan</text>
              <text x="165" y="168" fill="#F59E0B" fontSize="8" textAnchor="middle">[Containment]</text>

              <path d="M 165 180 L 165 210 L 10 210" stroke="#334155" strokeWidth="1.5" fill="none" strokeDasharray="2,2"/>
              <text x="250" y="225" fill="#475569" fontSize="8">Continuously Correlated Telemetry Loop</text>
            </svg>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-6">
        <h2 className="text-xl font-bold text-center text-white tracking-wide font-mono uppercase mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {[
            { q: "How does the Live Event Generator work?", a: "Source B simulates active log traffic. Once toggled inside the settings panel, the scheduler generates simulated network transactions, blocked requests, and ssh failures every 10 seconds to show real-time agent responses." },
            { q: "Is the Gemini status checks dynamic?", a: "Yes. The top navigation bar probes the backend directly. The service runs a lightweight handshake against Google's API to confirm connectivity, reporting 'Online' and the model version dynamically." },
            { q: "What does Cascade Deletion clear?", a: "To safeguard privacy, deleting an account clears all user references, saved notes, reports history, and security executions records from MongoDB. A confirmation password is required to execute." }
          ].map((f, idx) => (
            <div key={idx} className="bg-[#111827] border border-slate-800 rounded overflow-hidden transition">
              <button 
                onClick={() => toggleFaq(idx)}
                className="w-full text-left px-6 py-4 flex items-center justify-between text-xs font-semibold font-mono tracking-wide text-white hover:bg-slate-800/30 transition cursor-pointer"
              >
                <span>{f.q}</span>
                <HelpCircle className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
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

      {/* 7. FOOTER */}
      <footer className="border-t border-slate-800 bg-[#111827] py-12 text-center text-[10px] text-slate-500 font-mono tracking-wider space-y-4">
        <div>
          © 2026 AI_SOC INC. ALL SYSTEMS SECURE.
        </div>
        <div className="flex justify-center space-x-6">
          <a href="#" className="hover:text-slate-300">Privacy Policy</a>
          <a href="#" className="hover:text-slate-300">Terms of Service</a>
          <a href="#" className="hover:text-slate-300">Contact Support</a>
        </div>
      </footer>
    </div>
  );
}
