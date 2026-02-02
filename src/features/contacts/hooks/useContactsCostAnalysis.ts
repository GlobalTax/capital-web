// ============= CONTACTS COST ANALYSIS HOOK =============
// Combina datos de contactos con costes de campaña para análisis

import { useMemo, useState } from 'react';
import { useUnifiedContacts, UnifiedContact } from '@/hooks/useUnifiedContacts';
import { useCampaignCosts, CampaignCost } from '@/hooks/useCampaignCosts';
import { useAcquisitionChannels } from '@/hooks/useAcquisitionChannels';
import { 
  ContactStatsMetrics, 
  ChannelMetrics, 
  FunnelStage, 
  TimeSeriesDataPoint,
  QualityMetric,
  StatsFilters,
  PeriodGranularity
} from '../types/stats';
import { format, parseISO, startOfWeek, startOfMonth, isWithinInterval, subDays, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

// Mapeo de canales UTM a canales de costes
const UTM_TO_COST_CHANNEL: Record<string, string> = {
  'facebook': 'meta_ads',
  'fb': 'meta_ads',
  'instagram': 'meta_ads',
  'ig': 'meta_ads',
  'meta': 'meta_ads',
  'google': 'google_ads',
  'gads': 'google_ads',
  'linkedin': 'linkedin_ads',
  'organic': 'organic',
  'direct': 'direct',
  'referral': 'referral',
  'marketplace': 'marketplace',
};

const CHANNEL_LABELS: Record<string, string> = {
  'meta_ads': 'Meta Ads',
  'google_ads': 'Google Ads',
  'linkedin_ads': 'LinkedIn Ads',
  'organic': 'Orgánico',
  'direct': 'Directo',
  'referral': 'Referido',
  'marketplace': 'Marketplace',
  'other': 'Otros',
};

const FUNNEL_STAGES = [
  { stage: 'generated', label: 'Generados', color: 'hsl(var(--primary))' },
  { stage: 'contacted', label: 'Contactados', color: 'hsl(217, 91%, 60%)' },
  { stage: 'qualified', label: 'Calificados', color: 'hsl(142, 76%, 36%)' },
  { stage: 'valid', label: 'Válidos', color: 'hsl(45, 93%, 47%)' },
];

// Helper: Normaliza el canal del contacto
const normalizeChannel = (contact: UnifiedContact): string => {
  // Priorizar canal de adquisición si existe
  if (contact.acquisition_channel_name) {
    const normalized = contact.acquisition_channel_name.toLowerCase();
    if (normalized.includes('meta') || normalized.includes('facebook')) return 'meta_ads';
    if (normalized.includes('google')) return 'google_ads';
    if (normalized.includes('linkedin')) return 'linkedin_ads';
    if (normalized.includes('organic') || normalized.includes('orgánico')) return 'organic';
    if (normalized.includes('marketplace')) return 'marketplace';
    if (normalized.includes('referral') || normalized.includes('referido')) return 'referral';
  }
  
  // Fallback a UTM source
  if (contact.utm_source) {
    const source = contact.utm_source.toLowerCase();
    return UTM_TO_COST_CHANNEL[source] || 'other';
  }
  
  return 'other';
};

// Helper: Determina si un contacto está calificado
const isQualified = (contact: UnifiedContact): boolean => {
  return contact.lead_status_crm === 'calificado' || 
         contact.lead_status_crm === 'propuesta_enviada' ||
         contact.lead_status_crm === 'negociacion' ||
         contact.lead_status_crm === 'ganado' ||
         contact.status === 'qualified';
};

// Helper: Determina si un contacto fue contactado
const isContacted = (contact: UnifiedContact): boolean => {
  return contact.email_sent === true || 
         contact.lead_status_crm === 'contactado' ||
         contact.lead_status_crm === 'contactando' ||
         isQualified(contact);
};

// Helper: Determina si un contacto es válido (oportunidad real)
const isValid = (contact: UnifiedContact): boolean => {
  return contact.lead_status_crm === 'propuesta_enviada' ||
         contact.lead_status_crm === 'negociacion' ||
         contact.lead_status_crm === 'ganado' ||
         contact.lead_status_crm === 'mandato_firmado';
};

// Helper: Determina si es un lead de alto valor (EBITDA > 500K)
const isHighValue = (contact: UnifiedContact): boolean => {
  return (contact.ebitda && contact.ebitda > 500000) || 
         (contact.revenue && contact.revenue > 2000000);
};

export const useContactsCostAnalysis = () => {
  const { allContacts, isLoading: contactsLoading } = useUnifiedContacts();
  const { costs, channelAnalytics } = useCampaignCosts();
  const { channels, isLoading: channelsLoading } = useAcquisitionChannels();
  
  const [filters, setFilters] = useState<StatsFilters>({
    dateFrom: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
    dateTo: format(new Date(), 'yyyy-MM-dd'),
    showCosts: true,
    compareWithPrevious: true,
  });

  // Contactos filtrados por periodo - with safety checks
  const filteredContacts = useMemo(() => {
    if (!allContacts || !Array.isArray(allContacts) || allContacts.length === 0) return [];
    
    return allContacts.filter(contact => {
      try {
        if (!contact.created_at) return false;
        const contactDate = parseISO(contact.created_at);
        if (isNaN(contactDate.getTime())) return false;
        
        const from = parseISO(filters.dateFrom);
        const to = parseISO(filters.dateTo);
        if (isNaN(from.getTime()) || isNaN(to.getTime())) return true; // Include if dates invalid
        
        return isWithinInterval(contactDate, { start: from, end: to });
      } catch {
        return false;
      }
    });
  }, [allContacts, filters.dateFrom, filters.dateTo]);

  // Contactos del periodo anterior (para comparativas) - with safety
  const previousPeriodContacts = useMemo(() => {
    if (!allContacts || !Array.isArray(allContacts) || allContacts.length === 0 || !filters.compareWithPrevious) return [];
    
    try {
      const from = parseISO(filters.dateFrom);
      const to = parseISO(filters.dateTo);
      if (isNaN(from.getTime()) || isNaN(to.getTime())) return [];
      
      const periodLength = to.getTime() - from.getTime();
      
      const prevFrom = new Date(from.getTime() - periodLength);
      const prevTo = new Date(from.getTime() - 1);
      
      return allContacts.filter(contact => {
        try {
          if (!contact.created_at) return false;
          const contactDate = parseISO(contact.created_at);
          if (isNaN(contactDate.getTime())) return false;
          return isWithinInterval(contactDate, { start: prevFrom, end: prevTo });
        } catch {
          return false;
        }
      });
    } catch {
      return [];
    }
  }, [allContacts, filters.dateFrom, filters.dateTo, filters.compareWithPrevious]);

  // Costes del periodo - with safety
  const periodCosts = useMemo(() => {
    if (!costs || !Array.isArray(costs) || costs.length === 0) return [];
    
    try {
      const filterFrom = parseISO(filters.dateFrom);
      const filterTo = parseISO(filters.dateTo);
      if (isNaN(filterFrom.getTime()) || isNaN(filterTo.getTime())) return costs;
      
      return costs.filter(cost => {
        try {
          const costStart = parseISO(cost.period_start);
          const costEnd = parseISO(cost.period_end);
          if (isNaN(costStart.getTime()) || isNaN(costEnd.getTime())) return true;
          
          // El coste se solapa con el periodo de filtro
          return costStart <= filterTo && costEnd >= filterFrom;
        } catch {
          return true;
        }
      });
    } catch {
      return costs;
    }
  }, [costs, filters.dateFrom, filters.dateTo]);

  // Coste total del periodo
  const totalCost = useMemo(() => {
    return periodCosts.reduce((sum, cost) => sum + cost.amount, 0);
  }, [periodCosts]);

  // Costes del periodo anterior
  const previousPeriodCost = useMemo(() => {
    if (!costs.length || !filters.compareWithPrevious) return 0;
    
    const from = parseISO(filters.dateFrom);
    const to = parseISO(filters.dateTo);
    const periodLength = to.getTime() - from.getTime();
    
    const prevFrom = new Date(from.getTime() - periodLength);
    const prevTo = new Date(from.getTime() - 1);
    
    return costs.filter(cost => {
      const costStart = parseISO(cost.period_start);
      const costEnd = parseISO(cost.period_end);
      return costStart <= prevTo && costEnd >= prevFrom;
    }).reduce((sum, cost) => sum + cost.amount, 0);
  }, [costs, filters.dateFrom, filters.dateTo, filters.compareWithPrevious]);

  // Métricas principales (KPIs)
  const metrics: ContactStatsMetrics = useMemo(() => {
    const totalLeads = filteredContacts.length;
    const qualifiedLeads = filteredContacts.filter(isQualified).length;
    const uniqueEmails = new Set(filteredContacts.map(c => c.email.toLowerCase()));
    const uniqueLeads = uniqueEmails.size;
    const validLeads = filteredContacts.filter(isValid).length;
    
    const cpl = totalLeads > 0 ? totalCost / totalLeads : 0;
    const cplQualified = qualifiedLeads > 0 ? totalCost / qualifiedLeads : 0;
    const cplUnique = uniqueLeads > 0 ? totalCost / uniqueLeads : 0;
    const cacEstimated = validLeads > 0 ? totalCost / validLeads : 0;
    
    // Variación vs periodo anterior
    const prevCpl = previousPeriodContacts.length > 0 
      ? previousPeriodCost / previousPeriodContacts.length 
      : 0;
    const cplVariation = prevCpl > 0 ? ((cpl - prevCpl) / prevCpl) * 100 : 0;
    
    return {
      totalLeads,
      qualifiedLeads,
      uniqueLeads,
      totalCost,
      cpl,
      cplQualified,
      cplUnique,
      cacEstimated,
      cplVariation,
      previousPeriodLeads: previousPeriodContacts.length,
      previousPeriodCost,
    };
  }, [filteredContacts, totalCost, previousPeriodContacts, previousPeriodCost]);

  // Métricas por canal
  const channelMetrics: ChannelMetrics[] = useMemo(() => {
    const channelMap = new Map<string, {
      leads: UnifiedContact[];
      cost: number;
    }>();
    
    // Agrupar contactos por canal
    filteredContacts.forEach(contact => {
      const channel = normalizeChannel(contact);
      if (!channelMap.has(channel)) {
        channelMap.set(channel, { leads: [], cost: 0 });
      }
      channelMap.get(channel)!.leads.push(contact);
    });
    
    // Asignar costes a canales
    periodCosts.forEach(cost => {
      if (channelMap.has(cost.channel)) {
        channelMap.get(cost.channel)!.cost += cost.amount;
      } else {
        channelMap.set(cost.channel, { leads: [], cost: cost.amount });
      }
    });
    
    // Calcular métricas
    return Array.from(channelMap.entries()).map(([channel, data]) => {
      const leads = data.leads.length;
      const cost = data.cost;
      const qualifiedLeads = data.leads.filter(isQualified).length;
      const highEbitdaLeads = data.leads.filter(isHighValue).length;
      
      const ebitdas = data.leads.filter(c => c.ebitda).map(c => c.ebitda!);
      const revenues = data.leads.filter(c => c.revenue).map(c => c.revenue!);
      
      return {
        channel,
        channelLabel: CHANNEL_LABELS[channel] || channel,
        leads,
        cost,
        cpl: leads > 0 ? cost / leads : 0,
        qualifiedLeads,
        cplQualified: qualifiedLeads > 0 ? cost / qualifiedLeads : 0,
        avgEbitda: ebitdas.length > 0 ? ebitdas.reduce((a, b) => a + b, 0) / ebitdas.length : 0,
        avgRevenue: revenues.length > 0 ? revenues.reduce((a, b) => a + b, 0) / revenues.length : 0,
        highEbitdaLeads,
        costPerHighEbitdaLead: highEbitdaLeads > 0 ? cost / highEbitdaLeads : 0,
      };
    }).sort((a, b) => b.leads - a.leads);
  }, [filteredContacts, periodCosts]);

  // Funnel económico
  const funnelStages: FunnelStage[] = useMemo(() => {
    const total = filteredContacts.length;
    const contacted = filteredContacts.filter(isContacted).length;
    const qualified = filteredContacts.filter(isQualified).length;
    const valid = filteredContacts.filter(isValid).length;
    
    const stages = [
      { stage: 'generated', count: total },
      { stage: 'contacted', count: contacted },
      { stage: 'qualified', count: qualified },
      { stage: 'valid', count: valid },
    ];
    
    let accumulatedCost = 0;
    
    return stages.map((s, index) => {
      const stageConfig = FUNNEL_STAGES[index];
      const previousCount = index > 0 ? stages[index - 1].count : total;
      const conversionRate = previousCount > 0 ? (s.count / previousCount) * 100 : 0;
      
      // Distribuir costes proporcionalmente
      const costProportion = total > 0 ? s.count / total : 0;
      const stageCost = totalCost * costProportion;
      accumulatedCost += stageCost;
      
      return {
        stage: s.stage,
        stageLabel: stageConfig.label,
        count: s.count,
        accumulatedCost,
        costPerStage: s.count > 0 ? stageCost / s.count : 0,
        conversionRate,
        color: stageConfig.color,
      };
    });
  }, [filteredContacts, totalCost]);

  // Serie temporal
  const getTimeSeries = (granularity: PeriodGranularity): TimeSeriesDataPoint[] => {
    const grouped = new Map<string, { leads: UnifiedContact[], cost: number }>();
    
    // Función para obtener la clave de agrupación
    const getGroupKey = (date: Date): string => {
      switch (granularity) {
        case 'daily':
          return format(date, 'yyyy-MM-dd');
        case 'weekly':
          return format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        case 'monthly':
          return format(startOfMonth(date), 'yyyy-MM');
        default:
          return format(date, 'yyyy-MM-dd');
      }
    };
    
    // Agrupar contactos
    filteredContacts.forEach(contact => {
      const key = getGroupKey(parseISO(contact.created_at));
      if (!grouped.has(key)) {
        grouped.set(key, { leads: [], cost: 0 });
      }
      grouped.get(key)!.leads.push(contact);
    });
    
    // Prorratear costes
    periodCosts.forEach(cost => {
      const costStart = parseISO(cost.period_start);
      const costEnd = parseISO(cost.period_end);
      const days = Math.max(1, (costEnd.getTime() - costStart.getTime()) / (1000 * 60 * 60 * 24));
      const dailyCost = cost.amount / days;
      
      // Distribuir el coste a cada día dentro del periodo
      let currentDate = costStart;
      while (currentDate <= costEnd) {
        const key = getGroupKey(currentDate);
        if (grouped.has(key)) {
          grouped.get(key)!.cost += dailyCost;
        } else {
          grouped.set(key, { leads: [], cost: dailyCost });
        }
        currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      }
    });
    
    // Convertir a array ordenado
    return Array.from(grouped.entries())
      .map(([date, data]) => {
        const leads = data.leads.length;
        return {
          date,
          dateLabel: granularity === 'monthly' 
            ? format(parseISO(date + '-01'), 'MMM yyyy', { locale: es })
            : format(parseISO(date), 'dd MMM', { locale: es }),
          leads,
          cost: data.cost,
          cpl: leads > 0 ? data.cost / leads : 0,
          qualifiedLeads: data.leads.filter(isQualified).length,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  // Métricas de calidad
  const qualityMetrics: QualityMetric[] = useMemo(() => {
    return channelMetrics.map(cm => {
      const channelLeads = filteredContacts.filter(c => normalizeChannel(c) === cm.channel);
      const highValueLeads = channelLeads.filter(isHighValue);
      const highValuePercentage = channelLeads.length > 0 
        ? (highValueLeads.length / channelLeads.length) * 100 
        : 0;
      
      // Quality score: combinación de % alto valor y EBITDA medio
      const qualityScore = Math.min(100, 
        (highValuePercentage * 0.5) + 
        (cm.avgEbitda > 0 ? Math.min(50, (cm.avgEbitda / 2000000) * 50) : 0)
      );
      
      return {
        channel: cm.channel,
        channelLabel: cm.channelLabel,
        avgEbitda: cm.avgEbitda,
        avgRevenue: cm.avgRevenue,
        highValueLeads: highValueLeads.length,
        highValuePercentage,
        costPerHighValueLead: cm.costPerHighEbitdaLead,
        qualityScore,
      };
    }).sort((a, b) => b.qualityScore - a.qualityScore);
  }, [channelMetrics, filteredContacts]);

  return {
    // Estado
    isLoading: contactsLoading || channelsLoading,
    filters,
    setFilters,
    
    // Datos
    contacts: filteredContacts,
    costs: periodCosts,
    channels,
    
    // Métricas
    metrics,
    channelMetrics,
    funnelStages,
    qualityMetrics,
    
    // Series temporales
    getTimeSeries,
    
    // Comparativas
    previousPeriodContacts,
    previousPeriodCost,
  };
};
