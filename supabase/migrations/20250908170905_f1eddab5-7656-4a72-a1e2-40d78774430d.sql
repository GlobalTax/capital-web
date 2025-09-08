-- Final cleanup of remaining duplicate company operations
-- Strategy: Keep versions with financial data, or newer versions if both are empty

-- Proyecto Gest - keep the one with financial data
UPDATE company_operations 
SET is_active = false 
WHERE id = '8c2932c8-e6dc-45e4-ad9d-16897106a7f9';

-- Proyecto Graft - both have same financial data, keep the newer one
UPDATE company_operations 
SET is_active = false 
WHERE id = '776c04c7-beb1-4815-9c59-1e2ad45f8af0';

-- Proyecto Hidra - keep the one with financial data
UPDATE company_operations 
SET is_active = false 
WHERE id = 'ace99cfb-d213-403e-a93e-f81fdc51e3ef';

-- Proyecto Kappa - both have same financial data, keep the newer one
UPDATE company_operations 
SET is_active = false 
WHERE id = 'a775b82b-6cde-4bc2-a78f-60c0518be326';

-- Proyecto Olande - both have same financial data, keep the newer one
UPDATE company_operations 
SET is_active = false 
WHERE id = 'f1c631ae-ccf2-4533-ad93-d01253a3f045';

-- Proyecto Poli - keep the one with financial data
UPDATE company_operations 
SET is_active = false 
WHERE id = '346cb38b-c71a-49db-87b6-85aca7e4e0db';

-- Proyecto Stratalis - keep the one with financial data
UPDATE company_operations 
SET is_active = false 
WHERE id = 'a39ee2f6-ceda-47eb-ac89-62119958bc20';

-- Purge - both empty, keep the newer one
UPDATE company_operations 
SET is_active = false 
WHERE id = 'a562e2b2-1a59-4c5e-b388-1c4ee037ec0f';

-- Safety - both empty, keep the newer one
UPDATE company_operations 
SET is_active = false 
WHERE id = 'c6052815-b71e-4084-9f4b-2906b945a50c';

-- Tech - both empty, keep the newer one
UPDATE company_operations 
SET is_active = false 
WHERE id = 'dd2ef5a6-3132-45e2-8d0c-059626926d7f';

-- Ventia - both empty, keep the newer one
UPDATE company_operations 
SET is_active = false 
WHERE id = '1d10757c-ac24-4fc8-bca4-f1a24883113e';

-- Yellow - both empty, keep the newer one
UPDATE company_operations 
SET is_active = false 
WHERE id = '66edbd8f-3bd9-4fc0-9248-f0d98d763e11';

-- Final verification: Show any remaining duplicates (should be none)
SELECT company_name, COUNT(*) as count
FROM company_operations 
WHERE is_active = true
GROUP BY company_name
HAVING COUNT(*) > 1;