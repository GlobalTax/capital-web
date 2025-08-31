// Normalize valuation amounts to handle mixed data formats
export const normalizeValuationAmount = (rawValue: number): number => {
  // Si rawValue >= 1,000,000 o >= 10,000, asumimos que ya está en unidades
  if (rawValue >= 1_000_000 || rawValue >= 10_000) {
    return rawValue;
  }
  
  // Si 0 < rawValue < 10,000, interpretamos como millones
  if (rawValue > 0 && rawValue < 10_000) {
    return rawValue * 1_000_000;
  }
  
  // En cualquier otro caso, devolver tal cual
  return rawValue;
};

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
  // Normalize the value to handle mixed valuation formats
  const normalizedValue = normalizeValuationAmount(value);
  console.log('💰 formatCurrency called with:', { original: value, normalized: normalizedValue, currency });
  const mappedCurrency = mapCurrencySymbolToCode(currency);
  console.log('💱 Currency mapped from', currency, 'to', mappedCurrency);
  
  try {
    const result = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: mappedCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(normalizedValue);
    console.log('✅ formatCurrency result:', result);
    return result;
  } catch (error) {
    console.error('❌ formatCurrency error:', error, { original: value, normalized: normalizedValue, currency, mappedCurrency });
    // Fallback to basic formatting
    return `${normalizedValue.toLocaleString('es-ES')} €`;
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