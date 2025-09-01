import { useEffect } from 'react';
import { TrackingConfigService } from '@/services/TrackingConfigService';
import { initAnalytics } from '@/utils/analytics/AnalyticsManager';

/**
 * Component responsible for initializing tracking services
 * based on saved configuration when the app loads
 */
export const TrackingInitializer = () => {
  useEffect(() => {
    const initializeTracking = async () => {
      try {
        // Load saved tracking configuration
        const config = await TrackingConfigService.loadConfiguration();
        
        // Only initialize if we have at least one tracking service configured
        if (config.googleAnalyticsId || config.facebookPixelId || config.linkedInInsightTag || config.hotjarId) {
          
          console.log('Initializing tracking services', {
            hasGA: !!config.googleAnalyticsId,
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