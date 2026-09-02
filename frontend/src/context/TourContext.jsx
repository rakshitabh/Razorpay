import React, { createContext, useState, useContext, useEffect } from 'react';

const TourContext = createContext();

export const TourProvider = ({ children }) => {
  const [run, setRun] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const TOUR_STEPS = [
    {
      target: '[data-tour="dashboard"]',
      content: 'The SOC Dashboard provides an overview of telemetry, active incident counters, threat maps, and database health metrics.',
      disableBeacon: true
    },
    {
      target: '[data-tour="event-stream"]',
      content: 'The Event Stream tab displays parsed syslogs in real time. Pause or search records to inspect attacks.',
      disableBeacon: true
    },
    {
      target: '[data-tour="logs"]',
      content: 'Log Ingestion allows pasting syslogs or uploading .txt, .log, .csv, and .json telemetry logs for the rules parser.',
      disableBeacon: true
    },
    {
      target: '[data-tour="detection-rules"]',
      content: 'The Detection Rules workspace displays active correlation threshold rule profiles and MITRE mappings.',
      disableBeacon: true
    },
    {
      target: '[data-tour="incidents"]',
      content: 'The Incidents workspace groups correlated tickets. Review AI-generated timelines, playbooks, and log notes.',
      disableBeacon: true
    },
    {
      target: '[data-tour="reports"]',
      content: 'The Reports Directory lets you export security audit reports compiled by the Report Agent in PDF, MD, and JSON.',
      disableBeacon: true
    },
    {
      target: '[data-tour="audit-logs"]',
      content: 'Security Audit Logs display an immutable history trace recording all password modifications and playbook actions.',
      disableBeacon: true
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
    setStepIndex(0);
  };

  const skipTour = () => {
    setWelcomeOpen(false);
    setRun(false);
    localStorage.setItem('soc_joyride_completed', 'true');
  };

  const restartTour = () => {
    setWelcomeOpen(false);
    setRun(true);
    setStepIndex(0);
  };

  const completeTour = () => {
    setRun(false);
    localStorage.setItem('soc_joyride_completed', 'true');
  };

  return (
    <TourContext.Provider value={{
      run,
      setRun,
      welcomeOpen,
      setWelcomeOpen,
      steps: TOUR_STEPS,
      stepIndex,
      setStepIndex,
      startTour,
      skipTour,
      restartTour,
      completeTour
    }}>
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => useContext(TourContext);
