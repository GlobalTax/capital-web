/**
 * UTM Capture Utility
 * Captures and manages UTM parameters and click IDs from URL for campaign attribution
 */

export interface UTMParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  gclid: string | null;
  fbclid: string | null;
  referrer: string | null;
}

const UTM_STORAGE_KEY = 'capittal_utm_params';
const UTM_EXPIRY_DAYS = 30;

/**
 * Get UTM parameters from current URL
 */
export const getUTMFromURL = (): Partial<UTMParams> => {
  if (typeof window === 'undefined') return {};
  
  const params = new URLSearchParams(window.location.search);
  
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_content: params.get('utm_content'),
    utm_term: params.get('utm_term'),
    gclid: params.get('gclid'),
    fbclid: params.get('fbclid'),
    referrer: document.referrer || null
  };
};

/**
 * Store UTM parameters in localStorage with expiry
 */
export const storeUTMParams = (params: Partial<UTMParams>): void => {
  if (typeof window === 'undefined') return;
  
  // Only store if we have at least one valid parameter
  const hasValidParams = Object.values(params).some(v => v !== null && v !== '');
  if (!hasValidParams) return;
  
  const stored = {
    params,
    timestamp: Date.now(),
    expiry: Date.now() + (UTM_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
  };
  
  try {
    localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(stored));
    console.log('📊 UTM params stored:', params);
  } catch (error) {
    console.warn('Failed to store UTM params:', error);
  }
};

/**
 * Get stored UTM parameters from localStorage
 */
export const getStoredUTMParams = (): Partial<UTMParams> | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(UTM_STORAGE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    
    // Check if expired
    if (parsed.expiry && Date.now() > parsed.expiry) {
      localStorage.removeItem(UTM_STORAGE_KEY);
      return null;
    }
    
    return parsed.params;
  } catch (error) {
    console.warn('Failed to get stored UTM params:', error);
    return null;
  }
};

/**
 * Get UTM parameters - first from URL, then from storage
 * This ensures we capture the original source even across page navigations
 */
export const getUTMParams = (): Partial<UTMParams> => {
  // First check URL for fresh params
  const urlParams = getUTMFromURL();
  
  // If we have fresh URL params, store them and return
  const hasURLParams = Object.values(urlParams).some(v => v !== null && v !== '');
  if (hasURLParams) {
    storeUTMParams(urlParams);
    return urlParams;
  }
  
  // Otherwise, return stored params
  return getStoredUTMParams() || {};
};

/**
 * Get all UTM data formatted for database insertion
 */
export const getUTMDataForDB = (): Record<string, string | null> => {
  const params = getUTMParams();
  
  return {
    utm_source: params.utm_source || null,
    utm_medium: params.utm_medium || null,
    utm_campaign: params.utm_campaign || null,
    utm_content: params.utm_content || null,
    utm_term: params.utm_term || null,
    gclid: params.gclid || null,
    fbclid: params.fbclid || null,
    referrer: params.referrer || document.referrer || null
  };
};

/**
 * Initialize UTM capture on page load
 * Call this early in app initialization
 */
export const initUTMCapture = (): void => {
  if (typeof window === 'undefined') return;
  
  const params = getUTMFromURL();
  const hasParams = Object.values(params).some(v => v !== null && v !== '');
  
  if (hasParams) {
    storeUTMParams(params);
    console.log('🎯 UTM tracking initialized:', params);
  }
};

/**
 * Clear stored UTM params (call after conversion)
 */
export const clearUTMParams = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(UTM_STORAGE_KEY);
};

/**
 * Check if traffic is from paid sources
 */
export const isPaidTraffic = (): boolean => {
  const params = getUTMParams();
  return !!(params.gclid || params.fbclid || params.utm_medium === 'cpc' || params.utm_medium === 'paid');
};

/**
 * Get traffic source type
 */
export const getTrafficSource = (): 'google_ads' | 'meta_ads' | 'organic' | 'direct' | 'referral' | 'email' | 'other' => {
  const params = getUTMParams();
  
  if (params.gclid) return 'google_ads';
  if (params.fbclid) return 'meta_ads';
  if (params.utm_medium === 'email') return 'email';
  if (params.utm_source === 'google' && params.utm_medium === 'organic') return 'organic';
  if (params.referrer && !params.referrer.includes(window.location.hostname)) return 'referral';
  if (!params.referrer && !params.utm_source) return 'direct';
  
  return 'other';
};
