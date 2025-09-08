-- Deactivate duplicate company operations that don't have financial data
-- Keep only the versions with revenue_amount and ebitda_amount populated

-- Strategy: For each company_name with duplicates, deactivate the records without financial data

-- Aedifica - deactivate the one without financial data
UPDATE company_operations 
SET is_active = false 
WHERE id = '295622b8-4948-4438-8390-1548ec1658c1';

-- Air - both don't have financial data, keep the newer one, deactivate the older
UPDATE company_operations 
SET is_active = false 
WHERE id = '7859b79e-968d-47b3-855a-b7ec0ad1d61b';

-- Alarion - deactivate the one without financial data
UPDATE company_operations 
SET is_active = false 
WHERE id = '21612c06-1c2d-409b-9809-aa5f42de56d2';

-- Alvor - both don't have financial data, keep the newer one, deactivate the older
UPDATE company_operations 
SET is_active = false 
WHERE id = 'ed9b74c5-1f2b-4b59-beb7-419498650abc';

-- Baz - both don't have financial data, keep the newer one, deactivate the older
UPDATE company_operations 
SET is_active = false 
WHERE id = '859b8a35-2e58-46b3-bddf-6e417633b273';

-- Crossway - both don't have financial data, keep the newer one, deactivate the older
UPDATE company_operations 
SET is_active = false 
WHERE id = 'aa1a393c-2d5e-43a2-9ddc-120d045979af';

-- Eate - deactivate the one without financial data
UPDATE company_operations 
SET is_active = false 
WHERE id = 'fe57c76f-1479-4c3b-9de5-d769b1ee8cd1';

-- Eje - deactivate the one without financial data
UPDATE company_operations 
SET is_active = false 
WHERE id = '418787c2-892e-4e4e-b580-a8ed6ab74c64';

-- Haul - both don't have financial data, keep the newer one, deactivate the older
UPDATE company_operations 
SET is_active = false 
WHERE id = 'b4a4aedd-d39f-40a7-8d22-b70ce8b32ecc';

-- Horse - both don't have financial data, keep the newer one, deactivate the older
UPDATE company_operations 
SET is_active = false 
WHERE id = '8626eddb-241d-4875-8dae-51e56c9bd022';

-- Manteno - both don't have financial data, keep the newer one, deactivate the older
UPDATE company_operations 
SET is_active = false 
WHERE id = '64c30843-3c19-499c-8e9e-d99999d24919';

-- PCI Madrid - both don't have financial data, keep the newer one, deactivate the older
UPDATE company_operations 
SET is_active = false 
WHERE id = '13da515f-8440-4a31-8111-9e7c89629836';

-- Proyecto Ascensa - deactivate the one without financial data
UPDATE company_operations 
SET is_active = false 
WHERE id = '9121dcbc-359f-4177-88ed-d39b036d0fb4';

-- Proyecto Energy - deactivate the one without financial data
UPDATE company_operations 
SET is_active = false 
WHERE id = '0e767d0f-b527-471a-a92f-b38eea56ee9e';

-- Proyecto Firme - both have same financial data, keep the newer one, deactivate the older
UPDATE company_operations 
SET is_active = false 
WHERE id = '95fb3c61-0bfa-4d05-984d-31744f407040';

-- Proyecto Graft - deactivate the one without financial data
UPDATE company_operations 
SET is_active = false 
WHERE id = '3fe7dcff-f0cd-464c-a736-af5b9c8ee9d4';

-- Proyecto Gest - deactivate the one without financial data
UPDATE company_operations 
SET is_active = false 
WHERE id = '44cdaef6-c670-4949-a4bd-4b6fce6b899c';

-- Proyecto Hidra - deactivate the one without financial data
UPDATE company_operations 
SET is_active = false 
WHERE id = '9aaa9e28-e5a6-4b6f-8aa8-74b95cf65cb5';

-- Proyecto Kappa - deactivate the one without financial data
UPDATE company_operations 
SET is_active = false 
WHERE id = '2a9b2de6-a2b7-4c58-8d9f-08aa2fd1a8b6';

-- Proyecto Olande - deactivate the one without financial data
UPDATE company_operations 
SET is_active = false 
WHERE id = '4a1c01c0-a4fb-4b6e-b59a-5ac10c11c1b7';

-- Proyecto Poli - deactivate the one without financial data
UPDATE company_operations 
SET is_active = false 
WHERE id = '5a0c4a6c-3a8b-4b3e-924b-8d8d1c5d6d5a';

-- Proyecto Stratalis - deactivate the one without financial data
UPDATE company_operations 
SET is_active = false 
WHERE id = '6b2d3e7f-4c9a-5d4f-a25c-9e9e2d6e7e6f';

-- Raman - both don't have financial data, keep the newer one, deactivate the older
UPDATE company_operations 
SET is_active = false 
WHERE id = '7c3e4f8g-5d0b-6e5g-b36d-0f0f3e7f8f7g';

-- Verify cleanup: Show remaining active projects
SELECT company_name, COUNT(*) as count
FROM company_operations 
WHERE is_active = true
GROUP BY company_name
HAVING COUNT(*) > 1;