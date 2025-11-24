// ============= TYPEFORM CALCULATOR =============
// Container principal para la calculadora estilo Typeform

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useUnifiedCalculator } from '@/features/valuation/hooks/useUnifiedCalculator';
import { V2_B_CONFIG } from '@/features/valuation/configs/calculator.configs';
import { TypeformStep } from './TypeformStep';
import { TypeformProgress } from './TypeformProgress';
import { TYPEFORM_STEPS } from './questions.config';
import Step4Results from '@/components/valuation/Step4Results';
import { useToast } from '@/hooks/use-toast';

export const TypeformCalculator: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const { toast } = useToast();
  
  const calculator = useUnifiedCalculator(V2_B_CONFIG);
  
  const currentStep = TYPEFORM_STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === TYPEFORM_STEPS.length - 1;
  const isFirstStep = currentStepIndex === 0;

  // Validar el paso actual
  const validateCurrentStep = (): boolean => {
    const requiredFields = currentStep.fields.filter(f => f.required);
    const hasErrors = requiredFields.some(field => {
      const value = calculator.companyData[field.field];
      return !value || value === '' || value === 0;
    });

    return !hasErrors;
  };

  const handleNext = async () => {
    setShowErrors(false);

    // Validar antes de avanzar
    if (!validateCurrentStep()) {
      setShowErrors(true);
      toast({
        title: 'Campos requeridos',
        description: 'Por favor completa todos los campos obligatorios',
        variant: 'destructive'
      });
      return;
    }

    if (isLastStep) {
      // Calcular valoración
      try {
        await calculator.calculateValuation();
      } catch (error) {
        console.error('Error calculating valuation:', error);
        toast({
          title: 'Error al calcular',
          description: 'Hubo un problema al calcular la valoración. Inténtalo de nuevo.',
          variant: 'destructive'
        });
      }
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setShowErrors(false);
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  // Mostrar resultados
  if (calculator.result) {
    return (
      <div className="min-h-screen bg-background py-12">
        <Step4Results
          result={calculator.result}
          companyData={calculator.companyData}
          isCalculating={calculator.isCalculating}
          resetCalculator={() => {
            calculator.resetCalculator();
            setCurrentStepIndex(0);
            setShowErrors(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-20">
      <TypeformProgress 
        current={currentStepIndex + 1} 
        total={TYPEFORM_STEPS.length} 
      />

      <AnimatePresence mode="wait">
        <TypeformStep
          key={currentStep.id}
          step={currentStep}
          companyData={calculator.companyData}
          onChange={calculator.updateField}
          onNext={handleNext}
          onPrev={handlePrev}
          errors={calculator.errors as Record<string, string>}
          showErrors={showErrors}
          isFirst={isFirstStep}
          isLast={isLastStep}
        />
      </AnimatePresence>
    </div>
  );
};
