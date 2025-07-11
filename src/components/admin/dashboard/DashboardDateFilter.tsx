import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DateRange {
  from: Date;
  to: Date;
}

interface DashboardDateFilterProps {
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange) => void;
}

const DashboardDateFilter = ({ 
  dateRange = { from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), to: new Date() }, 
  onDateRangeChange = () => {} 
}: DashboardDateFilterProps) => {
  const presetRanges = [
    {
      label: 'Últimos 7 días',
      value: {
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        to: new Date()
      }
    },
    {
      label: 'Últimos 30 días',
      value: {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: new Date()
      }
    },
    {
      label: 'Últimos 90 días',
      value: {
        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        to: new Date()
      }
    },
    {
      label: 'Este año',
      value: {
        from: new Date(new Date().getFullYear(), 0, 1),
        to: new Date()
      }
    }
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="w-[280px] justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {format(dateRange.from, 'dd MMM', { locale: es })} - {format(dateRange.to, 'dd MMM yyyy', { locale: es })}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex">
          <div className="border-r p-4 space-y-2">
            <div className="text-sm font-medium mb-3">Rangos rápidos</div>
            {presetRanges.map((range) => (
              <Button
                key={range.label}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-left"
                onClick={() => onDateRangeChange(range.value)}
              >
                {range.label}
              </Button>
            ))}
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
                  onDateRangeChange({
                    from: range.from,
                    to: range.to
                  });
                }
              }}
              numberOfMonths={2}
              locale={es}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DashboardDateFilter;