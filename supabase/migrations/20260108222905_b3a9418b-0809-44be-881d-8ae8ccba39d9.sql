-- Clean up the excerpts - remove markdown images, tracking URLs, and junk
UPDATE news_articles
SET excerpt = CASE
  -- If excerpt starts with markdown image or tracking URL, set a generic excerpt
  WHEN excerpt LIKE '!%' OR excerpt LIKE 'http%' OR excerpt LIKE 'unidad%' OR excerpt LIKE '*%'
  THEN 'Accede al artículo completo para más información sobre esta noticia del sector M&A.'
  ELSE excerpt
END
WHERE excerpt LIKE '!%' 
   OR excerpt LIKE 'http%' 
   OR excerpt LIKE 'unidad%'
   OR excerpt LIKE '*%'
   OR excerpt LIKE '%pixelcounter%'
   OR excerpt LIKE '%permutive%';