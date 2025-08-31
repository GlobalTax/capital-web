// Helper function to map currency symbols to ISO codes
const mapCurrencySymbolToCode = (currency: string | null | undefined): string => {
  if (!currency) return 'EUR';
  
  const currencyMap: Record<string, string> = {
    '€': 'EUR',
    '$': 'USD',
    '£': 'GBP',
    '¥': 'JPY',
    'EUR': 'EUR',
    'USD': 'USD',
    'GBP': 'GBP',
    'JPY': 'JPY'
  };
  
  return currencyMap[currency] || 'EUR';
};

export const formatCurrency = (value: number, currency: string = 'EUR'): string => {
  const mappedCurrency = mapCurrencySymbolToCode(currency);
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: mappedCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
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