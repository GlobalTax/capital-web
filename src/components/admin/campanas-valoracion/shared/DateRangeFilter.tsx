import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { X, ChevronDown, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export interface DateRangeFilterValue {
  from: Date | null;
  to: Date | null;
}

interface DateRangeFilterProps {
  label: string;
  value: DateRangeFilterValue;
  onChange: (value: DateRangeFilterValue) => void;
}

function formatLabel(value: DateRangeFilterValue, label: string): string {
  const { from, to } = value;
  if (!from && !to) return label;
  const fmt = (d: Date) => format(d, 'dd/MM', { locale: es });
  if (from && to) return `${fmt(from)} - ${fmt(to)}`;
  if (from) return `Desde ${fmt(from)}`;
  if (to) return `Hasta ${fmt(to)}`;
  return label;
}

export function DateRangeFilter({ label, value, onChange }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const [localFrom, setLocalFrom] = useState<Date | undefined>(value.from ?? undefined);
  const [localTo, setLocalTo] = useState<Date | undefined>(value.to ?? undefined);

  const hasValue = value.from !== null || value.to !== null;

  const handleOpen = useCallback((isOpen: boolean) => {
    if (isOpen) {
      setLocalFrom(value.from ?? undefined);
      setLocalTo(value.to ?? undefined);
    }
    setOpen(isOpen);
  }, [value]);

  const applyFilter = () => {
    onChange({ from: localFrom ?? null, to: localTo ?? null });
    setOpen(false);
  };

  const clearFilter = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange({ from: null, to: null });
    setLocalFrom(undefined);
    setLocalTo(undefined);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-8 text-xs gap-1 px-2.5 ${hasValue ? 'border-primary text-primary bg-primary/5' : ''}`}
        >
          <CalendarDays className="h-3 w-3 shrink-0" />
          <span className="truncate max-w-[140px]">{formatLabel(value, label)}</span>
          {hasValue ? (
            <X className="h-3 w-3 shrink-0 opacity-60 hover:opacity-100" onClick={clearFilter} />
          ) : (
            <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <div className="flex gap-4">
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">Desde</label>
              <Calendar
                mode="single"
                selected={localFrom}
                onSelect={setLocalFrom}
                locale={es}
                disabled={(date) => localTo ? date > localTo : false}
                className={cn("p-2 pointer-events-auto border rounded-md")}
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">Hasta</label>
              <Calendar
                mode="single"
                selected={localTo}
                onSelect={setLocalTo}
                locale={es}
                disabled={(date) => localFrom ? date < localFrom : false}
                className={cn("p-2 pointer-events-auto border rounded-md")}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="flex-1 h-7 text-xs" onClick={clearFilter}>
              Limpiar
            </Button>
            <Button size="sm" className="flex-1 h-7 text-xs" onClick={applyFilter}>
              Aplicar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Check if a date falls within a from/to range */
export function matchesDateRange(date: string | null | undefined, filter: DateRangeFilterValue): boolean {
  if (!filter.from && !filter.to) return true;
  if (!date) return false;
  const d = new Date(date);
  if (isNaN(d.getTime())) return false;
  if (filter.from && d < new Date(filter.from.setHours(0, 0, 0, 0))) return false;
  if (filter.to && d > new Date(filter.to.setHours(23, 59, 59, 999))) return false;
  return true;
}
