import React from 'react';
import { TimeSlot, DaySlots } from './hooks/useBookingSlots';
import { cn } from '@/lib/utils';
import { Clock, Sun, Sunset } from 'lucide-react';

interface BookingTimeSlotsProps {
  day: DaySlots | null;
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
}

export const BookingTimeSlots: React.FC<BookingTimeSlotsProps> = ({
  day,
  selectedTime,
  onSelectTime
}) => {
  if (!day) {
    return (
      <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Selecciona una fecha para ver los horarios disponibles</p>
      </div>
    );
  }

  const morningSlots = day.slots.filter(s => {
    const hour = parseInt(s.time.split(':')[0]);
    return hour < 14;
  });

  const afternoonSlots = day.slots.filter(s => {
    const hour = parseInt(s.time.split(':')[0]);
    return hour >= 14;
  });

  const renderSlotGroup = (
    title: string,
    icon: React.ReactNode,
    slots: TimeSlot[]
  ) => {
    if (slots.length === 0) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {icon}
          <span>{title}</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {slots.map((slot) => {
            const isSelected = selectedTime === slot.time;
            
            return (
              <button
                key={slot.time}
                onClick={() => slot.available && onSelectTime(slot.time)}
                disabled={!slot.available}
                className={cn(
                  "py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200",
                  "border focus:outline-none focus:ring-2 focus:ring-primary/20",
                  slot.available
                    ? isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-md"
                      : "border-border bg-card hover:border-primary hover:bg-primary/5 text-foreground"
                    : "border-border bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                )}
              >
                {slot.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-foreground">
          Horarios para el {day.date.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          })}
        </h3>
      </div>

      <div className="space-y-4">
        {renderSlotGroup(
          'Mañana',
          <Sun className="h-4 w-4" />,
          morningSlots
        )}
        
        {renderSlotGroup(
          'Tarde',
          <Sunset className="h-4 w-4" />,
          afternoonSlots
        )}
      </div>

      {day.slots.every(s => !s.available) && (
        <div className="text-center py-4 text-muted-foreground">
          No hay horarios disponibles para este día.
        </div>
      )}
    </div>
  );
};
