import React, { useEffect, useState } from 'react';
import { UploadCloud, Search, Terminal, ChevronRight, ChevronDown, Check, AlertCircle } from 'lucide-react';

export default function LogManager({ token }) {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Ingest Form states
  const [rawText, setRawText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  // Filter states
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');
  const [event, setEvent] = useState('');
  const [page, setPage] = useState(1);
  
  // Expanded log row ID
  const [expandedLogId, setExpandedLogId] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        severity,
        event,
        page,
        limit: 15
      });
      const res = await fetch(`/api/logs?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Error fetching logs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, severity, event]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleLogUpload = async (e) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    setUploading(true);
    setUploadSuccess(false);
    setUploadError('');

    try {
      const res = await fetch('/api/logs/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rawLogs: rawText })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to ingest logs.');
      }

      setUploadSuccess(true);
      setRawText('');
      setPage(1);
      fetchLogs();
      setTimeout(() => setUploadSuccess(false), 4000);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadSuccess(false);
    setUploadError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/logs/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to upload log file.');
      }

      setUploadSuccess(true);
      setPage(1);
      fetchLogs();
      setTimeout(() => setUploadSuccess(false), 4000);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Left panel: Log Ingestion consoles */}
      <div className="xl:col-span-4 space-y-6">
        <div className="bg-[#111827] border border-slate-800 p-5 rounded-lg">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-white border-b border-slate-800 pb-2 flex items-center">
            <UploadCloud className="w-4 h-4 mr-1.5 text-[#2563EB]" /> INGESTION_GATEWAY
          </h3>

          <div className="mt-4">
            <label className="border border-dashed border-slate-800 hover:border-[#2563EB]/60 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition bg-slate-900/40 group">
              <UploadCloud className="w-8 h-8 text-slate-500 group-hover:text-[#2563EB] transition mb-2" />
              <span className="text-xs font-mono text-white font-semibold">UPLOAD LOG PAYLOAD</span>
              <span className="text-[10px] text-slate-500 font-mono mt-1">supports .txt, .log, .csv, .json (max 2MB)</span>
              <input type="file" onChange={handleFileUpload} className="hidden" accept=".txt,.log,.csv,.json" />
            </label>
          </div>

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-[9px] text-slate-500 font-mono">OR PASTE RAW STRINGS</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Paste Raw Logs Form */}
          <form onSubmit={handleLogUpload} className="space-y-4">
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="AUTH_SRV Failed password attempt for user admin from IP 192.168.1.1..."
              className="w-full h-36 bg-slate-900/50 border border-slate-800 rounded p-3 text-xs text-white font-mono placeholder-slate-700 focus:outline-none focus:border-[#2563EB] transition"
            />
            {uploadSuccess && (
              <div className="text-xs text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30 px-3 py-2 rounded font-mono flex items-center">
                <Check className="w-4 h-4 mr-1" /> [SUCCESS] Ingestion completed.
              </div>
            )}
            {uploadError && (
              <div className="text-xs text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/30 px-3 py-2 rounded font-mono flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" /> [ERROR] {uploadError}
              </div>
            )}
            <button
              type="submit"
              disabled={uploading || !rawText.trim()}
              className="w-full bg-[#2563EB]/15 hover:bg-[#2563EB]/25 text-white border border-[#2563EB] py-2 rounded text-xs font-mono font-semibold transition disabled:opacity-50 cursor-pointer flex items-center justify-center"
            >
              {uploading ? (
                <span className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                'SUBMIT TELEMETRY'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right panel: Log Queries and Tables */}
      <div className="xl:col-span-8 space-y-6">
        <div className="bg-[#111827] border border-slate-800 p-5 rounded-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-white flex items-center">
              <Terminal className="w-4 h-4 mr-1.5 text-[#10B981]" /> Log Registry Directory ({total})
            </h3>
            
            <div className="flex items-center space-x-2 font-mono text-[10px]">
              <select
                value={severity}
                onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
                className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-300"
              >
                <option value="">ALL_SEVERITIES</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Keyword Search form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search raw logs by IP, action, username, endpoint..."
                className="w-full bg-slate-900 border border-slate-800 rounded pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-[#2563EB] transition"
              />
            </div>
            <button
              type="submit"
              className="bg-[#2563EB] hover:bg-[#2563EB]/85 transition text-xs font-mono text-white px-4 py-2 rounded cursor-pointer font-semibold"
            >
              QUERY
            </button>
          </form>

          {/* Logs Table */}
          <div className="overflow-x-auto mt-4">
            {loading ? (
              <div className="py-12 text-center text-slate-500 text-xs font-mono animate-pulse">
                [RETRIEVING_LOGS...] Querying repository data...
              </div>
            ) : logs.length > 0 ? (
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="py-2.5 px-2 w-6"></th>
                    <th className="py-2.5 px-2">Timestamp</th>
                    <th className="py-2.5 px-2">IP Source</th>
                    <th className="py-2.5 px-2">Ingestion Event</th>
                    <th className="py-2.5 px-2">Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const isExpanded = expandedLogId === log._id;
                    return (
                      <React.Fragment key={log._id}>
                        <tr
                          onClick={() => setExpandedLogId(isExpanded ? null : log._id)}
                          className="border-b border-slate-800/40 hover:bg-slate-800/20 transition cursor-pointer"
                        >
                          <td className="py-2.5 px-2 text-center text-slate-500">
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </td>
                          <td className="py-2.5 px-2 text-slate-500">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td className="py-2.5 px-2 text-[#2563EB] font-bold">{log.ip}</td>
                          <td className="py-2.5 px-2 text-white font-semibold">{log.event}</td>
                          <td className="py-2.5 px-2">
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase ${
                              log.severity === 'Critical' ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30' :
                              log.severity === 'High' ? 'bg-[#F59E0B]/20 text-[#F59E0B]' :
                              log.severity === 'Medium' ? 'bg-[#2563EB]/25 text-[#2563EB]' :
                              'bg-slate-800 text-slate-400'
                            }`}>
                              {log.severity}
                            </span>
                          </td>
                        </tr>
                        
                        {/* Expanded details rendering */}
                        {isExpanded && (
                          <tr>
                            <td colSpan="5" className="bg-[#0F172A] p-4 border-b border-slate-850">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <div className="text-[10px] text-slate-500 uppercase mb-1 font-mono">Raw System Telemetry</div>
                                  <pre className="bg-slate-900 border border-slate-850 rounded p-2.5 text-[10px] text-slate-400 font-mono whitespace-pre-wrap">
                                    {log.rawLog}
                                  </pre>
                                </div>
                                <div>
                                  <div className="text-[10px] text-slate-500 uppercase mb-1 font-mono">Structured JSON Output (Parser Agent)</div>
                                  <pre className="bg-slate-900 border border-slate-850 rounded p-2.5 text-[10px] text-[#10B981] font-mono overflow-x-auto">
                                    {JSON.stringify(log.details, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs font-mono">
                [SYSTEM_IDLE] No logs matches search query filter.
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {total > 15 && (
            <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-4 font-mono text-xs text-slate-400">
              <button
                disabled={page === 1}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                className="px-3 py-1 bg-slate-900 border border-slate-800 rounded hover:bg-slate-850 transition disabled:opacity-30 cursor-pointer"
              >
                PREV
              </button>
              <span>PAGE {page}</span>
              <button
                disabled={logs.length < 15}
                onClick={() => setPage(prev => prev + 1)}
                className="px-3 py-1 bg-slate-900 border border-slate-800 rounded hover:bg-slate-850 transition disabled:opacity-30 cursor-pointer"
              >
                NEXT
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
