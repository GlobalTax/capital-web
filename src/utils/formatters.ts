// Helper function to map currency symbols to ISO codes
const mapCurrencySymbolToCode = (currency: string | null | undefined): string => {
  if (!currency) return 'EUR';
  
  // Clean and normalize the currency string
  const cleanCurrency = currency.trim();
  
  const currencyMap: Record<string, string> = {
    '€': 'EUR',
    'â¬': 'EUR', // Handle corrupted euro symbol
    '$': 'USD',
    '£': 'GBP',
    '¥': 'JPY',
    'EUR': 'EUR',
    'USD': 'USD',
    'GBP': 'GBP',
    'JPY': 'JPY'
  };
  
  // Try exact match first
  if (currencyMap[cleanCurrency]) {
    return currencyMap[cleanCurrency];
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