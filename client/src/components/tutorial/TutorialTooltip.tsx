import React, { useEffect, useState, useRef } from 'react';
import { useOnboarding } from './OnboardingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export const TutorialTooltip: React.FC = () => {
  const {
    isOnboarding,
    currentStep,
    nextStep,
    prevStep,
    skipOnboarding,
    totalSteps,
    currentStepIndex,
  } = useOnboarding();
  
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  
  // Calculate the tooltip position based on the target element
  useEffect(() => {
    if (!isOnboarding || !currentStep) {
      setIsVisible(false);
      return;
    }
    
    // For center position (e.g. intro and completion steps)
    if (currentStep.position === 'center') {
      setPosition({
        top: window.innerHeight / 2 - 150,
        left: window.innerWidth / 2 - 200,
      });
      setIsVisible(true);
      return;
    }
    
    // Find the target element
    const targetElement = document.querySelector(currentStep.target);
    
    if (!targetElement) {
      console.warn(`Tutorial target element not found: ${currentStep.target}`);
      setIsVisible(false);
      return;
    }
    
    const targetRect = targetElement.getBoundingClientRect();
    const tooltipWidth = 350;
    const tooltipHeight = 240;
    const margin = 10;
    
    let top = 0;
    let left = 0;
    
    switch (currentStep.position) {
      case 'top':
        top = targetRect.top - tooltipHeight - margin;
        left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
        break;
      case 'right':
        top = targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2);
        left = targetRect.right + margin;
        break;
      case 'bottom':
        top = targetRect.bottom + margin;
        left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
        break;
      case 'left':
        top = targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2);
        left = targetRect.left - tooltipWidth - margin;
        break;
    }
    
    // Adjust if the tooltip goes off-screen
    if (left < 0) left = margin;
    if (top < 0) top = margin;
    if (left + tooltipWidth > window.innerWidth) left = window.innerWidth - tooltipWidth - margin;
    if (top + tooltipHeight > window.innerHeight) top = window.innerHeight - tooltipHeight - margin;
    
    setPosition({ top, left });
    
    // Highlight the target element by adding a temporary overlay around it
    highlightElement(targetElement);
    
    setIsVisible(true);
  }, [isOnboarding, currentStep]);
  
  // Highlight the target element
  const highlightElement = (element: Element) => {
    // Remove any previous highlights
    document.querySelectorAll('.tutorial-highlight').forEach(el => el.remove());
    
    if (currentStep?.position === 'center') return;
    
    const rect = element.getBoundingClientRect();
    
    // Create a highlight effect
    const highlight = document.createElement('div');
    highlight.className = 'tutorial-highlight';
    highlight.style.position = 'fixed';
    highlight.style.top = `${rect.top - 4}px`;
    highlight.style.left = `${rect.left - 4}px`;
    highlight.style.width = `${rect.width + 8}px`;
    highlight.style.height = `${rect.height + 8}px`;
    highlight.style.background = 'rgba(59, 130, 246, 0.2)';
    highlight.style.border = '2px solid #3b82f6';
    highlight.style.borderRadius = '4px';
    highlight.style.zIndex = '999';
    highlight.style.pointerEvents = 'none';
    highlight.style.transition = 'all 0.3s ease';
    highlight.style.animation = 'pulse-border 1.5s infinite';
    
    // Add the highlight effect
    document.body.appendChild(highlight);
    
    // Add animation style if not already present
    if (!document.getElementById('tutorial-highlight-style')) {
      const style = document.createElement('style');
      style.id = 'tutorial-highlight-style';
      style.textContent = `
        @keyframes pulse-border {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
      `;
      document.head.appendChild(style);
    }
  };
  
  // Clean up highlights when component unmounts or tutorial ends
  useEffect(() => {
    return () => {
      document.querySelectorAll('.tutorial-highlight').forEach(el => el.remove());
      
      const style = document.getElementById('tutorial-highlight-style');
      if (style) {
        style.remove();
      }
    };
  }, []);
  
  if (!isOnboarding || !currentStep || !isVisible) {
    return null;
  }
  
  return (
    <div
      ref={tooltipRef}
      className="fixed z-[1000] transition-all duration-300"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: '350px',
      }}
    >
      <Card className="shadow-xl border-primary-100 border-2">
        <CardHeader className="bg-primary-50 rounded-t-lg py-3">
          <CardTitle className="text-lg text-primary-700">
            {currentStep.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-4">
          <p className="text-neutral-700">{currentStep.description}</p>
        </CardContent>
        <CardFooter className="flex justify-between bg-neutral-50 rounded-b-lg py-3">
          <div className="flex gap-2">
            {currentStepIndex > 0 && (
              <Button variant="outline" size="sm" onClick={prevStep}>
                Previous
              </Button>
            )}
            <Button 
              variant="default" 
              size="sm" 
              onClick={nextStep}
            >
              {currentStepIndex === totalSteps - 1 ? 'Finish' : 'Next'}
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">
              {currentStepIndex + 1}/{totalSteps}
            </span>
            <Button variant="ghost" size="sm" onClick={skipOnboarding}>
              Skip
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};