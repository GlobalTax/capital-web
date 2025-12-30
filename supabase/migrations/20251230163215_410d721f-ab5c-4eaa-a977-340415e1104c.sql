-- Add assignment fields to calendar_bookings
ALTER TABLE public.calendar_bookings
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.admin_users(user_id),
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES public.admin_users(user_id);

-- Create index for faster queries by assigned advisor
CREATE INDEX IF NOT EXISTS idx_calendar_bookings_assigned_to ON public.calendar_bookings(assigned_to);

-- Create booking assignment history table for tracking changes
CREATE TABLE IF NOT EXISTS public.booking_assignment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.calendar_bookings(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.admin_users(user_id),
  assigned_by UUID REFERENCES public.admin_users(user_id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.booking_assignment_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for booking_assignment_history
CREATE POLICY "Admins can view assignment history"
  ON public.booking_assignment_history
  FOR SELECT
  USING (public.is_user_admin(auth.uid()));

CREATE POLICY "Admins can insert assignment history"
  ON public.booking_assignment_history
  FOR INSERT
  WITH CHECK (public.is_user_admin(auth.uid()));

-- Enable realtime for calendar_bookings
ALTER PUBLICATION supabase_realtime ADD TABLE public.calendar_bookings;

-- Function to auto-log assignment changes
CREATE OR REPLACE FUNCTION public.log_booking_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.assigned_to IS DISTINCT FROM NEW.assigned_to) THEN
    INSERT INTO public.booking_assignment_history (booking_id, assigned_to, assigned_by, assigned_at)
    VALUES (NEW.id, NEW.assigned_to, NEW.assigned_by, COALESCE(NEW.assigned_at, now()));
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for assignment logging
DROP TRIGGER IF EXISTS trigger_log_booking_assignment ON public.calendar_bookings;
CREATE TRIGGER trigger_log_booking_assignment
  AFTER UPDATE ON public.calendar_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.log_booking_assignment();