import React from 'react';
import { DaySlots } from './hooks/useBookingSlots';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BookingCalendarProps {
  days: DaySlots[];
  selectedDate: string | null;
  onSelectDate: (dateString: string) => void;
  isLoading?: boolean;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  days,
  selectedDate,
  onSelectDate,
  isLoading
}) => {
  const [visibleStart, setVisibleStart] = React.useState(0);
  const visibleDays = 5; // Show 5 days at a time on desktop, 3 on mobile

  const handlePrev = () => {
    setVisibleStart(Math.max(0, visibleStart - 1));
  };

  const handleNext = () => {
    setVisibleStart(Math.min(days.length - visibleDays, visibleStart + 1));
  };

  const displayedDays = days.slice(visibleStart, visibleStart + visibleDays);
  const canGoPrev = visibleStart > 0;
  const canGoNext = visibleStart + visibleDays < days.length;

  if (isLoading) {
    return (
      <div className="flex justify-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div 
            key={i} 
            className="h-20 w-20 rounded-lg bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (days.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay fechas disponibles en las próximas semanas.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">
          Selecciona una fecha
        </h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            disabled={!canGoPrev}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={!canGoNext}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
        {displayedDays.map((day) => {
          const isSelected = selectedDate === day.dateString;
          const availableCount = day.slots.filter(s => s.available).length;
          
          return (
            <button
              key={day.dateString}
              onClick={() => onSelectDate(day.dateString)}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200",
                "hover:border-primary hover:bg-primary/5",
                isSelected 
                  ? "border-primary bg-primary/10 ring-2 ring-primary/20" 
                  : "border-border bg-card"
              )}
            >
              <span className={cn(
                "text-xs uppercase tracking-wide",
                isSelected ? "text-primary font-medium" : "text-muted-foreground"
              )}>
                {day.date.toLocaleDateString('es-ES', { weekday: 'short' })}
              </span>
              <span className={cn(
                "text-lg font-semibold mt-1",
                isSelected ? "text-primary" : "text-foreground"
              )}>
                {day.date.getDate()}
              </span>
              <span className="text-xs text-muted-foreground mt-0.5">
                {day.date.toLocaleDateString('es-ES', { month: 'short' })}
              </span>
              <span className={cn(
                "text-[10px] mt-1",
                availableCount > 4 ? "text-success" : availableCount > 2 ? "text-warning" : "text-destructive"
              )}>
                {availableCount} horas
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
