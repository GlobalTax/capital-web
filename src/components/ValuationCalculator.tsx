import React, { useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import StepContent from './valuation/StepContent';
import NavigationButtons from './valuation/NavigationButtons';
import { useValuationCalculator } from '@/hooks/useValuationCalculator';
import { useOptimizedSupabaseValuation } from '@/hooks/useOptimizedSupabaseValuation';
import { useBrevoTracking } from '@/hooks/useBrevoTracking';
import { useI18n } from '@/shared/i18n/I18nProvider';

const ValuationCalculator: React.FC = () => {
  const { t } = useI18n();
  const { createInitialValuation, updateValuation } = useOptimizedSupabaseValuation();
  const { trackValuationCompleted, identifyContact } = useBrevoTracking();
  const uniqueTokenRef = useRef<string | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveExecutedRef = useRef(false);
  
  const {
    currentStep,
    companyData,
    result,
    isCalculating,
    showValidation,
    isCurrentStepValid,
    updateField,
    handleFieldBlur,
    getFieldState,
    nextStep,
    prevStep,
    calculateValuation,
    resetCalculator,
    errors
  } = useValuationCalculator();

  // Solo limpiar el token cuando se resetea explícitamente la calculadora
  const handleReset = useCallback(() => {
    console.log('🔄 Resetting calculator and clearing uniqueToken');
    uniqueTokenRef.current = null;
    resetCalculator();
  }, [resetCalculator]);

  // Effect para auto-guardado con debounce - SOLO usando campos específicos como dependencias
  useEffect(() => {
    // Verificar si tenemos datos mínimos directamente en el effect
    const hasMinimalDataNow = companyData.contactName?.trim() && 
                             companyData.email?.trim() && 
                             companyData.companyName?.trim() &&
                             companyData.email.includes('@');

    if (!hasMinimalDataNow) return;

    // Limpiar timeout anterior
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Configurar nuevo timeout (debounce de 2 segundos)
    autoSaveTimeoutRef.current = setTimeout(async () => {
      // Evitar ejecuciones múltiples con la misma data
      if (saveExecutedRef.current) return;
      
      try {
        saveExecutedRef.current = true;
        
        // Si no tenemos token, crear registro inicial
        if (!uniqueTokenRef.current) {
          console.log('🟡 Creando registro inicial para auto-guardado...');
          const result = await createInitialValuation({
            contactName: companyData.contactName,
            companyName: companyData.companyName,
            cif: companyData.cif,
            email: companyData.email,
            phone: companyData.phone,
            industry: companyData.industry,
            employeeRange: companyData.employeeRange
          });
          
          if (result.success && result.uniqueToken) {
            uniqueTokenRef.current = result.uniqueToken;
            console.log('✅ Registro inicial creado con token:', result.uniqueToken);
          }
        } else {
          // Actualizar registro existente
          console.log('🟡 Actualizando registro existente...');
          const success = await updateValuation(uniqueTokenRef.current, {
            contactName: companyData.contactName,
            companyName: companyData.companyName,
            cif: companyData.cif,
            email: companyData.email,
            phone: companyData.phone,
            industry: companyData.industry,
            employeeRange: companyData.employeeRange,
            revenue: companyData.revenue,
            ebitda: companyData.ebitda,
            location: companyData.location,
            ownershipParticipation: companyData.ownershipParticipation,
            competitiveAdvantage: companyData.competitiveAdvantage
          });
          
          if (success) {
            console.log('✅ Registro actualizado correctamente');
          }
        }
      } catch (error) {
        console.error('❌ Error en auto-guardado:', error);
      } finally {
        // Reset flag después de un tiempo para permitir nuevos guardados
        setTimeout(() => {
          saveExecutedRef.current = false;
        }, 1000);
      }
    }, 2000);

    // Cleanup
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [
    // Solo usar campos específicos como dependencias para evitar loops
    companyData.contactName,
    companyData.email, 
    companyData.companyName,
    companyData.cif,
    companyData.phone,
    companyData.industry,
    companyData.employeeRange,
    companyData.revenue,
    companyData.ebitda,
    companyData.location,
    companyData.ownershipParticipation,
    companyData.competitiveAdvantage,
    createInitialValuation,
    updateValuation
  ]);

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return t('steps.basic_info');
      case 2: return t('steps.financial_data');
      case 3: return t('steps.characteristics');
      case 4: return t('steps.results');
      default: return '';
    }
  };

  const handleNext = async () => {
    if (currentStep === 3) {
      console.log('🎯 Starting valuation calculation...');
      await calculateValuation();
    } else {
      nextStep();
    }
  };

  // Trackear valoración completada y identificar contacto cuando hay resultado
  useEffect(() => {
    if (result && result.finalValuation > 0) {
      // Trackear evento de valoración completada
      trackValuationCompleted({
        sector: companyData.industry,
        value: result.finalValuation,
        employeeRange: companyData.employeeRange,
        revenue: companyData.revenue || 0,
        ebitda: companyData.ebitda || 0,
      });

      // Identificar contacto en Brevo
      identifyContact(companyData.email, {
        empresa: companyData.companyName,
        nombre: companyData.contactName,
        telefono: companyData.phone,
        sector: companyData.industry,
      });

      console.log('📊 [Brevo] Valuation tracked and contact identified');
    }
  }, [result, companyData, trackValuationCompleted, identifyContact]);

  const progressValue = currentStep === 4 ? 100 : ((currentStep - 1) / 3) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="shadow-lg">
        <CardContent className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
              {t('calculator.title')}
            </h1>
            <p className="text-center text-gray-600 mb-6">
              {t('calculator.subtitle')}
            </p>
            
            {/* Progress Bar - Only show for steps 1-3 */}
            {currentStep <= 3 && (
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{getStepTitle(currentStep)}</span>
                  <span>{t('nav.step_of', { current: currentStep, total: 3 })}</span>
                </div>
                <Progress value={progressValue} className="h-2" />
              </div>
            )}
          </div>

          {/* Step Content */}
          <StepContent
            currentStep={currentStep}
            companyData={companyData}
            updateField={updateField}
            result={result}
            isCalculating={isCalculating}
            resetCalculator={handleReset}
            showValidation={showValidation}
            getFieldState={getFieldState}
            handleFieldBlur={handleFieldBlur}
            errors={errors}
            uniqueToken={uniqueTokenRef.current}
          />

          {/* Navigation - Only show for steps 1-3 */}
          {currentStep <= 3 && (
            <NavigationButtons
              currentStep={currentStep}
              isNextDisabled={!isCurrentStepValid}
              onPrev={prevStep}
              onNext={handleNext}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ValuationCalculator;