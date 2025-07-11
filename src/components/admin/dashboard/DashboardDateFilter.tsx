import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DateFilterService, DateRange } from '@/utils/dateFilters';
import { Badge } from '@/components/ui/badge';

interface DashboardDateFilterProps {
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange) => void;
  showComparison?: boolean;
  comparisonData?: {
    current: number;
    previous: number;
    label: string;
  };
}

const DashboardDateFilter = ({ 
  dateRange = { from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), to: new Date() }, 
  onDateRangeChange = () => {},
  showComparison = false,
  comparisonData
}: DashboardDateFilterProps) => {
  const [activePreset, setActivePreset] = useState<string | null>(null);
  
  // Usar rangos predefinidos del servicio
  const presetRanges = useMemo(() => DateFilterService.getPresetRanges(), []);
  
  // Calcular comparación con período anterior
  const previousPeriod = useMemo(() => {
    if (!showComparison) return null;
    return DateFilterService.getPreviousPeriod(dateRange);
  }, [dateRange, showComparison]);

  // Calcular datos de comparación
  const comparisonStats = useMemo(() => {
    if (!comparisonData) return null;
    
    const change = DateFilterService.calculatePercentageChange(
      comparisonData.current, 
      comparisonData.previous
    );
    
    return {
      change,
      formatted: DateFilterService.formatPercentageChange(change),
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
    };
  }, [comparisonData]);

  const handlePresetChange = (range: DateRange, key: string) => {
    setActivePreset(key);
    onDateRangeChange(range);
  };

  return (
    <div className="flex items-center gap-3">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="w-[280px] justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(dateRange.from, 'dd MMM', { locale: es })} - {format(dateRange.to, 'dd MMM yyyy', { locale: es })}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="flex">
            <div className="border-r p-4 space-y-2 min-w-[180px]">
              <div className="text-sm font-medium mb-3">Rangos rápidos</div>
              {presetRanges.map((range) => (
                <Button
                  key={range.key}
                  variant={activePreset === range.key ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start text-left text-xs"
                  onClick={() => handlePresetChange(range.value, range.key)}
                >
                  {range.label}
                </Button>
              ))}
              
              {previousPeriod && (
                <>
                  <div className="border-t pt-2 mt-3">
                    <div className="text-xs text-muted-foreground mb-2">Período anterior:</div>
                    <div className="text-xs">
                      {format(previousPeriod.from, 'dd MMM', { locale: es })} - {format(previousPeriod.to, 'dd MMM', { locale: es })}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="p-4">
              <Calendar
                mode="range"
                defaultMonth={dateRange.from}
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setActivePreset(null);
                    onDateRangeChange({
                      from: range.from,
                      to: range.to
                    });
                  }
                }}
                numberOfMonths={2}
                locale={es}
                className="pointer-events-auto"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Mostrar comparación si está habilitada */}
      {showComparison && comparisonStats && comparisonData && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            {comparisonStats.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
            {comparisonStats.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
            {comparisonStats.trend === 'neutral' && <Minus className="h-3 w-3 text-muted-foreground" />}
            <span className={`text-xs ${
              comparisonStats.trend === 'up' ? 'text-green-600' : 
              comparisonStats.trend === 'down' ? 'text-red-600' : 
              'text-muted-foreground'
            }`}>
              {comparisonStats.formatted}
            </span>
          </Badge>
          <span className="text-xs text-muted-foreground">
            vs período anterior
          </span>
        </div>
      )}
    </div>
  );
};

export default DashboardDateFilter;