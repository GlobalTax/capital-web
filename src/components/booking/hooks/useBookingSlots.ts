import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TimeSlot {
  time: string;
  available: boolean;
  label: string;
}

export interface DaySlots {
  date: Date;
  dateString: string;
  dayLabel: string;
  slots: TimeSlot[];
}

interface BookingData {
  booking_date: string;
  booking_time: string;
  status: string;
}

// Configuration
const TIMEZONE = 'Europe/Madrid';
const MORNING_SLOTS = ['09:00', '10:00', '11:00', '12:00'];
const AFTERNOON_SLOTS = ['16:00', '17:00', '18:00', '19:00'];
const ALL_SLOTS = [...MORNING_SLOTS, ...AFTERNOON_SLOTS];
const MIN_HOURS_AHEAD = 12;
const MAX_DAYS_AHEAD = 14;
const BUFFER_MINUTES = 10;

const formatTimeLabel = (time: string): string => {
  return time;
};

const isWeekday = (date: Date): boolean => {
  const day = date.getDay();
  return day !== 0 && day !== 6; // Not Sunday (0) or Saturday (6)
};

const formatDayLabel = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'short', 
    day: 'numeric',
    month: 'short'
  };
  return date.toLocaleDateString('es-ES', options);
};

const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const useBookingSlots = () => {
  const [bookedSlots, setBookedSlots] = useState<BookingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch booked slots from database
  useEffect(() => {
    const fetchBookedSlots = async () => {
      try {
        setIsLoading(true);
        const today = new Date();
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + MAX_DAYS_AHEAD);

        const { data, error: fetchError } = await supabase
          .from('calendar_bookings')
          .select('booking_date, booking_time, status')
          .gte('booking_date', formatDateString(today))
          .lte('booking_date', formatDateString(maxDate))
          .neq('status', 'cancelled');

        if (fetchError) {
          throw fetchError;
        }

        setBookedSlots(data || []);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching booked slots:', err);
        setError('Error al cargar disponibilidad');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookedSlots();
  }, []);

  // Generate available days with slots
  const availableDays = useMemo((): DaySlots[] => {
    const days: DaySlots[] = [];
    const now = new Date();
    const minBookingTime = new Date(now.getTime() + MIN_HOURS_AHEAD * 60 * 60 * 1000);

    for (let i = 0; i < MAX_DAYS_AHEAD; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0);

      // Skip weekends
      if (!isWeekday(date)) continue;

      const dateString = formatDateString(date);
      
      // Check which slots are available for this day
      const slots: TimeSlot[] = ALL_SLOTS.map(time => {
        const [hours, minutes] = time.split(':').map(Number);
        const slotDateTime = new Date(date);
        slotDateTime.setHours(hours, minutes, 0, 0);

        // Check if slot is in the past or too soon
        if (slotDateTime < minBookingTime) {
          return { time, available: false, label: formatTimeLabel(time) };
        }

        // Check if slot is already booked
        const isBooked = bookedSlots.some(
          booking => booking.booking_date === dateString && booking.booking_time === time
        );

        return { 
          time, 
          available: !isBooked, 
          label: formatTimeLabel(time) 
        };
      });

      // Only include days that have at least one available slot
      if (slots.some(slot => slot.available)) {
        days.push({
          date,
          dateString,
          dayLabel: formatDayLabel(date),
          slots
        });
      }
    }

    return days;
  }, [bookedSlots]);

  return {
    availableDays,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true);
      // Re-trigger the effect by updating a dependency
    }
  };
};

// Token utilities
export interface BookingToken {
  leadId: string;
  email: string;
  name?: string;
  phone?: string;
  company?: string;
  exp: number;
}

export const generateBookingToken = (data: Omit<BookingToken, 'exp'>): string => {
  const token: BookingToken = {
    ...data,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  };
  return btoa(JSON.stringify(token));
};

export const parseBookingToken = (token: string): BookingToken | null => {
  try {
    const data = JSON.parse(atob(token)) as BookingToken;
    
    // Validate required fields
    if (!data.leadId || !data.email || !data.exp) {
      console.error('Token missing required fields');
      return null;
    }
    
    // Check expiration
    if (data.exp < Date.now()) {
      console.error('Token expired');
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Error parsing booking token:', err);
    return null;
  }
};
