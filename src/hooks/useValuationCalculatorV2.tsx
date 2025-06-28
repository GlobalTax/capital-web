
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CompanyDataV2, ValuationResultV2, SectorMultiple } from '@/types/valuationV2';
import { calculateCompanyValuationV2 } from '@/utils/valuationCalculationV2';
import { useFormValidation } from '@/hooks/useFormValidation';
import { createValidationRulesV2, validateStepFieldsV2, getStepFieldsV2 } from '@/utils/valuationValidationRulesV2';

const initialCompanyDataV2: CompanyDataV2 = {
  // Paso 1
  contactName: '',
  companyName: '',
  cif: '',
  email: '',
  phone: '',
  industry: '',
  yearsOfOperation: 0,
  employeeRange: '',
  
  // Paso 2
  revenue: 0,
  ebitda: 0,
  netProfitMargin: 0,
  growthRate: 0,
  
  // Paso 3
  location: '',
  ownershipParticipation: '',
  competitiveAdvantage: '',

  // Paso 4: Datos fiscales
  acquisitionCost: 0,
  yearsHeld: 1,
  salePercentage: 100,
  taxRegime: 'general',
  reinvestmentPlan: false,
  reinvestmentAmount: 0,
  previousCapitalGains: 0
};

export const useValuationCalculatorV2 = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showValidation, setShowValidation] = useState(false);
  const [sectorMultiples, setSectorMultiples] = useState<SectorMultiple[]>([]);
  const [result, setResult] = useState<ValuationResultV2 | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Usar el hook de validación con reglas V2
  const validationRules = createValidationRulesV2();
  const {
    data: companyData,
    errors,
    touched,
    isValid: isFormValid,
    updateField: updateFormField,
    markFieldAsTouched,
    getFieldState,
    validateAll,
    reset: resetForm
  } = useFormValidation(initialCompanyDataV2, validationRules);

  // Cargar múltiplos por sector desde Supabase
  useEffect(() => {
    const fetchSectorMultiples = async () => {
      try {
        const { data, error } = await supabase
          .from('sector_multiples')
          .select('*')
          .eq('is_active', true)
          .order('sector_name');
        
        if (error) {
          console.error('Error fetching sector multiples:', error);
          return;
        }
        
        setSectorMultiples(data || []);
      } catch (error) {
        console.error('Error fetching sector multiples:', error);
      }
    };

    fetchSectorMultiples();
  }, []);

  // Validar si el paso actual es válido
  const isCurrentStepValid = useCallback(() => {
    return validateStepFieldsV2(currentStep, companyData, validationRules);
  }, [currentStep, companyData, validationRules]);

  // Wrapper para updateField que mantiene compatibilidad
  const updateField = useCallback((field: keyof CompanyDataV2, value: string | number | boolean) => {
    updateFormField(field, value);
  }, [updateFormField]);

  // Función para manejar blur y marcar campos como tocados
  const handleFieldBlur = useCallback((field: keyof CompanyDataV2) => {
    markFieldAsTouched(field);
  }, [markFieldAsTouched]);

  const nextStep = useCallback(() => {
    console.log('nextStep called, currentStep:', currentStep);
    
    // Marcar todos los campos del paso actual como tocados
    const stepFields = getStepFieldsV2(currentStep);
    stepFields.forEach(field => markFieldAsTouched(field as keyof CompanyDataV2));
    
    // Validar el paso actual antes de avanzar
    if (!isCurrentStepValid()) {
      setShowValidation(true);
      return;
    }
    
    setShowValidation(false);
    setCurrentStep(prev => {
      const newStep = Math.min(prev + 1, 5); // Ahora son 5 pasos
      console.log('Moving from step', prev, 'to step', newStep);
      return newStep;
    });
  }, [currentStep, isCurrentStepValid, markFieldAsTouched]);

  const prevStep = useCallback(() => {
    console.log('prevStep called');
    setShowValidation(false);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    console.log('goToStep called with step:', step);
    setShowValidation(false);
    setCurrentStep(step);
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    return validateStepFieldsV2(step, companyData, validationRules);
  }, [companyData, validationRules]);

  const calculateValuation = useCallback(async () => {
    console.log('calculateValuation called');
    setIsCalculating(true);
    
    try {
      const valuationResult = await calculateCompanyValuationV2(companyData, sectorMultiples);
      setResult(valuationResult);
      setCurrentStep(5); // Ir al paso de resultados (ahora es el 5)
      console.log('Valuation calculated, moved to step 5');
    } catch (error) {
      console.error('Error calculating valuation:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [companyData, sectorMultiples]);

  const resetCalculator = useCallback(() => {
    resetForm();
    setResult(null);
    setCurrentStep(1);
    setShowValidation(false);
  }, [resetForm]);

  return {
    currentStep,
    companyData,
    result,
    isCalculating,
    showValidation,
    sectorMultiples,
    errors,
    touched,
    isCurrentStepValid: isCurrentStepValid(),
    isFormValid,
    updateField,
    handleFieldBlur,
    getFieldState,
    nextStep,
    prevStep,
    goToStep,
    validateStep,
    calculateValuation,
    resetCalculator
  };
};
