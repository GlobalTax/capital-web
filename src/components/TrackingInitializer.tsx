import { useEffect } from 'react';
import { TrackingConfigService } from '@/services/TrackingConfigService';
import { initAnalytics } from '@/utils/analytics/AnalyticsManager';
import { initEventSynchronizer } from '@/utils/analytics/EventSynchronizer';

/**
 * Component responsible for initializing tracking services
 * based on saved configuration when the app loads
 */
export const TrackingInitializer = () => {
  useEffect(() => {
    const initializeTracking = async () => {
      try {
        // Only initialize on production domain capittal.es
        const currentDomain = window.location.hostname;
        const isProductionDomain = currentDomain === 'capittal.es' || currentDomain.includes('capittal.es');
        
        if (!isProductionDomain) {
          console.log('Tracking disabled on development/preview domains:', currentDomain);
          return;
        }
        
        console.log('Initializing tracking for production domain:', currentDomain);
        
        // Load saved tracking configuration
        const config = await TrackingConfigService.loadConfiguration();
        
        // Only initialize if we have at least one tracking service configured
        if (config.googleAnalyticsId || config.googleTagManagerId || config.facebookPixelId || config.linkedInInsightTag || config.hotjarId) {
          
          console.log('Initializing tracking services', {
            hasGA: !!config.googleAnalyticsId,
            hasGTM: !!config.googleTagManagerId,
            hasFacebookPixel: !!config.facebookPixelId,
            hasLinkedIn: !!config.linkedInInsightTag,
            hasHotjar: !!config.hotjarId,
            enableHeatmaps: config.enableHeatmaps,
            enableSessionRecording: config.enableSessionRecording,
            enableLeadTracking: config.enableLeadTracking
          });

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
              
              console.log('Custom tracking code executed');
            } catch (error) {
              console.error('Error executing custom tracking code:', error);
            }
          }

          console.log('Tracking services initialized successfully');
        } else {
          console.log('No tracking services configured, skipping initialization');
        }
      } catch (error) {
        console.error('Error initializing tracking services:', error);
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

    console.log('Hotjar initialized', { siteId });
  } catch (error) {
    console.error('Error initializing Hotjar:', error);
  }
};

/**
 * Initialize Google Tag Manager
 */
const initGoogleTagManager = (gtmId: string) => {
  try {
    // Avoid duplicate initialization
    if ((window as any).dataLayer) {
      console.log('Google Tag Manager already initialized');
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

    console.log('Google Tag Manager initialized', { gtmId });
  } catch (error) {
    console.error('Error initializing Google Tag Manager:', error);
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

    console.log('LinkedIn Insight Tag initialized', { partnerId });
  } catch (error) {
    console.error('Error initializing LinkedIn Insight Tag:', error);
  }
};