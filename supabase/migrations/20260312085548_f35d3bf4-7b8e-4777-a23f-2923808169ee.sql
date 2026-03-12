ALTER TABLE outbound_list_companies 
  ADD COLUMN IF NOT EXISTS num_trabajadores INTEGER,
  ADD COLUMN IF NOT EXISTS director_ejecutivo TEXT,
  ADD COLUMN IF NOT EXISTS linkedin TEXT;