import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ExitReadinessProgressProps {
  currentStep: number;
  totalSteps: number;
}

const ExitReadinessProgress: React.FC<ExitReadinessProgressProps> = ({
  currentStep,
  totalSteps
}) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm text-muted-foreground mb-2">
        <span>Pregunta {currentStep} de {totalSteps}</span>
        <span>{Math.round(progress)}% completado</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};

export default ExitReadinessProgress;
