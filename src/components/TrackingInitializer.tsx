import { useEffect } from 'react';
import { TrackingConfigService } from '@/services/TrackingConfigService';
import { initAnalytics } from '@/utils/analytics/AnalyticsManager';
import { initEventSynchronizer } from '@/utils/analytics/EventSynchronizer';
import { secureLogger } from '@/utils/secureLogger';

/**
 * Component responsible for initializing tracking services
 * based on saved configuration when the app loads
 */
export const TrackingInitializer = () => {
  useEffect(() => {
    const initializeTracking = async () => {
      try {
        // 🔍 PASO 1: Validación de dominio estricta
        const currentDomain = window.location.hostname;
        const isProduction = currentDomain === 'capittal.es' || currentDomain.endsWith('.capittal.es');
        const isLocalhost = currentDomain === 'localhost' || currentDomain === '127.0.0.1';
        
        // ⚠️ SOLO inicializar en producción y localhost
        const shouldInitialize = isProduction || isLocalhost;
        
        if (!shouldInitialize) {
          secureLogger.info('🚫 Tracking desactivado en este entorno', { currentDomain }, { component: 'TrackingInitializer' });
          return;
        }
        
        secureLogger.info('✅ Dominio válido detectado, inicializando tracking', { 
          currentDomain, 
          environment: isProduction ? 'production' : 'localhost' 
        }, { component: 'TrackingInitializer' });
        
        // Load saved tracking configuration
        const config = await TrackingConfigService.loadConfiguration();
        
        // Only initialize if we have at least one tracking service configured
        if (config.googleAnalyticsId || config.googleTagManagerId || config.facebookPixelId || config.linkedInInsightTag || config.hotjarId) {
          
          secureLogger.debug('Initializing tracking services', {
            hasGA: !!config.googleAnalyticsId,
            hasGTM: !!config.googleTagManagerId,
            hasFacebookPixel: !!config.facebookPixelId,
            hasLinkedIn: !!config.linkedInInsightTag,
            hasHotjar: !!config.hotjarId,
            enableHeatmaps: config.enableHeatmaps,
            enableSessionRecording: config.enableSessionRecording,
            enableLeadTracking: config.enableLeadTracking
          }, { component: 'TrackingInitializer' });

          // Initialize AnalyticsManager with configuration
          initAnalytics({
            ga4MeasurementId: config.googleAnalyticsId,
            facebookPixelId: config.facebookPixelId,
            enableCompanyTracking: config.enableLeadTracking ?? true,
            enableEnrichment: true,
            enableAlerting: true,
            enableAttribution: true,
          });

          // Initialize optimized event synchronizer
          const eventSynchronizer = initEventSynchronizer({
            enableFacebook: !!config.facebookPixelId,
            enableGA4: !!config.googleAnalyticsId,
            enableValidation: true,
            debugMode: process.env.NODE_ENV === 'development'
          });

          // Make synchronizer globally available for analytics manager
          (window as any).eventSynchronizer = eventSynchronizer;

        // 🔍 PASO 2: Inicializar Google Tag Manager con anti-duplicación
        if (config.googleTagManagerId) {
          initGoogleTagManager(config.googleTagManagerId);
        }

        // 🔍 PASO 3: Verificar Facebook Pixel con anti-duplicación
        if (config.facebookPixelId) {
          const fbPixelStatus = (window as any).fbPixelStatus;
          
          if (fbPixelStatus?.loadedFromHTML && fbPixelStatus?.pixelId === config.facebookPixelId) {
            secureLogger.info('✅ Facebook Pixel ya cargado desde HTML, omitiendo re-inicialización', {
              pixelId: config.facebookPixelId,
              totalEvents: fbPixelStatus.totalEvents
            }, { component: 'TrackingInitializer' });
          } else {
            secureLogger.debug('🔄 Facebook Pixel será inicializado por AnalyticsManager', undefined, { component: 'TrackingInitializer' });
          }
        }

          // Initialize Hotjar if configured
          if (config.hotjarId && config.enableHeatmaps) {
            initHotjar(config.hotjarId);
          }

          // Initialize LinkedIn Insight Tag if configured
          if (config.linkedInInsightTag) {
            initLinkedInInsightTag(config.linkedInInsightTag);
          }

          // Execute custom tracking code if provided
          if (config.customTrackingCode) {
            try {
              // Create a script element for custom code
              const script = document.createElement('script');
              script.textContent = config.customTrackingCode;
              document.head.appendChild(script);
              
              secureLogger.debug('Custom tracking code executed', undefined, { component: 'TrackingInitializer' });
            } catch (error) {
              secureLogger.error('Error executing custom tracking code', error, { component: 'TrackingInitializer' });
            }
          }

          secureLogger.info('Tracking services initialized successfully', undefined, { component: 'TrackingInitializer' });
        } else {
          secureLogger.debug('No tracking services configured, skipping initialization', undefined, { component: 'TrackingInitializer' });
        }
      } catch (error) {
        secureLogger.error('Error initializing tracking services', error, { component: 'TrackingInitializer' });
      }
    };

    // Initialize tracking on component mount
    initializeTracking();
  }, []);

  return null; // This component doesn't render anything
};

