-- =====================================================
-- Importar Search Funds Históricos (2011-2020) - V3
-- Excluyendo fondos que ya existen en la base de datos
-- =====================================================

-- Fase 1: Crear solo los fondos que NO existen
-- Ya existen: Syna Capital, Tagus Capital, Ibérica Partners, Road Capital, Surca Capital
INSERT INTO sf_funds (name, country_base, cities, status, founded_year, investment_style) VALUES
('Ariol Capital', 'Spain', ARRAY['Barcelona'], 'acquired', 2011, 'single'),
('Elcano Partners', 'Spain', ARRAY['Pamplona'], 'acquired', 2013, 'single'),
('N Capital', 'Spain', ARRAY['Madrid'], 'acquired', 2015, 'single'),
('Lomba Capital', 'Spain', ARRAY['Madrid'], 'inactive', 2015, 'single'),
('Sachem Partners', 'Spain', ARRAY['Valencia', 'Madrid'], 'acquired', 2017, 'single'),
('Transición', 'Spain', ARRAY['Barcelona'], 'acquired', 2017, 'single'),
('A&M Partners', 'Spain', ARRAY['Madrid'], 'acquired', 2017, 'single'),
('Asta Capital', 'Spain', ARRAY['Madrid'], 'acquired', 2018, 'single'),
('Baluarte Capital', 'Spain', ARRAY['Barcelona'], 'acquired', 2019, 'single'),
('Namencis Capital', 'Spain', ARRAY['Barcelona'], 'acquired', 2019, 'single'),
('Vigía Capital', 'Spain', ARRAY['Madrid'], 'acquired', 2019, 'single');

-- Fase 2: Actualizar fondos que ya existen con datos históricos
UPDATE sf_funds 
SET founded_year = 2018, cities = ARRAY['Madrid']
WHERE name = 'Ibérica Partners';

UPDATE sf_funds
SET founded_year = 2018, cities = ARRAY['Sevilla'], status = 'acquired'
WHERE name = 'Syna Capital';

UPDATE sf_funds
SET founded_year = 2019, cities = ARRAY['Madrid'], status = 'acquired'
WHERE name = 'Tagus Capital';

UPDATE sf_acquisitions 
SET deal_year = 2020
WHERE company_name = 'CarPro / Jimpisoft';

-- Fase 3: Crear adquisiciones históricas (12 nuevas)
INSERT INTO sf_acquisitions (fund_id, company_name, sector, deal_year, status) VALUES
-- 2014-2016
((SELECT id FROM sf_funds WHERE name = 'Ariol Capital'), 'Repli', 'Packaging / Envases plásticos', 2014, 'owned'),
((SELECT id FROM sf_funds WHERE name = 'Elcano Partners'), 'Lodisna', 'Transporte internacional', 2015, 'owned'),
((SELECT id FROM sf_funds WHERE name = 'N Capital'), 'Cermer', 'Envases alimentarios / Cerámica', 2016, 'owned'),
-- 2018
((SELECT id FROM sf_funds WHERE name = 'Sachem Partners'), 'Lanaccess', 'Software vigilancia video', 2018, 'owned'),
((SELECT id FROM sf_funds WHERE name = 'Transición'), 'Mapex', 'Software industrial / Automatización', 2018, 'owned'),
-- 2019
((SELECT id FROM sf_funds WHERE name = 'A&M Partners'), 'Frenkit', 'Industrial / Componentes freno', 2019, 'owned'),
((SELECT id FROM sf_funds WHERE name = 'Asta Capital'), 'Logiscenter', 'eCommerce B2B / Logística', 2019, 'owned'),
((SELECT id FROM sf_funds WHERE name = 'Syna Capital'), 'Vozitel (Cristalware)', 'Software CRM', 2019, 'owned'),
-- 2020
((SELECT id FROM sf_funds WHERE name = 'Baluarte Capital'), 'Ctaima', 'Software / Compliance industrial', 2020, 'owned'),
((SELECT id FROM sf_funds WHERE name = 'Namencis Capital'), 'ENEB Business School', 'Educación / e-learning', 2020, 'owned'),
((SELECT id FROM sf_funds WHERE name = 'Vigía Capital'), 'Plásticos Arias', 'Industrial / Envases plásticos', 2020, 'owned'),
((SELECT id FROM sf_funds WHERE name = 'Tagus Capital'), 'The Umai Group', 'Restaurantes / Cadena', 2020, 'owned');

-- Fase 4: Añadir Searchers Conocidos
INSERT INTO sf_people (fund_id, full_name, role, is_primary_contact) VALUES
((SELECT id FROM sf_funds WHERE name = 'Ariol Capital'), 'Marc Bartomeus', 'searcher', true),
((SELECT id FROM sf_funds WHERE name = 'Elcano Partners'), 'José María Vara', 'searcher', true),
((SELECT id FROM sf_funds WHERE name = 'N Capital'), 'Nuño Arroyo', 'searcher', true),
((SELECT id FROM sf_funds WHERE name = 'Lomba Capital'), 'Ricardo Velilla', 'searcher', true),
((SELECT id FROM sf_funds WHERE name = 'Sachem Partners'), 'Daniel Di Cecco', 'searcher', true),
((SELECT id FROM sf_funds WHERE name = 'Sachem Partners'), 'Fernando Guillem', 'searcher', false),
((SELECT id FROM sf_funds WHERE name = 'Syna Capital'), 'Joaquín Pardo', 'searcher', true);

-- Fase 5: Notas para fondos sin información pública
UPDATE sf_funds 
SET notes_internal = 'Gestor(es) no público. Pendiente de investigar.'
WHERE name IN ('Transición', 'A&M Partners', 'Asta Capital', 'Baluarte Capital', 'Namencis Capital', 'Vigía Capital', 'Tagus Capital');

UPDATE sf_funds
SET notes_internal = 'No completó adquisición. Fondo inactivo.'
WHERE name = 'Lomba Capital';