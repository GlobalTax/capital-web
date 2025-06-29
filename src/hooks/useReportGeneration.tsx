
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ReportConfig, GeneratedReport, ReportData } from '@/types/reports';
import { fetchRevenueMetrics, fetchContentMetrics, fetchSystemMetrics } from '@/utils/analytics';
import { format, subDays, subWeeks, subMonths } from 'date-fns';

export const useReportGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  // Obtener configuraciones de reportes
  const { data: reportConfigs, isLoading: loadingConfigs } = useQuery({
    queryKey: ['report-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('report_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ReportConfig[];
    }
  });

  // Obtener histórico de reportes
  const { data: generatedReports, isLoading: loadingReports } = useQuery({
    queryKey: ['generated-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('generated_reports')
        .select(`
          *,
          report_configs (
            name,
            type,
            template
          )
        `)
        .order('generated_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as GeneratedReport[];
    }
  });

  // Función para obtener datos del reporte
  const fetchReportData = useCallback(async (metrics: string[], type: 'weekly' | 'monthly' | 'quarterly'): Promise<ReportData> => {
    const endDate = new Date();
    let startDate: Date;

    switch (type) {
      case 'weekly':
        startDate = subWeeks(endDate, 1);
        break;
      case 'monthly':
        startDate = subMonths(endDate, 1);
        break;
      case 'quarterly':
        startDate = subMonths(endDate, 3);
        break;
    }

    const dateRange = { start: startDate, end: endDate };
    
    const [businessData, contentData, systemData] = await Promise.all([
      metrics.includes('business') ? fetchRevenueMetrics(dateRange) : Promise.resolve([]),
      metrics.includes('content') ? fetchContentMetrics(dateRange) : Promise.resolve([]),
      metrics.includes('system') ? fetchSystemMetrics() : Promise.resolve([])
    ]);

    // Obtener leads
    let leadsData = { total: 0, new: 0, converted: 0 };
    if (metrics.includes('leads')) {
      const { count: totalLeads } = await supabase
        .from('contact_leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      const { count: newLeads } = await supabase
        .from('contact_leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      leadsData = {
        total: totalLeads || 0,
        new: newLeads || 0,
        converted: (totalLeads || 0) - (newLeads || 0)
      };
    }

    return {
      businessMetrics: {
        totalRevenue: businessData.reduce((sum, item) => sum + (item.revenue_amount || 0), 0),
        totalDeals: businessData.reduce((sum, item) => sum + (item.deal_count || 0), 0),
        avgDealSize: businessData.reduce((sum, item) => sum + (item.avg_deal_size || 0), 0) / Math.max(businessData.length, 1),
        conversionRate: businessData.reduce((sum, item) => sum + (item.conversion_rate || 0), 0) / Math.max(businessData.length, 1)
      },
      contentMetrics: {
        totalViews: contentData.reduce((sum, item) => sum + (item.page_views || 0), 0),
        totalEngagement: contentData.reduce((sum, item) => sum + (item.engagement_score || 0), 0),
        topPosts: contentData
          .sort((a, b) => (b.page_views || 0) - (a.page_views || 0))
          .slice(0, 5)
          .map(item => ({
            title: `Post ${item.id}`,
            views: item.page_views || 0,
            engagement: item.engagement_score || 0
          }))
      },
      systemMetrics: {
        uptime: systemData.length > 0 ? systemData[0].uptime_percentage || 0 : 0,
        responseTime: systemData.length > 0 ? systemData[0].api_response_time || 0 : 0,
        activeUsers: systemData.length > 0 ? systemData[0].active_users || 0 : 0
      },
      leads: leadsData,
      period: {
        start: format(startDate, 'yyyy-MM-dd'),
        end: format(endDate, 'yyyy-MM-dd')
      }
    };
  }, []);

  // Generar reporte manualmente
  const generateReportMutation = useMutation({
    mutationFn: async (config: ReportConfig) => {
      setIsGenerating(true);
      
      try {
        // Obtener datos del reporte
        const reportData = await fetchReportData(config.metrics, config.type);
        
        // Guardar en la base de datos
        const { data, error } = await supabase
          .from('generated_reports')
          .insert({
            config_id: config.id,
            report_data: reportData,
            status: 'completed'
          })
          .select()
          .single();

        if (error) throw error;

        return data;
      } finally {
        setIsGenerating(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-reports'] });
    }
  });

  // Crear nueva configuración de reporte
  const createConfigMutation = useMutation({
    mutationFn: async (config: Omit<ReportConfig, 'id'>) => {
      const { data, error } = await supabase
        .from('report_configs')
        .insert(config)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-configs'] });
    }
  });

  // Actualizar configuración
  const updateConfigMutation = useMutation({
    mutationFn: async ({ id, ...config }: ReportConfig) => {
      const { data, error } = await supabase
        .from('report_configs')
        .update(config)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-configs'] });
    }
  });

  // Eliminar configuración
  const deleteConfigMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('report_configs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-configs'] });
    }
  });

  return {
    reportConfigs,
    generatedReports,
    isLoading: loadingConfigs || loadingReports,
    isGenerating,
    generateReport: generateReportMutation.mutate,
    createConfig: createConfigMutation.mutate,
    updateConfig: updateConfigMutation.mutate,
    deleteConfig: deleteConfigMutation.mutate,
    isCreatingConfig: createConfigMutation.isPending,
    isUpdatingConfig: updateConfigMutation.isPending,
    isDeletingConfig: deleteConfigMutation.isPending
  };
};
