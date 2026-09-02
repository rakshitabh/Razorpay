import React from 'react';
import { Shield, Sparkles } from 'lucide-react';
import { useTour } from './TourProvider';

export default function WelcomeModal() {
  const { welcomeOpen, startTour, skipTour } = useTour();

  if (!welcomeOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans text-xs text-left select-none">
      <div className="bg-[#131C2E] border border-[#2A3A52] p-8 rounded-lg max-w-sm w-full relative space-y-5 shadow-2xl text-center">
        
        <div className="w-12 h-12 rounded bg-[#38BDF8]/15 border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8] mx-auto animate-pulse">
          <Shield className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wide flex items-center justify-center">
            <Sparkles className="w-4 h-4 mr-1.5 text-[#38BDF8]" /> Welcome to AI Risk Workstation
          </h2>
          <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
            Configure correlation triggers, manage active fraud metrics, and generate AI-driven incident reports in seconds.
          </p>
        </div>

        <div className="flex flex-col space-y-2 pt-2">
          <button
            onClick={startTour}
            className="w-full bg-[#38BDF8] hover:bg-[#38BDF8]/80 text-[#0B1220] py-2 rounded font-semibold transition cursor-pointer"
          >
            START TOUR
          </button>
          <button
            onClick={skipTour}
            className="w-full bg-[#1B263B]/60 hover:bg-[#1B263B] border border-[#2A3A52] text-[#9CA3AF] py-2 rounded transition cursor-pointer"
          >
            SKIP
          </button>
        </div>

      </div>
    </div>
  );
}
