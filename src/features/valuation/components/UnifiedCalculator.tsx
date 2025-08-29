// ============= UNIFIED CALCULATOR COMPONENT =============
// Single component to replace V1, V2, V3, Master, Standalone (NOT V4)

import React, { useEffect } from 'react';
import { useUnifiedCalculator } from '../hooks/useUnifiedCalculator';
import { useValuationCalculatorTracking } from '@/hooks/useValuationCalculatorTracking';
import { CalculatorConfig, ExtendedCompanyData } from '../types/unified.types';
import { SaveStatus } from '@/components/ui/save-status';
import { useI18n } from '@/shared/i18n/I18nProvider';

// Import existing UI components (we'll reuse them)
import StepIndicator from '@/components/valuation/StepIndicator';
import StepContent from '@/components/valuation/StepContent';
import NavigationButtons from '@/components/valuation/NavigationButtons';

// V2 Components
import StepIndicatorV2 from '@/components/valuation-v2/StepIndicatorV2';
import StepContentV2 from '@/components/valuation-v2/StepContentV2';
import NavigationButtonsV2 from '@/components/valuation-v2/NavigationButtonsV2';

// ============= COMPONENT PROPS =============
interface UnifiedCalculatorProps {
  config: CalculatorConfig;
  initialData?: Partial<ExtendedCompanyData>;
  className?: string;
}

// ============= MAIN COMPONENT =============
export const UnifiedCalculator: React.FC<UnifiedCalculatorProps> = ({
  config,
  initialData,
  className = ''
}) => {
  const { t } = useI18n();
  
  // Initialize unified calculator
  const calculator = useUnifiedCalculator(config, initialData);
  
  // Initialize tracking
  const tracking = useValuationCalculatorTracking();

  // Track step changes
  useEffect(() => {
    tracking.trackStepChange(calculator.currentStep);
  }, [calculator.currentStep, tracking]);

  // Enhanced field updates with tracking
  const trackedUpdateField = (field: keyof ExtendedCompanyData, value: any) => {
    calculator.updateField(field, value);
    tracking.trackFieldUpdate(field, value);
  };

  const trackedHandleFieldBlur = (field: keyof ExtendedCompanyData) => {
    calculator.handleFieldBlur(field);
    
    const fieldState = calculator.getFieldState(field.toString());
    if (fieldState.hasError && fieldState.error) {
      const errorMessage = Array.isArray(fieldState.error) 
        ? fieldState.error.join(', ') 
        : fieldState.error;
      tracking.trackValidationIssue(field, errorMessage);
    }
  };

  // Enhanced calculation with tracking
  const handleCalculation = async () => {
    if (calculator.currentStep === config.steps) {
      tracking.trackCalculationStart();
      try {
        const result = await calculator.calculateValuation();
        if (result) {
          tracking.trackCalculationComplete();
        }
      } catch (error) {
        tracking.trackCalculationAbandon(calculator.currentStep);
      }
    } else {
      calculator.nextStep();
    }
  };

  // Helper to convert errors for components
  const getCompatibleErrors = (): Record<string, string> => {
    const compatibleErrors: Record<string, string> = {};
    Object.entries(calculator.errors).forEach(([key, value]) => {
      compatibleErrors[key] = Array.isArray(value) ? value.join(', ') : value;
    });
    return compatibleErrors;
  };

  // Helper to get field state compatible with existing components
  const getCompatibleFieldState = (field: string) => {
    const state = calculator.getFieldState(field);
    return {
      isTouched: state.isTouched,
      hasError: state.hasError,
      isValid: !state.hasError,
      errorMessage: Array.isArray(state.error) ? state.error.join(', ') : state.error
    };
  };

  // Track abandon on unmount
  useEffect(() => {
    return () => {
      if (calculator.currentStep < config.steps + 1 && !calculator.result) {
        tracking.trackCalculationAbandon(calculator.currentStep);
      }
    };
  }, [calculator.currentStep, calculator.result, config.steps, tracking]);

  // ============= RENDER BY VERSION =============
  const renderByVersion = () => {
    switch (config.version) {
      case 'v1':
        return renderV1();
      case 'v2':
        return renderV2();
      default:
        return renderV1(); // fallback
    }
  };

  // ============= V1 RENDERER =============
  const renderV1 = () => (
    <div className="min-h-screen bg-white py-12 overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('calc.title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('calc.subtitle')}
          </p>
          
          {config.features.autosave && (
            <div className="flex items-center justify-center gap-4 mt-4">
              <SaveStatus isSaving={false} lastSaved={new Date()} />
            </div>
          )}
        </div>

        <StepIndicator 
          currentStep={calculator.currentStep} 
          goToStep={calculator.goToStep}
          validateStep={calculator.validateStep}
        />

        <div className="bg-white rounded-lg p-8 mb-8 border-0.5 border-border shadow-sm">
          <StepContent
            currentStep={calculator.currentStep}
            companyData={calculator.companyData}
            updateField={trackedUpdateField}
            result={calculator.result}
            isCalculating={calculator.isCalculating}
            resetCalculator={calculator.resetCalculator}
            showValidation={calculator.showValidation}
            getFieldState={getCompatibleFieldState}
            handleFieldBlur={trackedHandleFieldBlur}
            errors={getCompatibleErrors()}
          />

          {calculator.currentStep < config.steps + 1 && (
            <NavigationButtons
              currentStep={calculator.currentStep}
              isNextDisabled={calculator.isCalculating}
              onPrev={calculator.prevStep}
              onNext={handleCalculation}
            />
          )}
        </div>
      </div>
    </div>
  );

  // ============= V2 RENDERER =============
  const renderV2 = () => (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Calculadora de Valoración Empresarial
          </h1>
          <p className="text-lg text-gray-600">
            Obtén una valoración estimada de tu empresa basada en múltiplos de mercado
          </p>
        </div>

        <StepIndicatorV2 
          currentStep={calculator.currentStep} 
          goToStep={calculator.goToStep}
          validateStep={calculator.validateStep}
        />

        <div className="bg-white rounded-lg p-8 mb-8 border-0.5 border-border shadow-sm">
          <StepContentV2
            currentStep={calculator.currentStep}
            companyData={calculator.companyData}
            updateField={trackedUpdateField}
            result={calculator.result}
            isCalculating={calculator.isCalculating}
            resetCalculator={calculator.resetCalculator}
            showValidation={calculator.showValidation}
            getFieldState={getCompatibleFieldState}
            handleFieldBlur={trackedHandleFieldBlur}
            errors={getCompatibleErrors()}
          />

          {calculator.currentStep < config.steps + 1 && (
            <NavigationButtonsV2
              currentStep={calculator.currentStep}
              isNextDisabled={calculator.isCalculating}
              onPrev={calculator.prevStep}
              onNext={handleCalculation}
            />
          )}
        </div>
      </div>
    </div>
  );

  // ============= MAIN RENDER =============
  return (
    <div className={className}>
      {renderByVersion()}
    </div>
  );
};