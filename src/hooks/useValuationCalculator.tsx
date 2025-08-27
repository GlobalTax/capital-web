import { useState, useCallback, useMemo } from 'react';
import { CompanyData, ValuationResult, SectorMultiple } from '@/types/valuation';
import { createValidationRules, validateStepFields, getStepFields } from '@/utils/valuationValidationRules';
import { calculateCompanyValuation } from '@/utils/valuationCalculation';

const initialCompanyData: CompanyData = {
  contactName: '',
  companyName: '',
  cif: '',
  email: '',
  phone: '',
  phone_e164: '',
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

export const useValuationCalculator = () => {
  const [companyData, setCompanyData] = useState<CompanyData>(initialCompanyData);
  const [currentStep, setCurrentStep] = useState(1);
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [showValidation, setShowValidation] = useState(false);

  const validationRules = useMemo(() => createValidationRules(), []);

  const validationState = useMemo(() => {
    const state: any = {};
    Object.keys(companyData).forEach(field => {
      const validator = validationRules[field];
      if (validator) {
        const validationResult = validator(companyData[field as keyof CompanyData]);
        state[field] = {
          ...validationResult,
          isTouched: touchedFields.has(field)
        };
      }
    });
    return state;
  }, [companyData, validationRules, touchedFields]);

  const updateField = useCallback((field: string, value: string | number | boolean) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleFieldBlur = useCallback((field: string) => {
    setTouchedFields(prev => new Set(prev).add(field));
  }, []);

  const getFieldState = useCallback((field: string) => {
    const state = validationState[field];
    return {
      isTouched: state?.isTouched || false,
      hasError: !state?.isValid && state?.isTouched,
      isValid: state?.isValid || false,
      errorMessage: state?.message
    };
  }, [validationState]);

  const validateStep = useCallback((step: number) => {
    const stepFields = getStepFields(step);
    stepFields.forEach(field => {
      setTouchedFields(prev => new Set(prev).add(field));
    });
    setShowValidation(true);
    return validateStepFields(step, companyData, validationRules);
  }, [companyData, validationRules]);

  const isStepValid = useMemo(() => {
    return validateStepFields(currentStep, companyData, validationRules);
  }, [currentStep, companyData, validationRules]);

  const goToStep = useCallback((step: number) => {
    if (step <= currentStep || validateStep(currentStep)) {
      setCurrentStep(step);
    }
  }, [currentStep, validateStep]);

  const nextStep = useCallback(async () => {
    if (currentStep === 1) {
      if (!validateStep(1)) return;
      
      setIsCalculating(true);
      try {
        const sectorMultiples: SectorMultiple[] = []; // Use fallback values
        const calculationResult = await calculateCompanyValuation(companyData, sectorMultiples);
        setResult(calculationResult);
        setCurrentStep(2);
      } catch (error) {
        console.error('Error calculating valuation:', error);
      } finally {
        setIsCalculating(false);
      }
    }
  }, [currentStep, validateStep, companyData]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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