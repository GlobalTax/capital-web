-- STEP 1: NORMALIZE VALUATION AMOUNTS IN DATABASE
-- Convert values that are clearly in "millions" to actual units

-- Update values that are clearly in millions (< 100 and > 0) to multiply by 1,000,000
UPDATE public.company_operations 
SET valuation_amount = valuation_amount * 1000000
WHERE valuation_amount > 0 AND valuation_amount < 100;

-- Add a comment to document this normalization
COMMENT ON COLUMN public.company_operations.valuation_amount IS 'Valuation amount in actual currency units (not millions). Normalized on 2025-01-31';