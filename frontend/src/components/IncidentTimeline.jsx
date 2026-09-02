import React from 'react';
import { Clock, ShieldAlert, Sparkles, ShieldCheck, HelpCircle } from 'lucide-react';

export default function IncidentTimeline({ timeline = [] }) {
  
  const getTimelineIcon = (eventText) => {
    const txt = eventText.toLowerCase();
    if (txt.includes('ingest') || txt.includes('received')) {
      return <Clock className="w-3.5 h-3.5 text-slate-450" />;
    }
    if (txt.includes('detection') || txt.includes('match') || txt.includes('created')) {
      return <ShieldAlert className="w-3.5 h-3.5 text-[#F97316]" />;
    }
    if (txt.includes('ai') || txt.includes('investigation') || txt.includes('completed')) {
      return <Sparkles className="w-3.5 h-3.5 text-[#06B6D4]" />;
    }
    if (txt.includes('mitigat') || txt.includes('closed') || txt.includes('containment')) {
      return <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />;
    }
    return <HelpCircle className="w-3.5 h-3.5 text-slate-500" />;
  };

  return (
    <div className="bg-[#111827] border border-slate-800 p-5 rounded-lg space-y-4 font-mono text-xs text-left select-none">
      <div className="border-b border-slate-850 pb-2">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Chronological Audit Timeline</h3>
        <p className="text-[10px] text-slate-500 mt-0.5">Immutable trace tracking logging, detection, and playbooks runs.</p>
      </div>

      <div className="relative pl-6 space-y-5 border-l border-slate-800 mt-2">
        {timeline.length === 0 ? (
          <div className="text-slate-500 py-4 text-[10px] italic">[-] No timeline logs recorded.</div>
        ) : (
          timeline.map((item, idx) => (
            <div key={idx} className="relative space-y-1">
              
              {/* Timeline dot icon */}
              <div className="absolute -left-[33px] top-0.5 bg-[#111827] p-0.5 border border-slate-800 rounded-full flex items-center justify-center">
                {getTimelineIcon(item.event)}
              </div>

              <div className="flex items-start justify-between gap-4">
                <span className="font-semibold text-slate-200 leading-tight">
                  {item.event}
                </span>
                <span className="text-[9px] text-slate-500 shrink-0 font-bold">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <div className="text-[9px] text-slate-500 font-bold uppercase">
                {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: '2-digit' })}
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
