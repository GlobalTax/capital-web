
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';
import { 
  ValuationError,
  FinancialDataError,
  SectorMultipleError,
  CompanyDataError,
  HubSpotIntegrationError,
  BusinessRuleError,
  MAErrorContext,
  isValuationError,
  isFinancialDataError,
  isSectorMultipleError,
  isCompanyDataError,
  isHubSpotIntegrationError,
  isBusinessRuleError
} from '@/types/errorTypes';

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

interface UseErrorHandlerReturn {
  handleError: (error: Error, context?: ErrorContext | MAErrorContext) => void;
  handleAsyncError: <T>(
    asyncFn: () => Promise<T>, 
    context?: ErrorContext | MAErrorContext
  ) => Promise<T | null>;
  logError: (error: Error, context?: ErrorContext | MAErrorContext) => void;
  handleMAError: (error: Error, context?: MAErrorContext) => void;
}

export const useCentralizedErrorHandler = (): UseErrorHandlerReturn => {
  const { toast } = useToast();

  const logError = useCallback((error: Error, context?: ErrorContext | MAErrorContext) => {
    // Determinar contexto específico para M&A
    const logContext = isMAError(error) ? 'valuation' : 'system';
    
    logger.error('Application error', error, {
      context: logContext,
      component: context?.component || 'unknown',
      data: {
        action: context?.action,
        userId: context?.userId,
        metadata: context?.metadata,
        errorType: error.constructor.name,
        errorCode: (error as any).code || 'unknown',
        // Datos específicos de M&A
        ...(isMAErrorContext(context) && {
          companyId: context.companyId,
          valuationId: context.valuationId,
          sector: context.sector,
          transactionType: context.transactionType,
          dealSize: context.dealSize,
          currency: context.currency
        })
      }
    });
  }, []);

  const handleMAError = useCallback((error: Error, context?: MAErrorContext) => {
    logError(error, context);
    
    // Manejo específico por tipo de error de M&A
    if (isValuationError(error)) {
      const contextMessage = context?.sector ? ` en sector ${context.sector}` : '';
      
      toast({
        title: "Error de Valoración",
        description: `Error en ${error.calculationStep || 'cálculo'}${contextMessage}: ${error.message}`,
        variant: "destructive",
        duration: 5000,
      });
    } else if (isFinancialDataError(error)) {
      toast({
        title: "Error en Datos Financieros",
        description: `Campo ${error.dataField}: ${error.message}`,
        variant: "destructive",
        duration: 4000,
      });
    } else if (isSectorMultipleError(error)) {
      toast({
        title: "Error en Múltiplos Sectoriales",
        description: `Sector ${error.sector}: ${error.message}`,
        variant: "destructive",
        duration: 4000,
      });
    } else if (isCompanyDataError(error)) {
      toast({
        title: "Error en Datos de Empresa",
        description: `${error.companyField}: ${error.message}`,
        variant: "destructive",
        duration: 4000,
      });
    } else if (isHubSpotIntegrationError(error)) {
      toast({
        title: "Error de Integración",
        description: "Error al sincronizar con HubSpot. Reintentando...",
        variant: "destructive",
        duration: 3000,
      });
    } else if (isBusinessRuleError(error)) {
      toast({
        title: "Error de Regla de Negocio",
        description: `${error.ruleType}: ${error.message}`,
        variant: "destructive",
        duration: 4000,
      });
    }
  }, [logError, toast]);

  const handleError = useCallback((error: Error, context?: ErrorContext | MAErrorContext) => {
    // Si es un error específico de M&A, usar el handler especializado
    if (isMAError(error)) {
      handleMAError(error, context as MAErrorContext);
      return;
    }

    logError(error, context);
    
    // Solo mostrar toast para errores críticos, no de tracking
    if (!error.message.toLowerCase().includes('tracking') && 
        !error.message.toLowerCase().includes('404')) {
      const contextMessage = context?.component 
        ? ` en ${context.component}` 
        : '';
      
      toast({
        title: "Error",
        description: `Error${contextMessage}: ${error.message}`,
        variant: "destructive",
        duration: 3000,
      });
    }
  }, [logError, handleMAError, toast]);

  const handleAsyncError = useCallback(async <T,>(
    asyncFn: () => Promise<T>, 
    context?: ErrorContext | MAErrorContext
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error as Error, context);
      return null;
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
    logError,
    handleMAError
  };
};

// Función auxiliar para determinar si es un error de M&A
const isMAError = (error: Error): boolean => {
  return isValuationError(error) ||
         isFinancialDataError(error) ||
         isSectorMultipleError(error) ||
         isCompanyDataError(error) ||
         isHubSpotIntegrationError(error) ||
         isBusinessRuleError(error);
};

// Función auxiliar para determinar si es contexto de M&A
const isMAErrorContext = (context?: ErrorContext | MAErrorContext): context is MAErrorContext => {
  return context !== undefined && 
         ('companyId' in context || 'valuationId' in context || 'sector' in context || 'transactionType' in context);
};
