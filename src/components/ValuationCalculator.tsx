import React, { useEffect, useCallback, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import StepContent from './valuation/StepContent';
import NavigationButtons from './valuation/NavigationButtons';
import { useValuationCalculator } from '@/hooks/useValuationCalculator';
import { useValuationAutosave } from '@/hooks/useValuationAutosave';
import { useFormSessionTracking } from '@/hooks/useFormSessionTracking';
import { useBrevoTracking } from '@/hooks/useBrevoTracking';
import { useI18n } from '@/shared/i18n/I18nProvider';
import { AutosaveIndicator } from './valuation/AutosaveIndicator';
import { SessionRecoveryModal } from './valuation/SessionRecoveryModal';
import { CompanyData } from '@/types/valuation';

const ValuationCalculator: React.FC = () => {
  const { t } = useI18n();
  const { trackValuationCompleted, identifyContact } = useBrevoTracking();
  const [sessionRecovered, setSessionRecovered] = useState(false);
  
  const {
    currentStep,
    companyData,
    result,
    isCalculating,
    showValidation,
    isCurrentStepValid,
    updateField: originalUpdateField,
    handleFieldBlur,
    getFieldState,
    nextStep,
    prevStep,
    calculateValuation,
    resetCalculator: originalResetCalculator,
    errors
  } = useValuationCalculator();

  // FASE 1: Usar useValuationAutosave en lugar de código manual
  const {
    uniqueToken,
    lastSaved,
    isSaving,
    createInitialValuationOnFirstField,
    updateValuation,
    updateStep,
    clearAutosave,
    flushPendingUpdates
  } = useValuationAutosave();

  // FASE 2: Tracking de sesiones (soft abandonments)
  const { trackFieldTouch, linkValuation } = useFormSessionTracking({
    formType: 'valuation',
    onExitIntent: () => {
      console.log('⚠️ Usuario intenta salir - considerar mostrar modal de ayuda');
    }
  });

  // FASE 1: Wrapper para updateField que activa autosave en CUALQUIER campo
  const updateField = useCallback(async (field: keyof CompanyData, value: string | number | boolean) => {
    // Trackear toque de campo (FASE 2)
    trackFieldTouch(field);
    
    // Actualizar campo en el estado
    originalUpdateField(field, value);
    
    // FASE 1: Crear valoración en primer campo o actualizar existente
    if (!uniqueToken) {
      const token = await createInitialValuationOnFirstField(field, value, companyData);
      if (token) {
        linkValuation(token); // FASE 2: Linkear session tracking con valuation
      }
    } else {
      // Actualizar valoración existente con debounce de 500ms
      updateValuation({ [field]: value } as Partial<CompanyData>, field);
    }
  }, [originalUpdateField, trackFieldTouch, uniqueToken, createInitialValuationOnFirstField, companyData, updateValuation, linkValuation]);

  // Reset con limpieza de autosave
  const handleReset = useCallback(() => {
    console.log('🔄 Resetting calculator and clearing autosave');
    clearAutosave();
    originalResetCalculator();
  }, [clearAutosave, originalResetCalculator]);

  // FASE 3: Manejar recuperación de sesión
  const handleSessionRecovery = useCallback((sessionData: any) => {
    console.log('♻️ Recuperando sesión previa:', sessionData.token);
    
    // Restaurar todos los campos
    Object.entries(sessionData.data).forEach(([field, value]) => {
      if (value && field !== 'uniqueToken') {
        originalUpdateField(field as keyof CompanyData, value as any);
      }
    });
    
    setSessionRecovered(true);
  }, [originalUpdateField]);

  // Flush updates antes de salir
  useEffect(() => {
    const handleBeforeUnload = () => {
      flushPendingUpdates();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [flushPendingUpdates]);

  // Actualizar step en autosave
  useEffect(() => {
    if (uniqueToken) {
      updateStep(currentStep);
    }
  }, [currentStep, uniqueToken, updateStep]);

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
    <>
      {/* FASE 3: Modal de recuperación de sesión */}
      {!sessionRecovered && (
        <SessionRecoveryModal
          onContinue={handleSessionRecovery}
          onStartFresh={handleReset}
        />
      )}

      {/* FASE 1: Indicador de autoguardado */}
      <AutosaveIndicator
        isSaving={isSaving}
        lastSaved={lastSaved}
      />

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
            uniqueToken={uniqueToken}
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
    </>
  );
};

export default ValuationCalculator;