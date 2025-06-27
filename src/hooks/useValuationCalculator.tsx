
import { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CompanyData, ValuationResult, SectorMultiple } from '@/types/valuation';
import { createValidationState, validateStepData } from '@/utils/valuationValidation';
import { calculateCompanyValuation } from '@/utils/valuationCalculation';

export const useValuationCalculator = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showValidation, setShowValidation] = useState(false);
  const [sectorMultiples, setSectorMultiples] = useState<SectorMultiple[]>([]);
  const [companyData, setCompanyData] = useState<CompanyData>({
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
    competitiveAdvantage: ''
  });

  const [result, setResult] = useState<ValuationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

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

  // Memoizar la validación de datos para evitar recálculos innecesarios
  const validationState = useMemo(() => {
    return createValidationState(companyData);
  }, [companyData]);

  // Memoizar si el paso actual es válido
  const isCurrentStepValid = useMemo(() => {
    return validateStepData(currentStep, validationState);
  }, [currentStep, validationState]);

  const updateField = useCallback((field: keyof CompanyData, value: string | number) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const nextStep = useCallback(() => {
    console.log('nextStep called, currentStep:', currentStep);
    
    // Validar el paso actual antes de avanzar
    if (!isCurrentStepValid) {
      setShowValidation(true);
      return;
    }
    
    setShowValidation(false);
    setCurrentStep(prev => {
      const newStep = Math.min(prev + 1, 4);
      console.log('Moving from step', prev, 'to step', newStep);
      return newStep;
    });
  }, [currentStep, isCurrentStepValid]);

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
    return validateStepData(step, validationState);
  }, [validationState]);

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
    setCompanyData({
      contactName: '',
      companyName: '',
      cif: '',
      email: '',
      phone: '',
      industry: '',
      yearsOfOperation: 0,
      employeeRange: '',
      revenue: 0,
      ebitda: 0,
      netProfitMargin: 0,
      growthRate: 0,
      location: '',
      ownershipParticipation: '',
      competitiveAdvantage: ''
    });
    setResult(null);
    setCurrentStep(1);
    setShowValidation(false);
  }, []);

  return {
    currentStep,
    companyData,
    result,
    isCalculating,
    showValidation,
    sectorMultiples,
    validationState,
    isCurrentStepValid,
    updateField,
    nextStep,
    prevStep,
    goToStep,
    validateStep,
    calculateValuation,
    resetCalculator
  };
};
