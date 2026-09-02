import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronRight, ChevronLeft, Shield, AlertTriangle, Sparkles, Play, CheckCircle } from 'lucide-react';

export default function OnboardingTour({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState(null);
  const [demoRunning, setDemoRunning] = useState(false);

  const tourSteps = [
    {
      title: "Welcome to AI Security Operations Center",
      description: "Learn how to monitor threats, investigate incidents, and generate AI-powered security reports in seconds. Let's start with a quick tour of your workstation.",
      selector: null,
      badge: "WELCOME"
    },
    {
      title: "Step 1: Sidebar Control Board",
      description: "This navigation panel provides access to all threat hunting, monitoring, and administrative sections of the SOC.",
      selector: "aside",
      badge: "NAVIGATION"
    },
    {
      title: "Step 2: Critical Alerts Metric",
      description: "Displays unresolved critical and high-severity incidents that require immediate analyst response to meet service SLAs.",
      selector: "#dashboard-critical-card",
      badge: "METRICS"
    },
    {
      title: "Step 3: Events Today Ingress",
      description: "Events are individual security logs ingested today (e.g., login attempts, network requests, or gateway access). Displays total activities parsed.",
      selector: "#dashboard-events-card",
      badge: "TELEMETRY"
    },
    {
      title: "Step 4: Threat Ingress Map",
      description: "A dynamic visualization displaying attacks, source IPs, and target systems like auth servers or gateways.",
      selector: "#dashboard-threat-map",
      badge: "ATTACK MAP"
    },
    {
      title: "Step 5: Log Ingestion Gateway",
      description: "Go to this tab to paste raw syslogs or upload .log, .txt, .json, and .csv files. These are formatted instantly by the Parser Agent.",
      selector: "#nav-logs",
      badge: "INGEST"
    },
    {
      title: "Step 6: Detection Rules Engine",
      description: "Active signature correlation matching parameters mapped to MITRE ATT&CK techniques (Brute force, credential stuffing, scanning).",
      selector: "#nav-detection-rules",
      badge: "CORRELATION"
    },
    {
      title: "Step 7: Incident Workspace",
      description: "Opening any active ticket shows evidence, chronological timeline tracking, playbooks, and note comment panels.",
      selector: "#nav-incidents",
      badge: "WORKSPACE"
    },
    {
      title: "Step 8: Security Reports Page",
      description: "Allows exporting executive summaries and technical incident writeups into PDF, Markdown, or JSON formats.",
      selector: "#nav-reports",
      badge: "REPORTING"
    },
    {
      title: "Step 9: Security Audit Ledger",
      description: "An immutable history trace logging analyst logins, mitigation actions, and account changes to ensure compliance.",
      selector: "#nav-audit-logs",
      badge: "COMPLIANCE"
    },
    {
      title: "Tour Completed!",
      description: "Congratulations! You now understand the Dashboard, Monitoring, Detection Rules, AI Investigations, and Reporting flows.",
      selector: null,
      badge: "READY"
    }
  ];

  useEffect(() => {
    if (!isOpen) return;

    const stepObj = tourSteps[currentStep];
    if (stepObj && stepObj.selector) {
      const el = document.querySelector(stepObj.selector);
      if (el) {
        el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
        
        const updateRect = () => {
          const rect = el.getBoundingClientRect();
          setSpotlightRect({
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height
          });
        };
        
        const timeout = setTimeout(updateRect, 300);
        window.addEventListener('resize', updateRect);
        return () => {
          clearTimeout(timeout);
          window.removeEventListener('resize', updateRect);
        };
      } else {
        setSpotlightRect(null);
      }
    } else {
      setSpotlightRect(null);
    }
  }, [currentStep, isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      localStorage.setItem('soc_tour_completed', 'true');
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const triggerDemoScenario = async () => {
    setDemoRunning(true);
    try {
      const token = localStorage.getItem('soc_token');
      const sampleLogs = 
        `2026-08-23T22:00:00.000Z AUTH_SRV Failed Login for root from IP 198.51.100.42 on Port 22\n` +
        `2026-08-23T22:00:01.000Z AUTH_SRV Failed Login for admin from IP 198.51.100.42 on Port 22\n` +
        `2026-08-23T22:00:02.000Z AUTH_SRV Failed Login for guest from IP 198.51.100.42 on Port 22\n` +
        `2026-08-23T22:00:03.000Z AUTH_SRV Failed Login for operator from IP 198.51.100.42 on Port 22\n` +
        `2026-08-23T22:00:04.000Z AUTH_SRV Failed Login for user1 from IP 198.51.100.42 on Port 22\n` +
        `2026-08-23T22:00:05.000Z AUTH_SRV Failed Login for support from IP 198.51.100.42 on Port 22\n` +
        `2026-08-23T22:00:06.000Z AUTH_SRV Failed Login for mailer from IP 198.51.100.42 on Port 22\n` +
        `2026-08-23T22:00:07.000Z AUTH_SRV Failed Login for sysadmin from IP 198.51.100.42 on Port 22\n` +
        `2026-08-23T22:00:08.000Z AUTH_SRV Failed Login for testuser from IP 198.51.100.42 on Port 22\n` +
        `2026-08-23T22:00:09.000Z AUTH_SRV Failed Login for oracle from IP 198.51.100.42 on Port 22\n` +
        `2026-08-23T22:00:10.000Z AUTH_SRV Failed Login for dbadmin from IP 198.51.100.42 on Port 22`;

      const res = await fetch('/api/logs/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rawLogs: sampleLogs })
      });
      if (res.ok) {
        localStorage.setItem('soc_tour_completed', 'true');
        onClose();
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDemoRunning(false);
    }
  };

  const step = tourSteps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-[1px] p-4 overflow-hidden select-none">
      
      {/* Spotlight cutout mask overlay */}
      {spotlightRect && (
        <div 
          className="absolute border-2 border-[#2563EB] rounded-lg transition-all duration-300 pointer-events-none z-45"
          style={{
            top: spotlightRect.top - 6,
            left: spotlightRect.left - 6,
            width: spotlightRect.width + 12,
            height: spotlightRect.height + 12,
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.8), 0 0 15px rgba(37, 99, 235, 0.6)'
          }}
        />
      )}

      {/* Tour Dialog Card Box */}
      <div className="bg-[#111827] border border-slate-800 p-6 rounded-lg max-w-md w-full relative overflow-hidden z-50 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-850 pb-3">
          <h3 className="text-xs font-mono font-bold text-white flex items-center">
            <BookOpen className="w-4.5 h-4.5 mr-2 text-[#2563EB]" /> SOC_WORKSTATION_GUIDE
          </h3>
          <span className="text-[9px] font-mono bg-[#2563EB]/15 text-[#2563EB] px-2 py-0.5 rounded border border-[#2563EB]/35 font-bold">
            {step.badge}
          </span>
        </div>

        {/* Step Contents */}
        {currentStep === 0 ? (
          /* Welcome Onboarding Screen */
          <div className="space-y-4 text-center py-4">
            <div className="w-12 h-12 rounded bg-[#2563EB]/15 border border-[#2563EB]/40 flex items-center justify-center text-[#2563EB] mx-auto animate-pulse">
              <Shield className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white font-mono uppercase">{step.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">{step.description}</p>
            </div>
            <div className="flex flex-col space-y-2 pt-2 max-w-xs mx-auto">
              <button
                onClick={handleNext}
                className="w-full bg-[#2563EB] hover:bg-[#2563EB]/85 text-white py-2 rounded text-xs font-mono font-semibold transition cursor-pointer"
              >
                START INTERACTIVE TOUR
              </button>
              <button
                onClick={triggerDemoScenario}
                disabled={demoRunning}
                className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 py-2 rounded text-xs font-mono font-semibold transition cursor-pointer flex items-center justify-center space-x-1.5"
              >
                {demoRunning ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>RUN DEMO SCENARIO</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : currentStep === tourSteps.length - 1 ? (
          /* Completion Screen */
          <div className="space-y-4 text-center py-4">
            <div className="w-12 h-12 rounded bg-[#10B981]/15 border border-[#10B981]/40 flex items-center justify-center text-[#10B981] mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white font-mono uppercase">{step.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">{step.description}</p>
            </div>
            <div className="flex flex-col space-y-2 pt-2 max-w-xs mx-auto">
              <button
                onClick={triggerDemoScenario}
                disabled={demoRunning}
                className="w-full bg-[#2563EB] hover:bg-[#2563EB]/85 text-white py-2 rounded text-xs font-mono font-semibold transition cursor-pointer flex items-center justify-center space-x-1.5"
              >
                {demoRunning ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin text-white"></span>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>RUN DEMO ATTACK & GO</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  localStorage.setItem('soc_tour_completed', 'true');
                  onClose();
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 py-2 rounded text-xs font-mono font-semibold transition cursor-pointer"
              >
                EXPLORE WORKSTATION
              </button>
            </div>
          </div>
        ) : (
          /* Interactive steps with cutout highlight */
          <div className="space-y-3 text-left min-h-[120px]">
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-mono text-[#2563EB]">STEP_0{currentStep} //</span>
              <h4 className="text-sm font-bold text-white font-mono">{step.title}</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              {step.description}
            </p>
          </div>
        )}

        {/* Footer actions for interactive steps */}
        {currentStep > 0 && currentStep < tourSteps.length - 1 && (
          <div className="flex items-center justify-between border-t border-slate-850 pt-3 mt-2">
            <button
              onClick={() => {
                localStorage.setItem('soc_tour_completed', 'true');
                onClose();
              }}
              className="text-[10px] font-mono text-slate-500 hover:text-white transition cursor-pointer"
            >
              SKIP_TOUR
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleBack}
                className="flex items-center space-x-1 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-[10px] font-mono text-slate-450 hover:text-white transition cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>BACK</span>
              </button>
              <button
                onClick={handleNext}
                className="flex items-center space-x-1 px-3 py-1 bg-[#2563EB]/25 hover:bg-[#2563EB]/40 text-white border border-[#2563EB] rounded text-[10px] font-mono font-bold transition cursor-pointer"
              >
                <span>NEXT</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
