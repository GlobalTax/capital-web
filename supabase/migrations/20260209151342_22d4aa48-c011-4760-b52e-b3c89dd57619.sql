-- Drop the policy that depends on unique_token
DROP POLICY "ULTRA_SECURE_valuation_insert" ON company_valuations;

-- Alter column type
ALTER TABLE company_valuations ALTER COLUMN unique_token TYPE text;

-- Recreate the policy with identical logic
CREATE POLICY "ULTRA_SECURE_valuation_insert" ON company_valuations
FOR INSERT
WITH CHECK (
  (
    (auth.role() = 'anon'::text)
    AND (unique_token IS NOT NULL)
    AND (length(unique_token) >= 32)
    AND (contact_name IS NOT NULL)
    AND (length(TRIM(BOTH FROM contact_name)) >= 2)
    AND (length(TRIM(BOTH FROM contact_name)) <= 100)
    AND (company_name IS NOT NULL)
    AND (length(TRIM(BOTH FROM company_name)) >= 2)
    AND (length(TRIM(BOTH FROM company_name)) <= 100)
    AND (email IS NOT NULL)
    AND (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)
    AND (length(email) <= 254)
    AND (industry IS NOT NULL)
    AND (employee_range IS NOT NULL)
    AND check_rate_limit_enhanced(COALESCE((inet_client_addr())::text, 'unknown'::text), 'valuation_submission'::text, 2, 1440)
    AND (lower(email) !~~ '%test%'::text)
    AND (lower(email) !~~ '%fake%'::text)
    AND (lower(company_name) !~~ '%test%'::text)
    AND (lower(contact_name) !~~ '%test%'::text)
  )
  OR ((auth.uid() IS NOT NULL) AND (user_id = auth.uid()))
  OR current_user_is_admin()
);