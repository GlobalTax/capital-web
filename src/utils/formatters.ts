// Helper function to map currency symbols to ISO codes
const mapCurrencySymbolToCode = (currency: string | null | undefined): string => {
  if (!currency) return 'EUR';
  
  // Clean and normalize the currency string
  const cleanCurrency = currency.trim();
  const normalizedCurrency = cleanCurrency.toLowerCase();
  
  const currencyMap: Record<string, string> = {
    // Symbols
    '€': 'EUR',
    'â¬': 'EUR', // Handle corrupted euro symbol
    '$': 'USD',
    '£': 'GBP',
    '¥': 'JPY',
    // ISO codes
    'EUR': 'EUR',
    'USD': 'USD',
    'GBP': 'GBP',
    'JPY': 'JPY',
    // Aliases (case-insensitive)
    'eur': 'EUR',
    'euro': 'EUR',
    'euros': 'EUR',
    'usd': 'USD',
    'dollar': 'USD',
    'dollars': 'USD',
    'gbp': 'GBP',
    'pound': 'GBP',
    'pounds': 'GBP',
    'jpy': 'JPY',
    'yen': 'JPY'
  };
  
  // Try exact match first (for symbols and uppercase codes)
  if (currencyMap[cleanCurrency]) {
    return currencyMap[cleanCurrency];
  }
  
  // Try case-insensitive match for aliases
  if (currencyMap[normalizedCurrency]) {
    return currencyMap[normalizedCurrency];
  }
  
  // Handle corrupted euro symbols by checking if string contains euro-like characters
  if (cleanCurrency.includes('â') || cleanCurrency.includes('¬') || cleanCurrency.length > 3) {
    return 'EUR';
  }
  
  return 'EUR'; // Default fallback
};

export const formatCurrency = (value: number, currency: string = 'EUR'): string => {
  console.log('💰 formatCurrency called with:', { value, currency });
  const mappedCurrency = mapCurrencySymbolToCode(currency);
  console.log('💱 Currency mapped from', currency, 'to', mappedCurrency);
  
  try {
    const result = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: mappedCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
    console.log('✅ formatCurrency result:', result);
    return result;
  } catch (error) {
    console.error('❌ formatCurrency error:', error, { value, currency, mappedCurrency });
    // Fallback to basic formatting
    return `${value.toLocaleString('es-ES')} €`;
  }
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value / 100);
};

// Normalize valuation amounts (fix million interpretation)
export const normalizeValuationAmount = (raw: number): number => {
  if (!raw || raw <= 0) return 0;
  
  // If already >= 1,000,000 or >= 10,000, use as-is
  if (raw >= 1000000 || raw >= 10000) {
    return raw;
  }
  
  // If 0 < raw < 10,000, interpret as millions
  if (raw > 0 && raw < 10000) {
    return raw * 1000000;
  }
  
  return raw;
};

export const formatCompactNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date));
};

export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};