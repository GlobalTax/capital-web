// ============= DATE UTILITIES =============
// Utilidades para manejo de fechas

import { differenceInDays, parseISO, format as formatDateFns } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Check if operation is recent (within 30 days)
 */
export const isRecentOperation = (created_at?: string): boolean => {
  if (!created_at) return false;
  
  try {
    const createdDate = parseISO(created_at);
    const daysDiff = differenceInDays(new Date(), createdDate);
    return daysDiff <= 30;
  } catch {
    return false;
  }
};

/**
 * Format date to Spanish locale
 */
export const formatDate = (date: string | Date, formatStr = 'PPP'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDateFns(dateObj, formatStr, { locale: es });
  } catch {
    return 'Fecha inválida';
  }
};

/**
 * Format date with time
 */
export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'PPP p');
};

/**
 * Get relative time string (e.g., "hace 2 horas")
 */
export const getRelativeTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'hace un momento';
    if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 604800) return `hace ${Math.floor(diffInSeconds / 86400)} días`;
    if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 604800)} semanas`;
    if (diffInSeconds < 31536000) return `hace ${Math.floor(diffInSeconds / 2592000)} meses`;
    return `hace ${Math.floor(diffInSeconds / 31536000)} años`;
  } catch {
    return 'Fecha desconocida';
  }
};

/**
 * Check if date is in range
 */
export const isDateInRange = (date: Date, start: Date, end: Date): boolean => {
  return date >= start && date <= end;
};

/**
 * Add days to date
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Get difference in days between two dates
 */
export const diffInDays = (date1: Date | string, date2: Date | string): number => {
  try {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    return differenceInDays(d1, d2);
  } catch {
    return 0;
  }
};

/**
 * Check if date is today
 */
export const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if date is in the past
 */
export const isPast = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateObj < new Date();
};
