// ============= GOOGLE ADS FILTERS =============

import React from 'react';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, ChevronDown, X } from 'lucide-react';
import { DateRange } from 'react-day-picker';

interface Props {
  searchTerm: string;
  onSearchChange: (v: string) => void;
  selectedCampaign: string;
  onCampaignChange: (v: string) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (r: DateRange | undefined) => void;
  uniqueCampaigns: string[];
  recordCount: number;
  filteredCount: number;
}

const DATE_PRESETS = [
  { label: 'Últimos 7 días', days: 7 },
  { label: 'Últimos 30 días', days: 30 },
  { label: 'Últimos 90 días', days: 90 },
  { label: 'Este año', days: 365 },
];

export const GoogleAdsFilters: React.FC<Props> = ({
  searchTerm, onSearchChange, selectedCampaign, onCampaignChange,
  dateRange, onDateRangeChange, uniqueCampaigns, recordCount, filteredCount,
}) => {
  const hasActive = searchTerm || selectedCampaign !== 'all' || dateRange?.from;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar campaña..." value={searchTerm} onChange={e => onSearchChange(e.target.value)} className="pl-9 h-9" />
        </div>

        <Select value={selectedCampaign} onValueChange={onCampaignChange}>
          <SelectTrigger className="w-[280px] h-9"><SelectValue placeholder="Todas las campañas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las campañas</SelectItem>
            {uniqueCampaigns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <Calendar className="h-4 w-4" />
              {dateRange?.from
                ? dateRange.to
                  ? `${format(dateRange.from, 'dd MMM', { locale: es })} - ${format(dateRange.to, 'dd MMM', { locale: es })}`
                  : format(dateRange.from, 'dd MMM', { locale: es })
                : 'Rango de fechas'}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="p-2 border-b flex flex-wrap gap-1">
              {DATE_PRESETS.map(p => (
                <Button key={p.days} variant="ghost" size="sm" className="h-7 text-xs"
                  onClick={() => onDateRangeChange({ from: subDays(new Date(), p.days), to: new Date() })}>
                  {p.label}
                </Button>
              ))}
            </div>
            <CalendarComponent mode="range" selected={dateRange} onSelect={onDateRangeChange} locale={es} numberOfMonths={2} />
            {dateRange && (
              <div className="p-2 border-t">
                <Button variant="ghost" size="sm" className="w-full" onClick={() => onDateRangeChange(undefined)}>
                  Limpiar filtro de fechas
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {hasActive && (
          <Button variant="ghost" size="sm" className="h-9" onClick={() => { onSearchChange(''); onCampaignChange('all'); onDateRangeChange(undefined); }}>
            <X className="h-4 w-4 mr-1" />Limpiar filtros
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Mostrando <strong className="text-foreground">{filteredCount}</strong> registros
          {filteredCount !== recordCount && <> de <strong className="text-foreground">{recordCount}</strong> totales</>}
        </span>
        {hasActive && (
          <div className="flex items-center gap-1">
            <span>—</span>
            {searchTerm && <Badge variant="secondary" className="text-xs">Búsqueda: "{searchTerm}"</Badge>}
            {selectedCampaign !== 'all' && <Badge variant="secondary" className="text-xs">Campaña filtrada</Badge>}
            {dateRange?.from && <Badge variant="secondary" className="text-xs">Período filtrado</Badge>}
          </div>
        )}
      </div>
    </div>
  );
};
