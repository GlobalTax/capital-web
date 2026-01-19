/**
 * Google Ads Enhanced Conversions
 * Sends hashed user data with conversion events for better attribution
 */

// SHA-256 hash function for client-side
async function sha256Hash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Normalize phone to E.164 format
function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('34')) {
      cleaned = '+' + cleaned;
    } else {
      cleaned = '+34' + cleaned;
    }
  }
  
  return cleaned;
}

export interface UserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  street?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
}

export interface EnhancedConversionData {
  sha256_email_address?: string;
  sha256_phone_number?: string;
  sha256_first_name?: string;
  sha256_last_name?: string;
  sha256_street?: string;
  address?: {
    sha256_first_name?: string;
    sha256_last_name?: string;
    sha256_street?: string;
    city?: string;
    region?: string;
    postal_code?: string;
    country?: string;
  };
}

/**
 * Prepare enhanced conversion data with hashed PII
 */
export const prepareEnhancedConversionData = async (userData: UserData): Promise<EnhancedConversionData> => {
  const data: EnhancedConversionData = {};

  if (userData.email) {
    data.sha256_email_address = await sha256Hash(userData.email);
  }

  if (userData.phone) {
    const normalizedPhone = normalizePhone(userData.phone);
    data.sha256_phone_number = await sha256Hash(normalizedPhone);
  }

  if (userData.firstName) {
    data.sha256_first_name = await sha256Hash(userData.firstName);
  }

  if (userData.lastName) {
    data.sha256_last_name = await sha256Hash(userData.lastName);
  }

  // Address data
  if (userData.city || userData.region || userData.postalCode || userData.country) {
    data.address = {};
    
    if (userData.firstName) {
      data.address.sha256_first_name = await sha256Hash(userData.firstName);
    }
    if (userData.lastName) {
      data.address.sha256_last_name = await sha256Hash(userData.lastName);
    }
    if (userData.street) {
      data.address.sha256_street = await sha256Hash(userData.street);
    }
    if (userData.city) {
      data.address.city = userData.city;
    }
    if (userData.region) {
      data.address.region = userData.region;
    }
    if (userData.postalCode) {
      data.address.postal_code = userData.postalCode;
    }
    if (userData.country) {
      data.address.country = userData.country || 'ES';
    }
  }

  return data;
};

/**
 * Push enhanced conversion to dataLayer for GTM
 */
export const pushEnhancedConversion = async (
  conversionLabel: string,
  userData: UserData,
  conversionValue?: number,
  transactionId?: string
): Promise<void> => {
  if (typeof window === 'undefined') return;

  try {
    const enhancedData = await prepareEnhancedConversionData(userData);

    // Initialize dataLayer
    (window as any).dataLayer = (window as any).dataLayer || [];

    // Push the conversion event with enhanced data
    const conversionEvent: Record<string, any> = {
      event: 'conversion',
      send_to: conversionLabel,
      user_data: enhancedData
    };

    if (conversionValue !== undefined) {
      conversionEvent.value = conversionValue;
      conversionEvent.currency = 'EUR';
    }

    if (transactionId) {
      conversionEvent.transaction_id = transactionId;
    }

    (window as any).dataLayer.push(conversionEvent);

    console.log('📊 Enhanced Conversion pushed:', {
      conversionLabel,
      hasEmail: !!userData.email,
      hasPhone: !!userData.phone,
      value: conversionValue
    });
  } catch (error) {
    console.error('❌ Enhanced Conversion failed:', error);
  }
};

/**
 * Track valuation completed with enhanced conversions
 */
export const trackValuationEnhanced = async (data: {
  email: string;
  phone?: string;
  contactName?: string;
  valuationValue: number;
  valuationId: string;
  conversionLabel?: string;
}): Promise<void> => {
  const nameParts = (data.contactName || '').trim().split(' ');
  
  await pushEnhancedConversion(
    data.conversionLabel || 'AW-CONVERSION/valuation_completed',
    {
      email: data.email,
      phone: data.phone,
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(' '),
      country: 'ES'
    },
    data.valuationValue,
    data.valuationId
  );
};

/**
 * Track lead form submission with enhanced conversions
 */
export const trackLeadEnhanced = async (data: {
  email: string;
  phone?: string;
  name?: string;
  formType: string;
  conversionLabel?: string;
}): Promise<void> => {
  const nameParts = (data.name || '').trim().split(' ');
  
  await pushEnhancedConversion(
    data.conversionLabel || 'AW-CONVERSION/lead_form',
    {
      email: data.email,
      phone: data.phone,
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(' '),
      country: 'ES'
    }
  );
};

/**
 * Track meeting booked with enhanced conversions
 */
export const trackMeetingEnhanced = async (data: {
  email: string;
  phone?: string;
  name?: string;
  bookingId?: string;
  conversionLabel?: string;
}): Promise<void> => {
  const nameParts = (data.name || '').trim().split(' ');
  
  await pushEnhancedConversion(
    data.conversionLabel || 'AW-CONVERSION/meeting_booked',
    {
      email: data.email,
      phone: data.phone,
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(' '),
      country: 'ES'
    },
    undefined,
    data.bookingId
  );
};

/**
 * Set user data for enhanced conversions globally
 * Call this when user provides their info (e.g., in forms)
 */
export const setEnhancedConversionsUserData = async (userData: UserData): Promise<void> => {
  if (typeof window === 'undefined') return;

  try {
    const enhancedData = await prepareEnhancedConversionData(userData);

    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: 'set_user_data',
      user_data: enhancedData
    });

    console.log('👤 Enhanced Conversions user data set');
  } catch (error) {
    console.error('❌ Failed to set user data:', error);
  }
};
