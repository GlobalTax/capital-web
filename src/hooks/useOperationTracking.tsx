import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

type ViewType = 'card_hover' | 'detail_modal' | 'compare';

// Generate or retrieve session ID
const getSessionId = (): string => {
  const key = 'marketplace_session_id';
  let sessionId = sessionStorage.getItem(key);
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem(key, sessionId);
  }
  
  return sessionId;
};

export const useOperationTracking = () => {
  // Track which operations have been tracked in this session to avoid duplicates
  const trackedRef = useRef<Set<string>>(new Set());
  
  const trackView = useCallback(async (
    operationId: string, 
    viewType: ViewType,
    options?: { forceDuplicate?: boolean }
  ) => {
    // Create unique key for this view
    const trackKey = `${operationId}_${viewType}`;
    
    // Skip if already tracked (unless forced)
    if (!options?.forceDuplicate && trackedRef.current.has(trackKey)) {
      return;
    }
    
    try {
      const sessionId = getSessionId();
      
      await supabase
        .from('operation_views')
        .insert({
          operation_id: operationId,
          session_id: sessionId,
          view_type: viewType,
          source_page: window.location.pathname,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent
        });
      
      // Mark as tracked
      trackedRef.current.add(trackKey);
    } catch (error) {
      // Silently fail - tracking shouldn't break the app
      console.warn('Failed to track operation view:', error);
    }
  }, []);

  const trackDetailView = useCallback((operationId: string) => {
    trackView(operationId, 'detail_modal');
  }, [trackView]);

  const trackCompareView = useCallback((operationId: string) => {
    trackView(operationId, 'compare');
  }, [trackView]);

  const trackHoverView = useCallback((operationId: string) => {
    trackView(operationId, 'card_hover');
  }, [trackView]);

  return {
    trackView,
    trackDetailView,
    trackCompareView,
    trackHoverView,
    getSessionId
  };
};
