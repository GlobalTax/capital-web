// ============= META ADS FILTERS =============

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
import { CORE_CAMPAIGNS } from './types';

interface MetaAdsFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCampaign: string;
  onCampaignChange: (value: string) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
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

export const MetaAdsFilters: React.FC<MetaAdsFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedCampaign,
  onCampaignChange,
  dateRange,
  onDateRangeChange,
  uniqueCampaigns,
  recordCount,
  filteredCount,
}) => {
  const hasActiveFilters = searchTerm || selectedCampaign !== 'all' || dateRange?.from;

  const handlePresetClick = (days: number) => {
    const today = new Date();
    onDateRangeChange({
      from: subDays(today, days),
      to: today,
    });
  };

  const clearAllFilters = () => {
    onSearchChange('');
    onCampaignChange('all');
    onDateRangeChange(undefined);
  };

  // Separate core campaigns from others
  const coreCampaigns = uniqueCampaigns.filter(c => 
    CORE_CAMPAIGNS.some(core => core.toLowerCase() === c.toLowerCase())
  );
  const otherCampaigns = uniqueCampaigns.filter(c => 
    !CORE_CAMPAIGNS.some(core => core.toLowerCase() === c.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar campaña..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Campaign Selector */}
        <Select value={selectedCampaign} onValueChange={onCampaignChange}>
          <SelectTrigger className="w-[280px] h-9">
            <SelectValue placeholder="Todas las campañas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las campañas</SelectItem>
            
            {/* Core Campaigns */}
            {coreCampaigns.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                  Campañas Principales
                </div>
                {coreCampaigns.map(campaign => (
                  <SelectItem key={campaign} value={campaign}>
                    {campaign}
                  </SelectItem>
                ))}
              </>
            )}
            
            {/* Other Campaigns */}
            {otherCampaigns.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                  Otras Campañas
                </div>
                {otherCampaigns.map(campaign => (
                  <SelectItem key={campaign} value={campaign}>
                    {campaign}
                  </SelectItem>
                ))}
              </>
            )}
          </SelectContent>
        </Select>

        {/* Date Range */}
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
            {/* Quick presets */}
            <div className="p-2 border-b flex flex-wrap gap-1">
              {DATE_PRESETS.map(preset => (
                <Button
                  key={preset.days}
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handlePresetClick(preset.days)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            
            <CalendarComponent
              mode="range"
              selected={dateRange}
              onSelect={onDateRangeChange}
              locale={es}
              numberOfMonths={2}
            />
            
            {dateRange && (
              <div className="p-2 border-t">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  onClick={() => onDateRangeChange(undefined)}
                >
                  Limpiar filtro de fechas
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Clear All Filters */}
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9"
            onClick={clearAllFilters}
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Filter Status */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          Mostrando <strong className="text-foreground">{filteredCount}</strong> registros
          {filteredCount !== recordCount && (
            <> de <strong className="text-foreground">{recordCount}</strong> totales</>
          )}
        </span>
        
        {hasActiveFilters && (
          <div className="flex items-center gap-1">
            <span>—</span>
            {searchTerm && (
              <Badge variant="secondary" className="text-xs">
                Búsqueda: "{searchTerm}"
              </Badge>
            )}
            {selectedCampaign !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Campaña filtrada
              </Badge>
            )}
            {dateRange?.from && (
              <Badge variant="secondary" className="text-xs">
                Período filtrado
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
