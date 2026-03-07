import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AIUsageLog {
  id: string;
  created_at: string;
  function_name: string;
  provider: string;
  model: string;
  tokens_input: number;
  tokens_output: number;
  tokens_total: number;
  duration_ms: number;
  estimated_cost_usd: number;
  status: string;
  error_message: string | null;
  metadata: Record<string, any> | null;
}

export interface AIUsageSummary {
  provider: string;
  total_calls: number;
  total_tokens: number;
  total_cost: number;
  avg_duration_ms: number;
  error_count: number;
}

export interface AIUsageByFunction {
  function_name: string;
  total_calls: number;
  total_tokens: number;
  total_cost: number;
  avg_duration_ms: number;
  last_used: string;
}

export function useAIUsageLogs(days = 7) {
  return useQuery({
    queryKey: ['ai-usage-logs', days],
    queryFn: async () => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);

      const { data, error } = await supabase
        .from('ai_usage_logs')
        .select('*')
        .gte('created_at', cutoff.toISOString())
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      return (data || []) as AIUsageLog[];
    },
  });
}

export function useAIUsageSummary() {
  return useQuery({
    queryKey: ['ai-usage-summary'],
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('ai_usage_logs')
        .select('provider, tokens_total, estimated_cost_usd, duration_ms, status')
        .gte('created_at', startOfMonth.toISOString());

      if (error) throw error;

      const map = new Map<string, AIUsageSummary>();
      for (const log of data || []) {
        const existing = map.get(log.provider) || {
          provider: log.provider,
          total_calls: 0,
          total_tokens: 0,
          total_cost: 0,
          avg_duration_ms: 0,
          error_count: 0,
        };
        existing.total_calls += 1;
        existing.total_tokens += log.tokens_total || 0;
        existing.total_cost += Number(log.estimated_cost_usd) || 0;
        existing.avg_duration_ms += log.duration_ms || 0;
        if (log.status !== 'success') existing.error_count += 1;
        map.set(log.provider, existing);
      }

      // Calculate averages
      for (const v of map.values()) {
        if (v.total_calls > 0) v.avg_duration_ms = Math.round(v.avg_duration_ms / v.total_calls);
      }

      return Array.from(map.values());
    },
  });
}

export function useAIUsageByFunction(days = 30) {
  return useQuery({
    queryKey: ['ai-usage-by-function', days],
    queryFn: async () => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);

      const { data, error } = await supabase
        .from('ai_usage_logs')
        .select('function_name, tokens_total, estimated_cost_usd, duration_ms, created_at')
        .gte('created_at', cutoff.toISOString())
        .eq('status', 'success');

      if (error) throw error;

      const map = new Map<string, AIUsageByFunction>();
      for (const log of data || []) {
        const existing = map.get(log.function_name) || {
          function_name: log.function_name,
          total_calls: 0,
          total_tokens: 0,
          total_cost: 0,
          avg_duration_ms: 0,
          last_used: '',
        };
        existing.total_calls += 1;
        existing.total_tokens += log.tokens_total || 0;
        existing.total_cost += Number(log.estimated_cost_usd) || 0;
        existing.avg_duration_ms += log.duration_ms || 0;
        if (!existing.last_used || log.created_at > existing.last_used) {
          existing.last_used = log.created_at;
        }
        map.set(log.function_name, existing);
      }

      for (const v of map.values()) {
        if (v.total_calls > 0) v.avg_duration_ms = Math.round(v.avg_duration_ms / v.total_calls);
      }

      return Array.from(map.values()).sort((a, b) => b.total_tokens - a.total_tokens);
    },
  });
}

export function useAIUsageByDay(days = 30) {
  return useQuery({
    queryKey: ['ai-usage-by-day', days],
    queryFn: async () => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);

      const { data, error } = await supabase
        .from('ai_usage_logs')
        .select('provider, tokens_total, estimated_cost_usd, created_at')
        .gte('created_at', cutoff.toISOString())
        .eq('status', 'success')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const dailyData = new Map<string, { lovable: number; openai: number; cost: number }>();

      for (const log of data || []) {
        const day = log.created_at.split('T')[0];
        const entry = dailyData.get(day) || { lovable: 0, openai: 0, cost: 0 };
        if (log.provider === 'lovable') entry.lovable += log.tokens_total || 0;
        else entry.openai += log.tokens_total || 0;
        entry.cost += Number(log.estimated_cost_usd) || 0;
        dailyData.set(day, entry);
      }

      return Array.from(dailyData.entries()).map(([date, d]) => ({
        date,
        lovable: d.lovable,
        openai: d.openai,
        cost: Math.round(d.cost * 10000) / 10000,
      }));
    },
  });
}
