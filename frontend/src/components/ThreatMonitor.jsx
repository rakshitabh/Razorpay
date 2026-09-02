import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, AlertTriangle, Eye, ShieldCheck, Info, FileSpreadsheet, Layers } from 'lucide-react';
import { triggerNotification } from './NotificationCenter';

export default function ThreatMonitor({ token, onSelectIncident, mode, onNavigateToTab, onOpenDemoLauncher }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bulkActionActive, setBulkActionActive] = useState(false);
  
  // Filters
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        severity,
        status,
        mode,
        assignedTo
      }).toString();

      const res = await fetch(`/api/threats?${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIncidents(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [severity, status, mode, assignedTo]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchIncidents();
  };

  const getSeverityBadge = (sev) => {
    const s = (sev || '').toLowerCase();
    if (s === 'critical') return 'bg-[#DC2626]/20 text-[#DC2626] border border-[#DC2626]/30 font-bold';
    if (s === 'high') return 'bg-[#F97316]/20 text-[#F97316] border border-[#F97316]/30 font-bold';
    if (s === 'medium') return 'bg-[#EAB308]/20 text-[#EAB308] border border-[#EAB308]/30';
    return 'bg-slate-800 text-slate-400 border border-slate-700';
  };

  const getStatusBadge = (st) => {
    const s = (st || '').toLowerCase();
    if (s === 'open') return 'text-white border border-slate-700 bg-slate-800';
    if (s === 'investigating') return 'text-[#06B6D4] border border-[#06B6D4]/30 bg-[#06B6D4]/10';
    if (s === 'mitigated') return 'text-[#10B981] border border-[#10B981]/30 bg-[#10B981]/10';
    return 'text-slate-500 border border-slate-800 bg-slate-900';
  };

  const handleExportCSV = () => {
    try {
      const headers = ['IncidentID', 'Title', 'Severity', 'Status', 'RiskScore', 'Source', 'Target', 'CreatedTime'];
      const rows = incidents.map(inc => [
        inc.incidentId,
        inc.title,
        inc.severity,
        inc.status,
        inc.riskScore,
        inc.sourceIp,
        inc.targetSystem,
        new Date(inc.createdAt).toLocaleString()
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Risk_Intelligence_Export_${mode}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      triggerNotification('CSV Exported', 'success', 'Telemetry summary ledger downloaded successfully.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkMitigate = async () => {
    setBulkActionActive(true);
    try {
      // Simulate bulk action delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const openIncidents = incidents.filter(i => i.status === 'Open' || i.status === 'Investigating');
      for (const inc of openIncidents) {
        await fetch(`/api/threats/${inc._id || inc.incidentId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'Mitigated' })
        });
      }
      
      await fetchIncidents();
      triggerNotification('Bulk Resolve Complete', 'success', `Mitigated all active ${mode} incidents.`);
    } catch (err) {
      console.error(err);
    } finally {
      setBulkActionActive(false);
    }
  };

  const isFintech = mode === 'fintech';

  return (
    <div className="space-y-6 text-left font-mono text-xs">
      
      {/* Header title bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-[#DC2626]" /> 
            {isFintech ? 'FRAUD_CASES_REGISTRY' : 'SECURITY_INCIDENT_REGISTRY'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isFintech 
              ? 'Aggregate ledger of card testing, velocity anomalies, and UPI fraud flags.'
              : 'Review infrastructure scans, credential stuffing, and brute force intrusions.'
            }
          </p>
        </div>

        {/* Executive Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleBulkMitigate}
            disabled={loading || bulkActionActive || incidents.length === 0}
            className="flex items-center space-x-1.5 border border-slate-800 bg-[#111827] hover:bg-slate-850 text-slate-350 px-3.5 py-2 rounded transition cursor-pointer disabled:opacity-40"
          >
            {bulkActionActive ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Layers className="w-3.5 h-3.5" />
                <span>RESOLVE ALL</span>
              </>
            )}
          </button>
          
          <button
            onClick={fetchIncidents}
            disabled={loading}
            className="flex items-center space-x-1.5 border border-slate-800 bg-[#111827] hover:bg-slate-850 text-slate-350 px-3.5 py-2 rounded transition cursor-pointer disabled:opacity-40"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#38BDF8]' : ''}`} />
          </button>
          
          <button
            onClick={handleExportCSV}
            disabled={incidents.length === 0}
            className="flex items-center space-x-1.5 bg-[#06B6D4] hover:bg-[#06B6D4]/80 text-[#0F172A] px-3.5 py-2 rounded font-bold transition cursor-pointer disabled:opacity-40"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>

      {/* Query Filters */}
      <form onSubmit={handleSearchSubmit} className="bg-[#111827] border border-slate-800 p-4 rounded-lg flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder={isFintech ? "Search by cardholder name, order ID, or device..." : "Search by IP address, target server node, or path..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#0F172A] border border-slate-800 rounded text-xs text-white placeholder-slate-650 focus:outline-none focus:border-[#06B6D4] transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto select-none">
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="bg-[#0F172A] border border-slate-800 rounded px-3 py-2 text-[#06B6D4] font-bold focus:outline-none focus:border-[#06B6D4] w-full md:w-36 cursor-pointer"
          >
            <option value="">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-[#0F172A] border border-slate-800 rounded px-3 py-2 text-[#06B6D4] font-bold focus:outline-none focus:border-[#06B6D4] w-full md:w-36 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Investigating">Investigating</option>
            <option value="Mitigated">Mitigated</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="bg-[#0F172A] border border-slate-800 rounded px-3 py-2 text-[#06B6D4] font-bold focus:outline-none focus:border-[#06B6D4] w-full md:w-36 cursor-pointer text-xs"
          >
            <option value="">All Analysts</option>
            <option value="Unassigned">Unassigned</option>
            <option value="Rakshita Bhat">Rakshita Bhat</option>
            <option value="Risk Lead">Risk Lead</option>
            <option value="Compliance Lead">Compliance Lead</option>
            <option value="Security Admin">Security Admin</option>
          </select>

          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-350 px-4 py-2 rounded font-semibold transition cursor-pointer"
          >
            QUERY
          </button>
        </div>
      </form>

      {/* Incident table display */}
      <div id="incident-registry-table" className="bg-[#111827] border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-[9px] text-slate-400 uppercase tracking-wider font-bold select-none">
                <th className="p-4">Incident ID</th>
                <th className="p-4">Tactic / Category</th>
                <th className="p-4 flex items-center space-x-1">
                  <span>Severity</span>
                  <div className="group relative cursor-help">
                    <Info className="w-3 h-3 text-slate-500" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-[#1F2937] border border-slate-800 text-[8px] p-1.5 rounded w-36 shadow-lg z-50 text-center normal-case">
                      Impact level based on asset threat potential.
                    </span>
                  </div>
                </th>
                <th className="p-4">Status</th>
                <th className="p-4">Risk Score</th>
                {isFintech ? (
                  <>
                    <th className="p-4">Financial Impact</th>
                    <th className="p-4">Merchant Target</th>
                  </>
                ) : (
                  <>
                    <th className="p-4">Source IP</th>
                    <th className="p-4">Target Server</th>
                  </>
                )}
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan={isFintech ? 8 : 7} className="p-12 text-center text-slate-350">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <ShieldCheck className="w-9 h-9 text-[#10B981]/50" />
                      <div className="space-y-2">
                        <span className="text-white block font-bold text-xs uppercase">No incidents recorded in current ledger</span>
                        <span className="text-[10px] text-slate-400 block max-w-sm mx-auto leading-normal">
                          The active telemetry pipeline has not flagged any risk anomalies. Upload telemetry logs or launch simulated scenarios to test active triggers.
                        </span>
                        <div className="flex items-center justify-center space-x-3 pt-2">
                          <button
                            type="button"
                            onClick={onOpenDemoLauncher}
                            className="bg-[#38BDF8] hover:bg-[#38BDF8]/80 text-[#0B1220] px-4 py-1.5 rounded font-sans font-bold transition text-[9px] cursor-pointer"
                          >
                            RUN DEMO SIMULATOR
                          </button>
                          <button
                            type="button"
                            onClick={() => onNavigateToTab('ingestion')}
                            className="bg-slate-900 border border-[#2A3A52] hover:bg-[#1B263B] text-white px-4 py-1.5 rounded font-sans font-bold transition text-[9px] cursor-pointer"
                          >
                            UPLOAD DATA
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => (
                  <tr key={inc._id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="p-4 font-bold text-white">{inc.incidentId}</td>
                    <td className="p-4 text-slate-350">{inc.title}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[8px] uppercase ${getSeverityBadge(inc.severity)}`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[8px] uppercase ${getStatusBadge(inc.status)}`}>
                        {inc.status}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-[#DC2626]">
                      {inc.riskScore} / 100
                    </td>
                    {isFintech ? (
                      <>
                        <td className="p-4 text-white font-semibold">
                          ₹ {(inc.financialImpact || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-4 text-slate-400 truncate max-w-[120px]">{inc.targetSystem}</td>
                      </>
                    ) : (
                      <>
                        <td className="p-4 text-slate-400">{inc.sourceIp}</td>
                        <td className="p-4 text-slate-400 truncate max-w-[120px]">{inc.targetSystem}</td>
                      </>
                    )}
                    <td className="p-4 text-right">
                      <button
                        onClick={() => onSelectIncident(inc.incidentId || inc._id)}
                        className="inline-flex items-center space-x-1 border border-slate-800 bg-slate-900 hover:bg-slate-850 text-[10px] text-white px-2 py-1 rounded cursor-pointer transition"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1 text-[#06B6D4]" />
                        <span>INSPECT</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
