
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export const ProgressIndicator = React.memo(({ steps, currentStep, className }: ProgressIndicatorProps) => {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={cn("w-full space-y-4", className)}>
      <Progress value={progress} className="h-2" />
      
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isPending = index > currentStep;

          return (
            <div key={step.id} className="flex flex-col items-center text-center max-w-24">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-colors",
                isCompleted && "bg-primary text-primary-foreground",
                isCurrent && "bg-primary/20 text-primary border-2 border-primary",
                isPending && "bg-muted text-muted-foreground"
              )}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </div>
              
              <div className="text-xs">
                <div className={cn(
                  "font-medium mb-1",
                  (isCompleted || isCurrent) ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.title}
                </div>
                {step.description && (
                  <div className="text-muted-foreground text-xs">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

ProgressIndicator.displayName = 'ProgressIndicator';

interface LinearProgressProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export const LinearProgress = React.memo(({ 
  value, 
  label, 
  showPercentage = true, 
  className 
}: LinearProgressProps) => (
  <div className={cn("space-y-2", className)}>
    {(label || showPercentage) && (
      <div className="flex justify-between text-sm">
        {label && <span className="text-foreground font-medium">{label}</span>}
        {showPercentage && <span className="text-muted-foreground">{Math.round(value)}%</span>}
      </div>
    )}
    <Progress value={value} className="h-2" />
  </div>
));

LinearProgress.displayName = 'LinearProgress';

export default ProgressIndicator;
