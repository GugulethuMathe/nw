import React, { useState, useEffect } from 'react';
import { useOnboarding } from './OnboardingContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export const WelcomeDialog: React.FC = () => {
  const { startOnboarding, skipOnboarding } = useOnboarding();
  const [open, setOpen] = useState(false);
  
  // Show welcome dialog after a slight delay for first-time users
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  const handleStartTutorial = () => {
    setOpen(false);
    startOnboarding();
  };
  
  const handleSkipTutorial = () => {
    setOpen(false);
    skipOnboarding();
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-primary-700">Welcome to the Baseline Assessment System</DialogTitle>
          <DialogDescription className="text-neutral-600">
            This system helps North West CET College manage and track sites, staff, assets, and programs across the province.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-3">
          <p className="text-neutral-700 mb-4">
            Would you like to take a quick tutorial to learn how to use the system?
          </p>
          
          <div className="flex items-center py-2 space-x-2 text-sm rounded-lg bg-blue-50 px-3 text-blue-800">
            <i className="fas fa-info-circle text-blue-500 mr-1"></i>
            <p>The tutorial will walk you through the main features of the application.</p>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button
            variant="outline"
            onClick={handleSkipTutorial}
          >
            Skip Tutorial
          </Button>
          <Button
            onClick={handleStartTutorial}
          >
            Start Tutorial
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};