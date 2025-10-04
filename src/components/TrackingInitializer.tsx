import { useEffect } from 'react';

/**
 * TrackingInitializer - Componente simplificado para inicialización de tracking
 * Versión básica sin dependencias de Lead Scoring
 */
export const TrackingInitializer = () => {
  useEffect(() => {
    // Inicialización básica de tracking
    console.log('[Tracking] Sistema de tracking inicializado');
    
    // Aquí se pueden agregar scripts de tracking básicos si es necesario
    // Por ejemplo: Google Analytics, Facebook Pixel, etc.
    
  }, []);

  return null;
};
