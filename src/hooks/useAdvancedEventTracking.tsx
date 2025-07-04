import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLeadTracking } from './useLeadTracking';

export interface AdvancedTrackingEvent {
  eventType: string;
  eventCategory: 'engagement' | 'conversion' | 'navigation' | 'interaction' | 'download';
  eventData: Record<string, any>;
  pointsValue?: number;
  triggerAutomation?: boolean;
}

export const useAdvancedEventTracking = () => {
  const { trackEvent } = useLeadTracking();

  // Tracking de descargas
  const trackDownload = useCallback(async (downloadData: {
    resourceType: 'pdf' | 'case_study' | 'whitepaper' | 'report';
    resourceName: string;
    resourceId?: string;
    fileSize?: number;
    source?: string;
  }) => {
    await trackEvent(
      'resource_download',
      window.location.pathname,
      {
        resource_type: downloadData.resourceType,
        resource_name: downloadData.resourceName,
        resource_id: downloadData.resourceId,
        file_size_mb: downloadData.fileSize,
        download_source: downloadData.source,
        timestamp: new Date().toISOString()
      },
      15 // Alto valor por descarga
    );
  }, [trackEvent]);

  // Tracking de scroll depth
  const trackScrollDepth = useCallback(async (depth: number) => {
    if (depth >= 75) { // Solo trackear cuando llegue al 75%
      await trackEvent(
        'scroll_depth',
        window.location.pathname,
        {
          depth_percentage: depth,
          page_height: document.body.scrollHeight,
          viewport_height: window.innerHeight,
          timestamp: new Date().toISOString()
        },
        5
      );
    }
  }, [trackEvent]);

  // Tracking de interacciones con video
  const trackVideoInteraction = useCallback(async (videoData: {
    action: 'play' | 'pause' | 'complete' | 'skip';
    videoTitle: string;
    currentTime: number;
    duration: number;
    videoId?: string;
  }) => {
    const points = videoData.action === 'complete' ? 20 : 
                  videoData.action === 'play' ? 10 : 5;

    await trackEvent(
      'video_interaction',
      window.location.pathname,
      {
        video_action: videoData.action,
        video_title: videoData.videoTitle,
        video_id: videoData.videoId,
        current_time: videoData.currentTime,
        duration: videoData.duration,
        completion_percentage: (videoData.currentTime / videoData.duration) * 100,
        timestamp: new Date().toISOString()
      },
      points
    );
  }, [trackEvent]);

  // Tracking de búsquedas internas
  const trackInternalSearch = useCallback(async (searchData: {
    searchTerm: string;
    resultsCount: number;
    selectedResult?: string;
    searchLocation: string;
  }) => {
    await trackEvent(
      'internal_search',
      window.location.pathname,
      {
        search_term: searchData.searchTerm,
        results_count: searchData.resultsCount,
        selected_result: searchData.selectedResult,
        search_location: searchData.searchLocation,
        timestamp: new Date().toISOString()
      },
      8
    );
  }, [trackEvent]);

  // Tracking de interacciones con CTA
  const trackCTAInteraction = useCallback(async (ctaData: {
    ctaText: string;
    ctaType: 'button' | 'link' | 'banner';
    ctaLocation: string;
    targetPage?: string;
  }) => {
    await trackEvent(
      'cta_interaction',
      window.location.pathname,
      {
        cta_text: ctaData.ctaText,
        cta_type: ctaData.ctaType,
        cta_location: ctaData.ctaLocation,
        target_page: ctaData.targetPage,
        timestamp: new Date().toISOString()
      },
      12
    );
  }, [trackEvent]);

  // Tracking de errores o problemas
  const trackError = useCallback(async (errorData: {
    errorType: 'form_error' | 'page_error' | 'api_error' | 'user_error';
    errorMessage: string;
    errorContext?: string;
    severity: 'low' | 'medium' | 'high';
  }) => {
    await trackEvent(
      'error_event',
      window.location.pathname,
      {
        error_type: errorData.errorType,
        error_message: errorData.errorMessage,
        error_context: errorData.errorContext,
        severity: errorData.severity,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      },
      -5 // Puntos negativos por errores
    );
  }, [trackEvent]);

  // Tracking de engagement temporal
  const trackEngagementMilestone = useCallback(async (milestone: {
    timeSpent: number; // en segundos
    interactions: number;
    pageDepth: number;
    returnVisitor: boolean;
  }) => {
    const points = milestone.timeSpent > 300 ? 20 : // Más de 5 minutos
                  milestone.timeSpent > 120 ? 15 : // Más de 2 minutos
                  milestone.timeSpent > 60 ? 10 : 5; // Más de 1 minuto

    await trackEvent(
      'engagement_milestone',
      window.location.pathname,
      {
        time_spent_seconds: milestone.timeSpent,
        interaction_count: milestone.interactions,
        page_depth: milestone.pageDepth,
        is_return_visitor: milestone.returnVisitor,
        engagement_score: Math.round((milestone.timeSpent / 60) + milestone.interactions + milestone.pageDepth),
        timestamp: new Date().toISOString()
      },
      points
    );
  }, [trackEvent]);

  // Tracking de intención de salida
  const trackExitIntent = useCallback(async (exitData: {
    timeOnPage: number;
    scrollDepth: number;
    interactionCount: number;
    exitTrigger: 'mouse_leave' | 'tab_close' | 'navigation';
  }) => {
    await trackEvent(
      'exit_intent',
      window.location.pathname,
      {
        time_on_page: exitData.timeOnPage,
        scroll_depth: exitData.scrollDepth,
        interaction_count: exitData.interactionCount,
        exit_trigger: exitData.exitTrigger,
        timestamp: new Date().toISOString()
      },
      exitData.interactionCount > 3 ? 10 : 5
    );
  }, [trackEvent]);

  // Tracking de conversiones micro
  const trackMicroConversion = useCallback(async (conversionData: {
    conversionType: 'newsletter_signup' | 'resource_request' | 'demo_interest' | 'price_inquiry';
    conversionValue: number;
    source: string;
    campaignId?: string;
  }) => {
    await trackEvent(
      'micro_conversion',
      window.location.pathname,
      {
        conversion_type: conversionData.conversionType,
        conversion_value: conversionData.conversionValue,
        conversion_source: conversionData.source,
        campaign_id: conversionData.campaignId,
        timestamp: new Date().toISOString()
      },
      conversionData.conversionValue
    );
  }, [trackEvent]);

  return {
    trackDownload,
    trackScrollDepth,
    trackVideoInteraction,
    trackInternalSearch,
    trackCTAInteraction,
    trackError,
    trackEngagementMilestone,
    trackExitIntent,
    trackMicroConversion
  };
};