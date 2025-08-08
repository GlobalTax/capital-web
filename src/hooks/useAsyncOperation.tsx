// ============= ASYNC OPERATION HOOK =============
// Hook optimizado para operaciones asíncronas con debounce

import { useCallback, useRef, useState } from 'react';
import { performanceMonitor } from '@/utils/performanceMonitor';

interface AsyncOperationOptions {
  debounceMs?: number;
  retries?: number;
  timeout?: number;
}

export const useAsyncOperation = <T, R>(
  operation: (params: T) => Promise<R>,
  options: AsyncOperationOptions = {}
) => {
  const { debounceMs = 0, retries = 1, timeout = 30000 } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  const execute = useCallback(async (params: T): Promise<R | null> => {
    // Cancelar operación anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    return new Promise((resolve) => {
      timeoutRef.current = setTimeout(async () => {
        setLoading(true);
        setError(null);
        
        // Crear nuevo AbortController
        abortControllerRef.current = new AbortController();
        
        const operationName = operation.name || 'async-operation';
        const startTime = performance.now();

        try {
          let lastError: Error;
          
          // Retry logic
          for (let attempt = 0; attempt <= retries; attempt++) {
            try {
              // Timeout para la operación
              const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Operation timeout')), timeout)
              );
              
              const result = await Promise.race([
                operation(params),
                timeoutPromise
              ]);
              
              const duration = performance.now() - startTime;
              performanceMonitor.record(operationName, duration, 'api');
              setLoading(false);
              resolve(result);
              return;
            } catch (err) {
              lastError = err instanceof Error ? err : new Error('Unknown error');
              
              // Si no es el último intento, esperar antes de reintentar
              if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
              }
            }
          }
          
          throw lastError!;
        } catch (err) {
          const finalError = err instanceof Error ? err : new Error('Unknown error');
          const duration = performance.now() - startTime;
          performanceMonitor.record(`${operationName}_error`, duration, 'api');
          setError(finalError);
          setLoading(false);
          resolve(null);
        }
      }, debounceMs);
    });
  }, [operation, debounceMs, retries, timeout]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLoading(false);
  }, []);

  return {
    execute,
    cancel,
    loading,
    error
  };
};