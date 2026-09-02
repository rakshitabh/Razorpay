import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, ChevronLeft, ChevronRight, Terminal } from 'lucide-react';

export default function EventStream({ token }) {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Filters state
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');
  const [event, setEvent] = useState('');
  const [ip, setIp] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page,
        limit: 25,
        search,
        severity,
        event,
        ip
      }).toString();

      const res = await fetch(`/api/logs?${query}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotal(data.total || 0);
        setTotalPages(data.pages || 1);
      }
    } catch (err) {
      console.error('Error fetching logs stream:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, severity]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const getSeverityBadge = (sev) => {
    const s = (sev || '').toLowerCase();
    if (s === 'critical') return 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30';
    if (s === 'high') return 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30';
    if (s === 'medium') return 'bg-[#2563EB]/15 text-[#2563EB] border border-[#2563EB]/30';
    return 'bg-slate-800/80 text-slate-400 border border-slate-700/60';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white font-mono flex items-center">
            <Terminal className="w-5 h-5 mr-2 text-[#2563EB]" /> LOG_EVENT_TELEMETRY_STREAM
          </h1>
          <p className="text-xs text-slate-400 mt-1">Real-time application, access, firewall, and intrusion attempt logs.</p>
        </div>
        <button 
          onClick={fetchLogs} 
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
            placeholder="Search raw log payloads or events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#0F172A] border border-slate-800 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2563EB] transition font-mono"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="bg-[#0F172A] border border-slate-800 rounded px-3 py-2 text-xs text-slate-300 focus:outline-none font-mono focus:border-[#2563EB] w-full md:w-40"
          >
            <option value="">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <input
            type="text"
            placeholder="Filter Source IP"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            className="bg-[#0F172A] border border-slate-800 rounded px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-mono focus:border-[#2563EB] w-full md:w-44"
          />

          <button
            type="submit"
            className="bg-[#2563EB] hover:bg-[#2563EB]/85 transition text-xs font-mono text-white px-4 py-2 rounded font-semibold cursor-pointer"
          >
            FILTER
          </button>
        </div>
      </form>

      {/* EVENTS TABLE */}
      <div className="bg-[#111827] border border-slate-800/80 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Source IP</th>
                <th className="p-4">Event Type</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Raw Log Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-500 font-mono">
                    {loading ? 'Ingesting log streams...' : '[-] NO_TELEMETRY_LOGS_AVAILABLE_IN_DB'}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-4 font-mono text-[11px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString()}<br/>
                      <span className="text-[9px] text-slate-600">{new Date(log.timestamp).toLocaleDateString()}</span>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-[#2563EB] font-bold">{log.ip || '127.0.0.1'}</td>
                    <td className="p-4 font-mono font-medium text-white">{log.event || 'System Telemetry'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono ${getSeverityBadge(log.severity)}`}>
                        {log.severity || 'LOW'}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[10px] text-slate-400 truncate max-w-lg" title={log.rawLog}>
                      {log.rawLog}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION PANEL */}
        {totalPages > 1 && (
          <div className="bg-slate-900 border-t border-slate-800 px-6 py-4 flex items-center justify-between font-mono text-xs text-slate-400">
            <div>
              Showing page <span className="text-white font-semibold">{page}</span> of <span className="text-white font-semibold">{totalPages}</span> ({total} logs)
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded border border-slate-800 bg-[#111827] text-slate-400 hover:text-white disabled:opacity-30 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded border border-slate-800 bg-[#111827] text-slate-400 hover:text-white disabled:opacity-30 transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
