import React, { useState } from 'react';
import { Sliders, ToggleLeft, ToggleRight, Edit3, Plus, Search, Shield, Info, Check, HelpCircle } from 'lucide-react';

const INITIAL_RULES = [
  {
    id: 'rule-1',
    name: 'Brute Force Attack Detector',
    severity: 'High',
    triggerLogic: 'Failed logins >= 10 from single IP in 5 minutes',
    mitreMapping: 'T1110 (Brute Force)',
    lastTriggered: '10 minutes ago',
    status: true,
    count: 14
  },
  {
    id: 'rule-2',
    name: 'Credential Stuffing Anomaly',
    severity: 'Critical',
    triggerLogic: 'Failed logins from single IP across multiple usernames',
    mitreMapping: 'T1110.004 (Credential Stuffing)',
    lastTriggered: '1 hour ago',
    status: true,
    count: 3
  },
  {
    id: 'rule-3',
    name: 'Gateway Port Probing',
    severity: 'Medium',
    triggerLogic: 'Connection requests to >= 5 distinct restricted ports',
    mitreMapping: 'T1046 (Network Service Scanning)',
    lastTriggered: '1 day ago',
    status: true,
    count: 27
  },
  {
    id: 'rule-4',
    name: 'Directory Traversal Attempt',
    severity: 'High',
    triggerLogic: 'Syslog matching restricted directory traversal patterns',
    mitreMapping: 'T1505 (Server Software Component)',
    lastTriggered: 'Never',
    status: false,
    count: 0
  }
];

export default function DetectionRules() {
  const [rules, setRules] = useState(INITIAL_RULES);
  const [search, setSearch] = useState('');
  
  // Rule Editor modal state
  const [editingRule, setEditingRule] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [editedSeverity, setEditedSeverity] = useState('Medium');
  const [editedLogic, setEditedLogic] = useState('');
  
  const handleToggle = (id) => {
    setRules(rules.map(r => r.id === id ? { ...r, status: !r.status } : r));
  };

  const handleEditClick = (rule) => {
    setEditingRule(rule);
    setEditedName(rule.name);
    setEditedSeverity(rule.severity);
    setEditedLogic(rule.triggerLogic);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingRule) return;

    setRules(rules.map(r => r.id === editingRule.id ? {
      ...r,
      name: editedName,
      severity: editedSeverity,
      triggerLogic: editedLogic
    } : r));

    setEditingRule(null);
  };

  const filteredRules = rules.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.mitreMapping.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner and Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white font-mono flex items-center">
            <Sliders className="w-5 h-5 mr-2 text-[#2563EB]" /> SYSTEM_DETECTION_RULES
          </h1>
          <p className="text-xs text-slate-400 mt-1">Configure correlation engine signature filters and align alerts with the MITRE ATT&CK framework.</p>
        </div>
        <button
          onClick={() => alert('Visual Custom Rule Builder is locked for Admin Tier Integration.')}
          className="bg-[#2563EB] hover:bg-[#2563EB]/85 transition text-xs font-mono text-white px-3.5 py-2 rounded font-semibold cursor-pointer flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>CREATE RULE</span>
        </button>
      </div>

      {/* Search Header */}
      <div className="bg-[#111827] border border-slate-800 p-4 rounded-lg flex items-center justify-between">
        <div className="relative flex-1 max-w-md font-mono text-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search rules by name, tactic, or MITRE technique..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded pl-9 pr-3 py-2 text-white placeholder-slate-650 focus:outline-none focus:border-[#2563EB] transition"
          />
        </div>
        <div className="hidden md:flex items-center space-x-4 text-[10px] font-mono text-slate-500">
          <span>Active Rules: {rules.filter(r => r.status).length}</span>
          <span>•</span>
          <span>Total Triggers (24h): {rules.reduce((acc, r) => acc + r.count, 0)}</span>
        </div>
      </div>

      {/* Rules Registry Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px] bg-slate-900/40">
                <th className="py-3 px-4">Rule Name</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Correlation Logic</th>
                <th className="py-3 px-4">MITRE Mapping</th>
                <th className="py-3 px-4">Last Trigger</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRules.map((rule) => (
                <tr key={rule.id} className="border-b border-slate-800/40 hover:bg-slate-800/20 transition">
                  <td className="py-4 px-4 font-semibold text-white">
                    <div className="flex flex-col">
                      <span>{rule.name}</span>
                      <span className="text-[9px] text-slate-500 mt-0.5">Triggers: {rule.count}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                      rule.severity === 'Critical' ? 'bg-[#DC2626]/20 text-[#DC2626] border border-[#DC2626]/30' :
                      rule.severity === 'High' ? 'bg-[#EF4444]/20 text-[#EF4444]' :
                      rule.severity === 'Medium' ? 'bg-[#F59E0B]/20 text-[#F59E0B]' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {rule.severity}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-400 max-w-xs truncate" title={rule.triggerLogic}>
                    {rule.triggerLogic}
                  </td>
                  <td className="py-4 px-4 text-[#06B6D4] font-semibold">
                    {rule.mitreMapping}
                  </td>
                  <td className="py-4 px-4 text-slate-500">
                    {rule.lastTriggered}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => handleToggle(rule.id)}
                      className="cursor-pointer text-slate-400 hover:text-white transition"
                    >
                      {rule.status ? (
                        <ToggleRight className="w-6 h-6 text-[#10B981]" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-slate-600" />
                      )}
                    </button>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleEditClick(rule)}
                      className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
                      title="Modify Correlation Rule"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Rule Editor Modal */}
      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-slate-800 p-6 rounded-lg max-w-md w-full font-mono text-xs text-left shadow-xl space-y-4">
            
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase flex items-center">
                <Shield className="w-4.5 h-4.5 mr-2 text-[#2563EB]" /> Edit Detection Rule
              </h3>
              <button 
                onClick={() => setEditingRule(null)}
                className="text-slate-500 hover:text-white transition cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[9px] text-slate-400 uppercase">Rule Display Name</label>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] text-slate-400 uppercase">Correlation Target Severity</label>
                <select
                  value={editedSeverity}
                  onChange={(e) => setEditedSeverity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-300 focus:outline-none focus:border-[#2563EB] cursor-pointer"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] text-slate-400 uppercase">Trigger Threshold Expression</label>
                <textarea
                  value={editedLogic}
                  onChange={(e) => setEditedLogic(e.target.value)}
                  rows="3"
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-slate-400 hover:text-white transition cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#2563EB] hover:bg-[#2563EB]/85 text-white rounded font-semibold transition cursor-pointer flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>SAVE_CHANGES</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
