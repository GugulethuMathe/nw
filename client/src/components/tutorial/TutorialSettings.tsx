import React from 'react';
import { useOnboarding } from './OnboardingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export const TutorialSettings: React.FC = () => {
  const { startOnboarding } = useOnboarding();
  const [showTutorialOnStartup, setShowTutorialOnStartup] = React.useState(() => {
    return localStorage.getItem('hasSeenTutorial') !== 'true';
  });
  
  const handleToggleAutostart = (checked: boolean) => {
    setShowTutorialOnStartup(checked);
    
    if (checked) {
      localStorage.removeItem('hasSeenTutorial');
    } else {
      localStorage.setItem('hasSeenTutorial', 'true');
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Guided Tutorial</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <p className="text-neutral-600">
            The guided tutorial walks you through the main features of the Baseline Assessment System.
          </p>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-tutorial">Show tutorial on startup</Label>
              <p className="text-sm text-neutral-500">
                Automatically start the guided tutorial when you first visit the application.
              </p>
            </div>
            <Switch
              id="show-tutorial"
              checked={showTutorialOnStartup}
              onCheckedChange={handleToggleAutostart}
            />
          </div>
          
          <Button onClick={startOnboarding} className="w-full sm:w-auto">
            Start Tutorial
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};