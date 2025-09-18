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
        // Domain validation with detailed logging
        const currentDomain = window.location.hostname;
        const currentUrl = window.location.href;
        const isProductionDomain = currentDomain === 'capittal.es' || currentDomain.includes('capittal.es');
        const isLovableDomain = currentDomain.includes('lovableproject.com') || 
                              currentDomain.includes('sandbox.lovable.dev') || 
                              currentDomain.includes('lovable.app') ||
                              currentDomain.endsWith('.lovable.dev') ||
                              currentDomain.endsWith('.lovable.app');
        const isLocalhost = currentDomain === 'localhost' || currentDomain === '127.0.0.1';
        
        secureLogger.debug('Tracking domain analysis', {
          currentDomain,
          currentUrl,
          isProductionDomain,
          isLovableDomain,
          isLocalhost,
          userAgent: navigator.userAgent.slice(0, 50) + '...'
        }, { component: 'TrackingInitializer' });
        
        // Allow tracking on production, lovable preview, and localhost for testing
        const shouldInitialize = isProductionDomain || isLovableDomain || isLocalhost;
        
        if (!shouldInitialize) {
          secureLogger.debug('Tracking disabled on unknown domain', { currentDomain }, { component: 'TrackingInitializer' });
          return;
        }
        
        if (isProductionDomain) {
          secureLogger.info('Production domain detected - full tracking enabled', undefined, { component: 'TrackingInitializer' });
        } else if (isLovableDomain) {
          secureLogger.info('Lovable preview domain detected - testing mode enabled', undefined, { component: 'TrackingInitializer' });
        } else if (isLocalhost) {
          secureLogger.info('Localhost detected - development mode enabled', undefined, { component: 'TrackingInitializer' });
        }
        
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

          // Initialize Google Tag Manager if configured
          if (config.googleTagManagerId) {
            initGoogleTagManager(config.googleTagManagerId);
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
    // Avoid duplicate initialization
    if ((window as any).dataLayer) {
      secureLogger.info('Google Tag Manager already initialized', undefined, { component: 'TrackingInitializer' });
      return;
    }

    // Initialize dataLayer
    (window as any).dataLayer = (window as any).dataLayer || [];
    
    // GTM script for head
    const gtmScript = document.createElement('script');
    gtmScript.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${gtmId}');`;
    document.head.appendChild(gtmScript);

    // GTM noscript for body
    const gtmNoscript = document.createElement('noscript');
    gtmNoscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
      height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
    document.body.insertBefore(gtmNoscript, document.body.firstChild);

    secureLogger.debug('Google Tag Manager initialized', { gtmId }, { component: 'TrackingInitializer' });
  } catch (error) {
    secureLogger.error('Error initializing Google Tag Manager', error, { component: 'TrackingInitializer' });
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