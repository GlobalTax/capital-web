import { useState, useCallback } from 'react';
import { CompanyData, ValuationResult, ValidationState, ValidationResult } from '@/types/valuation';
import { useMAErrorHandler } from './useMAErrorHandler';
import { 
  ValuationError, 
  FinancialDataError, 
  ValidationError 
} from '@/types/errorTypes';

interface UseValuationCalculatorReturn {
  currentStep: number;
  companyData: CompanyData;
  result: ValuationResult | null;
  isCalculating: boolean;
  showValidation: boolean;
  errors: Record<string, string>;
  getFieldState: (field: string) => { isTouched: boolean; hasError: boolean; isValid: boolean; errorMessage?: string; };
  handleFieldBlur: (field: keyof CompanyData) => void;
  updateField: (field: keyof CompanyData, value: any) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  validateStep: (step: number) => boolean;
  calculateValuation: () => Promise<ValuationResult | null>;
  resetCalculator: () => void;
}

export const useValuationCalculator = (): UseValuationCalculatorReturn => {
  const [currentStep, setCurrentStep] = useState(1);
  const [companyData, setCompanyData] = useState<CompanyData>({
    contactName: '',
    companyName: '',
    cif: '',
    email: '',
    phone: '',
    industry: '',
    activityDescription: '',
    employeeRange: '',
    revenue: 0,
    ebitda: 0,
    hasAdjustments: false,
    adjustmentAmount: 0,
    location: '',
    ownershipParticipation: '',
    competitiveAdvantage: '',
  });
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationState, setValidationState] = useState<ValidationState>({
    contactName: { isValid: false },
    companyName: { isValid: false },
    email: { isValid: false },
    phone: { isValid: false },
    cif: { isValid: false },
    industry: { isValid: false },
    activityDescription: { isValid: false },
    employeeRange: { isValid: false },
    revenue: { isValid: false },
    ebitda: { isValid: false },
    hasAdjustments: { isValid: true },
    adjustmentAmount: { isValid: true },
    location: { isValid: false },
    ownershipParticipation: { isValid: false },
    competitiveAdvantage: { isValid: false },
  });

  const { 
    handleValuationError,
    handleFinancialDataError,
    createFinancialDataError 
  } = useMAErrorHandler();

  const getFieldState = useCallback((field: string) => {
    const validation = validationState[field as keyof CompanyData] || { isValid: false };
    return {
      isTouched: showValidation || Boolean(errors[field]),
      hasError: Boolean(errors[field]),
      isValid: validation.isValid,
      errorMessage: errors[field]
    };
  }, [validationState, showValidation, errors]);

  const validateField = useCallback((field: keyof CompanyData, value: any): ValidationResult => {
    switch (field) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return {
          isValid: emailRegex.test(value),
          message: emailRegex.test(value) ? undefined : 'Email inválido'
        };
      case 'revenue':
      case 'ebitda':
        const num = Number(value);
        return {
          isValid: !isNaN(num) && num >= 0,
          message: (!isNaN(num) && num >= 0) ? undefined : 'Debe ser un número positivo'
        };
      default:
        return {
          isValid: Boolean(value && value.toString().trim()),
          message: Boolean(value && value.toString().trim()) ? undefined : 'Campo requerido'
        };
    }
  }, []);

  const updateField = useCallback((field: keyof CompanyData, value: any) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
    
    const validation = validateField(field, value);
    setValidationState(prev => ({ ...prev, [field]: validation }));
    
    if (validation.message) {
      setErrors(prev => ({ ...prev, [field]: validation.message! }));
    } else {
      setErrors(prev => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  }, [validateField]);

  const handleFieldBlur = useCallback((field: keyof CompanyData) => {
    const validation = validateField(field, companyData[field]);
    setValidationState(prev => ({ ...prev, [field]: validation }));
    
    if (validation.message) {
      setErrors(prev => ({ ...prev, [field]: validation.message! }));
    }
  }, [validateField, companyData]);

  const validateStep = useCallback((step: number): boolean => {
    const stepFields: Record<number, (keyof CompanyData)[]> = {
      1: ['contactName', 'companyName', 'cif', 'email', 'phone', 'industry', 'activityDescription', 'employeeRange'],
      2: ['revenue', 'ebitda'],
      3: ['location', 'ownershipParticipation', 'competitiveAdvantage']
    };

    const fieldsToValidate = stepFields[step] || [];
    return fieldsToValidate.every(field => validationState[field].isValid);
  }, [validationState]);

  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      setShowValidation(false);
    } else {
      setShowValidation(true);
    }
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setShowValidation(false);
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step <= 1) {
      setCurrentStep(step);
      return;
    }
    
    // Validar pasos anteriores
    for (let i = 1; i < step; i++) {
      if (!validateStep(i)) {
        setShowValidation(true);
        return;
      }
    }
    
    setCurrentStep(step);
    setShowValidation(false);
  }, [validateStep]);

  const calculateValuation = useCallback(async (): Promise<ValuationResult | null> => {
    setIsCalculating(true);
    
    try {
      // Validar datos financieros
      if (companyData.ebitda <= 0) {
        throw createFinancialDataError(
          'El EBITDA debe ser mayor a cero para calcular la valoración',
          'ebitda',
          { min: 0, max: Number.MAX_SAFE_INTEGER },
          companyData.ebitda
        );
      }

      // Simular cálculo (aquí iría la lógica real)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const ebitdaMultiple = 8; // Múltiplo ejemplo
      const finalValuation = companyData.ebitda * ebitdaMultiple;
      
      const calculationResult: ValuationResult = {
        ebitdaMultiple,
        finalValuation,
        valuationRange: {
          min: finalValuation * 0.8,
          max: finalValuation * 1.2
        },
        multiples: {
          ebitdaMultipleUsed: ebitdaMultiple
        }
      };

      setResult(calculationResult);
      setCurrentStep(4);
      return calculationResult;
      
    } catch (error) {
      if (error instanceof FinancialDataError) {
        handleFinancialDataError(error, {
          component: 'ValuationCalculator',
          companyId: companyData.companyName
        });
      } else if (error instanceof ValuationError) {
        handleValuationError(error, {
          component: 'ValuationCalculator',
          companyId: companyData.companyName,
          sector: companyData.industry
        });
      }
      return null;
    } finally {
      setIsCalculating(false);
    }
  }, [createFinancialDataError, handleFinancialDataError, handleValuationError]);

  const resetCalculator = useCallback(() => {
    setCurrentStep(1);
    setCompanyData({
      contactName: '',
      companyName: '',
      cif: '',
      email: '',
      phone: '',
      industry: '',
      activityDescription: '',
      employeeRange: '',
      revenue: 0,
      ebitda: 0,
      hasAdjustments: false,
      adjustmentAmount: 0,
      location: '',
      ownershipParticipation: '',
      competitiveAdvantage: '',
    });
    setResult(null);
    setErrors({});
    setShowValidation(false);
    setValidationState({
      contactName: { isValid: false },
      companyName: { isValid: false },
      email: { isValid: false },
      phone: { isValid: false },
      cif: { isValid: false },
      industry: { isValid: false },
      activityDescription: { isValid: false },
      employeeRange: { isValid: false },
      revenue: { isValid: false },
      ebitda: { isValid: false },
      hasAdjustments: { isValid: true },
      adjustmentAmount: { isValid: true },
      location: { isValid: false },
      ownershipParticipation: { isValid: false },
      competitiveAdvantage: { isValid: false },
    });
  }, []);

  return {
    currentStep,
    companyData,
    result,
    isCalculating,
    showValidation,
    errors,
    getFieldState,
    handleFieldBlur,
    updateField,
    nextStep,
    prevStep,
    goToStep,
    validateStep,
    calculateValuation,
    resetCalculator
  };
};