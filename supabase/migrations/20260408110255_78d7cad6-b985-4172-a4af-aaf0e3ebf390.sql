-- Add data_scale column: 1000 = legacy (needs x1000), 1 = data already in real euros
ALTER TABLE public.outbound_lists 
ADD COLUMN IF NOT EXISTS data_scale integer NOT NULL DEFAULT 1000;

-- Set the Servicios Profesionales list (and its sublists) to scale 1
UPDATE public.outbound_lists 
SET data_scale = 1 
WHERE id = '00350b83-1da4-49a5-ab98-ccc8b58f0ca8' 
   OR lista_madre_id = '00350b83-1da4-49a5-ab98-ccc8b58f0ca8';