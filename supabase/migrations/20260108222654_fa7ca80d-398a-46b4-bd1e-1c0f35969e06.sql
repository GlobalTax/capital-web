-- Approve the real news articles
UPDATE news_articles 
SET is_published = true, published_at = NOW()
WHERE id IN (
  '1e126ee5-61c8-4987-a95c-195ab873ee16',
  '48e9fe7b-13ca-4331-ba6e-c0a11eb9a876'
);

-- Delete the sample/fake articles we created earlier
DELETE FROM news_articles 
WHERE source_url LIKE '%expansion.com/empresas.html%'
   OR source_url LIKE '%capitalandcorporate.com/%'
   OR source_url LIKE '%eleconomista.es/empresas-finanzas/%'
   OR source_url LIKE '%cincodias.elpais.com/mercados-financieros/%'
   OR source_url LIKE '%elconfidencial.com/empresas/%';