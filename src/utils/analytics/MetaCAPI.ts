/**
 * Meta Conversions API Client
 * Sends server-side events to Meta for improved attribution
 */

import { supabase } from '@/integrations/supabase/client';

export interface MetaEventParams {
  event_name: 'Lead' | 'CompleteRegistration' | 'SubmitApplication' | 'Contact' | 'ViewContent' | 'InitiateCheckout' | 'Purchase' | string;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  city?: string;
  country?: string;
  value?: number;
  currency?: string;
  content_name?: string;
  content_category?: string;
  sector?: string;
  employee_range?: string;
  valuation_id?: string;
  event_id?: string;
}

/**
 * Get Facebook cookies for deduplication
 */
const getFacebookCookies = (): { fbc: string | null; fbp: string | null } => {
  if (typeof document === 'undefined') {
    return { fbc: null, fbp: null };
  }

  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  return {
    fbc: cookies._fbc || null,
    fbp: cookies._fbp || null
  };
};

/**
 * Generate unique event ID for deduplication
 */
const generateEventId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Send event to Meta Conversions API via Edge Function
 */
export const sendMetaEvent = async (params: MetaEventParams): Promise<boolean> => {
  try {
    const { fbc, fbp } = getFacebookCookies();
    const eventId = params.event_id || generateEventId();

    // Also fire browser pixel for deduplication (same event_id)
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', params.event_name, {
        content_name: params.content_name,
        content_category: params.content_category || params.sector,
        value: params.value,
        currency: params.currency || 'EUR'
      }, { eventID: eventId });
    }

    // Send to server-side API
    const { data, error } = await supabase.functions.invoke('meta-conversions-api', {
      body: {
        ...params,
        event_id: eventId,
        fbc,
        fbp,
        client_user_agent: navigator.userAgent,
        event_source_url: window.location.href,
        action_source: 'website'
      }
    });

    if (error) {
      console.error('❌ Meta CAPI error:', error);
      return false;
    }

    console.log('✅ Meta CAPI event sent:', params.event_name, data);
    return true;
  } catch (error) {
    console.error('❌ Meta CAPI failed:', error);
    return false;
  }
};

/**
 * Track valuation completed event
 */
export const trackValuationCompleted = async (data: {
  email: string;
  phone?: string;
  contactName?: string;
  sector: string;
  valuationValue: number;
  valuationId: string;
  employeeRange?: string;
}): Promise<void> => {
  // Parse name into first/last
  const nameParts = (data.contactName || '').trim().split(' ');
  const firstName = nameParts[0] || undefined;
  const lastName = nameParts.slice(1).join(' ') || undefined;

  await sendMetaEvent({
    event_name: 'Lead',
    email: data.email,
    phone: data.phone,
    first_name: firstName,
    last_name: lastName,
    value: data.valuationValue,
    currency: 'EUR',
    content_name: 'Valuation Completed',
    content_category: data.sector,
    sector: data.sector,
    employee_range: data.employeeRange,
    valuation_id: data.valuationId
  });
};

/**
 * Track contact form submission
 */
export const trackContactSubmission = async (data: {
  email: string;
  phone?: string;
  name?: string;
  formType: string;
}): Promise<void> => {
  const nameParts = (data.name || '').trim().split(' ');
  
  await sendMetaEvent({
    event_name: 'Contact',
    email: data.email,
    phone: data.phone,
    first_name: nameParts[0] || undefined,
    last_name: nameParts.slice(1).join(' ') || undefined,
    content_name: data.formType,
    content_category: 'Contact Form'
  });
};

/**
 * Track calculator started
 */
export const trackCalculatorStarted = async (data: {
  sector?: string;
}): Promise<void> => {
  await sendMetaEvent({
    event_name: 'ViewContent',
    content_name: 'Valuation Calculator',
    content_category: data.sector || 'Calculator'
  });
};

/**
 * Track booking/meeting scheduled
 */
export const trackMeetingScheduled = async (data: {
  email: string;
  phone?: string;
  name?: string;
  meetingType: string;
}): Promise<void> => {
  const nameParts = (data.name || '').trim().split(' ');
  
  await sendMetaEvent({
    event_name: 'CompleteRegistration',
    email: data.email,
    phone: data.phone,
    first_name: nameParts[0] || undefined,
    last_name: nameParts.slice(1).join(' ') || undefined,
    content_name: data.meetingType,
    content_category: 'Meeting Scheduled'
  });
};
