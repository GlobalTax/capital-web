-- Update news articles with real source URLs
UPDATE news_articles 
SET source_url = 'https://www.expansion.com/empresas.html'
WHERE id = '86b39098-0a48-4a3d-ae3d-1387ebf2b39c';

UPDATE news_articles 
SET source_url = 'https://capitalandcorporate.com/'
WHERE id = '3127ef2c-5264-4889-ad2f-18f09ff26068';

UPDATE news_articles 
SET source_url = 'https://www.eleconomista.es/empresas-finanzas/'
WHERE id = '8960cc79-943a-4827-9c73-f3688b46c03a';

UPDATE news_articles 
SET source_url = 'https://cincodias.elpais.com/mercados-financieros/'
WHERE id = 'ad773816-87ce-4082-b760-c7ca013692f1';