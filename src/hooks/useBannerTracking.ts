import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

type TrackingEvent = 'impression' | 'click';

interface TrackingOptions {
  bannerId: string;
  enabled?: boolean;
}

// Helper function to validate UUID format
const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export const useBannerTracking = ({ bannerId, enabled = true }: TrackingOptions) => {
  const location = useLocation();
  const impressionTracked = useRef(false);

  const trackEvent = useCallback(async (event: TrackingEvent) => {
    // Skip tracking if disabled, no bannerId, or bannerId is not a valid UUID (e.g., "preview")
    if (!enabled || !bannerId || !isValidUUID(bannerId)) return;

    try {
      // Call the edge function to track the event
      const response = await fetch(
        `https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/banners_list/banners/${bannerId}/track?path=${encodeURIComponent(location.pathname)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`,
          },
          body: JSON.stringify({ event }),
        }
      );

      if (!response.ok) {
        console.warn('Failed to track banner event:', await response.text());
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Error tracking banner event:', error);
      return false;
    }
  }, [bannerId, location.pathname, enabled]);

  // Track impression once per banner render
  const trackImpression = useCallback(() => {
    if (!impressionTracked.current && enabled) {
      impressionTracked.current = true;
      trackEvent('impression');
    }
  }, [trackEvent, enabled]);

  // Track click events
  const trackClick = useCallback(() => {
    trackEvent('click');
  }, [trackEvent]);

  // Reset impression tracking when banner ID changes
  useEffect(() => {
    impressionTracked.current = false;
  }, [bannerId]);

  // Track impression on mount
  useEffect(() => {
    if (enabled && bannerId) {
      trackImpression();
    }
  }, [trackImpression, enabled, bannerId]);

  return {
    trackClick,
    trackImpression,
    trackEvent,
  };
};