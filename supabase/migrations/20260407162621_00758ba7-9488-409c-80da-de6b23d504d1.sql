
-- Add signature and CC support to rod_sends
ALTER TABLE public.rod_sends 
  ADD COLUMN IF NOT EXISTS signature_html text,
  ADD COLUMN IF NOT EXISTS cc_recipient_ids text[] DEFAULT '{}';

-- Create rod_send_emails for per-recipient personalized emails
CREATE TABLE IF NOT EXISTS public.rod_send_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  send_id uuid REFERENCES public.rod_sends(id) ON DELETE CASCADE NOT NULL,
  member_id uuid,
  email text NOT NULL,
  full_name text,
  company text,
  subject text NOT NULL,
  body_html text,
  body_text text,
  is_manually_edited boolean DEFAULT false,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
  sent_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.rod_send_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage rod_send_emails"
  ON public.rod_send_emails
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_rod_send_emails_send_id ON public.rod_send_emails(send_id);
CREATE INDEX idx_rod_send_emails_status ON public.rod_send_emails(status);
