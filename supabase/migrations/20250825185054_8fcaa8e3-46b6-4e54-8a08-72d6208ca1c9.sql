-- Fix search path for security - update the send_booking_notification function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';