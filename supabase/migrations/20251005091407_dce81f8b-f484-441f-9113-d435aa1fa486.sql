-- Update "Valor total gestionado" statistic to €900M
UPDATE public.key_statistics 
SET 
  metric_value = '€900M',
  updated_at = now()
WHERE id = '0cfad30e-cfdb-41f0-b3b7-4385f1200c62';