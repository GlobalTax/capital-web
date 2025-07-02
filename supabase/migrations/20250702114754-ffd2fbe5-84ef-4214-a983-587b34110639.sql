-- Create admin notifications log table
CREATE TABLE IF NOT EXISTS admin_notifications_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  email_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_admin_notifications_log_recipient ON admin_notifications_log(recipient_email);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_log_sent_at ON admin_notifications_log(sent_at);

-- Create admin audit log table for tracking admin actions
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  target_user_id UUID,
  target_user_email TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for audit log
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_user ON admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action_type ON admin_audit_log(action_type);

-- RLS policies for audit log (only super admins can view)
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view audit log"
ON admin_audit_log
FOR SELECT
USING (is_user_super_admin(auth.uid()));

CREATE POLICY "System can insert audit log"
ON admin_audit_log
FOR INSERT
WITH CHECK (true);

-- RLS policies for notifications log (only admins can view)
ALTER TABLE admin_notifications_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view notifications log"
ON admin_notifications_log
FOR SELECT
USING (is_user_admin(auth.uid()));

CREATE POLICY "System can insert notifications log"
ON admin_notifications_log
FOR INSERT
WITH CHECK (true);