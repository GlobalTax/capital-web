// ============= ERROR RECOVERY HOOK =============
// Hook especializado para recuperación automática de errores

import { useState, useCallback, useRef, useEffect } from 'react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useToast } from '@/hooks/use-toast';

interface RecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  autoRetry?: boolean;
  fallbackMode?: boolean;
}

interface RecoveryState {
  isRecovering: boolean;
  retryCount: number;
  lastError: Error | null;
  recoverySuccess: boolean;
}

export const useErrorRecovery = (options: RecoveryOptions = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 2000,
    autoRetry = true,
    fallbackMode = true
  } = options;

  const [recoveryState, setRecoveryState] = useState<RecoveryState>({
    isRecovering: false,
    retryCount: 0,
    lastError: null,
    recoverySuccess: false
  });

  const { handleError, handleAsyncError } = useErrorHandler();
  const { toast } = useToast();
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Función principal de recuperación
  const recoverOperation = useCallback(async <T,>(
    operation: () => Promise<T>,
    context: string,
    customOptions?: Partial<RecoveryOptions>
  ): Promise<T | null> => {
    const opts = { ...options, ...customOptions };
    
    // Cancelar operación anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setRecoveryState(prev => ({
      ...prev,
      isRecovering: true,
      lastError: null,
      recoverySuccess: false
    }));

    let lastError: Error;

    for (let attempt = 0; attempt <= opts.maxRetries!; attempt++) {
      try {
        // Verificar si la operación fue cancelada
        if (signal.aborted) {
          throw new Error('Operation was cancelled');
        }

        console.log(`🔄 Recovery attempt ${attempt + 1}/${opts.maxRetries! + 1} for: ${context}`);
        
        const result = await operation();
        
        // Éxito
        setRecoveryState(prev => ({
          ...prev,
          isRecovering: false,
          retryCount: attempt,
          recoverySuccess: true
        }));

        if (attempt > 0) {
          toast({
            title: "Operación recuperada",
            description: `Se ha recuperado la conexión después de ${attempt} intento(s)`,
            variant: "default",
          });
        }

        return result;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        setRecoveryState(prev => ({
          ...prev,
          retryCount: attempt + 1,
          lastError
        }));

        // Si no es el último intento y autoRetry está activado
        if (attempt < opts.maxRetries! && opts.autoRetry) {
          const delay = opts.retryDelay! * Math.pow(2, attempt); // Exponential backoff
          
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          
          await new Promise((resolve, reject) => {
            retryTimeoutRef.current = setTimeout(() => {
              if (signal.aborted) {
                reject(new Error('Operation was cancelled'));
              } else {
                resolve(void 0);
              }
            }, delay);
          });
        }
      }
    }

    // Todos los reintentos fallaron
    setRecoveryState(prev => ({
      ...prev,
      isRecovering: false,
      recoverySuccess: false
    }));

    // Manejar error final
    handleError(lastError!, { 
      component: 'ErrorRecovery', 
      action: context,
      metadata: { attempts: opts.maxRetries! + 1 }
    });

    // Activar modo fallback si está disponible
    if (opts.fallbackMode) {
      toast({
        title: "Modo de respaldo activado",
        description: "La operación continuará en modo offline. Los datos se sincronizarán cuando la conexión se restablezca.",
        variant: "default",
      });
    }

    return null;
  }, [options, handleError, toast]);

  // Reintentar manualmente
  const manualRetry = useCallback(async <T,>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T | null> => {
    return recoverOperation(operation, context, { autoRetry: false, maxRetries: 1 });
  }, [recoverOperation]);

  // Resetear estado de recuperación
  const resetRecovery = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setRecoveryState({
      isRecovering: false,
      retryCount: 0,
      lastError: null,
      recoverySuccess: false
    });
  }, []);

  // Verificar si una operación puede ser reintentada
  const canRetry = useCallback((error: Error): boolean => {
    // No reintentar errores de validación o de cliente
    const nonRetryableErrors = [
      'validation',
      'unauthorized', 
      'forbidden',
      'not_found',
      'bad_request'
    ];
    
    const errorMessage = error.message.toLowerCase();
    return !nonRetryableErrors.some(errorType => 
      errorMessage.includes(errorType)
    );
  }, []);

  // Wrapper para operaciones automáticas con recuperación
  const withRecovery = useCallback(<T,>(
    operation: () => Promise<T>,
    context: string,
    customOptions?: Partial<RecoveryOptions>
  ) => {
    return handleAsyncError(
      () => recoverOperation(operation, context, customOptions),
      { component: 'ErrorRecovery', action: `withRecovery:${context}` }
    );
  }, [handleAsyncError, recoverOperation]);

  return {
    recoveryState,
    recoverOperation,
    manualRetry,
    resetRecovery,
    canRetry,
    withRecovery,
    
    // Estado computado
    isRecovering: recoveryState.isRecovering,
    hasRecoveryError: !!recoveryState.lastError,
    shouldShowRetryButton: !recoveryState.isRecovering && 
                          recoveryState.lastError && 
                          canRetry(recoveryState.lastError)
  };
};