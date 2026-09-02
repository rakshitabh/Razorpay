import React from 'react';
import { Joyride } from 'react-joyride';
import { useTour } from '../context/TourContext';

export default function ProductTour() {
  const { run, steps, completeTour } = useTour();

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if (status === 'finished' || status === 'skipped') {
      completeTour();
    }
  };

  const customStyles = {
    options: {
      arrowColor: '#111827',
      backgroundColor: '#111827',
      overlayColor: 'rgba(15, 23, 42, 0.85)',
      primaryColor: '#2563EB',
      textColor: '#F8FAFC',
      zIndex: 10000
    },
    tooltip: {
      borderRadius: '8px',
      border: '1px solid #374151',
      padding: '16px'
    },
    tooltipContainer: {
      textAlign: 'left',
      fontFamily: 'monospace',
      fontSize: '11px',
      lineHeight: '1.5'
    },
    buttonNext: {
      backgroundColor: '#2563EB',
      fontSize: '10px',
      fontFamily: 'monospace',
      fontWeight: 'bold',
      borderRadius: '4px',
      color: '#FFFFFF',
      padding: '6px 12px',
      outline: 'none'
    },
    buttonBack: {
      color: '#94A3B8',
      fontSize: '10px',
      fontFamily: 'monospace',
      marginRight: '8px',
      outline: 'none'
    },
    buttonSkip: {
      color: '#64748B',
      fontSize: '10px',
      fontFamily: 'monospace',
      outline: 'none'
    }
  };

  return (
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
        open: 'OPEN',
        skip: 'SKIP'
      }}
    />
  );
}
