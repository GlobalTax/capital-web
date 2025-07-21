
import { useCallback } from 'react';
import { useCentralizedErrorHandler } from './useCentralizedErrorHandler';
import { 
  ValuationError, 
  FinancialDataError, 
  SectorMultipleError,
  CompanyDataError,
  HubSpotIntegrationError,
  ExternalApiError,
  BusinessRuleError,
  MAErrorContext
} from '@/types/errorTypes';
import { useToast } from '@/hooks/use-toast';

interface UseMAErrorHandlerReturn {
  handleValuationError: (error: ValuationError, context?: MAErrorContext) => void;
  handleFinancialDataError: (error: FinancialDataError, context?: MAErrorContext) => void;
  handleSectorMultipleError: (error: SectorMultipleError, context?: MAErrorContext) => void;
  handleCompanyDataError: (error: CompanyDataError, context?: MAErrorContext) => void;
  handleHubSpotError: (error: HubSpotIntegrationError, context?: MAErrorContext) => void;
  handleExternalApiError: (error: ExternalApiError, context?: MAErrorContext) => void;
  handleBusinessRuleError: (error: BusinessRuleError, context?: MAErrorContext) => void;
  createValuationError: (message: string, step?: string, data?: Record<string, unknown>) => ValuationError;
  createFinancialDataError: (message: string, field?: string, expectedRange?: { min: number; max: number }, actualValue?: unknown) => FinancialDataError;
  createSectorMultipleError: (message: string, sector?: string, multipleType?: string) => SectorMultipleError;
}

export const useMAErrorHandler = (): UseMAErrorHandlerReturn => {
  const { handleError, logError } = useCentralizedErrorHandler();
  const { toast } = useToast();

  const handleValuationError = useCallback((error: ValuationError, context?: MAErrorContext) => {
    logError(error, {
      ...context,
      component: context?.component || 'ValuationCalculator',
      metadata: {
        ...context?.metadata,
        calculationStep: error.calculationStep,
        valuationData: error.valuationData,
        sector: context?.sector,
        transactionType: context?.transactionType,
        dealSize: context?.dealSize
      }
    });

    // Mostrar mensaje específico para errores de valoración
    toast({
      title: "Error en Valoración",
      description: `Error en ${error.calculationStep || 'cálculo'}: ${error.message}`,
      variant: "destructive",
      duration: 5000,
    });
  }, [logError, toast]);

  const handleFinancialDataError = useCallback((error: FinancialDataError, context?: MAErrorContext) => {
    logError(error, {
      ...context,
      component: context?.component || 'FinancialDataInput',
      metadata: {
        ...context?.metadata,
        dataField: error.dataField,
        expectedRange: error.expectedRange,
        actualValue: error.actualValue
      }
    });

    toast({
      title: "Error en Datos Financieros",
      description: `Campo ${error.dataField}: ${error.message}`,
      variant: "destructive",
      duration: 4000,
    });
  }, [logError, toast]);

  const handleSectorMultipleError = useCallback((error: SectorMultipleError, context?: MAErrorContext) => {
    logError(error, {
      ...context,
      component: context?.component || 'SectorMultiples',
      metadata: {
        ...context?.metadata,
        sector: error.sector,
        multipleType: error.multipleType
      }
    });

    toast({
      title: "Error en Múltiplos Sectoriales",
      description: `Sector ${error.sector || 'desconocido'}: ${error.message}`,
      variant: "destructive",
      duration: 4000,
    });
  }, [logError, toast]);

  const handleCompanyDataError = useCallback((error: CompanyDataError, context?: MAErrorContext) => {
    logError(error, {
      ...context,
      component: context?.component || 'CompanyDataForm',
      metadata: {
        ...context?.metadata,
        companyField: error.companyField,
        validationRule: error.validationRule
      }
    });

    toast({
      title: "Error en Datos de Empresa",
      description: `Campo ${error.companyField}: ${error.message}`,
      variant: "destructive",
      duration: 4000,
    });
  }, [logError, toast]);

  const handleHubSpotError = useCallback((error: HubSpotIntegrationError, context?: MAErrorContext) => {
    logError(error, {
      ...context,
      component: context?.component || 'HubSpotIntegration',
      metadata: {
        ...context?.metadata,
        hubspotErrorCode: error.hubspotErrorCode,
        endpoint: error.endpoint
      }
    });

    toast({
      title: "Error de Integración HubSpot",
      description: "Error al sincronizar con HubSpot. Reintentando automáticamente...",
      variant: "destructive",
      duration: 3000,
    });
  }, [logError, toast]);

  const handleExternalApiError = useCallback((error: ExternalApiError, context?: MAErrorContext) => {
    logError(error, {
      ...context,
      component: context?.component || 'ExternalAPI',
      metadata: {
        ...context?.metadata,
        apiProvider: error.apiProvider,
        endpoint: error.endpoint,
        responseStatus: error.responseStatus
      }
    });

    toast({
      title: "Error de Servicio Externo",
      description: `Error con ${error.apiProvider || 'servicio externo'}: ${error.message}`,
      variant: "destructive",
      duration: 4000,
    });
  }, [logError, toast]);

  const handleBusinessRuleError = useCallback((error: BusinessRuleError, context?: MAErrorContext) => {
    logError(error, {
      ...context,
      component: context?.component || 'BusinessRules',
      metadata: {
        ...context?.metadata,
        ruleType: error.ruleType,
        businessContext: error.businessContext
      }
    });

    toast({
      title: "Error de Regla de Negocio",
      description: `Regla ${error.ruleType}: ${error.message}`,
      variant: "destructive",
      duration: 4000,
    });
  }, [logError, toast]);

  // Factory methods para crear errores específicos
  const createValuationError = useCallback((message: string, step?: string, data?: Record<string, unknown>) => {
    return new ValuationError(message, step, data);
  }, []);

  const createFinancialDataError = useCallback((message: string, field?: string, expectedRange?: { min: number; max: number }, actualValue?: unknown) => {
    return new FinancialDataError(message, field, expectedRange, actualValue);
  }, []);

  const createSectorMultipleError = useCallback((message: string, sector?: string, multipleType?: string) => {
    return new SectorMultipleError(message, sector, multipleType);
  }, []);

  return {
    handleValuationError,
    handleFinancialDataError,
    handleSectorMultipleError,
    handleCompanyDataError,
    handleHubSpotError,
    handleExternalApiError,
    handleBusinessRuleError,
    createValuationError,
    createFinancialDataError,
    createSectorMultipleError,
  };
};
