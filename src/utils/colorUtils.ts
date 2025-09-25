/**
 * Color utility functions for accessibility and validation
 */

export interface ColorTheme {
  name: string;
  primary: string;
  secondary?: string;
  textOnPrimary?: string;
}

export interface ContrastResult {
  ratio: number;
  level: 'AAA' | 'AA' | 'AA Large' | 'Fail';
  accessible: boolean;
}

export const COLOR_THEMES: ColorTheme[] = [
  { 
    name: "Ocean", 
    primary: "#0ea5e9", 
    secondary: "#2563eb",
    textOnPrimary: "#ffffff"
  },
  { 
    name: "Emerald", 
    primary: "#10b981", 
    secondary: "#059669",
    textOnPrimary: "#ffffff"
  },
  { 
    name: "Sunset", 
    primary: "#f97316", 
    secondary: "#ef4444",
    textOnPrimary: "#ffffff"
  },
  { 
    name: "Grape", 
    primary: "#8b5cf6", 
    secondary: "#6d28d9",
    textOnPrimary: "#ffffff"
  },
  { 
    name: "Carbon", 
    primary: "#111827", 
    secondary: "#374151",
    textOnPrimary: "#ffffff"
  }
];

/**
 * Convert hex color to RGB values
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Calculate relative luminance according to WCAG guidelines
 */
export const calculateLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Calculate contrast ratio between two colors
 */
export const calculateContrastRatio = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 1;
  
  const lum1 = calculateLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = calculateLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * Get contrast level and accessibility status
 */
export const getContrastLevel = (ratio: number): ContrastResult => {
  if (ratio >= 7) {
    return { ratio, level: 'AAA', accessible: true };
  } else if (ratio >= 4.5) {
    return { ratio, level: 'AA', accessible: true };
  } else if (ratio >= 3) {
    return { ratio, level: 'AA Large', accessible: true };
  }
  return { ratio, level: 'Fail', accessible: false };
};

/**
 * Enhanced hex color validation
 */
export const isValidHex = (hex: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
};

/**
 * Get contrast info between foreground and background colors
 */
export const getContrastInfo = (foreground: string, background: string): ContrastResult => {
  const ratio = calculateContrastRatio(foreground, background);
  return getContrastLevel(ratio);
};