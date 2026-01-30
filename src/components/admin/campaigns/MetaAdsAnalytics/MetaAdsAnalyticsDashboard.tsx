// ============= META ADS ANALYTICS DASHBOARD =============
// Dashboard completo de análisis de Meta Ads
// Visión global + análisis por campaña + gráficos de evolución

import React, { useState, useMemo } from 'react';
import { parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Upload, Download, Loader2, FileSpreadsheet } from 'lucide-react';
import { useAdsCostsHistory, useExportAdsCosts, AdsCostRecord } from '@/hooks/useAdsCostsHistory';
import { AdsCostsImportModal } from '../AdsCostsImportModal';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

import { GlobalKPIs } from './GlobalKPIs';
import { CampaignCard } from './CampaignCard';
import { EvolutionCharts } from './EvolutionCharts';
import { MetaAdsFilters } from './MetaAdsFilters';
import { 
  analyzeMetaAdsData, 
  getDailyEvolution, 
  CORE_CAMPAIGNS,
  CampaignStats
} from './types';

export const MetaAdsAnalyticsDashboard: React.FC = () => {
  const { data: records, isLoading } = useAdsCostsHistory('meta_ads');
  const { exportToExcel } = useExportAdsCosts();
  
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Get unique campaigns for filter
  const uniqueCampaigns = useMemo(() => {
    if (!records) return [];
    const campaigns = [...new Set(records.map(r => r.campaign_name))];
    return campaigns.sort();
  }, [records]);

  // Filter records based on current filters
  const filteredRecords = useMemo(() => {
    if (!records) return [];

    let filtered = [...records];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.campaign_name.toLowerCase().includes(term) ||
        r.campaign_id?.toLowerCase().includes(term)
      );
    }

    // Campaign filter
    if (selectedCampaign && selectedCampaign !== 'all') {
      filtered = filtered.filter(r => r.campaign_name === selectedCampaign);
    }

    // Date range filter
    if (dateRange?.from) {
      filtered = filtered.filter(r => {
        const recordDate = parseISO(r.date);
        if (dateRange.from && recordDate < dateRange.from) return false;
        if (dateRange.to && recordDate > dateRange.to) return false;
        return true;
      });
    }

    return filtered;
  }, [records, searchTerm, selectedCampaign, dateRange]);

  // Analyze filtered data
  const analysis = useMemo(() => {
    return analyzeMetaAdsData(filteredRecords);
  }, [filteredRecords]);

  // Get daily evolution for charts
  const dailyEvolution = useMemo(() => {
    return getDailyEvolution(filteredRecords);
  }, [filteredRecords]);

  // Get campaign cards to display
  const campaignCards = useMemo(() => {
    const cards: CampaignStats[] = [];
    
    // Add core campaigns in order
    for (const campaignName of CORE_CAMPAIGNS) {
      const stats = analysis.core.get(campaignName);
      if (stats) {
        cards.push(stats);
      }
    }
    
    // Add "other" if exists
    if (analysis.other) {
      cards.push(analysis.other);
    }
    
    return cards;
  }, [analysis]);

  const handleExport = () => {
    if (filteredRecords.length > 0) {
      exportToExcel(filteredRecords, `Meta_Ads_historico_${format(new Date(), 'yyyyMMdd')}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-blue-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            Meta Ads
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Histórico de costes importados desde Excel
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={filteredRecords.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm" onClick={() => setShowImportModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Importar histórico
          </Button>
        </div>
      </div>

      {/* No Data State */}
      {(!records || records.length === 0) && (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-muted/20 border border-dashed rounded-lg">
          <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground font-medium">Sin datos históricos</p>
          <p className="text-muted-foreground text-sm mt-1 mb-4">
            Importa un archivo Excel para ver el análisis de Meta Ads
          </p>
          <Button onClick={() => setShowImportModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Importar histórico
          </Button>
        </div>
      )}

      {/* Main Content */}
      {records && records.length > 0 && (
        <>
          {/* Filters */}
          <MetaAdsFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCampaign={selectedCampaign}
            onCampaignChange={setSelectedCampaign}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            uniqueCampaigns={uniqueCampaigns}
            recordCount={records.length}
            filteredCount={filteredRecords.length}
          />

          <Separator />

          {/* Global KPIs */}
          <GlobalKPIs stats={analysis.global} />

          <Separator />

          {/* Evolution Charts */}
          <EvolutionCharts data={dailyEvolution} />

          <Separator />

          {/* Campaign Analysis */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-gradient-to-br from-primary/50 to-primary/20" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Análisis por Campaña
              </h3>
            </div>

            {campaignCards.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay campañas que coincidan con los filtros actuales
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {campaignCards.map((stats, index) => (
                  <CampaignCard 
                    key={stats.campaignName} 
                    stats={stats} 
                    colorIndex={index}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Import Modal */}
      <AdsCostsImportModal
        platform="meta_ads"
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </div>
  );
};

export default MetaAdsAnalyticsDashboard;
