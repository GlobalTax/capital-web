
import { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CompanyData, ValuationResult, SectorMultiple } from '@/types/valuation';
import { calculateCompanyValuation } from '@/utils/valuationCalculation';
import { useFormValidation } from '@/hooks/useFormValidation';
import { createValidationRules, validateStepFields, getStepFields } from '@/utils/valuationValidationRules';

const initialCompanyData: CompanyData = {
  // Paso 1
  contactName: '',
  companyName: '',
  cif: '',
  email: '',
  phone: '',
  industry: '',
  activityDescription: '',
  employeeRange: '',
  
  // Paso 2
  revenue: 0,
  ebitda: 0,
  hasAdjustments: false,
  adjustmentAmount: 0,
  
  // Paso 3
  location: '',
  ownershipParticipation: '',
  competitiveAdvantage: ''
};

export const useValuationCalculator = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showValidation, setShowValidation] = useState(false);
  const [sectorMultiples, setSectorMultiples] = useState<SectorMultiple[]>([]);
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

// Estado del formulario y validación (nuevo API)
  const [companyData, setCompanyData] = useState<CompanyData>(initialCompanyData);
  const validationRules = createValidationRules();
  const {
    validationState,
    validateField,
    markFieldTouched,
    reset: resetValidation,
    getFieldError,
    isFieldTouched,
    isFieldValid
  } = useFormValidation({ fields: validationRules as any });

  const errors = useMemo(() => {
    const map: Record<string, string> = {};
    validationState.errors.forEach(e => {
      if (map[e.field]) {
        map[e.field] = `${map[e.field]}, ${e.message}`;
      } else {
        map[e.field] = e.message;
      }
    });
    return map;
  }, [validationState.errors]);

  const touched = validationState.touchedFields;
  const isFormValid = validationState.isValid;

  const getFieldState = useCallback((field: keyof CompanyData) => {
    const name = field as string;
    const error = getFieldError(name)?.message;
    return {
      isTouched: isFieldTouched(name),
      hasError: !!error,
      isValid: isFieldValid(name),
      errorMessage: error
    };
  }, [getFieldError, isFieldTouched, isFieldValid]);

  const updateFormField = useCallback((field: keyof CompanyData, value: any) => {
    setCompanyData(prev => {
      const updated = { ...prev, [field]: value };
      validateField(field as string, value, updated, true);
      return updated;
    });
  }, [validateField]);

  const markFieldAsTouched = markFieldTouched;
  const resetForm = resetValidation;

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
    return validateStepFields(currentStep, companyData, validationRules);
  }, [currentStep, companyData, validationRules]);

  // Wrapper para updateField que mantiene compatibilidad
  const updateField = useCallback((field: keyof CompanyData, value: string | number | boolean) => {
    updateFormField(field, value);
  }, [updateFormField]);

  // Función para manejar blur y marcar campos como tocados
  const handleFieldBlur = useCallback((field: keyof CompanyData) => {
    markFieldAsTouched(field);
  }, [markFieldAsTouched]);

  const nextStep = useCallback(() => {
    console.log('nextStep called, currentStep:', currentStep);
    
    // Marcar todos los campos del paso actual como tocados
    const stepFields = getStepFields(currentStep);
    stepFields.forEach(field => markFieldAsTouched(field as keyof CompanyData));
    
    // Validar el paso actual antes de avanzar
    if (!isCurrentStepValid()) {
      setShowValidation(true);
      return;
    }
    
    setShowValidation(false);
    setCurrentStep(prev => {
      const newStep = Math.min(prev + 1, 4);
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
    return validateStepFields(step, companyData, validationRules);
  }, [companyData, validationRules]);

  const calculateValuation = useCallback(async () => {
    console.log('calculateValuation called');
    setIsCalculating(true);
    
    try {
      const valuationResult = await calculateCompanyValuation(companyData, sectorMultiples);
      setResult(valuationResult);
      setCurrentStep(4); // Ir al paso de resultados
      console.log('Valuation calculated, moved to step 4');
    } catch (error) {
      console.error('Error calculating valuation:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [companyData, sectorMultiples]);

  const resetCalculator = useCallback(() => {
    // Reset más inteligente: mantener datos básicos de contacto y empresa
    const resetData: CompanyData = {
      ...initialCompanyData,
      contactName: companyData.contactName,
      companyName: companyData.companyName,
      email: companyData.email,
      phone: companyData.phone,
      industry: companyData.industry,
      activityDescription: companyData.activityDescription,
      employeeRange: companyData.employeeRange
    };
    
    resetForm();
    updateFormField('contactName', resetData.contactName);
    updateFormField('companyName', resetData.companyName);
    updateFormField('email', resetData.email);
    updateFormField('phone', resetData.phone);
    updateFormField('industry', resetData.industry);
    updateFormField('activityDescription', resetData.activityDescription);
    updateFormField('employeeRange', resetData.employeeRange);
    
    setResult(null);
    setCurrentStep(1);
    setShowValidation(false);
  }, [companyData, resetForm, updateFormField]);

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
