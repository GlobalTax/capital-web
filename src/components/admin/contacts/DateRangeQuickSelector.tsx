import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarDays, CalendarRange, Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { startOfDay, endOfDay, startOfWeek, startOfMonth, subDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DateRangeQuickSelectorProps {
  onRangeSelect: (dateFrom: string, dateTo: string, label: string) => void;
  selectedLabel?: string;
}

interface QuickRange {
  label: string;
  icon: React.ReactNode;
  getRange: () => { dateFrom: Date; dateTo: Date };
}

const DateRangeQuickSelector: React.FC<DateRangeQuickSelectorProps> = ({
  onRangeSelect,
  selectedLabel,
}) => {
  const [customDateFrom, setCustomDateFrom] = React.useState<Date | undefined>();
  const [customDateTo, setCustomDateTo] = React.useState<Date | undefined>();
  const [showCustom, setShowCustom] = React.useState(false);

  const quickRanges: QuickRange[] = [
    {
      label: 'Hoy',
      icon: <Calendar className="h-4 w-4" />,
      getRange: () => ({
        dateFrom: startOfDay(new Date()),
        dateTo: endOfDay(new Date()),
      }),
    },
    {
      label: 'Esta semana',
      icon: <CalendarDays className="h-4 w-4" />,
      getRange: () => ({
        dateFrom: startOfWeek(new Date(), { weekStartsOn: 1 }),
        dateTo: endOfDay(new Date()),
      }),
    },
    {
      label: 'Este mes',
      icon: <CalendarRange className="h-4 w-4" />,
      getRange: () => ({
        dateFrom: startOfMonth(new Date()),
        dateTo: endOfDay(new Date()),
      }),
    },
    {
      label: 'Últimos 7 días',
      icon: <Clock className="h-4 w-4" />,
      getRange: () => ({
        dateFrom: startOfDay(subDays(new Date(), 7)),
        dateTo: endOfDay(new Date()),
      }),
    },
    {
      label: 'Últimos 30 días',
      icon: <Clock className="h-4 w-4" />,
      getRange: () => ({
        dateFrom: startOfDay(subDays(new Date(), 30)),
        dateTo: endOfDay(new Date()),
      }),
    },
  ];

  const handleQuickRangeClick = (range: QuickRange) => {
    const { dateFrom, dateTo } = range.getRange();
    onRangeSelect(dateFrom.toISOString(), dateTo.toISOString(), range.label);
  };

  const handleCustomApply = () => {
    if (customDateFrom && customDateTo) {
      const label = `${format(customDateFrom, 'dd/MM/yyyy', { locale: es })} - ${format(customDateTo, 'dd/MM/yyyy', { locale: es })}`;
      onRangeSelect(
        startOfDay(customDateFrom).toISOString(),
        endOfDay(customDateTo).toISOString(),
        label
      );
      setShowCustom(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {quickRanges.map((range) => (
        <Button
          key={range.label}
          variant={selectedLabel === range.label ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleQuickRangeClick(range)}
          className="h-9"
        >
          {range.icon}
          <span className="ml-2">{range.label}</span>
        </Button>
      ))}

      <Popover open={showCustom} onOpenChange={setShowCustom}>
        <PopoverTrigger asChild>
          <Button
            variant={selectedLabel && !quickRanges.find(r => r.label === selectedLabel) ? 'default' : 'outline'}
            size="sm"
            className="h-9"
          >
            <CalendarRange className="h-4 w-4 mr-2" />
            {selectedLabel && !quickRanges.find(r => r.label === selectedLabel) 
              ? selectedLabel 
              : 'Personalizado'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="p-4 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Desde</label>
              <CalendarComponent
                mode="single"
                selected={customDateFrom}
                onSelect={setCustomDateFrom}
                className={cn("pointer-events-auto")}
                disabled={(date) => date > new Date()}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Hasta</label>
              <CalendarComponent
                mode="single"
                selected={customDateTo}
                onSelect={setCustomDateTo}
                className={cn("pointer-events-auto")}
                disabled={(date) => 
                  date > new Date() || (customDateFrom && date < customDateFrom)
                }
              />
            </div>
            <Button
              onClick={handleCustomApply}
              disabled={!customDateFrom || !customDateTo}
              className="w-full"
            >
              Aplicar
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {selectedLabel && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRangeSelect('', '', '')}
          className="h-9"
        >
          Limpiar fechas
        </Button>
      )}
    </div>
  );
};

export default DateRangeQuickSelector;