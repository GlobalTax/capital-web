// ============= FORMAT UTILITIES =============
// Utilidades centralizadas para formateo de datos

// ========== CURRENCY MAPPING ==========

const mapCurrencySymbolToCode = (currency: string | null | undefined): string => {
  if (!currency) return 'EUR';
  
  const cleanCurrency = currency.trim();
  const normalizedCurrency = cleanCurrency.toLowerCase();
  
  const currencyMap: Record<string, string> = {
    '€': 'EUR',
    'â¬': 'EUR', // Handle corrupted euro symbol
    '$': 'USD',
    '£': 'GBP',
    '¥': 'JPY',
    'EUR': 'EUR',
    'USD': 'USD',
    'GBP': 'GBP',
    'JPY': 'JPY',
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
  
  if (currencyMap[cleanCurrency]) return currencyMap[cleanCurrency];
  if (currencyMap[normalizedCurrency]) return currencyMap[normalizedCurrency];
  if (cleanCurrency.includes('â') || cleanCurrency.includes('¬') || cleanCurrency.length > 3) {
    return 'EUR';
  }
  
  return 'EUR';
};

// ========== NUMBER FORMATTERS ==========

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const formatCurrency = (value: number, currency: string = 'EUR'): string => {
  const mappedCurrency = mapCurrencySymbolToCode(currency);
  
  try {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: mappedCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  } catch (error) {
    console.error('formatCurrency error:', error, { value, currency, mappedCurrency });
    return `${value.toLocaleString('es-ES')} €`;
  }
};

export const formatPercentage = (value: number, decimals = 0): string => {
  return `${value.toFixed(decimals)}%`;
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

export const formatCompactCurrency = (
  amount: number | undefined, 
  currency: string = 'EUR'
): string => {
  if (!amount || amount <= 0) return 'Consultar';
  
  const normalized = normalizeValuationAmount(amount);
  const currencySymbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€';
  
  if (normalized >= 1_000_000) {
    return `${currencySymbol}${(normalized / 1_000_000).toFixed(1)}M`;
  }
  if (normalized >= 1_000) {
    return `${currencySymbol}${(normalized / 1_000).toFixed(0)}K`;
  }
  return `${currencySymbol}${normalized.toFixed(0)}`;
};

// ========== VALUATION NORMALIZERS ==========

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