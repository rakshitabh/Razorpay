import React, { createContext, useContext, useState, useEffect } from 'react';
import { Joyride } from 'react-joyride';

const TourContext = createContext();

export const useTour = () => useContext(TourContext);

export default function TourProvider({ children }) {
  const [run, setRun] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);

  const steps = [
    {
      target: '#run-demo-btn',
      content: 'Click here to launch the simulation seeder. It will dispatch raw event batch telemetry (Security or Fintech) and auto-create an incident.',
      disableBeacon: true,
      placement: 'bottom'
    },
    {
      target: '#nav-incidents',
      content: 'Go to the Incidents registry page to view all open threat alerts and fraud cases.',
      disableBeacon: true,
      placement: 'right'
    },
    {
      target: '#incident-registry-table',
      content: 'Click inspecting buttons on any ticket to open the state-of-the-art analyst workspace.',
      disableBeacon: true,
      placement: 'top'
    },
    {
      target: '#incident-timeline-section',
      content: 'Review the chronological audit timeline tracking everything from raw log ingestion to playbook containment executions.',
      disableBeacon: true,
      placement: 'right'
    },
    {
      target: '#ai-investigation-section',
      content: 'Examine Gemini flash autonomic findings, mapping target host vulnerabilities or financial indicators.',
      disableBeacon: true,
      placement: 'top'
    },
    {
      target: '#nav-reports',
      content: 'Finally, go to the Reports Directory to download compiled executive and compliance summaries.',
      disableBeacon: true,
      placement: 'right'
    }
  ];

  useEffect(() => {
    const isCompleted = localStorage.getItem('soc_joyride_completed') === 'true';
    if (!isCompleted) {
      setWelcomeOpen(true);
    }
  }, []);

  const startTour = () => {
    setWelcomeOpen(false);
    setRun(true);
  };

  const skipTour = () => {
    setWelcomeOpen(false);
    setRun(false);
    localStorage.setItem('soc_joyride_completed', 'true');
  };

  const restartTour = () => {
    setWelcomeOpen(false);
    setRun(true);
  };

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if (status === 'finished' || status === 'skipped') {
      setRun(false);
      localStorage.setItem('soc_joyride_completed', 'true');
    }
  };

  const customStyles = {
    options: {
      arrowColor: '#111827',
      backgroundColor: '#111827',
      overlayColor: 'rgba(15, 23, 42, 0.85)',
      primaryColor: '#38BDF8',
      textColor: '#F8FAFC',
      zIndex: 10000
    },
    tooltip: {
      borderRadius: '8px',
      border: '1px solid #334155',
      padding: '16px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
    },
    tooltipContainer: {
      textAlign: 'left',
      fontFamily: 'Inter, sans-serif',
      fontSize: '12px',
      lineHeight: '1.6'
    },
    buttonNext: {
      backgroundColor: '#38BDF8',
      fontSize: '11px',
      fontFamily: 'Inter, sans-serif',
      fontWeight: 'bold',
      borderRadius: '4px',
      color: '#0F172A',
      padding: '6px 12px',
      outline: 'none',
      cursor: 'pointer'
    },
    buttonBack: {
      color: '#9CA3AF',
      fontSize: '11px',
      fontFamily: 'Inter, sans-serif',
      marginRight: '8px',
      outline: 'none',
      cursor: 'pointer'
    },
    buttonSkip: {
      color: '#9CA3AF',
      fontSize: '11px',
      fontFamily: 'Inter, sans-serif',
      outline: 'none',
      cursor: 'pointer'
    }
  };

  return (
    <TourContext.Provider value={{ welcomeOpen, setWelcomeOpen, startTour, skipTour, restartTour }}>
      {children}
      <Joyride
        steps={steps}
        run={run}
        continuous={true}
        showSkipButton={true}
        showProgress={true}
        styles={customStyles}
        callback={handleJoyrideCallback}
        locale={{
          back: 'BACK',
          close: 'CLOSE',
          last: 'FINISH',
          next: 'NEXT',
          skip: 'SKIP'
        }}
      />
    </TourContext.Provider>
  );
}
