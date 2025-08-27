-- Create unified form submissions table
CREATE TABLE public.form_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_type TEXT NOT NULL CHECK (form_type IN ('contact', 'collaborator', 'newsletter', 'calendar')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'processed', 'closed')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Contact information
  full_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  
  -- Form specific data
  form_data JSONB NOT NULL DEFAULT '{}',
  
  -- Tracking and metadata  
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Email tracking
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  email_opened BOOLEAN DEFAULT FALSE,
  email_opened_at TIMESTAMP WITH TIME ZONE,
  email_message_id TEXT,
  
  -- Admin tracking
  processed_by UUID REFERENCES admin_users(user_id),
  processed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage all form submissions" 
ON public.form_submissions 
FOR ALL 
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

CREATE POLICY "System can insert form submissions" 
ON public.form_submissions 
FOR INSERT 
WITH CHECK (
  form_type IS NOT NULL 
  AND email IS NOT NULL 
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- Create indexes for performance
CREATE INDEX idx_form_submissions_type_status ON public.form_submissions(form_type, status);
CREATE INDEX idx_form_submissions_created_at ON public.form_submissions(created_at);
CREATE INDEX idx_form_submissions_email ON public.form_submissions(email);
CREATE INDEX idx_form_submissions_priority_status ON public.form_submissions(priority, status);

-- Create trigger for updated_at
CREATE TRIGGER update_form_submissions_updated_at
  BEFORE UPDATE ON public.form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically send notifications
CREATE OR REPLACE FUNCTION public.notify_form_submission()
RETURNS TRIGGER AS $$
BEGIN
  -- Send notification via edge function
  PERFORM
    net.http_post(
      url := 'https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/send-form-notifications',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6YWZpY2oiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzQ5ODI3OTUzLCJleHAiOjIwNjU0MDM5NTN9.3X4qOZrE7yx6bJqLKGVo4oQlBYgVxgYIz9m9YIK7pDw'
      ),
      body := jsonb_build_object(
        'submissionId', NEW.id,
        'formType', NEW.form_type,
        'email', NEW.email,
        'fullName', NEW.full_name,
        'formData', NEW.form_data
      )
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to notify on new submissions
CREATE TRIGGER trigger_notify_form_submission
  AFTER INSERT ON public.form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_form_submission();