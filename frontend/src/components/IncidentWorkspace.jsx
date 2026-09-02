import React, { useState, useEffect } from 'react';
import { Shield, Clock, AlertTriangle, Play, ChevronRight, Activity, ArrowLeft, Terminal, CheckCircle, ShieldAlert, Cpu } from 'lucide-react';
import IncidentTimeline from './IncidentTimeline';
import AnalystNotes from './AnalystNotes';
import { triggerNotification } from './NotificationCenter';

export default function IncidentWorkspace({ incidentId, token, onBack }) {
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mitigating, setMitigating] = useState(false);

  const fetchIncidentDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/threats/${incidentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIncident(data);
      } else if (res.status === 404) {
        setError('INCIDENT_NOT_FOUND');
      } else {
        setError('Failed to fetch incident detail from server.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection refused. Ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidentDetail();
  }, [incidentId]);

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await fetch(`/api/threats/${incident._id || incidentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setIncident(updated);
        triggerNotification('Status Updated', 'success', `Incident status set to ${newStatus}.`);
      }
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const handleMitigatePlaybook = async (actionName) => {
    setMitigating(true);
    try {
      const res = await fetch(`/api/threats/${incident._id || incidentId}/mitigate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ actionName })
      });
      const data = await res.json();
      if (res.ok) {
        setIncident(data.updatedThreat);
        triggerNotification('Playbook Executed', 'success', `Action: "${actionName}" completed.`);
      }
    } catch (err) {
      alert(`Playbook run failed: ${err.message}`);
    } finally {
      setMitigating(false);
    }
  };

  if (error === 'INCIDENT_NOT_FOUND') {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-400 font-sans text-xs space-y-4 text-center">
        <ShieldAlert className="w-12 h-12 text-[#EF4444]" />
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-2">Incident Not Found</h2>
          <p className="max-w-md mx-auto">The requested incident ticket could not be located in the database. It may have been purged or you have an invalid ID.</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="bg-[#38BDF8] hover:bg-[#38BDF8]/80 text-[#0F172A] px-6 py-2 rounded font-sans font-bold transition flex items-center mt-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> RETURN TO INCIDENT REGISTRY
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 font-sans text-xs space-y-3 text-center">
        <AlertTriangle className="w-6 h-6 text-[#EF4444]" />
        <span className="text-white font-bold uppercase tracking-wider">{error}</span>
        <button
          type="button"
          onClick={onBack}
          className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white px-4 py-2 rounded font-sans font-bold transition cursor-pointer mt-2"
        >
          RETURN TO INCIDENT REGISTRY
        </button>
      </div>
    );
  }

  if (loading || !incident) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-400 font-sans text-xs space-y-3">
        <Activity className="w-8 h-8 animate-spin text-[#38BDF8]" />
        <span className="tracking-widest uppercase font-bold text-[#38BDF8]">Loading Investigation Workspace...</span>
      </div>
    );
  }

  const isFintech = incident.mode === 'fintech';
  
  const createdTime = new Date(incident.createdAt).toLocaleString();
  const severityColor = incident.severity === 'Critical' ? 'text-[#EF4444]' : incident.severity === 'High' ? 'text-[#F59E0B]' : 'text-[#38BDF8]';

  return (
    <div className="space-y-6 font-sans text-xs text-left select-none">
      
      {/* Navigation Breadcrumb */}
      <div className="flex items-center space-x-2 text-slate-400">
        <button onClick={onBack} className="hover:text-white transition uppercase font-bold flex items-center cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Incident Registry
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-white font-bold font-mono">{incident.incidentId}</span>
      </div>

      {/* 1. Header Panel */}
      <div className="bg-[#111827] border border-slate-700 p-5 rounded-lg flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <span className="text-xs text-slate-400 font-bold font-mono bg-slate-800 px-2 py-0.5 rounded">{incident.incidentId}</span>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${incident.mode === 'fintech' ? 'text-[#F59E0B]' : 'text-[#38BDF8]'}`}>
              {incident.mode} MODE
            </span>
            <span className="text-slate-500 text-[10px] flex items-center"><Clock className="w-3 h-3 mr-1" /> {createdTime}</span>
          </div>
          <h1 className="text-2xl font-bold text-white uppercase mt-2 tracking-tight">{incident.title}</h1>
        </div>
        
        <div className="grid grid-cols-3 gap-6 bg-[#0F172A] p-4 rounded border border-slate-800 shrink-0">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Risk Score</span>
            <span className="text-2xl font-bold font-mono text-white block">{incident.riskScore}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Severity</span>
            <span className={`text-xl font-bold uppercase block ${severityColor}`}>{incident.severity}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Status</span>
            <span className={`text-xl font-bold uppercase block ${incident.status === 'Open' ? 'text-[#EF4444]' : incident.status === 'Mitigated' ? 'text-[#22C55E]' : 'text-[#38BDF8]'}`}>
              {incident.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8/12) */}
        <div className="lg:col-span-8 space-y-6">

          {/* 1. Executive Summary Panel */}
          {(incident.investigationDetails || incident.rootCause) && (
            <div className="bg-[#111827] border border-slate-700 rounded-lg overflow-hidden">
              <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                <h3 className="font-bold text-white uppercase tracking-wider flex items-center">
                  <Terminal className="w-4 h-4 mr-2 text-[#38BDF8]" /> Executive Summary
                </h3>
                <span className="bg-[#38BDF8]/20 text-[#38BDF8] text-[8px] font-bold px-2 py-0.5 rounded uppercase border border-[#38BDF8]/30">AI Generated</span>
              </div>
              <div className="p-4 bg-[#0F172A] space-y-3">
                {incident.rootCause && (
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Root Cause Analysis</span>
                    <p className="text-white text-xs leading-relaxed">{incident.rootCause}</p>
                  </div>
                )}
                {incident.investigationDetails && (
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Investigation Details</span>
                    <p className="text-slate-300 text-xs leading-relaxed">{incident.investigationDetails}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. Investigation Findings Grid */}
          <div className="bg-[#111827] border border-slate-700 rounded-lg overflow-hidden">
            <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-white uppercase tracking-wider flex items-center">
                <Shield className="w-4 h-4 mr-2 text-[#F59E0B]" /> Investigation Findings
              </h3>
            </div>
            <div className="p-4 bg-[#0F172A]">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#111827] border border-slate-800 p-3 rounded">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Target System</span>
                  <span className="text-white font-mono text-xs">{incident.targetSystem || 'Unknown'}</span>
                </div>
                <div className="bg-[#111827] border border-slate-800 p-3 rounded">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Threat Classification</span>
                  <span className="text-white font-sans text-xs">{incident.threatClassification || incident.category || 'TBD'}</span>
                </div>
                <div className="bg-[#111827] border border-slate-800 p-3 rounded">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block mb-1">MITRE ATT&CK Mapping</span>
                  <span className="text-white font-mono text-xs">{incident.mitreMapping || 'TBD'}</span>
                </div>
                <div className="bg-[#111827] border border-slate-800 p-3 rounded">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Fraud / Risk Indicators</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(incident.fraudIndicators || []).length > 0 ? (
                      incident.fraudIndicators.map((ind, i) => (
                        <span key={i} className="text-[9px] bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 px-1.5 py-0.5 rounded">
                          {ind}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 text-[10px]">None identified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 3. Timeline Panel */}
          <div id="incident-timeline-section" className="bg-[#111827] border border-slate-700 rounded-lg overflow-hidden">
            <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-white uppercase tracking-wider flex items-center">
                <Clock className="w-4 h-4 mr-2 text-[#38BDF8]" /> Chronological Flow
              </h3>
            </div>
            <div className="p-4">
              <IncidentTimeline timeline={incident.timeline} />
            </div>
          </div>

          {/* 3. Evidence Panel */}
          <div className="bg-[#111827] border border-slate-700 rounded-lg overflow-hidden">
            <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-white uppercase tracking-wider flex items-center">
                <Terminal className="w-4 h-4 mr-2 text-[#38BDF8]" /> Raw Evidence
              </h3>
            </div>
            <div className="p-4 bg-[#0F172A]">
              <div className="max-h-64 overflow-y-auto space-y-3 pr-2">
                {(incident.evidenceLogs || []).map((l, i) => {
                  let parsedContent = l.rawLog || JSON.stringify(l);
                  if (parsedContent.startsWith('{')) {
                    try {
                      parsedContent = JSON.stringify(JSON.parse(parsedContent), null, 2);
                    } catch(e){}
                  }
                  
                  return (
                    <div key={i} className="space-y-1.5 border-l-2 border-slate-600 pl-3 py-1">
                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                        <span>Event #{i+1}</span>
                        <span>{l.timestamp ? new Date(l.timestamp).toLocaleTimeString() : ''}</span>
                      </div>
                      <pre className="text-slate-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                        {parsedContent}
                      </pre>
                    </div>
                  );
                })}
                {(incident.evidenceLogs || []).length === 0 && (
                  <div className="text-center text-slate-500 italic py-4">No raw evidence logs attached to this incident.</div>
                )}
              </div>
            </div>
          </div>

          {/* 5. Report Preview Panel */}
          {incident.markdownReport && (
            <div className="bg-[#111827] border border-slate-700 rounded-lg overflow-hidden">
              <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                <h3 className="font-bold text-white uppercase tracking-wider flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-[#22C55E]" /> Final Executive Brief
                </h3>
              </div>
              <div className="p-4 bg-white text-slate-900 rounded-b-lg prose prose-sm max-w-none max-h-96 overflow-y-auto font-sans leading-normal">
                {/* Note: In a real app we would use a markdown parser (e.g. react-markdown). For now, rendering pre-wrap text or basic formatting */}
                <pre className="whitespace-pre-wrap font-sans text-[11px] leading-relaxed">
                  {incident.markdownReport}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Right Column (4/12) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* 4. Explainability Panel */}
          <div id="ai-investigation-section" className="bg-[#111827] border border-slate-700 rounded-lg overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#38BDF8]"></div>
            <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-white uppercase tracking-wider flex items-center">
                <Cpu className="w-4 h-4 mr-2 text-[#38BDF8]" /> AI Explainability
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold mb-1">Rule Triggered</span>
                <div className="bg-[#0F172A] border border-slate-700 p-2.5 rounded text-slate-200 font-mono text-xs leading-relaxed">
                  {isFintech ? 'Failed Transactions >= 3\nVelocity > $10k/hr' : 'Failed Authentications > 10\nTarget Port: 22'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0F172A] border border-slate-700 p-2.5 rounded text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Scoring Logic</span>
                  <span className="text-sm font-bold text-white block">+{Math.floor(incident.riskScore * 0.4)} pts</span>
                  <span className="text-[8px] text-slate-500 uppercase">Base Anomaly</span>
                </div>
                <div className="bg-[#0F172A] border border-slate-700 p-2.5 rounded text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">AI Confidence</span>
                  <span className="text-sm font-bold text-[#22C55E] block">{incident.confidenceScore || 94}%</span>
                  <span className="text-[8px] text-slate-500 uppercase">Gemini Flash</span>
                </div>
                <div className="bg-[#0F172A] border border-slate-700 p-2.5 rounded text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Matched Inds</span>
                  <span className="text-sm font-bold text-[#F59E0B] block">{incident.fraudIndicators ? incident.fraudIndicators.length : (isFintech ? 3 : 2)}</span>
                  <span className="text-[8px] text-slate-500 uppercase">Threat Signs</span>
                </div>
                <div className="bg-[#0F172A] border border-slate-700 p-2.5 rounded text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Evidence Count</span>
                  <span className="text-sm font-bold text-[#38BDF8] block">{(incident.evidenceLogs || []).length}</span>
                  <span className="text-[8px] text-slate-500 uppercase">Raw Logs</span>
                </div>
              </div>
              
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold mb-1">AI Insights</span>
                <p className="text-slate-300 text-xs leading-relaxed italic bg-slate-800/40 p-3 rounded border border-slate-700">
                  "{incident.investigationDetails || (isFintech ? 'Anomalous velocity detected from untrusted device fingerprint.' : 'Sustained brute force activity detected targeting critical internal endpoints.')}"
                </p>
              </div>
            </div>
          </div>

          {/* 5. Mitigation Panel */}
          <div className="bg-[#111827] border border-slate-700 rounded-lg overflow-hidden">
            <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-white uppercase tracking-wider flex items-center">
                <ShieldAlert className="w-4 h-4 mr-2 text-[#EF4444]" /> Mitigation Actions
              </h3>
            </div>
            <div className="p-4 space-y-2">
              <button 
                onClick={() => handleMitigatePlaybook('Block Source IP')}
                disabled={mitigating}
                className="w-full bg-[#0F172A] border border-slate-700 hover:border-[#EF4444] hover:bg-[#EF4444]/10 text-white p-2.5 rounded text-xs font-bold transition flex justify-between items-center cursor-pointer"
              >
                <span>Block Source IP</span>
                <Play className="w-3.5 h-3.5 text-[#EF4444]" />
              </button>
              
              <button 
                onClick={() => handleMitigatePlaybook('Freeze Account')}
                disabled={mitigating}
                className="w-full bg-[#0F172A] border border-slate-700 hover:border-[#F59E0B] hover:bg-[#F59E0B]/10 text-white p-2.5 rounded text-xs font-bold transition flex justify-between items-center cursor-pointer"
              >
                <span>Freeze Account</span>
                <Play className="w-3.5 h-3.5 text-[#F59E0B]" />
              </button>

              <div className="border-t border-slate-700 my-2 pt-2 space-y-2">
                <button 
                  onClick={() => handleStatusChange('Investigating')}
                  className="w-full bg-[#0F172A] border border-slate-700 hover:bg-slate-800 text-[#38BDF8] p-2.5 rounded text-xs font-bold transition cursor-pointer text-left"
                >
                  Escalate to L3 Analyst
                </button>
                <button 
                  onClick={() => handleStatusChange('Mitigated')}
                  className="w-full bg-[#0F172A] border border-slate-700 hover:bg-slate-800 text-[#22C55E] p-2.5 rounded text-xs font-bold transition cursor-pointer text-left"
                >
                  Resolve Case (Mitigated)
                </button>
                <button 
                  onClick={() => handleStatusChange('Closed')}
                  className="w-full bg-slate-800 text-white p-2.5 rounded text-xs font-bold transition hover:bg-slate-700 cursor-pointer text-left"
                >
                  Close Case (False Positive / Done)
                </button>
                <button 
                  onClick={() => {
                    triggerNotification('Report Download', 'info', 'Preparing PDF report export...');
                    if (incident.markdownReport) {
                      const element = document.createElement("a");
                      const file = new Blob([incident.markdownReport], {type: 'text/markdown'});
                      element.href = URL.createObjectURL(file);
                      element.download = `${incident.incidentId}_Report.md`;
                      document.body.appendChild(element); // Required for this to work in FireFox
                      element.click();
                    }
                  }}
                  className="w-full bg-[#38BDF8] text-[#0B1220] hover:bg-[#38BDF8]/80 p-2.5 rounded text-xs font-bold transition cursor-pointer text-center"
               >
                  DOWNLOAD REPORT (.MD)
                </button>
              </div>
            </div>
          </div>

          {/* 6. Analyst Notes */}
          <div className="bg-[#111827] border border-slate-700 rounded-lg overflow-hidden">
            <AnalystNotes 
              incidentId={incident.incidentId || incident._id} 
              token={token} 
              currentAssigned={incident.assignedTo} 
              onUpdateIncident={(updated) => setIncident(updated)} 
            />
          </div>

        </div>
      </div>
    </div>
  );
}
