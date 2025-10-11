// ============= NUMBER UTILITIES =============
// Utilidades para manejo de números

/**
 * Clamp number between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Round number to specific decimal places
 */
export const roundToDecimals = (value: number, decimals: number): number => {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
};

/**
 * Parse float safely with fallback
 */
export const parseFloatSafe = (value: string | number, fallback = 0): number => {
  const parsed = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(parsed) ? fallback : parsed;
};

/**
 * Parse int safely with fallback
 */
export const parseIntSafe = (value: string | number, fallback = 0): number => {
  const parsed = typeof value === 'string' ? parseInt(value, 10) : Math.floor(value);
  return isNaN(parsed) ? fallback : parsed;
};

/**
 * Check if number is in range (inclusive)
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Generate random number in range
 */
export const randomInRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

/**
 * Generate random integer in range
 */
export const randomIntInRange = (min: number, max: number): number => {
  return Math.floor(randomInRange(min, max + 1));
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (part: number, total: number): number => {
  if (total === 0) return 0;
  return (part / total) * 100;
};

/**
 * Calculate average
 */
export const average = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
};

/**
 * Sum array of numbers
 */
export const sum = (numbers: number[]): number => {
  return numbers.reduce((total, num) => total + num, 0);
};
