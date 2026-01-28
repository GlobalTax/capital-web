// ============= ADS COSTS HISTORY TABLE =============
// Tabla de visualización del histórico de costes importados
// Incluye resúmenes calculados dinámicamente (Media/Total)

import React, { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Upload,
  Download,
  Search,
  Calendar,
  ArrowUpDown,
  Loader2,
  FileSpreadsheet,
  Euro,
  TrendingUp,
  Zap,
  ChevronDown,
  Target,
  MousePointerClick,
  Eye,
  Users,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdsCostsHistory, useExportAdsCosts, AdsPlatform, AdsCostRecord, calculateStats } from '@/hooks/useAdsCostsHistory';
import { AdsCostsImportModal } from './AdsCostsImportModal';
import { DateRange } from 'react-day-picker';

interface AdsCostsHistoryTableProps {
  platform: AdsPlatform;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatNumber = (value?: number) => {
  if (value === undefined || value === null) return '—';
  return new Intl.NumberFormat('es-ES').format(Math.round(value));
};

const formatDecimal = (value?: number, decimals = 2) => {
  if (value === undefined || value === null) return '—';
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

type SortKey = 'date' | 'campaign_name' | 'spend' | 'results' | 'impressions';
type SortOrder = 'asc' | 'desc';

export const AdsCostsHistoryTable: React.FC<AdsCostsHistoryTableProps> = ({ platform }) => {
  const { data: records, isLoading } = useAdsCostsHistory(platform);
  const { exportToExcel } = useExportAdsCosts();
  
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');

  const platformName = platform === 'meta_ads' ? 'Meta Ads' : 'Google Ads';

  // Get unique campaigns for filter
  const uniqueCampaigns = useMemo(() => {
    if (!records) return [];
    const campaigns = [...new Set(records.map(r => r.campaign_name))];
    return campaigns.sort();
  }, [records]);

  // Filter and sort records
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

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortKey) {
        case 'date':
          comparison = a.date.localeCompare(b.date);
          break;
        case 'campaign_name':
          comparison = a.campaign_name.localeCompare(b.campaign_name);
          break;
        case 'spend':
          comparison = a.spend - b.spend;
          break;
        case 'results':
          comparison = (a.results || a.conversions || 0) - (b.results || b.conversions || 0);
          break;
        case 'impressions':
          comparison = (a.impressions || 0) - (b.impressions || 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [records, searchTerm, selectedCampaign, dateRange, sortKey, sortOrder]);

  // Calculate dynamic statistics
  const stats = useMemo(() => calculateStats(filteredRecords), [filteredRecords]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const handleExport = () => {
    if (filteredRecords.length > 0) {
      exportToExcel(filteredRecords, `${platformName.replace(' ', '_')}_historico_${format(new Date(), 'yyyyMMdd')}`);
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {platform === 'meta_ads' ? (
              <div className="h-6 w-6 rounded bg-blue-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">M</span>
              </div>
            ) : (
              <div className="h-6 w-6 rounded bg-amber-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">G</span>
              </div>
            )}
            {platformName}
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

      {/* Stats Cards - TOTALS (Calculados dinámicamente) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Totales (calculados)
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <Card className="bg-muted/30">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Euro className="h-3.5 w-3.5" />
                <span className="text-[10px] uppercase tracking-wider">Gasto Total</span>
              </div>
              <p className="text-lg font-semibold">{formatCurrency(stats.totalSpend)}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/30">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Target className="h-3.5 w-3.5" />
                <span className="text-[10px] uppercase tracking-wider">Resultados</span>
              </div>
              <p className="text-lg font-semibold">{formatNumber(stats.totalResults)}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/30">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Eye className="h-3.5 w-3.5" />
                <span className="text-[10px] uppercase tracking-wider">Impresiones</span>
              </div>
              <p className="text-lg font-semibold">{formatNumber(stats.totalImpressions)}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/30">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="h-3.5 w-3.5" />
                <span className="text-[10px] uppercase tracking-wider">Alcance</span>
              </div>
              <p className="text-lg font-semibold">{formatNumber(stats.totalReach)}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/30">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MousePointerClick className="h-3.5 w-3.5" />
                <span className="text-[10px] uppercase tracking-wider">Clics</span>
              </div>
              <p className="text-lg font-semibold">{formatNumber(stats.totalLinkClicks || stats.totalClicks)}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/30">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span className="text-[10px] uppercase tracking-wider">Días</span>
              </div>
              <p className="text-lg font-semibold">{stats.uniqueDays}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats Cards - AVERAGES (Calculados dinámicamente) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Medias (calculadas)
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-primary/70 mb-1">
                <Euro className="h-3.5 w-3.5" />
                <span className="text-[10px] uppercase tracking-wider">Coste/Resultado</span>
              </div>
              <p className="text-lg font-semibold text-primary">{formatCurrency(stats.avgCostPerResult)}</p>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-primary/70 mb-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="text-[10px] uppercase tracking-wider">CPM</span>
              </div>
              <p className="text-lg font-semibold text-primary">{formatCurrency(stats.avgCpm)}</p>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-primary/70 mb-1">
                <Zap className="h-3.5 w-3.5" />
                <span className="text-[10px] uppercase tracking-wider">Frecuencia</span>
              </div>
              <p className="text-lg font-semibold text-primary">{formatDecimal(stats.avgFrequency)}</p>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-primary/70 mb-1">
                <Euro className="h-3.5 w-3.5" />
                <span className="text-[10px] uppercase tracking-wider">Gasto/Día</span>
              </div>
              <p className="text-lg font-semibold text-primary">{formatCurrency(stats.avgSpendPerDay)}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar campaña..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Campaign filter */}
        <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
          <SelectTrigger className="w-[200px] h-9">
            <SelectValue placeholder="Todas las campañas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las campañas</SelectItem>
            {uniqueCampaigns.map(campaign => (
              <SelectItem key={campaign} value={campaign}>
                {campaign}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date range */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <Calendar className="h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  `${format(dateRange.from, 'dd MMM', { locale: es })} - ${format(dateRange.to, 'dd MMM', { locale: es })}`
                ) : (
                  format(dateRange.from, 'dd MMM', { locale: es })
                )
              ) : (
                'Rango de fechas'
              )}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <CalendarComponent
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              locale={es}
              numberOfMonths={2}
            />
            {dateRange && (
              <div className="p-2 border-t">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setDateRange(undefined)}
                >
                  Limpiar filtro
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Table */}
      {filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-muted/20 border border-dashed rounded-lg">
          <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-4" />
          {records && records.length > 0 ? (
            <>
              <p className="text-muted-foreground font-medium">Sin resultados</p>
              <p className="text-muted-foreground text-sm mt-1">
                Ajusta los filtros para ver los datos
              </p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground font-medium">Sin datos históricos</p>
              <p className="text-muted-foreground text-sm mt-1 mb-4">
                Importa un archivo Excel para ver el histórico de costes
              </p>
              <Button onClick={() => setShowImportModal(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Importar histórico
              </Button>
            </>
          )}
        </div>
      ) : (
        <Card>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-1">
                      Fecha
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('campaign_name')}
                  >
                    <div className="flex items-center gap-1">
                      Campaña
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('spend')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Gasto
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('results')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Resultados
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Coste/Res.</TableHead>
                  <TableHead 
                    className="text-right cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('impressions')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Impresiones
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">CPM</TableHead>
                  <TableHead className="text-right">Frecuencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-mono text-xs">
                      {format(parseISO(record.date), 'dd MMM yyyy', { locale: es })}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={record.campaign_name}>
                      {record.campaign_name}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {formatCurrency(record.spend)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(record.results || record.conversions)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {record.cost_per_result ? formatCurrency(record.cost_per_result) : '—'}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatNumber(record.impressions)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {record.cpm ? formatCurrency(record.cpm) : '—'}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDecimal(record.frequency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {/* Footer with calculated totals */}
              <TableFooter className="bg-muted/50">
                <TableRow className="font-medium">
                  <TableCell colSpan={2} className="text-xs uppercase tracking-wider text-muted-foreground">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(stats.totalSpend)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(stats.totalResults)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(stats.avgCostPerResult)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(stats.totalImpressions)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(stats.avgCpm)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatDecimal(stats.avgFrequency)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </ScrollArea>
          <div className="px-4 py-2 border-t text-xs text-muted-foreground flex justify-between">
            <span>Mostrando {filteredRecords.length} registros diarios</span>
            <span className="text-primary font-medium">
              Totales y medias calculados automáticamente
            </span>
          </div>
        </Card>
      )}

      {/* Import Modal */}
      <AdsCostsImportModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        platform={platform}
      />
    </div>
  );
};

export default AdsCostsHistoryTable;
