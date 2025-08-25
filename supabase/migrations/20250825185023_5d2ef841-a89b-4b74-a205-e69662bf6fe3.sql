-- Create calendar_bookings table for appointment management
CREATE TABLE public.calendar_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  valuation_id UUID REFERENCES public.company_valuations(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  company_name TEXT,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  booking_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  meeting_type TEXT NOT NULL DEFAULT 'consultation' CHECK (meeting_type IN ('consultation', 'valuation_review', 'negotiation')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  confirmed_by UUID,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.calendar_bookings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage all bookings"
ON public.calendar_bookings
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

CREATE POLICY "Anyone can create bookings with rate limiting"
ON public.calendar_bookings
FOR INSERT
WITH CHECK (
  check_rate_limit_enhanced(
    COALESCE(inet_client_addr()::text, 'unknown'),
    'calendar_booking',
    3,  -- Max 3 bookings per day
    1440 -- Per 24 hours
  )
  AND client_name IS NOT NULL
  AND client_email IS NOT NULL
  AND booking_date IS NOT NULL
  AND booking_time IS NOT NULL
  AND client_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND length(trim(client_name)) >= 2
  AND length(trim(client_name)) <= 100
);

-- Create indexes for performance
CREATE INDEX idx_calendar_bookings_date ON public.calendar_bookings(booking_date);
CREATE INDEX idx_calendar_bookings_datetime ON public.calendar_bookings(booking_datetime);
CREATE INDEX idx_calendar_bookings_status ON public.calendar_bookings(status);
CREATE INDEX idx_calendar_bookings_email ON public.calendar_bookings(client_email);

-- Create trigger for updated_at
CREATE TRIGGER update_calendar_bookings_updated_at
  BEFORE UPDATE ON public.calendar_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to send booking notifications
CREATE OR REPLACE FUNCTION public.send_booking_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Send notification via edge function
  PERFORM
    net.http_post(
      url := 'https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/send-booking-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6YWZpY2oiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzQ5ODI3OTUzLCJleHAiOjIwNjU0MDM5NTN9.3X4qOZrE7yx6bJqLKGVo4oQlBYgVxgYIz9m9YIK7pDw'
      ),
      body := jsonb_build_object(
        'bookingId', NEW.id,
        'clientName', NEW.client_name,
        'clientEmail', NEW.client_email,
        'clientPhone', NEW.client_phone,
        'companyName', NEW.company_name,
        'bookingDate', NEW.booking_date,
        'bookingTime', NEW.booking_time,
        'meetingType', NEW.meeting_type,
        'notes', NEW.notes
      )
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically send notifications on booking creation
CREATE TRIGGER trigger_send_booking_notification
  AFTER INSERT ON public.calendar_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.send_booking_notification();