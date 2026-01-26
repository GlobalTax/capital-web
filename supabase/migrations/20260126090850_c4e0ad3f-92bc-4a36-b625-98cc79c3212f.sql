-- Create corporate_outreach table for logging email communications
CREATE TABLE IF NOT EXISTS public.corporate_outreach (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.corporate_contacts(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES public.corporate_buyers(id) ON DELETE CASCADE,
  outreach_type TEXT NOT NULL DEFAULT 'email' CHECK (outreach_type IN ('email', 'phone', 'linkedin', 'meeting', 'other')),
  channel TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered', 'opened', 'clicked', 'replied')),
  subject TEXT,
  content TEXT,
  email_mode TEXT CHECK (email_mode IN ('template', 'custom', 'ai_generated')),
  operation_id UUID,
  sent_at TIMESTAMPTZ,
  sent_by UUID,
  provider_message_id TEXT,
  error_message TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.corporate_outreach ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admin users can manage corporate outreach"
ON public.corporate_outreach
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
    AND is_active = true
  )
);

-- Create indexes for performance
CREATE INDEX idx_corporate_outreach_contact_id ON public.corporate_outreach(contact_id);
CREATE INDEX idx_corporate_outreach_buyer_id ON public.corporate_outreach(buyer_id);
CREATE INDEX idx_corporate_outreach_status ON public.corporate_outreach(status);
CREATE INDEX idx_corporate_outreach_sent_at ON public.corporate_outreach(sent_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_corporate_outreach_updated_at
  BEFORE UPDATE ON public.corporate_outreach
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();