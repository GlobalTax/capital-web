// ============= EDGE FUNCTION CONSUMPTION OPTIMIZER =============
// Hook para controlar y optimizar el consumo de Edge Functions

import { useState, useCallback, useRef } from 'react';

interface OptimizationConfig {
  maxCallsPerMinute: number;
  enableBatching: boolean;
  batchInterval: number;
  enableEmergencyMode: boolean;
}

interface ConsumptionStats {
  callsThisMinute: number;
  totalCallsToday: number;
  lastResetTime: number;
  emergencyModeActive: boolean;
}

const DEFAULT_CONFIG: OptimizationConfig = {
  maxCallsPerMinute: 10, // Máximo 10 llamadas por minuto
  enableBatching: true,
  batchInterval: 5000, // Batch cada 5 segundos
  enableEmergencyMode: false
};

export const useEdgeFunctionOptimizer = (config: Partial<OptimizationConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [stats, setStats] = useState<ConsumptionStats>({
    callsThisMinute: 0,
    totalCallsToday: 0,
    lastResetTime: Date.now(),
    emergencyModeActive: false
  });

  const batchQueue = useRef<Array<{ fn: Function; args: any[] }>>([]);
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Verificar si podemos hacer una llamada
  const canMakeCall = useCallback((): boolean => {
    const now = Date.now();
    const minutesPassed = (now - stats.lastResetTime) / 60000;

    // Reset counter cada minuto
    if (minutesPassed >= 1) {
      setStats(prev => ({
        ...prev,
        callsThisMinute: 0,
        lastResetTime: now
      }));
      return true;
    }

    // En modo emergencia, bloquear todas las llamadas no críticas
    if (stats.emergencyModeActive) {
      console.warn('🚨 Emergency mode active - blocking non-critical Edge Function calls');
      return false;
    }

    // Verificar límite por minuto
    if (stats.callsThisMinute >= finalConfig.maxCallsPerMinute) {
      console.warn('⚠️ Edge Function rate limit reached for this minute');
      return false;
    }

    return true;
  }, [stats, finalConfig.maxCallsPerMinute]);

  // Wrapper optimizado para Edge Functions
  const optimizedCall = useCallback(async <T>(
    edgeFunction: () => Promise<T>,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<T | null> => {
    
    // Llamadas críticas siempre pasan
    if (priority === 'critical') {
      setStats(prev => ({
        ...prev,
        callsThisMinute: prev.callsThisMinute + 1,
        totalCallsToday: prev.totalCallsToday + 1
      }));
      return await edgeFunction();
    }

    // Verificar si podemos hacer la llamada
    if (!canMakeCall()) {
      console.debug(`🚫 Edge Function call blocked (priority: ${priority})`);
      return null;
    }

    try {
      setStats(prev => ({
        ...prev,
        callsThisMinute: prev.callsThisMinute + 1,
        totalCallsToday: prev.totalCallsToday + 1
      }));

      const result = await edgeFunction();
      console.debug(`✅ Optimized Edge Function call completed (priority: ${priority})`);
      return result;
    } catch (error) {
      console.error('❌ Optimized Edge Function call failed:', error);
      throw error;
    }
  }, [canMakeCall]);

  // Batching para llamadas no críticas
  const batchedCall = useCallback(<T>(
    edgeFunction: () => Promise<T>,
    priority: 'low' | 'medium' = 'low'
  ): Promise<T | null> => {
    return new Promise((resolve) => {
      if (!finalConfig.enableBatching || priority === 'medium') {
        // Llamada inmediata para prioridad media
        optimizedCall(edgeFunction, priority).then(resolve);
        return;
      }

      // Añadir a batch queue
      batchQueue.current.push({
        fn: () => optimizedCall(edgeFunction, priority).then(resolve),
        args: []
      });

      // Configurar timeout para procesar batch
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }

      batchTimeoutRef.current = setTimeout(() => {
        processBatch();
      }, finalConfig.batchInterval);
    });
  }, [finalConfig.enableBatching, finalConfig.batchInterval, optimizedCall]);

  // Procesar batch de llamadas
  const processBatch = useCallback(async () => {
    if (batchQueue.current.length === 0) return;

    console.debug(`📦 Processing batch of ${batchQueue.current.length} Edge Function calls`);
    
    const batch = [...batchQueue.current];
    batchQueue.current = [];

    // Procesar máximo 3 llamadas del batch para no sobrecargar
    const limitedBatch = batch.slice(0, 3);
    
    for (const { fn } of limitedBatch) {
      try {
        await fn();
        // Pequeña pausa entre llamadas
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error('Batch call error:', error);
      }
    }

    // Si quedan más llamadas, programar siguiente batch
    if (batch.length > 3) {
      batchQueue.current = batch.slice(3);
      batchTimeoutRef.current = setTimeout(processBatch, finalConfig.batchInterval);
    }
  }, [finalConfig.batchInterval]);

  // Activar modo emergencia
  const activateEmergencyMode = useCallback(() => {
    console.warn('🚨 Activating emergency mode - blocking non-critical Edge Functions');
    setStats(prev => ({ ...prev, emergencyModeActive: true }));
    
    // Auto-desactivar después de 10 minutos
    setTimeout(() => {
      setStats(prev => ({ ...prev, emergencyModeActive: false }));
      console.log('✅ Emergency mode deactivated');
    }, 10 * 60 * 1000);
  }, []);

  // Reset stats manualmente
  const resetStats = useCallback(() => {
    setStats({
      callsThisMinute: 0,
      totalCallsToday: 0,
      lastResetTime: Date.now(),
      emergencyModeActive: false
    });
    console.log('📊 Edge Function stats reset');
  }, []);

  return {
    // Métodos principales
    optimizedCall,
    batchedCall,
    
    // Estado y control
    stats,
    canMakeCall: canMakeCall(),
    activateEmergencyMode,
    resetStats,
    
    // Configuración
    config: finalConfig
  };
};