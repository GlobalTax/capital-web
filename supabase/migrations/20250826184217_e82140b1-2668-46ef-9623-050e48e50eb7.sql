-- Promote lluis@capittal.es to super_admin
UPDATE public.admin_users 
SET 
  role = 'super_admin',
  updated_at = now()
WHERE user_id = '5403772d-92b6-4e35-8ea1-b6d5c3b22113'::uuid
  AND email = 'lluis@capittal.es'
  AND is_active = true;

-- Log the promotion for audit trail
PERFORM public.log_security_event(
  'ADMIN_ROLE_PROMOTED',
  'high',
  'admin_users',
  'promote_to_super_admin',
  jsonb_build_object(
    'promoted_user_email', 'lluis@capittal.es',
    'promoted_user_id', '5403772d-92b6-4e35-8ea1-b6d5c3b22113',
    'old_role', 'admin',
    'new_role', 'super_admin',
    'promoted_by', 'system_migration'
  )
);