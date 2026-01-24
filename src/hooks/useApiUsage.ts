import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ApiUsageLog {
  id: string;
  service: string;
  operation: string;
  credits_used: number;
  tokens_used: number | null;
  cost_usd: number | null;
  function_name: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ApiUsageMonthly {
  service: string;
  operation: string;
  month: string;
  total_credits: number;
  total_tokens: number | null;
  total_cost: number | null;
  call_count: number;
}

export interface ApiUsageSummary {
  service: string;
  total_credits: number;
  total_calls: number;
  last_used: string | null;
}

export function useApiUsageLogs(days = 30) {
  return useQuery({
    queryKey: ['api-usage-logs', days],
    queryFn: async () => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { data, error } = await supabase
        .from('api_usage_log')
        .select('*')
        .gte('created_at', cutoffDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      return data as ApiUsageLog[];
    },
  });
}

export function useApiUsageSummary() {
  return useQuery({
    queryKey: ['api-usage-summary'],
    queryFn: async () => {
      // Get current month's usage grouped by service
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('api_usage_log')
        .select('service, credits_used, created_at')
        .gte('created_at', startOfMonth.toISOString());

      if (error) throw error;

      // Aggregate by service
      const summaryMap = new Map<string, ApiUsageSummary>();

      for (const log of data || []) {
        const existing = summaryMap.get(log.service) || {
          service: log.service,
          total_credits: 0,
          total_calls: 0,
          last_used: null,
        };

        existing.total_credits += log.credits_used || 0;
        existing.total_calls += 1;
        if (!existing.last_used || log.created_at > existing.last_used) {
          existing.last_used = log.created_at;
        }

        summaryMap.set(log.service, existing);
      }

      return Array.from(summaryMap.values());
    },
  });
}

export function useApiUsageByDay(days = 30) {
  return useQuery({
    queryKey: ['api-usage-by-day', days],
    queryFn: async () => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { data, error } = await supabase
        .from('api_usage_log')
        .select('service, credits_used, created_at')
        .gte('created_at', cutoffDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by day and service
      const dailyData = new Map<string, Map<string, number>>();

      for (const log of data || []) {
        const day = log.created_at.split('T')[0];
        if (!dailyData.has(day)) {
          dailyData.set(day, new Map());
        }
        const dayMap = dailyData.get(day)!;
        dayMap.set(log.service, (dayMap.get(log.service) || 0) + (log.credits_used || 0));
      }

      // Convert to array format for chart
      const result: Array<{ date: string; firecrawl: number; openai: number; lovable_ai: number }> = [];

      for (const [date, services] of dailyData) {
        result.push({
          date,
          firecrawl: services.get('firecrawl') || 0,
          openai: services.get('openai') || 0,
          lovable_ai: services.get('lovable_ai') || 0,
        });
      }

      return result;
    },
  });
}

// Firecrawl plan limits for comparison
export const FIRECRAWL_PLANS = {
  free: { name: 'Free', credits: 500, price: 0 },
  hobby: { name: 'Hobby', credits: 3000, price: 16 },
  standard: { name: 'Standard', credits: 10000, price: 66 },
  growth: { name: 'Growth', credits: 50000, price: 249 },
} as const;

export function getRecommendedPlan(monthlyCredits: number): keyof typeof FIRECRAWL_PLANS {
  if (monthlyCredits <= 450) return 'free'; // 90% of free tier
  if (monthlyCredits <= 2700) return 'hobby';
  if (monthlyCredits <= 9000) return 'standard';
  return 'growth';
}
