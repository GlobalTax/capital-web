-- ============================================
-- FIX: Add UNIQUE constraint for UPSERT support
-- and UPDATE policy for ads_costs_history
-- ============================================

-- 1. Create unique constraint on (platform, campaign_name, date)
-- This is REQUIRED for upsert to work
CREATE UNIQUE INDEX IF NOT EXISTS ads_costs_history_platform_campaign_date_unique 
ON public.ads_costs_history (platform, campaign_name, date);

-- 2. Add UPDATE policy for admins (required for upsert)
CREATE POLICY "Admins can update ads costs history"
ON public.ads_costs_history FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid() 
    AND admin_users.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid() 
    AND admin_users.is_active = true
  )
);

-- 3. Add DELETE policy for admins (useful for future cleanup)
CREATE POLICY "Admins can delete ads costs history"
ON public.ads_costs_history FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid() 
    AND admin_users.is_active = true
  )
);