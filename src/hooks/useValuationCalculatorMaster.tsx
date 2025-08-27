import { useState, useCallback, useMemo } from 'react';
import { CompanyDataMaster, ValuationResultMaster, ValidationStateMaster } from '@/types/valuationMaster';
import { createValidationRulesMaster, validateStepFieldsMaster } from '@/utils/valuationValidationRulesMaster';
import { calculateCompanyValuationMaster } from '@/utils/valuationCalculationMaster';
// import { useSectorMultiples } from '@/hooks/useSectorMultiples';

const initialCompanyData: CompanyDataMaster = {
  contactName: '',
  companyName: '',
  cif: '',
  email: '',
  phone: '',
  whatsapp_opt_in: false,
  industry: '',
  activityDescription: '',
  employeeRange: '',
  revenue: 0,
  ebitda: 0,
  hasAdjustments: false,
  adjustmentAmount: 0,
  location: '',
  ownershipParticipation: '',
  competitiveAdvantage: ''
};

export const useValuationCalculatorMaster = () => {
  const [companyData, setCompanyData] = useState<CompanyDataMaster>(initialCompanyData);
  const [currentStep, setCurrentStep] = useState(1);
  const [result, setResult] = useState<ValuationResultMaster | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [showValidation, setShowValidation] = useState(false);

  const sectorMultiples = []; // TODO: Implement useSectorMultiples hook
  const validationRules = useMemo(() => createValidationRulesMaster(), []);

  // Validation state
  const validationState = useMemo((): ValidationStateMaster => {
    const state = {} as ValidationStateMaster;
    Object.keys(validationRules).forEach(field => {
      const key = field as keyof ValidationStateMaster;
      state[key] = validationRules[key](companyData);
    });
    return state;
  }, [companyData, validationRules]);

  const updateField = useCallback((field: string, value: string | number | boolean) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleFieldBlur = useCallback((field: string) => {
    setTouchedFields(prev => new Set([...prev, field]));
  }, []);

  const getFieldState = useCallback((field: string) => {
    const validation = validationState[field as keyof ValidationStateMaster];
    const isTouched = touchedFields.has(field) || showValidation;
    
    return {
      isTouched,
      hasError: isTouched && !validation.isValid,
      isValid: validation.isValid,
      errorMessage: isTouched && !validation.isValid ? validation.message : undefined
    };
  }, [validationState, touchedFields, showValidation]);

  const validateStep = useCallback((step: number): boolean => {
    return validateStepFieldsMaster(step, companyData, validationRules);
  }, [companyData, validationRules]);

  const isStepValid = useMemo(() => validateStep(currentStep), [validateStep, currentStep]);

  const goToStep = useCallback((step: number) => {
    // Solo permitir avanzar si los pasos anteriores son válidos
    if (step > currentStep) {
      for (let i = 1; i < step; i++) {
        if (!validateStep(i)) {
          setShowValidation(true);
          return;
        }
      }
    }
    setCurrentStep(step);
  }, [currentStep, validateStep]);

  const nextStep = useCallback(async () => {
    if (currentStep === 3 && isStepValid) {
      // Calcular en el paso 3
      setIsCalculating(true);
      try {
        const calculationResult = await calculateCompanyValuationMaster(companyData, sectorMultiples);
        setResult(calculationResult);
        setCurrentStep(4);
      } catch (error) {
        console.error('Error calculating valuation:', error);
      } finally {
        setIsCalculating(false);
      }
    } else if (currentStep < 3 && isStepValid) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowValidation(true);
    }
  }, [currentStep, isStepValid, companyData, sectorMultiples]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setShowValidation(false);
    }
  }, [currentStep]);

  const resetCalculator = useCallback(() => {
    setCompanyData(initialCompanyData);
    setCurrentStep(1);
    setResult(null);
    setIsCalculating(false);
    setTouchedFields(new Set());
    setShowValidation(false);
  }, []);

  return {
    companyData,
    currentStep,
    result,
    isCalculating,
    showValidation,
    validationState,
    isStepValid,
    updateField,
    handleFieldBlur,
    getFieldState,
    validateStep,
    goToStep,
    nextStep,
    prevStep,
    resetCalculator
  };
};