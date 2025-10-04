-- Update created_at dates for company_operations to allow proper sorting
-- Operations with newer years will have more recent created_at dates
-- Within the same year, they'll be sorted alphabetically with staggered dates

DO $$
DECLARE
  op RECORD;
  base_date TIMESTAMP WITH TIME ZONE;
  days_offset INTEGER := 0;
BEGIN
  -- Start from a base date (e.g., 2024-01-01)
  base_date := '2024-01-01 00:00:00+00'::TIMESTAMP WITH TIME ZONE;
  
  -- Update each operation with staggered dates
  -- Sorted by year DESC (newest first), then by company_name ASC
  FOR op IN 
    SELECT id, company_name, year
    FROM public.company_operations
    WHERE is_active = true
    ORDER BY year DESC, company_name ASC
  LOOP
    -- Update the created_at for this operation
    UPDATE public.company_operations
    SET 
      created_at = base_date + (days_offset || ' days')::INTERVAL,
      updated_at = base_date + (days_offset || ' days')::INTERVAL
    WHERE id = op.id;
    
    -- Increment offset by 1 day for the next operation
    days_offset := days_offset + 1;
  END LOOP;
  
  RAISE NOTICE 'Updated created_at dates for % operations', days_offset;
END $$;