/**
 * Initialize Hotjar tracking
 */
const initHotjar = (siteId: string) => {
  try {
    (window as any).hj = (window as any).hj || function(...args: any[]) {
      ((window as any).hj.q = (window as any).hj.q || []).push(args);
    };
    (window as any)._hjSettings = { hjid: parseInt(siteId), hjsv: 6 };

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://static.hotjar.com/c/hotjar-${siteId}.js?sv=6`;
    document.head.appendChild(script);

    secureLogger.debug('Hotjar initialized', { siteId }, { component: 'TrackingInitializer' });
  } catch (error) {
    secureLogger.error('Error initializing Hotjar', error, { component: 'TrackingInitializer' });
  }
};

/**
 * Initialize Google Tag Manager
 */
const initGoogleTagManager = (gtmId: string) => {
  try {
    // 🔍 PASO 1: Detectar si GTM ya está cargado
    if ((window as any).dataLayer && Array.isArray((window as any).dataLayer) && (window as any).dataLayer.length > 0) {
      secureLogger.info('✅ GTM ya inicializado, omitiendo re-carga', { 
        existingEvents: (window as any).dataLayer.length 
      }, { component: 'TrackingInitializer' });
      return;
    }

    // 🔍 PASO 2: Detectar si el script GTM ya existe en el DOM
    const existingGTMScript = document.querySelector(`script[src*="googletagmanager.com/gtm.js?id=${gtmId}"]`);
    if (existingGTMScript) {
      secureLogger.info('✅ Script GTM ya presente en DOM, omitiendo inserción', undefined, { component: 'TrackingInitializer' });
      return;
    }

    // 🚀 PASO 3: Inicializar GTM solo si no existe
    secureLogger.info('🔄 Inicializando GTM desde TrackingInitializer', { gtmId }, { component: 'TrackingInitializer' });
    
    // Initialize dataLayer
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });

    // Load GTM script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
    document.head.appendChild(script);

    // Add noscript iframe to body
    const noscript = document.createElement('noscript');
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.cssText = 'display:none;visibility:hidden';
    noscript.appendChild(iframe);
    document.body.insertBefore(noscript, document.body.firstChild);

    secureLogger.info('✅ GTM inicializado correctamente desde TrackingInitializer', { gtmId }, { component: 'TrackingInitializer' });
  } catch (error) {
    secureLogger.error('❌ Error inicializando GTM', error, { component: 'TrackingInitializer' });
  }
};

/**
 * Initialize LinkedIn Insight Tag
 */
const initLinkedInInsightTag = (partnerId: string) => {
  try {
    (window as any)._linkedin_partner_id = partnerId;
    (window as any)._linkedin_data_partner_ids = (window as any)._linkedin_data_partner_ids || [];
    (window as any)._linkedin_data_partner_ids.push(partnerId);

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
    document.head.appendChild(script);

    // Add noscript pixel
    const noscript = document.createElement('noscript');
    const img = document.createElement('img');
    img.height = 1;
    img.width = 1;
    img.style.display = 'none';
    img.alt = '';
    img.src = `https://px.ads.linkedin.com/collect/?pid=${partnerId}&fmt=gif`;
    noscript.appendChild(img);
    document.head.appendChild(noscript);

    secureLogger.debug('LinkedIn Insight Tag initialized', { partnerId }, { component: 'TrackingInitializer' });
  } catch (error) {
    secureLogger.error('Error initializing LinkedIn Insight Tag', error, { component: 'TrackingInitializer' });
  }
};