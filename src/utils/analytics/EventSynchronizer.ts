// ============= EVENT SYNCHRONIZER =============
// Sistema de sincronización de eventos entre Facebook Pixel y Google Analytics 4
// Garantiza que los eventos se envíen de forma coordinada y con parámetros consistentes

import { OPTIMIZED_EVENT_MAPPINGS, getOptimizedMapping, EventMapping } from './OptimizedEventMapping';

export interface SyncResult {
  success: boolean;
  facebookSent: boolean;
  ga4Sent: boolean;
  errors: string[];
  eventMapping?: EventMapping;
}

export interface EventSyncConfig {
  enableFacebook: boolean;
  enableGA4: boolean;
  enableValidation: boolean;
  debugMode: boolean;
}

export class EventSynchronizer {
  private config: EventSyncConfig;
  private eventQueue: Array<{ eventName: string; properties: Record<string, any>; timestamp: Date }> = [];
  private syncStats = {
    totalEvents: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    facebookEvents: 0,
    ga4Events: 0
  };

  constructor(config: EventSyncConfig) {
    this.config = config;
  }

  // Método principal para sincronizar eventos
  async syncEvent(eventName: string, properties: Record<string, any> = {}): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      facebookSent: false,
      ga4Sent: false,
      errors: []
    };

    try {
      // Obtener mapeo optimizado
      const mapping = getOptimizedMapping(eventName);
      if (!mapping) {
        result.errors.push(`No optimized mapping found for event: ${eventName}`);
        return result;
      }

      result.eventMapping = mapping;
      this.syncStats.totalEvents++;

      // Preparar parámetros unificados
      const unifiedParams = this.prepareUnifiedParameters(mapping, properties);

      // Enviar a Facebook Pixel
      if (this.config.enableFacebook) {
        result.facebookSent = await this.sendToFacebookPixel(mapping.facebookEvent, unifiedParams);
        if (result.facebookSent) {
          this.syncStats.facebookEvents++;
        }
      }

      // Enviar a Google Analytics 4
      if (this.config.enableGA4) {
        result.ga4Sent = await this.sendToGA4(mapping.ga4Event, unifiedParams);
        if (result.ga4Sent) {
          this.syncStats.ga4Events++;
        }
      }

      // Bridge al dataLayer para triggers de GTM (Google Ads)
      await this.pushToDataLayer(eventName, unifiedParams);

      // Determinar éxito general
      result.success = (this.config.enableFacebook ? result.facebookSent : true) && 
                      (this.config.enableGA4 ? result.ga4Sent : true);

      if (result.success) {
        this.syncStats.successfulSyncs++;
      } else {
        this.syncStats.failedSyncs++;
      }

      // Logging detallado en modo debug
      if (this.config.debugMode) {
        console.log('🔄 Event Synchronization Result:', {
          eventName,
          mapping: mapping.description,
          facebookEvent: mapping.facebookEvent,
          ga4Event: mapping.ga4Event,
          facebookSent: result.facebookSent,
          ga4Sent: result.ga4Sent,
          success: result.success,
          parameters: unifiedParams
        });
      }

      // Agregar a cola para análisis
      this.eventQueue.push({
        eventName,
        properties: unifiedParams,
        timestamp: new Date()
      });

      // Mantener solo los últimos 100 eventos
      if (this.eventQueue.length > 100) {
        this.eventQueue.shift();
      }

    } catch (error) {
      result.errors.push(`Synchronization error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.syncStats.failedSyncs++;
      
      if (this.config.debugMode) {
        console.error('❌ Event synchronization failed:', error);
      }
    }

    return result;
  }

  // Preparar parámetros unificados combinando mapeo y propiedades personalizadas
  private prepareUnifiedParameters(mapping: EventMapping, customProperties: Record<string, any>): Record<string, any> {
    const unified = { ...mapping.parameters };

    // Sobrescribir con propiedades personalizadas, manteniendo consistencia
    Object.keys(customProperties).forEach(key => {
      // Mapear nombres de parámetros comunes
      switch (key) {
        case 'resourceName':
        case 'fileName':
          unified.content_name = customProperties[key];
          unified.item_name = customProperties[key];
          break;
        case 'sector':
        case 'industry':
          unified.content_category = customProperties[key];
          unified.item_category = customProperties[key];
          break;
        case 'eventValue':
          unified.value = customProperties[key];
          break;
        case 'formType':
          unified.content_type = customProperties[key];
          break;
        default:
          unified[key] = customProperties[key];
      }
    });

    // Asegurar valores consistentes
    if (unified.value && !unified.currency) {
      unified.currency = 'EUR';
    }

    // Añadir metadatos de sincronización
    unified.sync_timestamp = new Date().toISOString();
    unified.sync_session = this.getCurrentSessionId();

    return unified;
  }

  // Enviar evento a Facebook Pixel
  private async sendToFacebookPixel(eventName: string, parameters: Record<string, any>): Promise<boolean> {
    try {
      if (!(window as any).fbq) {
        if (this.config.debugMode) {
          console.warn('⚠️ Facebook Pixel not available');
        }
        return false;
      }

      // Preparar parámetros específicos de Facebook
      const fbParams: Record<string, any> = {};
      
      // Mapear parámetros a formato Facebook
      if (parameters.content_name) fbParams.content_name = parameters.content_name;
      if (parameters.content_category) fbParams.content_category = parameters.content_category;
      if (parameters.content_type) fbParams.content_type = parameters.content_type;
      if (parameters.value) fbParams.value = parameters.value;
      if (parameters.currency) fbParams.currency = parameters.currency;

      // Añadir parámetros personalizados
      Object.keys(parameters).forEach(key => {
        if (!key.startsWith('event_') && !key.startsWith('item_') && !key.startsWith('sync_')) {
          fbParams[key] = parameters[key];
        }
      });

      (window as any).fbq('track', eventName, fbParams);
      
      if (this.config.debugMode) {
        console.log('📊 Facebook Pixel event sent:', eventName, fbParams);
      }
      
      return true;
    } catch (error) {
      if (this.config.debugMode) {
        console.error('❌ Facebook Pixel send failed:', error);
      }
      return false;
    }
  }

  // Enviar evento a Google Analytics 4
  private async sendToGA4(eventName: string, parameters: Record<string, any>): Promise<boolean> {
    try {
      if (!(window as any).gtag) {
        if (this.config.debugMode) {
          console.warn('⚠️ Google Analytics not available');
        }
        return false;
      }

      // Preparar parámetros específicos de GA4
      const ga4Params: Record<string, any> = {};
      
      // Mapear parámetros a formato GA4
      if (parameters.event_category) ga4Params.event_category = parameters.event_category;
      if (parameters.event_label) ga4Params.event_label = parameters.event_label;
      if (parameters.value) ga4Params.value = parameters.value;
      if (parameters.currency) ga4Params.currency = parameters.currency;
      if (parameters.item_name) ga4Params.item_name = parameters.item_name;
      if (parameters.item_category) ga4Params.item_category = parameters.item_category;
      if (parameters.item_id) ga4Params.item_id = parameters.item_id;

      // Añadir parámetros personalizados
      Object.keys(parameters).forEach(key => {
        if (!key.startsWith('content_') && !key.startsWith('sync_')) {
          ga4Params[key] = parameters[key];
        }
      });

      (window as any).gtag('event', eventName, ga4Params);
      
      if (this.config.debugMode) {
        console.log('📊 GA4 event sent:', eventName, ga4Params);
      }
      
      return true;
    } catch (error) {
      if (this.config.debugMode) {
        console.error('❌ GA4 send failed:', error);
      }
      return false;
    }
  }

  // Push al dataLayer para triggers de GTM (Google Ads conversions)
  private async pushToDataLayer(eventName: string, parameters: Record<string, any>): Promise<void> {
    try {
      // Inicializar dataLayer si no existe
      (window as any).dataLayer = (window as any).dataLayer || [];

      // Eventos críticos que disparan conversiones de Google Ads en GTM
      const adsConversionEvents = [
        'calculator_used',
        'contact_form_submit', 
        'demo_request',
        'lead_qualified',
        'valuation_completed'
      ];

      // Solo empujar eventos relevantes al dataLayer para GTM
      if (adsConversionEvents.includes(eventName)) {
        const dataLayerEvent: Record<string, any> = {
          event: eventName,
          ...parameters
        };

        (window as any).dataLayer.push(dataLayerEvent);

        if (this.config.debugMode) {
          console.log('📤 DataLayer push for GTM:', eventName, dataLayerEvent);
        }
      }
    } catch (error) {
      if (this.config.debugMode) {
        console.error('❌ DataLayer push failed:', error);
      }
    }
  }

  // Obtener ID de sesión actual
  private getCurrentSessionId(): string {
    let sessionId = sessionStorage.getItem('sync_session_id');
    if (!sessionId) {
      sessionId = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('sync_session_id', sessionId);
    }
    return sessionId;
  }

  // Obtener estadísticas de sincronización
  getSyncStats() {
    return {
      ...this.syncStats,
      successRate: this.syncStats.totalEvents > 0 ? 
        (this.syncStats.successfulSyncs / this.syncStats.totalEvents) * 100 : 0,
      recentEvents: this.eventQueue.slice(-10) // Últimos 10 eventos
    };
  }

  // Verificar salud del sistema
  getHealthStatus() {
    const stats = this.getSyncStats();
    const isHealthy = stats.successRate >= 90;
    
    return {
      healthy: isHealthy,
      successRate: stats.successRate,
      totalEvents: stats.totalEvents,
      issues: stats.successRate < 90 ? [
        'Success rate below 90%',
        'Check Facebook Pixel and GA4 configuration'
      ] : [],
      recommendations: isHealthy ? [] : [
        'Verify tracking script loading',
        'Check for ad blockers',
        'Validate event parameters'
      ]
    };
  }

  // Limpiar estadísticas
  resetStats() {
    this.syncStats = {
      totalEvents: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      facebookEvents: 0,
      ga4Events: 0
    };
    this.eventQueue = [];
  }
}

// Singleton instance
let eventSynchronizer: EventSynchronizer | null = null;

export const getEventSynchronizer = (config?: EventSyncConfig): EventSynchronizer => {
  if (!eventSynchronizer) {
    eventSynchronizer = new EventSynchronizer(config || {
      enableFacebook: true,
      enableGA4: true,
      enableValidation: true,
      debugMode: process.env.NODE_ENV === 'development'
    });
  }
  return eventSynchronizer;
};

export const initEventSynchronizer = (config: EventSyncConfig): EventSynchronizer => {
  eventSynchronizer = new EventSynchronizer(config);
  return eventSynchronizer;
};