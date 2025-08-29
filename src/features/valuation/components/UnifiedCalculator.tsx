// ============= UNIFIED CALCULATOR COMPONENT =============
// Single component to replace V1, V2, V3, Master, Standalone (NOT V4)

import React, { useEffect } from 'react';
import { useUnifiedCalculator } from '../hooks/useUnifiedCalculator';
import { useValuationCalculatorTracking } from '@/hooks/useValuationCalculatorTracking';
import { CalculatorConfig, ExtendedCompanyData } from '../types/unified.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

// V3 Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ScenarioCard from '@/components/valuation-v3/ScenarioCard';
import TaxConfigPanel from '@/components/valuation-v3/TaxConfigPanel';
import ComparisonDashboard from '@/components/valuation-v3/ComparisonDashboard';

// Master Components
import StepIndicatorMaster from '@/components/valuation-master/StepIndicatorMaster';
import StepContentMaster from '@/components/valuation-master/StepContentMaster';
import NavigationButtonsMaster from '@/components/valuation-master/NavigationButtonsMaster';

import { Building2, Calculator, BarChart3, Settings } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/format';

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
      case 'v3':
        return renderV3();
      case 'master':
        return renderMaster();
      case 'standalone':
        return renderStandalone();
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

  // ============= V3 RENDERER =============
  const renderV3 = () => {
    if (!initialData) return <div>No company data provided</div>;

    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Simulador de Venta - {initialData.companyName}
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Explora diferentes escenarios de venta y analiza el impacto fiscal de cada opción
            </p>
          </div>

          {/* Company Info */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Datos de la Empresa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Sector</div>
                  <div className="font-semibold">{initialData.industry}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Facturación</div>
                  <div className="font-semibold">{formatCurrency(initialData.revenue || 0)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">EBITDA</div>
                  <div className="font-semibold">{formatCurrency(initialData.ebitda || 0)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Valoración Base</div>
                  <div className="font-semibold text-primary">{formatCurrency(initialData.baseValuation || 0)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Tabs defaultValue="scenarios" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="scenarios" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Escenarios
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Comparación
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuración
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scenarios" className="space-y-6 mt-6">
              {/* Scenarios will render here when result is available */}
              <div className="text-center py-8">
                <p className="text-muted-foreground">V3 scenarios will be rendered here</p>
              </div>
            </TabsContent>

            <TabsContent value="comparison" className="mt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">V3 comparison will be rendered here</p>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              {calculator.taxData && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <TaxConfigPanel 
                      taxData={calculator.taxData}
                      onTaxDataChange={calculator.updateTaxData}
                    />
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  };

  // ============= MASTER RENDERER =============
  const renderMaster = () => (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t('calculator.title')}
        </h1>
        <p className="text-lg text-gray-600">
          {t('calculator.subtitle')}
        </p>
        
        {config.features.autosave && (
          <div className="flex justify-center mt-4">
            <SaveStatus isSaving={false} lastSaved={new Date()} />
          </div>
        )}
      </div>

      <StepIndicatorMaster
        currentStep={calculator.currentStep}
        goToStep={calculator.goToStep}
        validateStep={calculator.validateStep}
      />

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <StepContentMaster
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
          <NavigationButtonsMaster
            currentStep={calculator.currentStep}
            isNextDisabled={calculator.isCalculating}
            onPrev={calculator.prevStep}
            onNext={handleCalculation}
          />
        )}
      </div>
    </div>
  );

  // ============= STANDALONE RENDERER =============
  const renderStandalone = () => (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Calculadora Independiente
          </h1>
          <p className="text-lg text-muted-foreground">
            Análisis rápido de valoración empresarial
          </p>
        </div>
        
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Standalone calculator implementation coming soon
          </p>
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