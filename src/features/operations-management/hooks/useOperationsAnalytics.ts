import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subMonths, startOfMonth, differenceInDays } from 'date-fns';
import type { OperationsAnalytics, Operation, SectorDistribution, TemporalData, RecentActivity } from '../types/operations';

export const useOperationsAnalytics = () => {
  return useQuery({
    queryKey: ['operations-analytics'],
    queryFn: async (): Promise<OperationsAnalytics> => {
      // Fetch all active operations
      const { data: operations, error } = await supabase
        .from('company_operations')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const ops = (operations || []) as Operation[];

      // Calculate KPIs
      const totalOperations = ops.length;
      const totalValue = ops.reduce((sum, op) => sum + op.valuation_amount, 0);
      const averageValue = totalOperations > 0 ? totalValue / totalOperations : 0;

      // Average time to close (from created_at to updated_at for closed operations)
      const closedOps = ops.filter(op => op.status === 'completed' || op.status === 'closed');
      const averageTimeToClose = closedOps.length > 0
        ? closedOps.reduce((sum, op) => {
            return sum + differenceInDays(new Date(op.updated_at), new Date(op.created_at));
          }, 0) / closedOps.length
        : 0;

      // Conversion rate (closed / total)
      const conversionRate = totalOperations > 0 ? (closedOps.length / totalOperations) * 100 : 0;

      // Pipeline value (active operations)
      const activeOps = ops.filter(op => op.is_active && op.status !== 'closed');
      const pipelineValue = activeOps.reduce((sum, op) => sum + op.valuation_amount, 0);

      // Win rate by sector
      const winRateBySector: Record<string, number> = {};
      const sectorGroups = ops.reduce((acc, op) => {
        if (!acc[op.sector]) {
          acc[op.sector] = { total: 0, closed: 0 };
        }
        acc[op.sector].total++;
        if (op.status === 'closed' || op.status === 'completed') {
          acc[op.sector].closed++;
        }
        return acc;
      }, {} as Record<string, { total: number; closed: number }>);

      Object.entries(sectorGroups).forEach(([sector, data]) => {
        winRateBySector[sector] = data.total > 0 ? (data.closed / data.total) * 100 : 0;
      });

      // Monthly growth (compare last month vs previous month)
      const now = new Date();
      const lastMonth = subMonths(startOfMonth(now), 1);
      const twoMonthsAgo = subMonths(startOfMonth(now), 2);

      const lastMonthOps = ops.filter(op => {
        const created = new Date(op.created_at);
        return created >= lastMonth && created < now;
      });

      const previousMonthOps = ops.filter(op => {
        const created = new Date(op.created_at);
        return created >= twoMonthsAgo && created < lastMonth;
      });

      const monthlyGrowth = previousMonthOps.length > 0
        ? ((lastMonthOps.length - previousMonthOps.length) / previousMonthOps.length) * 100
        : 0;

      // Sector distribution
      const sectorMap = new Map<string, { count: number; value: number }>();
      ops.forEach(op => {
        const current = sectorMap.get(op.sector) || { count: 0, value: 0 };
        sectorMap.set(op.sector, {
          count: current.count + 1,
          value: current.value + op.valuation_amount
        });
      });

      const sectorDistribution: SectorDistribution[] = Array.from(sectorMap.entries())
        .map(([sector, data]) => ({
          sector,
          count: data.count,
          value: data.value,
          percentage: (data.count / totalOperations) * 100
        }))
        .sort((a, b) => b.value - a.value);

      // Temporal data (last 12 months)
      const temporalData: TemporalData[] = [];
      for (let i = 11; i >= 0; i--) {
        const monthDate = subMonths(startOfMonth(now), i);
        const nextMonth = subMonths(startOfMonth(now), i - 1);
        
        const monthOps = ops.filter(op => {
          const created = new Date(op.created_at);
          return created >= monthDate && created < nextMonth;
        });

        temporalData.push({
          month: format(monthDate, 'MMM yyyy'),
          count: monthOps.length,
          value: monthOps.reduce((sum, op) => sum + op.valuation_amount, 0)
        });
      }

      // Pipeline stages (simulated - you can adjust based on your status field)
      const statusGroups = ops.reduce((acc, op) => {
        const status = op.status || 'new';
        if (!acc[status]) {
          acc[status] = { count: 0, value: 0 };
        }
        acc[status].count++;
        acc[status].value += op.valuation_amount;
        return acc;
      }, {} as Record<string, { count: number; value: number }>);

      const pipelineStages = Object.entries(statusGroups).map(([stage, data]) => ({
        stage,
        count: data.count,
        value: data.value,
        dropOffRate: 0 // Would need historical data to calculate
      }));

      // Recent activity (last 10 operations)
      const recentActivity: RecentActivity[] = ops.slice(0, 10).map(op => {
        const daysSinceCreation = differenceInDays(now, new Date(op.created_at));
        const isNew = daysSinceCreation <= 7;
        
        return {
          id: op.id,
          type: isNew ? 'created' as const : 'updated' as const,
          operation_id: op.id,
          operation_name: op.company_name,
          description: isNew 
            ? `Nueva operación en ${op.sector}` 
            : `Actualizada: ${op.short_description || op.description.substring(0, 50)}`,
          timestamp: op.created_at,
          priority: op.valuation_amount > 5000000 ? 'high' as const : 'medium' as const
        };
      });

      // Top 5 sectors by value
      const topSectors = sectorDistribution.slice(0, 5).map(s => ({
        sector: s.sector,
        value: s.value,
        count: s.count
      }));

      return {
        kpis: {
          totalOperations,
          totalValue,
          averageValue,
          averageTimeToClose,
          conversionRate,
          pipelineValue,
          winRateBySector,
          monthlyGrowth
        },
        sectorDistribution,
        temporalData,
        pipelineStages,
        recentActivity,
        topSectors
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true
  });
};
