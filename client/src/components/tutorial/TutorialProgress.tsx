import React from 'react';
import { useOnboarding } from './OnboardingContext';
import { Progress } from '@/components/ui/progress';

export const TutorialProgress: React.FC = () => {
  const { isOnboarding, currentStepIndex, totalSteps } = useOnboarding();
  
  if (!isOnboarding) {
    return null;
  }
  
  const progressPercentage = ((currentStepIndex + 1) / totalSteps) * 100;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-[1001] bg-transparent pointer-events-none">
      <Progress
        value={progressPercentage}
        className="w-full h-1 bg-transparent"
      />
    </div>
  );
};