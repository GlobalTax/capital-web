-- Extract and populate financial data from descriptions
UPDATE company_operations 
SET revenue_amount = 16000000, ebitda_amount = 1300000
WHERE id = 'f1c631ae-ccf2-4533-ad93-d01253a3f045'; -- Proyecto Olande

UPDATE company_operations 
SET revenue_amount = 20000000, ebitda_amount = 2000000
WHERE id = '776c04c7-beb1-4815-9c59-1e2ad45f8af0'; -- Proyecto Graft

UPDATE company_operations 
SET revenue_amount = 8300000, ebitda_amount = 550000
WHERE id = 'a775b82b-6cde-4bc2-a78f-60c0518be326'; -- Proyecto Kappa

UPDATE company_operations 
SET revenue_amount = 12500000, ebitda_amount = 2000000
WHERE id = '95fb3c61-0bfa-4d05-984d-31744f407040'; -- Proyecto Firme

-- Update other operations with financial data extracted from descriptions
UPDATE company_operations 
SET revenue_amount = 35000000, ebitda_amount = 7000000
WHERE company_name = 'Proyecto Hernia' AND revenue_amount IS NULL;

UPDATE company_operations 
SET revenue_amount = 45000000, ebitda_amount = 9000000  
WHERE company_name = 'Proyecto Quantum' AND revenue_amount IS NULL;

UPDATE company_operations 
SET revenue_amount = 15000000, ebitda_amount = 2250000
WHERE company_name = 'Proyecto Nova' AND revenue_amount IS NULL;

UPDATE company_operations 
SET revenue_amount = 28000000, ebitda_amount = 4200000
WHERE company_name = 'Proyecto Alpha' AND revenue_amount IS NULL;