import React from 'react';
import { 
  Shield, 
  LayoutDashboard, 
  Terminal, 
  AlertTriangle, 
  Search, 
  FileText, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Globe,
  BrainCircuit,
  Workflow,
  ShieldAlert,
  UploadCloud
} from 'lucide-react';

export default function Sidebar({ 
  user, 
  activeTab, 
  setActiveTab, 
  onLogout, 
  sidebarOpen, 
  setSidebarOpen,
  mode,
  setMode 
}) {
  const isViewer = user && user.role === 'viewer';
  const isAdmin = user && user.role === 'admin';
  const isFintech = mode === 'fintech';

  const navigationGroups = [
    {
      title: 'Operations',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, role: 'viewer' },
        { id: 'incidents', label: isFintech ? 'Fraud Cases' : 'Incidents', icon: AlertTriangle, role: 'viewer' },
        { id: 'investigations', label: 'Investigations', icon: Search, role: 'viewer' }
      ]
    },
    {
      title: 'Intelligence',
      items: [
        { id: 'threat-intel', label: isFintech ? 'Fraud Intel' : 'Threat Intel', icon: Globe, role: 'viewer' },
        { id: 'event-stream', label: isFintech ? 'Transaction Stream' : 'Event Stream', icon: Terminal, role: 'viewer' }
      ]
    },
    {
      title: 'Data Ingestion',
      items: [
        { id: 'ingestion', label: 'Data Ingestion', icon: UploadCloud, role: 'viewer' }
      ]
    },
    {
      title: 'AI Platform',
      items: [
        { id: 'risk-workbench', label: 'Risk Workbench', icon: Workflow, role: 'viewer' },
        { id: 'ai-architecture', label: 'AI Architecture', icon: BrainCircuit, role: 'viewer' }
      ]
    },
    {
      title: 'Administration',
      items: [
        { id: 'reports', label: 'Reports', icon: FileText, role: 'viewer' },
        { id: 'audit-logs', label: 'Audit Logs', icon: ShieldAlert, role: 'analyst' },
        { id: 'settings', label: 'Settings', icon: Settings, role: 'viewer' }
      ]
    }
  ];

  const filteredGroups = navigationGroups.map(group => {
    const items = group.items.filter(item => {
      if (isViewer && item.role !== 'viewer') return false;
      if (item.role === 'admin' && !isAdmin) return false;
      return true;
    });
    return { ...group, items };
  }).filter(group => group.items.length > 0);

  return (
    <aside className={`bg-[#131C2E] border-r border-[#2A3A52] flex flex-col justify-between transition-all duration-300 relative no-print h-screen shrink-0 overflow-y-auto select-none ${
      sidebarOpen ? 'w-64' : 'w-16'
    }`}>
      
      <div>
        {/* Brand logo area */}
        <div className="flex items-center space-x-3 p-4 border-b border-[#2A3A52] overflow-hidden">
          <div className="w-8 h-8 rounded bg-[#38BDF8]/15 border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8] shrink-0 font-bold">
            <Shield className="w-4.5 h-4.5" />
          </div>
          {sidebarOpen && (
            <div className="transition-opacity duration-300">
              <span className="text-[11px] font-bold font-sans tracking-wider text-white">RISK_INTEL // WORKSTATION</span>
            </div>
          )}
        </div>

        {/* Mode Switcher selector */}
        {sidebarOpen && (
          <div className="p-3 border-b border-[#2A3A52] bg-[#1B263B]/25">
            <label className="block text-[8px] font-bold font-sans text-[#9CA3AF] uppercase tracking-widest mb-1.5 px-1">
              OPERATIONAL MODE
            </label>
            <select
              value={mode}
              onChange={(e) => {
                setMode(e.target.value);
                localStorage.setItem('soc_mode', e.target.value);
              }}
              className="w-full bg-[#0B1220] border border-[#2A3A52] rounded px-2.5 py-1.5 text-[10px] font-sans text-[#38BDF8] font-bold focus:outline-none focus:border-[#38BDF8] cursor-pointer transition"
            >
              <option value="security">SECURITY OPERATIONS</option>
              <option value="fintech">FINTECH FRAUD DETECT</option>
            </select>
          </div>
        )}

        {/* Grouped navigation list */}
        <nav className="p-3 space-y-4 mt-2">
          {filteredGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {sidebarOpen ? (
                <span className="block text-[9px] font-bold font-sans text-[#9CA3AF]/60 uppercase tracking-widest px-3 mb-1">
                  {group.title}
                </span>
              ) : (
                <div className="border-t border-[#2A3A52]/60 my-2 mx-2"></div>
              )}

              {group.items.map((item) => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    data-tour={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded text-xs font-sans font-medium tracking-normal border cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'bg-[#38BDF8]/10 text-white border-[#38BDF8]/30 shadow-sm'
                        : 'text-[#9CA3AF] border-transparent hover:text-white hover:bg-[#1B263B]/50'
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {sidebarOpen && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom User status details */}
      <div className="p-3 border-t border-[#2A3A52] shrink-0">
        <div className="flex items-center justify-between">
          {sidebarOpen ? (
            <div className="flex items-center space-x-2 overflow-hidden">
              <button 
                onClick={() => setActiveTab('profile')}
                className="w-6 h-6 rounded-full bg-[#38BDF8]/15 border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8] shrink-0 font-sans font-bold text-[10px] hover:bg-[#38BDF8]/35 transition cursor-pointer"
              >
                {user?.name?.substring(0, 1).toUpperCase()}
              </button>
              <div className="flex flex-col text-[10px] font-sans leading-tight">
                <span className="text-white font-semibold truncate max-w-[120px]">{user?.name}</span>
                <span className="text-[#9CA3AF] uppercase text-[8px]">{user?.role}</span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('profile')}
              className="w-6 h-6 rounded-full bg-[#38BDF8]/15 border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8] shrink-0 font-sans font-bold text-[10px] hover:bg-[#38BDF8]/35 transition cursor-pointer mx-auto"
            >
              {user?.name?.substring(0, 1).toUpperCase()}
            </button>
          )}
          
          {sidebarOpen && (
            <button
              onClick={onLogout}
              title="Log Out Session"
              className="p-2 text-[#9CA3AF] hover:text-[#EF4444] transition cursor-pointer rounded hover:bg-[#1B263B]/40"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sidebar Collapse Toggle Trigger button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute -right-3 top-5 w-6 h-6 rounded-full bg-[#0B1220] border border-[#2A3A52] text-[#9CA3AF] hover:text-white flex items-center justify-center cursor-pointer transition shadow z-10 hover:border-[#38BDF8]"
      >
        {sidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>
    </aside>
  );
}
