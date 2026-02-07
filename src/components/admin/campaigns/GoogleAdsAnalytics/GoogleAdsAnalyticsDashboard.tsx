// ============= GOOGLE ADS ANALYTICS DASHBOARD =============

import React, { useState, useMemo } from 'react';
import { parseISO, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Upload, Download, Loader2, FileSpreadsheet } from 'lucide-react';
import { useAdsCostsHistory, useExportAdsCosts } from '@/hooks/useAdsCostsHistory';
import { GoogleAdsImportModal } from '../GoogleAdsImportModal';
import { DateRange } from 'react-day-picker';

import { GoogleAdsKPIs } from './GoogleAdsKPIs';
import { GoogleAdsCampaignCard } from './GoogleAdsCampaignCard';
import { GoogleAdsEvolutionCharts } from './GoogleAdsEvolutionCharts';
import { GoogleAdsFilters } from './GoogleAdsFilters';
import { analyzeGoogleAdsData, getGoogleAdsDailyEvolution } from './types';

export const GoogleAdsAnalyticsDashboard: React.FC = () => {
  const { data: records, isLoading } = useAdsCostsHistory('google_ads');
  const { exportToExcel } = useExportAdsCosts();

  const [showImportModal, setShowImportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const uniqueCampaigns = useMemo(() => {
    if (!records) return [];
    return [...new Set(records.map(r => r.campaign_name))].sort();
  }, [records]);

  const filteredRecords = useMemo(() => {
    if (!records) return [];
    let filtered = [...records];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => r.campaign_name.toLowerCase().includes(term));
    }
    if (selectedCampaign && selectedCampaign !== 'all') {
      filtered = filtered.filter(r => r.campaign_name === selectedCampaign);
    }
    if (dateRange?.from) {
      filtered = filtered.filter(r => {
        const d = parseISO(r.date);
        if (dateRange.from && d < dateRange.from) return false;
        if (dateRange.to && d > dateRange.to) return false;
        return true;
      });
    }
    return filtered;
  }, [records, searchTerm, selectedCampaign, dateRange]);

  const analysis = useMemo(() => analyzeGoogleAdsData(filteredRecords), [filteredRecords]);
  const dailyEvolution = useMemo(() => getGoogleAdsDailyEvolution(filteredRecords), [filteredRecords]);

  const handleExport = () => {
    if (filteredRecords.length > 0) {
      exportToExcel(filteredRecords, `Google_Ads_historico_${format(new Date(), 'yyyyMMdd')}`);
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
            <div className="h-6 w-6 rounded bg-[#4285F4] flex items-center justify-center">
              <span className="text-white text-xs font-bold">G</span>
            </div>
            Google Ads
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">Histórico de costes importados desde CSV/Excel</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={filteredRecords.length === 0}>
            <Download className="h-4 w-4 mr-2" />Exportar
          </Button>
          <Button size="sm" onClick={() => setShowImportModal(true)}>
            <Upload className="h-4 w-4 mr-2" />Importar datos
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {(!records || records.length === 0) && (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-muted/20 border border-dashed rounded-lg">
          <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground font-medium">Sin datos históricos</p>
          <p className="text-muted-foreground text-sm mt-1 mb-4">Importa un archivo CSV de Google Ads para ver el análisis</p>
          <Button onClick={() => setShowImportModal(true)}>
            <Upload className="h-4 w-4 mr-2" />Importar datos
          </Button>
        </div>
      )}

      {/* Main Content */}
      {records && records.length > 0 && (
        <>
          <GoogleAdsFilters
            searchTerm={searchTerm} onSearchChange={setSearchTerm}
            selectedCampaign={selectedCampaign} onCampaignChange={setSelectedCampaign}
            dateRange={dateRange} onDateRangeChange={setDateRange}
            uniqueCampaigns={uniqueCampaigns}
            recordCount={records.length} filteredCount={filteredRecords.length}
          />
          <Separator />
          <GoogleAdsKPIs stats={analysis.global} />
          <Separator />
          <GoogleAdsEvolutionCharts data={dailyEvolution} />
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-gradient-to-br from-primary/50 to-primary/20" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Análisis por Campaña</h3>
            </div>
            {analysis.campaigns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No hay campañas que coincidan con los filtros</div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {analysis.campaigns.map((stats, i) => (
                  <GoogleAdsCampaignCard key={stats.campaignName} stats={stats} colorIndex={i} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <GoogleAdsImportModal open={showImportModal} onClose={() => setShowImportModal(false)} />
    </div>
  );
};
