import React, { useState } from 'react';
import { Play, X, RefreshCw } from 'lucide-react';
import { triggerNotification } from './NotificationCenter';

export default function DemoScenarioModal({ isOpen, onClose, token, onNavigateToIncident }) {
  const [loading, setLoading] = useState(null);
  const [activeTab, setActiveTab] = useState('security');

  if (!isOpen) return null;

  const scenarios = {
    security: [
      { id: 'brute_force', name: 'Brute Force Attack', type: 'critical', eventsCount: 150, expectedDetection: 'SSH Brute Force', estimatedRisk: '90-95' },
      { id: 'credential_stuffing', name: 'Credential Stuffing', type: 'high', eventsCount: 180, expectedDetection: 'Credential Stuffing', estimatedRisk: '80-85' },
      { id: 'port_scan', name: 'Port Scan', type: 'medium', eventsCount: 120, expectedDetection: 'Port Reconnaissance', estimatedRisk: '55-65' },
      { id: 'unauthorized_access', name: 'Unauthorized Access', type: 'medium', eventsCount: 80, expectedDetection: 'Unauthorized Access', estimatedRisk: '65-70' },
      { id: 'privilege_escalation', name: 'Privilege Escalation', type: 'critical', eventsCount: 200, expectedDetection: 'Privilege Escalation', estimatedRisk: '95-99' },
      { id: 'lateral_movement', name: 'Lateral Movement', type: 'high', eventsCount: 140, expectedDetection: 'Lateral Movement', estimatedRisk: '85-89' },
      { id: 'suspicious_powershell', name: 'PowerShell Execution', type: 'high', eventsCount: 160, expectedDetection: 'PowerShell Execution', estimatedRisk: '75-80' },
      { id: 'web_exploitation', name: 'Web Exploitation', type: 'high', eventsCount: 220, expectedDetection: 'Web Exploitation', estimatedRisk: '80-88' }
    ],
    fintech: [
      { id: 'upi_fraud', name: 'UPI Fraud', type: 'critical', eventsCount: 130, expectedDetection: 'UPI Protocol Fraud', estimatedRisk: '92-98' },
      { id: 'card_testing', name: 'Card Testing', type: 'high', eventsCount: 110, expectedDetection: 'Card Testing Botnet', estimatedRisk: '85-90' },
      { id: 'refund_abuse', name: 'Refund Abuse', type: 'high', eventsCount: 95, expectedDetection: 'Refund Volume Abuse', estimatedRisk: '75-85' },
      { id: 'account_takeover', name: 'Account Takeover', type: 'high', eventsCount: 85, expectedDetection: 'Account Takeover (ATO)', estimatedRisk: '88-92' },
      { id: 'velocity_abuse', name: 'Velocity Abuse', type: 'medium', eventsCount: 120, expectedDetection: 'Velocity Limits Abuse', estimatedRisk: '60-70' },
      { id: 'merchant_abuse', name: 'Merchant Abuse', type: 'medium', eventsCount: 75, expectedDetection: 'Merchant Settlements', estimatedRisk: '65-75' },
      { id: 'chargeback_spike', name: 'Chargeback Abuse', type: 'high', eventsCount: 65, expectedDetection: 'Chargeback Spikes', estimatedRisk: '75-80' },
      { id: 'payout_abuse', name: 'Payout Abuse', type: 'high', eventsCount: 140, expectedDetection: 'UPI Gateway Volume', estimatedRisk: '80-88' },
      { id: 'synthetic_identity', name: 'Synthetic Identity', type: 'medium', eventsCount: 45, expectedDetection: 'Synthetic Identity', estimatedRisk: '70-75' },
      { id: 'settlement_manipulation', name: 'Settlement Manipulation', type: 'critical', eventsCount: 150, expectedDetection: 'Settlement Manipulation', estimatedRisk: '95-100' }
    ]
  };

  const handleGenerate = async (scenarioId, name, type) => {
    setLoading(scenarioId);
    try {
      const res = await fetch('/api/simulator/generate-scenario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ scenario: scenarioId })
      });

      if (res.ok) {
        const data = await res.json();
        const incidentId = data.incidentId;
        
        triggerNotification(
          `${name} Simulated`,
          type === 'critical' ? 'critical' : type === 'high' ? 'high' : 'info',
          incidentId 
            ? `Correlated ticket ${incidentId} generated successfully.`
            : `Simulation events parsed. Rules checking matched successfully.`
        );

        onClose();
        
        if (incidentId) {
          onNavigateToIncident(incidentId);
        }
      } else {
        alert('Failed to execute simulation pipeline.');
      }
    } catch (err) {
      console.error(err);
      alert(`Simulation error: ${err.message}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans text-xs text-left select-none">
      <div className="bg-[#131C2E] border border-[#2A3A52] p-6 rounded-lg max-w-xl w-full relative space-y-4 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2A3A52] pb-3">
          <h3 className="text-xs font-bold text-white flex items-center">
            <Play className="w-4 h-4 mr-2 text-[#38BDF8]" /> SEED_DEMO_SCENARIO_ENGINE
          </h3>
          <button 
            onClick={onClose} 
            className="text-[#9CA3AF] hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Group Tabs switcher */}
        <div className="flex border-b border-[#2A3A52]">
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 border-b-2 font-bold cursor-pointer transition text-xs ${
              activeTab === 'security' 
                ? 'border-[#38BDF8] text-[#38BDF8] bg-[#38BDF8]/5' 
                : 'border-transparent text-[#9CA3AF] hover:text-white'
            }`}
          >
            SECURITY ATTACKS
          </button>
          <button
            onClick={() => setActiveTab('fintech')}
            className={`px-4 py-2 border-b-2 font-bold cursor-pointer transition text-xs ${
              activeTab === 'fintech' 
                ? 'border-[#38BDF8] text-[#38BDF8] bg-[#38BDF8]/5' 
                : 'border-transparent text-[#9CA3AF] hover:text-white'
            }`}
          >
            FINTECH FRAUD SCENARIOS
          </button>
        </div>

        {/* Grid list of scenarios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
          {scenarios[activeTab].map((sc) => (
            <div 
              key={sc.id} 
              className="bg-[#0B1220] border border-[#2A3A52] p-4 rounded hover:border-[#38BDF8]/30 transition flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-[#2A3A52]/40 pb-1.5">
                  <span className="font-bold text-white uppercase text-[10px] tracking-wide">{sc.name}</span>
                  <span className={`text-[7px] px-1.5 py-0.2 rounded uppercase font-bold border ${
                    sc.type === 'critical' ? 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30' :
                    sc.type === 'high' ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30' :
                    'bg-[#38BDF8]/20 text-[#38BDF8] border-[#38BDF8]/30'
                  }`}>
                    {sc.type}
                  </span>
                </div>
                
                <div className="space-y-1 text-[9px] font-mono text-[#9CA3AF]">
                  <div className="flex justify-between">
                    <span>Severity:</span>
                    <span className="text-white uppercase font-bold">{sc.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Generated Events:</span>
                    <span className="text-white">{sc.eventsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Risk:</span>
                    <span className={`font-bold ${
                      sc.type === 'critical' ? 'text-[#EF4444]' :
                      sc.type === 'high' ? 'text-[#F59E0B]' :
                      'text-[#38BDF8]'
                    }`}>{sc.estimatedRisk}</span>
                  </div>
                  <div className="pt-1 border-t border-[#2A3A52]/30 mt-1">
                    <span className="block text-[8px] text-[#9CA3AF]">Expected Detection:</span>
                    <span className="block text-white font-sans mt-0.5 text-[9px] font-semibold text-[#38BDF8]">{sc.expectedDetection}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleGenerate(sc.id, sc.name, sc.type)}
                disabled={!!loading}
                className="mt-3.5 w-full bg-[#38BDF8]/10 hover:bg-[#38BDF8]/20 border border-[#38BDF8]/30 text-[#38BDF8] py-1.5 rounded font-semibold transition cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-50 text-[10px]"
              >
                {loading === sc.id ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Play className="w-3 h-3" />
                    <span>RUN SCENARIO</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
