
-- Scheduled batches for ROD email sends
CREATE TABLE public.rod_scheduled_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  send_id UUID NOT NULL REFERENCES public.rod_sends(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  batch_size INTEGER NOT NULL DEFAULT 20,
  delay_seconds INTEGER NOT NULL DEFAULT 30,
  email_ids UUID[] DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rod_scheduled_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage scheduled batches"
  ON public.rod_scheduled_batches
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_rod_scheduled_batches_status ON public.rod_scheduled_batches(status, scheduled_at);
CREATE INDEX idx_rod_scheduled_batches_send_id ON public.rod_scheduled_batches(send_id);

CREATE TRIGGER update_rod_scheduled_batches_updated_at
  BEFORE UPDATE ON public.rod_scheduled_batches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
