
-- outbound_send_queue: server-side send scheduling
CREATE TABLE public.outbound_send_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL,
  send_type text NOT NULL CHECK (send_type IN ('initial', 'document', 'followup')),
  sequence_id uuid NULL,
  email_ids text[] NOT NULL DEFAULT '{}',
  interval_ms int NOT NULL DEFAULT 30000,
  max_per_hour int NULL,
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'paused', 'completed', 'failed', 'cancelled')),
  progress_current int NOT NULL DEFAULT 0,
  progress_total int NOT NULL DEFAULT 0,
  last_processed_at timestamptz NULL,
  error_message text NULL,
  created_by uuid NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for the worker to find active jobs
CREATE INDEX idx_outbound_queue_status_scheduled ON public.outbound_send_queue(status, scheduled_at);
CREATE INDEX idx_outbound_queue_campaign ON public.outbound_send_queue(campaign_id);

-- RLS
ALTER TABLE public.outbound_send_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage queue" ON public.outbound_send_queue
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_outbound_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_outbound_queue_updated_at
  BEFORE UPDATE ON public.outbound_send_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_outbound_queue_updated_at();
