import React, { createContext, useContext, useState, useEffect } from 'react';

type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'right' | 'bottom' | 'left' | 'center';
  order: number;
};

interface OnboardingContextType {
  isOnboarding: boolean;
  startOnboarding: () => void;
  endOnboarding: () => void;
  skipOnboarding: () => void;
  currentStep: OnboardingStep | null;
  nextStep: () => void;
  prevStep: () => void;
  totalSteps: number;
  currentStepIndex: number;
}

const defaultContext: OnboardingContextType = {
  isOnboarding: false,
  startOnboarding: () => {},
  endOnboarding: () => {},
  skipOnboarding: () => {},
  currentStep: null,
  nextStep: () => {},
  prevStep: () => {},
  totalSteps: 0,
  currentStepIndex: 0,
};

const OnboardingContext = createContext<OnboardingContextType>(defaultContext);

// Define the tutorial steps
const tutorialSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to the Baseline Assessment System',
    description: 'This tutorial will guide you through the main features of the application.',
    target: 'body',
    position: 'center',
    order: 0,
  },
  {
    id: 'navigation',
    title: 'Navigation Menu',
    description: 'Use the sidebar to navigate between different sections of the application.',
    target: '.fas.fa-bars',
    position: 'right',
    order: 1,
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Get an overview of all sites, staff, and recent activities.',
    target: 'a[href="/dashboard"] div',
    position: 'right',
    order: 2,
  },
  {
    id: 'map-view',
    title: 'Map View',
    description: 'View all CET College sites geographically on an interactive map.',
    target: 'a[href="/map"] div',
    position: 'right',
    order: 3,
  },
  {
    id: 'sites',
    title: 'Sites Management',
    description: 'View and manage all college sites and centers.',
    target: 'a[href="/sites"] div',
    position: 'right',
    order: 4,
  },
  {
    id: 'staff',
    title: 'Staff Management',
    description: 'View and manage all staff members.',
    target: 'a[href="/staff"] div',
    position: 'right',
    order: 5,
  },
  {
    id: 'assets',
    title: 'Assets Tracking',
    description: 'Track all assets across different sites.',
    target: 'a[href="/assets"] div',
    position: 'right',
    order: 6,
  },
  {
    id: 'programs',
    title: 'Programs',
    description: 'View all educational programs offered at different sites.',
    target: 'a[href="/programs"] div',
    position: 'right',
    order: 7,
  },
  {
    id: 'reports',
    title: 'Reports',
    description: 'Generate and export reports about sites, staff, and assets.',
    target: 'a[href="/reports"] div',
    position: 'right',
    order: 8,
  },
  {
    id: 'offline-mode',
    title: 'Offline Mode',
    description: 'The system works offline. Your changes will sync when you reconnect to the internet.',
    target: '.sm\\:flex.items-center.text-sm.px-3.py-1.rounded-full',
    position: 'bottom',
    order: 9,
  },
  {
    id: 'user-menu',
    title: 'User Menu',
    description: 'Access your profile and settings, or log out from the application.',
    target: '.w-8.h-8.rounded-full',
    position: 'left',
    order: 10,
  },
  {
    id: 'completion',
    title: 'Ready to Start!',
    description: 'You have completed the tutorial. You can access it again from the help section in settings.',
    target: 'body',
    position: 'center',
    order: 11,
  },
];

export const OnboardingProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const sortedSteps = [...tutorialSteps].sort((a, b) => a.order - b.order);
  
  // Check if user has seen tutorial before
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    
    if (!hasSeenTutorial) {
      // Auto-start tutorial after a short delay for first-time users
      const timer = setTimeout(() => {
        startOnboarding();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  const startOnboarding = () => {
    setIsOnboarding(true);
    setCurrentStepIndex(0);
  };
  
  const endOnboarding = () => {
    setIsOnboarding(false);
    localStorage.setItem('hasSeenTutorial', 'true');
  };
  
  const skipOnboarding = () => {
    setIsOnboarding(false);
    localStorage.setItem('hasSeenTutorial', 'true');
  };
  
  const nextStep = () => {
    if (currentStepIndex < sortedSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      endOnboarding();
    }
  };
  
  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };
  
  return (
    <OnboardingContext.Provider
      value={{
        isOnboarding,
        startOnboarding,
        endOnboarding,
        skipOnboarding,
        currentStep: isOnboarding ? sortedSteps[currentStepIndex] : null,
        nextStep,
        prevStep,
        totalSteps: sortedSteps.length,
        currentStepIndex,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => useContext(OnboardingContext);