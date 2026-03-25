DROP POLICY IF EXISTS "CRITICAL_secure_collaborator_submission" ON collaborator_applications;
CREATE POLICY "CRITICAL_secure_collaborator_submission"
ON collaborator_applications FOR INSERT TO anon
WITH CHECK (
  check_rate_limit_enhanced(email, 'collaborator_application', 5, 60)
  AND full_name IS NOT NULL
  AND length(trim(full_name)) >= 2 AND length(trim(full_name)) <= 100
  AND email IS NOT NULL
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND length(email) <= 254
  AND phone IS NOT NULL
  AND profession IS NOT NULL
  AND length(trim(profession)) >= 2 AND length(trim(profession)) <= 100
);