import { differenceInDays, parseISO } from 'date-fns';

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
