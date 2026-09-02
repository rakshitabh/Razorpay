import React, { useEffect, useState, useRef } from 'react';
import { Terminal } from 'lucide-react';

export default function AgentStatusConsole({ token: propToken }) {
  const [executions, setExecutions] = useState([]);
  const consoleBodyRef = useRef(null);

  const fetchExecutions = async () => {
    try {
      const token = propToken || localStorage.getItem('soc_token');
      if (!token) return;
      const res = await fetch('/api/logs/executions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setExecutions(data || []);
      }
    } catch (err) {
      console.error('Error querying executions:', err);
    }
  };

  useEffect(() => {
    fetchExecutions();
    const interval = setInterval(fetchExecutions, 5000);
    return () => clearInterval(interval);
  }, []);

  // Scroll only the terminal container itself, NOT the browser window
  useEffect(() => {
    if (consoleBodyRef.current) {
      consoleBodyRef.current.scrollTop = consoleBodyRef.current.scrollHeight;
    }
  }, [executions]);

  const renderConsoleLines = () => {
    if (executions.length === 0) {
      return (
        <div className="space-y-1">
          <div className="text-slate-500 font-mono">[2026-08-22 SOC_STARTUP] Initializing AI Command Modules...</div>
          <div className="text-slate-400 font-mono">[SYSTEM] Multi-Agent Security Engine is ONLINE.</div>
          <div className="text-[#10B981] font-mono">[SYSTEM] Awaiting raw log injection stream...<span className="terminal-cursor"></span></div>
        </div>
      );
    }

    const lines = [];

    executions.forEach((exec) => {
      const timeStr = new Date(exec.timestamp).toLocaleTimeString([], { hour12: false });
      const duration = exec.executionTime ? `${exec.executionTime}ms` : 'pending';

      if (exec.agentName === 'Parser Agent') {
        lines.push({
          time: timeStr,
          agent: 'Parser Agent',
          status: 'info',
          text: `Ingesting raw logs. Running rule-based token parsing...`
        });
        if (exec.status === 'Completed') {
          lines.push({
            time: timeStr,
            agent: 'Parser Agent',
            status: 'success',
            text: `SUCCESS: Structured logs saved to database. Duration: ${duration}.`
          });
        } else if (exec.status === 'Failed') {
          lines.push({
            time: timeStr,
            agent: 'Parser Agent',
            status: 'error',
            text: `FAILED: Error during regex log formatting.`
          });
        }
      }

      if (exec.agentName === 'Threat Detection Agent') {
        lines.push({
          time: timeStr,
          agent: 'Threat Agent',
          status: 'info',
          text: `Scanning structured schemas for anomaly signatures...`
        });
        if (exec.status === 'Completed') {
          lines.push({
            time: timeStr,
            agent: 'Threat Agent',
            status: 'success',
            text: `Scan complete. Flags matched in database. Duration: ${duration}.`
          });
        } else if (exec.status === 'Failed') {
          lines.push({
            time: timeStr,
            agent: 'Threat Agent',
            status: 'error',
            text: `FAILED: Error during threat scanning.`
          });
        }
      }

      if (exec.agentName === 'Investigation Agent') {
        lines.push({
          time: timeStr,
          agent: 'Investigation Agent',
          status: 'info',
          text: `Triggering Gemini AI Security reasoning for alert correlation...`
        });
        if (exec.status === 'Completed') {
          lines.push({
            time: timeStr,
            agent: 'Investigation Agent',
            status: 'success',
            text: `AI Root Cause Analysis completed. Severity determined. Duration: ${duration}.`
          });
        } else if (exec.status === 'Failed') {
          lines.push({
            time: timeStr,
            agent: 'Investigation Agent',
            status: 'error',
            text: `AI reasoning error. Gracefully recovered via localized formula.`
          });
        }
      }

      if (exec.agentName === 'Response Agent') {
        lines.push({
          time: timeStr,
          agent: 'Response Agent',
          status: 'info',
          text: `Invoking AI Playbook Engine to draft containment options...`
        });
        if (exec.status === 'Completed') {
          lines.push({
            time: timeStr,
            agent: 'Response Agent',
            status: 'success',
            text: `Remediation playbooks compiled and stored. Duration: ${duration}.`
          });
        } else if (exec.status === 'Failed') {
          lines.push({
            time: timeStr,
            agent: 'Response Agent',
            status: 'error',
            text: `AI Playbook build error. Reverted to default containment rules.`
          });
        }
      }

      if (exec.agentName === 'Report Agent') {
        lines.push({
          time: timeStr,
          agent: 'Report Agent',
          status: 'info',
          text: `Compiling agent analytics into security Incident Report...`
        });
        if (exec.status === 'Completed') {
          lines.push({
            time: timeStr,
            agent: 'Report Agent',
            status: 'success',
            text: `Incident Report created. PDF/JSON compilation complete. Duration: ${duration}.`
          });
        }
      }
    });

    return (
      <div className="space-y-1">
        {lines.map((line, index) => {
          let colorClass = 'text-slate-400';
          if (line.status === 'success') colorClass = 'text-[#10B981]';
          if (line.status === 'error') colorClass = 'text-[#EF4444] font-bold';
          if (line.status === 'info') colorClass = 'text-[#2563EB]';

          return (
            <div key={index} className="font-mono text-[10px] leading-tight flex items-start space-x-1">
              <span className="text-slate-650 select-none">[{line.time}]</span>
              <span className="text-slate-500 font-semibold select-none">[{line.agent}]</span>
              <span className={colorClass}>{line.text}</span>
            </div>
          );
        })}
        <div className="text-[#10B981] font-mono text-[10px]">
          [SYSTEM] Pipeline status: idle.<span className="terminal-cursor"></span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#111827] border border-slate-800 p-4 rounded-lg flex flex-col h-full">
      <div className="border-b border-slate-850 pb-2 mb-3 flex items-center justify-between">
        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-white flex items-center">
          <Terminal className="w-4 h-4 mr-1.5 text-[#10B981]" /> AGENT_ACTIVITY_FEED
        </h3>
        <span className="text-[9px] font-mono bg-[#10B981]/15 text-[#10B981] px-2 py-0.5 rounded border border-[#10B981]/30 animate-pulse">
          LIVE_STREAM
        </span>
      </div>
      
      <div 
        ref={consoleBodyRef}
        className="flex-1 overflow-y-auto p-3 bg-slate-950 rounded border border-slate-850 text-left min-h-[400px]"
      >
        {renderConsoleLines()}
      </div>
    </div>
  );
}
