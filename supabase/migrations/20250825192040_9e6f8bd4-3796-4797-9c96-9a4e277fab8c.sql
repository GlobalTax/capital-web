-- Add meeting_format field to calendar_bookings table
ALTER TABLE public.calendar_bookings 
ADD COLUMN meeting_format text NOT NULL DEFAULT 'video_call' 
CHECK (meeting_format IN ('phone_call', 'video_call'));

-- Add comment to explain the field
COMMENT ON COLUMN public.calendar_bookings.meeting_format IS 'Format of the meeting: phone_call or video_call';

-- Update meeting_type constraint to include new option
ALTER TABLE public.calendar_bookings 
DROP CONSTRAINT IF EXISTS calendar_bookings_meeting_type_check;

ALTER TABLE public.calendar_bookings 
ADD CONSTRAINT calendar_bookings_meeting_type_check 
CHECK (meeting_type IN ('consultation', 'valuation_review', 'negotiation', 'sell_company'));