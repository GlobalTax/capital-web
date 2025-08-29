// ============= UNIFIED CALCULATOR HOOK =============
// Single hook to rule all calculator versions

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCentralizedErrorHandler } from '@/hooks/useCentralizedErrorHandler';
import { dataAccessService } from '../services/data-access.service';
import { 
  ExtendedCompanyData, 
  CalculatorState, 
  CalculatorConfig, 
  ValuationResult,
  ComprehensiveResult,
  TaxData,
  ScenarioResult
} from '../types/unified.types';
import { calculateUnifiedValuation } from '../utils/calculation.engine';
import { validateCalculatorData } from '../utils/validation.engine';

// ============= INITIAL STATE =============
const createInitialState = (config: CalculatorConfig): CalculatorState => ({
  currentStep: 1,
  companyData: {
    contactName: '',
    companyName: '',
    email: '',
    phone: '',
    phone_e164: '',
    industry: '',
    cif: '',
    revenue: 0,
    ebitda: 0,
    whatsapp_opt_in: false,
    activityDescription: '',
    employeeRange: '',
    location: '',
    ownershipParticipation: '',
    competitiveAdvantage: '',
    hasAdjustments: false,
    adjustmentAmount: 0,
    baseValuation: 0
  },
  taxData: config.features.taxCalculation ? {
    acquisitionValue: 0,
    acquisitionDate: '2020-01-01',
    taxpayerType: 'individual',
    salePercentage: 100,
    reinvestmentPlan: false,
    reinvestmentAmount: 0,
    vitaliciaPlan: false,
    vitaliciaAmount: 0
  } : undefined,
  isCalculating: false,
  showValidation: false,
  errors: {},
  touched: {}
});

