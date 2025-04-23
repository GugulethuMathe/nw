import React from 'react';
import { useOnboarding } from './OnboardingContext';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const HelpButton: React.FC = () => {
  const { startOnboarding } = useOnboarding();
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed bottom-4 right-4 w-10 h-10 rounded-full bg-primary-500 text-white shadow-lg hover:bg-primary-600 hover:scale-110 transition-transform duration-200"
            onClick={startOnboarding}
          >
            <i className="fas fa-question text-sm"></i>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Start guided tutorial</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};