
import type { SystemMetrics } from '@/types/dashboard';

export const fetchSystemMetrics = async (): Promise<SystemMetrics[]> => {
  // System metrics disabled after cleanup
  console.log('System metrics fetching disabled after cleanup');
  return [];
};