// ============= MAIN HOOK =============
export const useUnifiedCalculator = (config: CalculatorConfig, initialData?: Partial<ExtendedCompanyData>) => {
  const { handleError, handleAsyncError } = useCentralizedErrorHandler();
  const [state, setState] = useState<CalculatorState>(() => {
    const initial = createInitialState(config);
    if (initialData) {
      initial.companyData = { ...initial.companyData, ...initialData };
    }
    return initial;
  });
  
  const [uniqueToken, setUniqueToken] = useState<string | null>(null);

  // ============= DATA FETCHING =============
  const { data: sectorMultiples = [] } = useQuery({
    queryKey: ['sectorMultiples'],
    queryFn: dataAccessService.getSectorMultiples,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // ============= COMPUTED VALUES =============
  const isCurrentStepValid = useMemo(() => {
    const validation = validateCalculatorData(state.companyData, state.currentStep, config);
    return validation.isValid;
  }, [state.companyData, state.currentStep, config]);

  const isFormValid = useMemo(() => {
    const validation = validateCalculatorData(state.companyData, config.steps, config);
    return validation.isValid;
  }, [state.companyData, config]);

  // ============= FIELD MANAGEMENT =============
  const updateField = useCallback((field: keyof ExtendedCompanyData, value: any) => {
    setState(prev => {
      const newState = {
        ...prev,
        companyData: {
          ...prev.companyData,
          [field]: value
        },
        touched: {
          ...prev.touched,
          [field]: true
        }
      };

      // Re-validate the field
      const validation = validateCalculatorData(newState.companyData, prev.currentStep, config);
      newState.errors = validation.errors;

      return newState;
    });

    // Auto-save if enabled
    if (config.features.autosave && uniqueToken) {
      handleAsyncError(async () => {
        await dataAccessService.updateValuation(uniqueToken, { [field]: value }, field);
      }, { component: 'UnifiedCalculator', action: 'updateField' });
    }
  }, [config, uniqueToken, handleAsyncError]);

  const updateTaxData = useCallback((field: keyof TaxData, value: any) => {
    if (!config.features.taxCalculation) return;

    setState(prev => ({
      ...prev,
      taxData: prev.taxData ? {
        ...prev.taxData,
        [field]: value
      } : undefined
    }));
  }, [config.features.taxCalculation]);

  const handleFieldBlur = useCallback((field: keyof ExtendedCompanyData) => {
    setState(prev => ({
      ...prev,
      touched: {
        ...prev.touched,
        [field]: true
      }
    }));
  }, []);

  // ============= NAVIGATION =============
  const nextStep = useCallback(() => {
    if (state.currentStep < config.steps && isCurrentStepValid) {
      setState(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1,
        showValidation: false
      }));
    } else {
      setState(prev => ({ ...prev, showValidation: true }));
    }
  }, [state.currentStep, config.steps, isCurrentStepValid]);

  const prevStep = useCallback(() => {
    if (state.currentStep > 1) {
      setState(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1,
        showValidation: false
      }));
    }
  }, [state.currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= config.steps) {
      setState(prev => ({
        ...prev,
        currentStep: step,
        showValidation: false
      }));
    }
  }, [config.steps]);

  // ============= CALCULATION =============
  const calculateValuation = useCallback(async (): Promise<ValuationResult | ComprehensiveResult | null> => {
    if (!isFormValid) {
      setState(prev => ({ ...prev, showValidation: true }));
      return null;
    }

    setState(prev => ({ ...prev, isCalculating: true }));

    return await handleAsyncError(async () => {
      const result = await calculateUnifiedValuation(
        state.companyData,
        sectorMultiples,
        {
          version: config.version,
          includeTaxCalculation: config.features.taxCalculation,
          includeScenarios: config.features.scenarios,
          taxData: state.taxData
        }
      );

      setState(prev => ({
        ...prev,
        result,
        isCalculating: false,
        currentStep: config.steps + 1 // Move to results step
      }));

      // Finalize valuation if autosave enabled
      if (config.features.autosave && uniqueToken) {
        await dataAccessService.finalizeValuation(uniqueToken, result);
      }

      return result;
    }, { 
      component: 'UnifiedCalculator', 
      action: 'calculateValuation' 
    }) || null;
  }, [isFormValid, state.companyData, state.taxData, sectorMultiples, config, uniqueToken, handleAsyncError]);

  // ============= AUTOSAVE =============
  const initializeAutosave = useCallback(async () => {
    if (!config.features.autosave) return;

    return await handleAsyncError(async () => {
      // Check for existing token in URL
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');

      if (urlToken) {
        const existingData = await dataAccessService.getValuationByToken(urlToken);
        if (existingData) {
          setState(prev => ({
            ...prev,
            companyData: { ...prev.companyData, ...existingData }
          }));
          setUniqueToken(urlToken);
          return urlToken;
        }
      }

      // Generate new token
      const newToken = dataAccessService.generateToken();
      setUniqueToken(newToken);
      return newToken;
    }, { component: 'UnifiedCalculator', action: 'initializeAutosave' });
  }, [config.features.autosave, handleAsyncError]);

  const createInitialValuation = useCallback(async () => {
    if (!config.features.autosave || uniqueToken) return;

    return await handleAsyncError(async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const utmData = {
        utm_source: urlParams.get('utm_source'),
        utm_medium: urlParams.get('utm_medium'),
        utm_campaign: urlParams.get('utm_campaign'),
        referrer: document.referrer || null
      };

      const token = await dataAccessService.createValuation(state.companyData, utmData);
      if (token) {
        setUniqueToken(token);
      }
      return token;
    }, { component: 'UnifiedCalculator', action: 'createInitialValuation' });
  }, [config.features.autosave, uniqueToken, state.companyData, handleAsyncError]);

  // ============= RESET =============
  const resetCalculator = useCallback(() => {
    setState(createInitialState(config));
    setUniqueToken(null);
  }, [config]);

  // ============= INITIALIZATION =============
  useEffect(() => {
    if (config.features.autosave) {
      initializeAutosave();
    }
  }, [config.features.autosave, initializeAutosave]);

  // ============= RETURN STATE & ACTIONS =============
  return {
    // State
    ...state,
    uniqueToken,
    sectorMultiples,
    isCurrentStepValid,
    isFormValid,
    
    // Actions
    updateField,
    updateTaxData,
    handleFieldBlur,
    nextStep,
    prevStep,
    goToStep,
    calculateValuation,
    resetCalculator,
    
    // Autosave
    initializeAutosave,
    createInitialValuation,
    
    // Validation helpers
    getFieldState: (field: string) => ({
      hasError: !!state.errors[field],
      isTouched: !!state.touched[field],
      error: state.errors[field]
    }),
    
    validateStep: (step: number) => {
      const validation = validateCalculatorData(state.companyData, step, config);
      return validation.isValid;
    }
  };
};