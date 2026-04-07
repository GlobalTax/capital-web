
-- Rod sends table
CREATE TABLE public.rod_sends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL DEFAULT '',
  body_html TEXT NOT NULL DEFAULT '',
  body_text TEXT NOT NULL DEFAULT '',
  target_language TEXT NOT NULL CHECK (target_language IN ('es', 'en', 'both')) DEFAULT 'es',
  status TEXT NOT NULL CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled')) DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  attachment_ids TEXT[] DEFAULT '{}',
  attachment_urls JSONB DEFAULT '[]',
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rod_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage rod_sends" ON public.rod_sends
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

-- Rod send recipients table
CREATE TABLE public.rod_send_recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  send_id UUID NOT NULL REFERENCES public.rod_sends(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'skipped')) DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rod_send_recipients_send_id ON public.rod_send_recipients(send_id);
CREATE INDEX idx_rod_send_recipients_status ON public.rod_send_recipients(status);

ALTER TABLE public.rod_send_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage rod_send_recipients" ON public.rod_send_recipients
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

-- Updated_at trigger for rod_sends
CREATE TRIGGER update_rod_sends_updated_at
  BEFORE UPDATE ON public.rod_sends
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
