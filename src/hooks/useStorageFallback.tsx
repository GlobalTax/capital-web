// ============= STORAGE FALLBACK SYSTEM =============
// Hook para manejar bloqueos de storage en Safari/Edge con fallback a Edge Functions

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { useErrorHandler } from './useErrorHandler';

interface StorageTestResult {
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;
  isTrackingPrevented: boolean;
}

interface FallbackConfig {
  bypassStorage: boolean;
  useDirectSubmission: boolean;
  enableMemoryOnly: boolean;
  preferEdgeFunction: boolean;
}

export const useStorageFallback = () => {
  const [storageStatus, setStorageStatus] = useState<StorageTestResult>({
    localStorage: true,
    sessionStorage: true,
    indexedDB: true,
    isTrackingPrevented: false
  });

  const [fallbackConfig, setFallbackConfig] = useState<FallbackConfig>({
    bypassStorage: false,
    useDirectSubmission: false,
    enableMemoryOnly: false,
    preferEdgeFunction: false
  });

  const { handleError } = useErrorHandler();

  // Detect storage capabilities and tracking prevention
  const testStorageCapabilities = useCallback(async (): Promise<StorageTestResult> => {
    const result: StorageTestResult = {
      localStorage: false,
      sessionStorage: false,
      indexedDB: false,
      isTrackingPrevented: false
    };

    // Test localStorage
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      result.localStorage = true;
    } catch (error) {
      // Log solo una vez por sesión para reducir ruido en consola
      if (!(window as any).__storageBlockLogged) {
        (window as any).__storageBlockLogged = true;
        logger.debug('Storage blocked by browser - using memory fallback', { 
          error: (error as Error).message 
        }, {
          context: 'system',
          component: 'useStorageFallback'
        });
      }
    }

    // Test sessionStorage
    try {
      const testKey = '__session_test__';
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.removeItem(testKey);
      result.sessionStorage = true;
    } catch (error) {
      // Silenciar - ya logueado en localStorage test
    }

    // Test IndexedDB
    try {
      if ('indexedDB' in window) {
        const request = indexedDB.open('test', 1);
        await new Promise((resolve, reject) => {
          request.onsuccess = () => {
            request.result.close();
            resolve(true);
          };
          request.onerror = () => reject(request.error);
          request.onblocked = () => reject(new Error('IndexedDB blocked'));
        });
        result.indexedDB = true;
      }
    } catch (error) {
      // Silenciar - ya logueado en localStorage test
    }

    // Detect tracking prevention based on actual storage availability
    const isTrackingPrevented = !result.localStorage && !result.sessionStorage;

    result.isTrackingPrevented = isTrackingPrevented;

    return result;
  }, []);

  // Initialize storage testing
  useEffect(() => {
    let mounted = true;

    const initializeStorageTest = async () => {
      try {
        const status = await testStorageCapabilities();
        
        if (!mounted) return;
        
        setStorageStatus(status);
        
        // Configure fallback based on actual storage availability
        const config: FallbackConfig = {
          bypassStorage: !status.localStorage,
          useDirectSubmission: !status.localStorage && !status.sessionStorage,
          enableMemoryOnly: !status.localStorage,
          preferEdgeFunction: !status.localStorage && !status.sessionStorage
        };
        
        setFallbackConfig(config);
        
        logger.info('Storage capabilities detected', { 
          status, 
          config,
          userAgent: navigator.userAgent.substring(0, 100)
        }, {
          context: 'system',
          component: 'useStorageFallback'
        });
        
      } catch (error) {
        if (mounted) {
          handleError(error as Error, {
            component: 'useStorageFallback',
            action: 'initializeStorageTest'
          });
        }
      }
    };

    initializeStorageTest();
    
    return () => {
      mounted = false;
    };
  }, [testStorageCapabilities, handleError]);

  // Submit form data directly to Edge Function (bypassing client-side storage)
  const submitDirectToEdgeFunction = useCallback(async (
    functionName: string,
    payload: Record<string, any>,
    headers: Record<string, string> = {}
  ) => {
    try {
      const response = await supabase.functions.invoke(functionName, {
        body: {
          ...payload,
          // Add metadata indicating this is a direct submission
          _directSubmission: true,
          _storageBlocked: storageStatus.isTrackingPrevented,
          _timestamp: Date.now(),
          _userAgent: navigator.userAgent.substring(0, 200)
        },
        headers: {
          'Content-Type': 'application/json',
          'X-Direct-Submission': 'true',
          'X-Storage-Blocked': storageStatus.isTrackingPrevented.toString(),
          ...headers
        }
      });

      if (response.error) {
        throw new Error(`Edge Function error: ${response.error.message}`);
      }

      logger.info('Direct Edge Function submission successful', {
        functionName,
        storageBlocked: storageStatus.isTrackingPrevented
      }, {
        context: 'system',
        component: 'useStorageFallback'
      });

      return response.data;
    } catch (error) {
      logger.error('Direct Edge Function submission failed', error as Error, {
        context: 'system',
        component: 'useStorageFallback',
        data: { functionName, storageStatus }
      });
      
      handleError(error as Error, {
        component: 'useStorageFallback',
        action: 'submitDirectToEdgeFunction',
        metadata: { functionName, storageStatus }
      });
      
      throw error;
    }
  }, [storageStatus, handleError]);

  // Get safe storage (memory fallback for blocked environments)
  const getSafeStorage = useCallback((type: 'local' | 'session' = 'local') => {
    const isAvailable = type === 'local' ? storageStatus.localStorage : storageStatus.sessionStorage;
    
    if (isAvailable) {
      return type === 'local' ? localStorage : sessionStorage;
    }
    
    // Return memory storage fallback
    const memoryStorage = new Map<string, string>();
    return {
      getItem: (key: string) => memoryStorage.get(key) || null,
      setItem: (key: string, value: string) => memoryStorage.set(key, value),
      removeItem: (key: string) => memoryStorage.delete(key),
      clear: () => memoryStorage.clear(),
      length: memoryStorage.size,
      key: (index: number) => Array.from(memoryStorage.keys())[index] || null
    };
  }, [storageStatus]);

  // Check if we should prefer Edge Function over client storage
  const shouldUseEdgeFunction = useCallback((operation: 'tracking' | 'forms' | 'analytics') => {
    if (fallbackConfig.preferEdgeFunction) return true;
    
    // For critical operations, use Edge Function if storage is blocked
    if (operation === 'forms' && fallbackConfig.useDirectSubmission) return true;
    
    return false;
  }, [fallbackConfig]);

  return {
    // Status
    storageStatus,
    fallbackConfig,
    isStorageBlocked: storageStatus.isTrackingPrevented,
    
    // Methods
    testStorageCapabilities,
    submitDirectToEdgeFunction,
    getSafeStorage,
    shouldUseEdgeFunction,
    
    // Utilities
    canUseLocalStorage: storageStatus.localStorage,
    canUseSessionStorage: storageStatus.sessionStorage,
    canUseIndexedDB: storageStatus.indexedDB,
    needsMemoryFallback: fallbackConfig.enableMemoryOnly
  };
};