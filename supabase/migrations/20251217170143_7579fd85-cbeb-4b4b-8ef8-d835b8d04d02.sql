-- Create bulk_inquiries table for joint operation requests
CREATE TABLE public.bulk_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT NOT NULL,
  message TEXT,
  operation_ids UUID[] NOT NULL,
  operation_names TEXT[],
  status TEXT DEFAULT 'pending',
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  processed_at TIMESTAMPTZ,
  processed_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bulk_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for form submissions)
CREATE POLICY "Allow anonymous inserts for bulk inquiries"
  ON public.bulk_inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow admins to view all bulk inquiries
CREATE POLICY "Admins can view all bulk inquiries"
  ON public.bulk_inquiries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Allow admins to update bulk inquiries
CREATE POLICY "Admins can update bulk inquiries"
  ON public.bulk_inquiries
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Create index for faster queries
CREATE INDEX idx_bulk_inquiries_email ON public.bulk_inquiries(email);
CREATE INDEX idx_bulk_inquiries_created_at ON public.bulk_inquiries(created_at DESC);
CREATE INDEX idx_bulk_inquiries_status ON public.bulk_inquiries(status);

-- Create trigger for updated_at
CREATE TRIGGER update_bulk_inquiries_updated_at
  BEFORE UPDATE ON public.bulk_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();