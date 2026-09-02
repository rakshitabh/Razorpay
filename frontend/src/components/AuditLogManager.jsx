import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Shield } from 'lucide-react';

export default function AuditLogManager({ token }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        action: actionFilter
      }).toString();

      const res = await fetch(`/api/audit-logs?${query}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data || []);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [actionFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAuditLogs();
  };

  const getResultBadge = (res) => {
    if (res === 'success') return 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30';
    return 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white font-mono flex items-center">
            <Shield className="w-5 h-5 mr-2 text-[#2563EB]" /> SECURITY_AUDIT_TRAILS
          </h1>
          <p className="text-xs text-slate-400 mt-1">Immutable ledger tracking auth events, incident creations, closures, and playbook executions.</p>
        </div>
        <button 
          onClick={fetchAuditLogs} 
          disabled={loading}
          className="flex items-center space-x-1 border border-slate-800 bg-[#111827] hover:bg-slate-800 text-xs font-mono text-slate-300 px-3 py-1.5 rounded active:scale-95 transition disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>REFRESH</span>
        </button>
      </div>

      {/* FILTER PANEL */}
      <form onSubmit={handleSearchSubmit} className="bg-[#111827] border border-slate-800/80 p-4 rounded-lg flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by action, analyst username, or IP address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#0F172A] border border-slate-800 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2563EB] transition font-mono"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-[#0F172A] border border-slate-800 rounded px-3 py-2 text-xs text-slate-300 focus:outline-none font-mono focus:border-[#2563EB] w-full md:w-56"
          >
            <option value="">All Actions</option>
            <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
            <option value="LOGIN_FAILED">LOGIN_FAILED</option>
            <option value="LOGOUT">LOGOUT</option>
            <option value="PASSWORD_CHANGE">PASSWORD_CHANGE</option>
            <option value="INCIDENT_CREATED">INCIDENT_CREATED</option>
            <option value="INCIDENT_UPDATED">INCIDENT_UPDATED</option>
            <option value="INCIDENT_CLOSED">INCIDENT_CLOSED</option>
            <option value="REPORT_GENERATED">REPORT_GENERATED</option>
            <option value="ACCOUNT_DELETED">ACCOUNT_DELETED</option>
          </select>

          <button
            type="submit"
            className="bg-[#2563EB] hover:bg-[#2563EB]/85 transition text-xs font-mono text-white px-4 py-2 rounded font-semibold cursor-pointer"
          >
            SEARCH
          </button>
        </div>
      </form>

      {/* AUDIT LOG TABLE */}
      <div className="bg-[#111827] border border-slate-800/80 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Action</th>
                <th className="p-4">Operator / User</th>
                <th className="p-4">Source IP</th>
                <th className="p-4">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-500 font-mono">
                    {loading ? 'Reading audit logs...' : '[-] NO_AUDIT_LOGS_AVAILABLE'}
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={log._id || idx} className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-4 font-mono text-[11px] text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-white font-bold tracking-wide">
                      {log.action}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-300">
                      {log.user}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-400">
                      {log.ipAddress}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase ${getResultBadge(log.result)}`}>
                        {log.result}
                      </span>
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
