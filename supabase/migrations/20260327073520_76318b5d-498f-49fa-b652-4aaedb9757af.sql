
-- Add target_user_id to admin_notifications for filtering by recipient
ALTER TABLE public.admin_notifications 
ADD COLUMN IF NOT EXISTS target_user_id UUID;

-- Create index for fast lookups by target user
CREATE INDEX IF NOT EXISTS idx_admin_notifications_target_user 
ON public.admin_notifications (target_user_id, is_read, created_at DESC);

-- Drop existing select policy and recreate to include target_user_id filter
DROP POLICY IF EXISTS "Admin users can view notifications" ON public.admin_notifications;

CREATE POLICY "Admin users can view own notifications"
ON public.admin_notifications
FOR SELECT
TO authenticated
USING (
  target_user_id IS NULL 
  OR target_user_id = auth.uid()
);
