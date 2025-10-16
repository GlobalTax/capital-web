
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { format, subDays, subWeeks, subMonths } from 'https://esm.sh/date-fns@3.6.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportConfig {
  id: string;
  name: string;
  type: 'weekly' | 'monthly' | 'quarterly';
  recipients: string[];
  template: string;
  metrics: string[];
  schedule: string;
  is_active: boolean;
}

interface ReportData {
  businessMetrics: any;
  contentMetrics: any;
  systemMetrics: any;
  leads: any;
  incompleteValuations?: any[];
  period: {
    start: string;
    end: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting scheduled report generation...');

    // Obtener configuraciones activas
    const { data: configs, error: configError } = await supabase
      .from('report_configs')
      .select('*')
      .eq('is_active', true);

    if (configError) {
      console.error('Error fetching report configs:', configError);
      throw configError;
    }

    console.log(`Found ${configs?.length || 0} active report configurations`);

    for (const config of configs || []) {
      try {
        console.log(`Processing report: ${config.name}`);
        
        // Generar datos del reporte
        const reportData = await generateReportData(supabase, config);
        
        // Guardar reporte generado
        const { data: generatedReport, error: insertError } = await supabase
          .from('generated_reports')
          .insert({
            config_id: config.id,
            report_data: reportData,
            status: 'completed'
          })
          .select()
          .single();

        if (insertError) {
          console.error(`Error saving report for ${config.name}:`, insertError);
          continue;
        }

        console.log(`Report generated successfully: ${config.name}`);

        // TODO: Enviar por email usando Resend
        // Este sería el lugar para integrar el envío de emails
        
      } catch (error) {
        console.error(`Error processing report ${config.name}:`, error);
        
        // Guardar error en la base de datos
        await supabase
          .from('generated_reports')
          .insert({
            config_id: config.id,
            report_data: {},
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error'
          });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${configs?.length || 0} report configurations`
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );

  } catch (error) {
    console.error('Error in scheduled report generation:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      }
    );
  }
};

async function generateReportData(supabase: any, config: ReportConfig): Promise<ReportData> {
  const endDate = new Date();
  let startDate: Date;

  switch (config.type) {
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

  const reportData: ReportData = {
    businessMetrics: {},
    contentMetrics: {},
    systemMetrics: {},
    leads: {},
    period: {
      start: format(startDate, 'yyyy-MM-dd'),
      end: format(endDate, 'yyyy-MM-dd')
    }
  };

  // Obtener métricas de negocio
  if (config.metrics.includes('business')) {
    const { data: businessData } = await supabase
      .from('business_metrics')
      .select('*')
      .gte('period_start', format(startDate, 'yyyy-MM-dd'))
      .lte('period_end', format(endDate, 'yyyy-MM-dd'));

    reportData.businessMetrics = {
      totalRevenue: businessData?.reduce((sum: number, item: any) => sum + (item.revenue_amount || 0), 0) || 0,
      totalDeals: businessData?.reduce((sum: number, item: any) => sum + (item.deal_count || 0), 0) || 0,
      avgDealSize: businessData?.length > 0 ? 
        businessData.reduce((sum: number, item: any) => sum + (item.avg_deal_size || 0), 0) / businessData.length : 0,
      conversionRate: businessData?.length > 0 ? 
        businessData.reduce((sum: number, item: any) => sum + (item.conversion_rate || 0), 0) / businessData.length : 0
    };
  }

  // Obtener métricas de contenido
  if (config.metrics.includes('content')) {
    const { data: contentData } = await supabase
      .from('content_analytics')
      .select('*')
      .gte('period_date', format(startDate, 'yyyy-MM-dd'))
      .lte('period_date', format(endDate, 'yyyy-MM-dd'));

    reportData.contentMetrics = {
      totalViews: contentData?.reduce((sum: number, item: any) => sum + (item.page_views || 0), 0) || 0,
      totalEngagement: contentData?.reduce((sum: number, item: any) => sum + (item.engagement_score || 0), 0) || 0,
      topPosts: contentData?.sort((a: any, b: any) => (b.page_views || 0) - (a.page_views || 0))
        .slice(0, 5)
        .map((item: any) => ({
          title: `Post ${item.id}`,
          views: item.page_views || 0,
          engagement: item.engagement_score || 0
        })) || []
    };
  }

  // Obtener métricas del sistema
  if (config.metrics.includes('system')) {
    const { data: systemData } = await supabase
      .from('system_metrics')
      .select('*')
      .gte('recorded_at', startDate.toISOString())
      .lte('recorded_at', endDate.toISOString())
      .order('recorded_at', { ascending: false })
      .limit(1);

    reportData.systemMetrics = {
      uptime: systemData?.[0]?.uptime_percentage || 0,
      responseTime: systemData?.[0]?.api_response_time || 0,
      activeUsers: systemData?.[0]?.active_users || 0
    };
  }

  // Obtener datos de leads
  if (config.metrics.includes('leads')) {
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

    reportData.leads = {
      total: totalLeads || 0,
      new: newLeads || 0,
      converted: (totalLeads || 0) - (newLeads || 0)
    };
  }

  // Obtener valoraciones incompletas con filtros de calidad
  if (config.metrics.includes('valuations') || config.type === 'daily') {
    const { data: incompleteValuations, error: valuationsError } = await supabase
      .from('company_valuations')
      .select('id, contact_name, company_name, email, industry, created_at, revenue, ebitda, current_step, time_spent_seconds, ip_address')
      .eq('valuation_status', 'in_progress')
      .eq('is_deleted', false) // Excluir soft-deleted
      .gte('created_at', format(startDate, 'yyyy-MM-dd'))
      .lte('created_at', format(endDate, 'yyyy-MM-dd'))
      .gte('time_spent_seconds', 10) // Excluir abandonos inmediatos (<10s)
      .not('email', 'ilike', '%test%') // Excluir emails de prueba
      .not('email', 'ilike', '%prueba%')
      .not('contact_name', 'ilike', '%test%')
      .not('contact_name', 'ilike', '%prueba%')
      .order('created_at', { ascending: false });

    if (valuationsError) {
      console.error('Error fetching incomplete valuations:', valuationsError);
      reportData.incompleteValuations = [];
    } else {
      // Filtrar duplicados del mismo IP en menos de 5 minutos
      const filteredValuations = filterDuplicateIPs(incompleteValuations || []);
      reportData.incompleteValuations = filteredValuations;
    }
  }

  return reportData;
}

// Función auxiliar para filtrar múltiples intentos del mismo IP en <5 minutos
function filterDuplicateIPs(valuations: any[]): any[] {
  if (!valuations || valuations.length === 0) return [];

  const ipGroups = new Map<string, any[]>();
  
  // Agrupar por IP
  valuations.forEach(val => {
    if (val.ip_address) {
      const ipKey = val.ip_address.toString();
      if (!ipGroups.has(ipKey)) {
        ipGroups.set(ipKey, []);
      }
      ipGroups.get(ipKey)!.push(val);
    }
  });
  
  // Filtrar IPs con múltiples intentos en <5 minutos
  return valuations.filter(val => {
    if (!val.ip_address) return true; // Mantener si no hay IP
    
    const ipKey = val.ip_address.toString();
    const sameIpVals = ipGroups.get(ipKey) || [];
    
    if (sameIpVals.length <= 1) return true; // Solo 1 intento, ok
    
    // Verificar si hay múltiples intentos en <5 minutos
    const timestamps = sameIpVals.map(v => new Date(v.created_at).getTime());
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const diffMinutes = (maxTime - minTime) / (1000 * 60);
    
    return diffMinutes > 5; // Mantener si >5 min entre intentos
  });

  return reportData;
}

serve(handler);
