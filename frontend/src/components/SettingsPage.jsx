import React, { useState, useEffect } from 'react';
import { ToggleLeft, ToggleRight, Server, ShieldAlert, KeyRound, Play, Square, RefreshCw, AlertTriangle } from 'lucide-react';

export default function SettingsPage({ token, onLogout }) {
  const [activeTab, setActiveTab] = useState('api');
  
  // Simulator state
  const [simActive, setSimActive] = useState(false);
  const [togglingSim, setTogglingSim] = useState(false);

  // Health state
  const [health, setHealth] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  // Delete account fields
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const fetchHealthStatus = async () => {
    setLoadingHealth(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHealth(false);
    }
  };

  const fetchSimulatorStatus = async () => {
    try {
      const res = await fetch('/api/simulator/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSimActive(data.active);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHealthStatus();
    fetchSimulatorStatus();
  }, []);

  const handleToggleSimulator = async () => {
    setTogglingSim(true);
    try {
      const res = await fetch('/api/simulator/toggle', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSimActive(data.active);
      }
    } catch (err) {
      alert(`Simulator toggle failed: ${err.message}`);
    } finally {
      setTogglingSim(false);
    }
  };

  const handleDeleteAccountSubmit = async (e) => {
    e.preventDefault();
    if (!confirmPassword) return;

    if (!window.confirm('[WARNING] YOU ARE IN THE DANGER ZONE. Wiping your profile is permanent and cascade deletes all logged notes and reports. Are you sure you wish to proceed?')) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: confirmPassword })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Account successfully deleted.');
        onLogout();
      } else {
        alert(data.message || 'Deletion failed.');
      }
    } catch (err) {
      alert(`Error during account removal: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white font-mono uppercase">SYSTEM_CONFIGURATION_PANEL</h1>
        <p className="text-xs text-slate-400 mt-1">Configure simulator, verify database links, and manage account details.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 flex space-x-6 text-xs font-mono">
        {[
          { id: 'api', label: 'API_INFRASTRUCTURE' },
          { id: 'simulator', label: 'EVENT_SIMULATOR' },
          { id: 'danger', label: 'DANGER_ZONE' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2.5 transition border-b-2 font-bold cursor-pointer ${
              activeTab === tab.id ? 'border-[#2563EB] text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: API */}
      {activeTab === 'api' && (
        <div className="bg-[#111827] border border-slate-800/80 p-6 rounded-lg space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white font-mono flex items-center">
              <Server className="w-4.5 h-4.5 mr-2 text-[#2563EB]" /> Live Node Link Diagnostics
            </h2>
            <button 
              onClick={fetchHealthStatus}
              disabled={loadingHealth}
              className="p-1.5 rounded border border-slate-800 bg-[#0F172A] text-slate-400 hover:text-white transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingHealth ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0F172A] border border-[#2A3A52] p-4 rounded space-y-2">
              <span className="text-[10px] font-mono text-[#9CA3AF] uppercase tracking-wider">Database Status</span>
              <div className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${health?.database === 'connected' ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}></span>
                <span className="text-xs font-mono font-bold text-white">
                  {health ? `MongoDB ${health.database.toUpperCase()}` : 'Querying status...'}
                </span>
              </div>
            </div>
            
            <div className="bg-[#0F172A] border border-[#2A3A52] p-4 rounded space-y-2">
              <span className="text-[10px] font-mono text-[#9CA3AF] uppercase tracking-wider">AI Coprocessor</span>
              <div className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${health?.ai === 'online' ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}></span>
                <span className="text-xs font-mono font-bold text-white">
                  {health ? `Gemini API: ${health.ai.toUpperCase()}` : 'Querying status...'}
                </span>
              </div>
            </div>

            <div className="bg-[#0F172A] border border-[#2A3A52] p-4 rounded space-y-2">
              <span className="text-[10px] font-mono text-[#9CA3AF] uppercase tracking-wider">Platform Version</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-white">
                  {health ? `v${health.version || '1.0.0'}` : '1.0.0'}
                </span>
              </div>
            </div>

            <div className="bg-[#0F172A] border border-[#2A3A52] p-4 rounded space-y-2">
              <span className="text-[10px] font-mono text-[#9CA3AF] uppercase tracking-wider">Environment</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-white uppercase">
                  {health ? health.environment || 'production' : 'production'}
                </span>
              </div>
            </div>
          </div>
          {health?.uptime && (
            <div className="text-[10px] text-slate-400 font-mono mt-2">
              Uptime Reference: <span className="text-[#38BDF8]">{health.uptime}</span>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="bg-[#111827] border border-slate-800/80 p-6 rounded-lg space-y-6">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-white font-mono flex items-center">
              Source B: Live Event Stream Ingestion
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Activate the background simulator to continuously feed brute-force stuffing, port probes, and unrestricted traversal logs to the detection rule engine every 10 seconds. Perfect for demonstrating real-time alert flows.
            </p>
          </div>

          <div className="bg-[#0F172A] border border-slate-800 p-6 rounded-lg flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-white font-mono">Simulator State</span>
              <p className="text-[10px] text-slate-500 font-mono">
                {simActive ? 'STATUS: ACTIVE_FEED_RUNNING' : 'STATUS: SUSPENDED'}
              </p>
            </div>
            <button
              onClick={handleToggleSimulator}
              disabled={togglingSim}
              className={`flex items-center space-x-2 px-4 py-2 rounded text-xs font-semibold font-mono text-white transition active:scale-95 disabled:opacity-50 cursor-pointer ${
                simActive 
                  ? 'border border-[#EF4444] bg-[#EF4444]/15 hover:bg-[#EF4444]/25' 
                  : 'border border-[#10B981] bg-[#10B981]/15 hover:bg-[#10B981]/25'
              }`}
            >
              {simActive ? (
                <>
                  <Square className="w-3.5 h-3.5 mr-1" />
                  <span>SUSPEND_SIMULATION</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 mr-1" />
                  <span>START_SIMULATION</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: DANGER ZONE */}
      {activeTab === 'danger' && (
        <div className="bg-[#111827] border border-[#EF4444]/25 p-6 rounded-lg space-y-6 shadow-sm shadow-[#EF4444]/5">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-white font-mono flex items-center text-[#EF4444]">
              <ShieldAlert className="w-4.5 h-4.5 mr-2" /> Cascade Purge danger Zone
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deleting this account removes your analyst profile, session logs, notes, incident telemetry maps, and reports history completely from Mongoose. **This action cannot be undone.**
            </p>
          </div>

          <form onSubmit={handleDeleteAccountSubmit} className="bg-[#0F172A] border border-slate-800/80 p-6 rounded-lg space-y-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Confirm Your Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="Enter account password..."
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#111827] border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-[#EF4444] transition font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={deleting || !confirmPassword}
              className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded text-xs font-semibold font-mono text-white border border-[#EF4444] bg-[#EF4444]/20 hover:bg-[#EF4444]/35 active:scale-95 transition disabled:opacity-30 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{deleting ? 'DELETING_ACCOUNT...' : 'DELETE_MY_ACCOUNT'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
