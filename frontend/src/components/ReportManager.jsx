import React, { useEffect, useState } from 'react';
import { FileText, Download, Printer, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';

export default function ReportManager({ token }) {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter
  const [search, setSearch] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('summary'); // summary, technical, evidence, mitigation, timeline

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const arr = Array.isArray(data) ? data : [];
        setReports(arr);
        if (arr.length > 0 && !selectedReport) {
          setSelectedReport(arr[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handlePrintPDF = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    if (!selectedReport) return;
    const blob = new Blob([selectedReport.fullMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `INC_REPORT_${selectedReport.threatId?.incidentId || 'Generic'}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    if (!selectedReport) return;
    const blob = new Blob([JSON.stringify(selectedReport, null, 2)], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `INC_REPORT_${selectedReport.threatId?.incidentId || 'Generic'}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    if (!selectedReport) return;
    const headers = 'Incident ID,Title,Severity,Status,Risk Score,Source IP,Target System,Created At\\n';
    const row = `"${selectedReport.threatId?.incidentId || ''}","${selectedReport.threatId?.title || ''}","${selectedReport.threatId?.severity || ''}","${selectedReport.threatId?.status || ''}","${selectedReport.threatId?.riskScore || ''}","${selectedReport.threatId?.sourceIp || ''}","${selectedReport.threatId?.targetSystem || ''}","${selectedReport.createdAt || ''}"\\n`;
    const blob = new Blob([headers + row], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `INC_REPORT_${selectedReport.threatId?.incidentId || 'Generic'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered reports
  const filteredReports = reports.filter(r => {
    const s = search.toLowerCase();
    const title = (r.threatId?.title || '').toLowerCase();
    const id = (r.threatId?.incidentId || '').toLowerCase();
    const ip = (r.threatId?.sourceIp || '').toLowerCase();
    return title.includes(s) || id.includes(s) || ip.includes(s);
  });

  const getReportSectionContent = () => {
    if (!selectedReport) return '';
    const md = selectedReport.fullMarkdown || '';
    
    // Fallback splitter helpers to divide Markdown sections cleanly
    const sections = {
      summary: '',
      technical: '',
      evidence: '',
      mitigation: '',
      timeline: ''
    };

    if (md.includes('## Executive Summary')) {
      const parts = md.split('## ');
      parts.forEach(part => {
        if (part.startsWith('Executive Summary')) {
          sections.summary = part.replace('Executive Summary\n', '');
        } else if (part.startsWith('Technical Analysis') || part.startsWith('Technical Findings')) {
          sections.technical = part.replace(/Technical (Analysis|Findings)\n/, '');
        } else if (part.startsWith('Evidence') || part.startsWith('Evidence Logs')) {
          sections.evidence = part.replace(/Evidence (Logs)?\n/, '');
        } else if (part.startsWith('Mitigation') || part.startsWith('Recommendations')) {
          sections.mitigation = part.replace(/(Mitigation|Recommendations)\n/, '');
        } else if (part.startsWith('Timeline') || part.startsWith('Attack Timeline')) {
          sections.timeline = part.replace(/(Timeline|Attack Timeline)\n/, '');
        }
      });
    }

    // Return active tab segment or full text fallback
    const activeText = sections[activeSubTab];
    if (activeText) return activeText;
    
    // Parse headers dynamically if no exact match
    return md;
  };

  const renderCleanText = (text) => {
    if (!text) return <p className="text-slate-500 italic">No section data compiled.</p>;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="text-white font-bold font-mono text-xs mt-4 mb-2">{line.substring(4)}</h4>;
      }
      if (line.startsWith('- ')) {
        return <li key={idx} className="list-disc ml-4 my-1 text-slate-300 font-mono text-xs">{line.substring(2)}</li>;
      }
      if (line.trim() === '---') {
        return <hr key={idx} className="border-t border-slate-800 my-4" />;
      }
      if (line.trim()) {
        return <p key={idx} className="text-slate-300 font-mono text-xs leading-relaxed my-2">{line}</p>;
      }
      return null;
    });
  };

  if (loading) {
    return (
      <div className="bg-[#131C2E] border border-[#2A3A52] p-8 rounded-lg text-center text-xs font-mono animate-pulse no-print">
        [RETRIEVING_REPORT_REGISTRY...] Querying incident databases...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print-page">
      
      {/* Left panel: Report Registry list */}
      <div className="lg:col-span-4 space-y-6 no-print">
        <div className="bg-[#131C2E] border border-[#2A3A52] p-5 rounded-lg space-y-4">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white border-b border-slate-800 pb-2 flex items-center">
            <FileText className="w-4 h-4 mr-1.5 text-[#2563EB]" /> Incident Reports
          </h3>

          <div className="relative font-mono text-xs">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded text-white focus:outline-none focus:border-[#2563EB] transition"
            />
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {filteredReports.length > 0 ? (
              filteredReports.map((rep) => {
                const isSelected = selectedReport?._id === rep._id;
                const dateStr = new Date(rep.createdAt).toLocaleDateString();
                return (
                  <button
                    key={rep._id}
                    onClick={() => setSelectedReport(rep)}
                    className={`w-full text-left font-mono border rounded p-3 transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#2563EB]/15 text-white border-[#2563EB]/55'
                        : 'bg-slate-900/40 border-slate-850 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-white">
                        {rep.threatId?.incidentId || 'INC-xxxx'}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                        {rep.threatId?.title || 'System Audit'}
                      </div>
                      <div className="text-[9px] text-slate-500">Date: {dateStr}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                );
              })
            ) : (
              <div className="py-8 text-center text-slate-600 text-xs font-mono">
                [-] NO_REPORTS_COMPILED
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right panel: Active Report viewer */}
      <div className="lg:col-span-8 print-page">
        {selectedReport ? (
          <div className="bg-[#131C2E] border border-[#2A3A52] p-6 rounded-lg flex flex-col min-h-[500px]">
            
            {/* Toolbar Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#2A3A52] pb-4 mb-4 gap-4 no-print">
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Report Workspace</span>
                <h4 className="text-xs font-mono font-bold text-white uppercase mt-0.5">
                  ID: {selectedReport.threatId?.incidentId || 'INC-xxxx'}
                </h4>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrintPDF}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-slate-300 hover:text-white transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 mr-1 text-[#10B981]" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={handleDownloadMarkdown}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-slate-300 hover:text-white transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 mr-1 text-[#F59E0B]" />
                  <span>MARKDOWN</span>
                </button>
                <button
                  onClick={handleExportJSON}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 border border-[#2A3A52] rounded text-xs font-mono text-slate-350 hover:text-white transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 mr-1 text-[#2563EB]" />
                  <span>JSON</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 border border-[#2A3A52] rounded text-xs font-mono text-slate-350 hover:text-white transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 mr-1 text-[#10B981]" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            {/* Sub Tabs */}
            <div className="flex border-b border-slate-800 pb-2 mb-4 space-x-4 text-xs font-mono no-print">
              {[
                { id: 'summary', label: 'EXECUTIVE_SUMMARY' },
                { id: 'technical', label: 'TECHNICAL_FINDINGS' },
                { id: 'evidence', label: 'EVIDENCE' },
                { id: 'mitigation', label: 'MITIGATION' },
                { id: 'timeline', label: 'TIMELINE' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`pb-1 transition border-b-2 font-bold cursor-pointer ${
                    activeSubTab === tab.id ? 'border-[#2563EB] text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Document contents */}
            <div className="flex-1 text-left print-page space-y-4 max-h-[450px] overflow-y-auto pr-1">
              {renderCleanText(getReportSectionContent())}
            </div>

          </div>
        ) : (
          <div className="bg-[#111827] border border-slate-800 p-8 rounded-lg text-center text-xs font-mono text-slate-500 no-print">
            [AWAITING_INCIDENT_INGESTION] Select a report from the left directory.
          </div>
        )}
      </div>
    </div>
  );
}
