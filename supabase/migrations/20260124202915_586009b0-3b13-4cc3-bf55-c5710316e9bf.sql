-- =====================================================
-- Importar Search Funds 2019-2025 (Segunda Ronda)
-- Excluyendo fondos y adquisiciones que ya existen
-- =====================================================

-- Fase 1: Crear 24 Nuevos Fondos
INSERT INTO sf_funds (name, country_base, cities, status, founded_year, investment_style, notes_internal) VALUES
-- Adquisiciones 2021
('Ventura', 'Spain', ARRAY['Madrid'], 'acquired', 2019, 'single', 'Gestor(es) no público'),
('Sotavento Capital', 'Spain', ARRAY['Barcelona'], 'acquired', 2019, 'single', 'Gestor(es) no público'),
('NCA - Jan Nikolaisen', 'Spain', ARRAY['Barcelona'], 'acquired', 2020, 'single', 'Novastone program - Searcher internacional'),
('Eon Partners', 'Spain', ARRAY['Madrid'], 'acquired', 2020, 'single', 'Gestor(es) no público'),
('Tilden Capital', 'Spain', ARRAY['Barcelona'], 'acquired', 2020, 'single', 'Gestor(es) no público'),
('Arista Partners', 'Spain', ARRAY['Madrid'], 'acquired', 2020, 'single', 'Gestor(es) no público'),
('Navega Capital', 'Spain', ARRAY['Bilbao'], 'acquired', 2020, 'single', 'Gestor(es) no público'),
('Bogo Inversión', 'Spain', ARRAY['Madrid'], 'acquired', 2020, 'single', 'Gestor(es) no público'),
('Vesta Capital Partners', 'Spain', ARRAY['Madrid'], 'acquired', 2020, 'single', 'Gestores internacionales'),
-- Adquisiciones 2022
('Taurus Capital', 'Spain', ARRAY['Barcelona'], 'acquired', 2020, 'single', 'Gestor(es) no público'),
('Antesala Capital', 'Spain', ARRAY['Madrid'], 'acquired', 2020, 'single', 'Gestor(es) no público'),
('Albatros Equity', 'Spain', ARRAY['Valencia'], 'acquired', 2020, 'single', 'Gestor(es) no público'),
('Emptio Capital', 'Spain', ARRAY['Madrid'], 'acquired', 2020, 'single', 'Gestor(es) no público'),
-- Adquisiciones 2023
('Axias Partners', 'Spain', ARRAY['Barcelona'], 'acquired', 2021, 'single', NULL),
('Aretê Mgmt & Capital Partners', 'Spain', ARRAY['Madrid'], 'acquired', 2021, 'single', NULL),
('Almond Capital', 'Spain', ARRAY['Madrid'], 'acquired', 2021, 'single', 'Gestor(es) no público'),
('Nobis Capital', 'Spain', ARRAY['Madrid'], 'acquired', 2021, 'single', NULL),
('Verus Inversiones', 'Spain', ARRAY['Vigo'], 'acquired', 2021, 'single', 'Gestor(es) no público'),
('Aqua Capital Partners', 'Spain', ARRAY['Madrid'], 'acquired', 2021, 'single', 'Gestor(es) no público'),
('J Capital Partners', 'Spain', ARRAY['Madrid'], 'acquired', 2022, 'single', 'Gestor(es) no público'),
('Luceiro Capital', 'Spain', ARRAY['Madrid'], 'acquired', 2022, 'single', 'Gestor(es) no público'),
('Albion Capital', 'Spain', ARRAY['Madrid'], 'acquired', 2022, 'single', 'Gestor(es) no público'),
('Somontano Capital', 'Spain', ARRAY['Zaragoza'], 'acquired', 2022, 'single', 'Gestor(es) no público'),
('Versa Capital', 'Spain', ARRAY['Lleida'], 'acquired', 2022, 'single', 'Gestor(es) no público');

-- Fase 2: Actualizar 15 Fondos Existentes con datos históricos
UPDATE sf_funds SET status = 'acquired', founded_year = 2020, cities = ARRAY['Madrid'] 
WHERE name = 'Signatus Capital';

UPDATE sf_funds SET status = 'acquired', founded_year = 2021, cities = ARRAY['Madrid'] 
WHERE name = 'Arcadio Investments';

UPDATE sf_funds SET status = 'acquired', founded_year = 2020, cities = ARRAY['Valencia'] 
WHERE name = 'Road Capital';

UPDATE sf_funds SET status = 'acquired', founded_year = 2021, cities = ARRAY['Madrid'] 
WHERE name = 'Surca Capital';

UPDATE sf_funds SET status = 'acquired', founded_year = 2020, cities = ARRAY['Madrid'] 
WHERE name = 'D''Ella Capital';

UPDATE sf_funds SET founded_year = 2022, cities = ARRAY['Santander'] 
WHERE name = 'Pleamar Partners';

UPDATE sf_funds SET founded_year = 2022, cities = ARRAY['Madrid'] 
WHERE name = 'Pontem Capital';

UPDATE sf_funds SET founded_year = 2022, cities = ARRAY['Valencia'] 
WHERE name = 'Imagine+ Inversión';

UPDATE sf_funds SET founded_year = 2022, cities = ARRAY['Tolosa'] 
WHERE name = 'Lemnos Capital';

UPDATE sf_funds SET founded_year = 2022, cities = ARRAY['Madrid'] 
WHERE name = 'Kramer Inversiones';

UPDATE sf_funds SET founded_year = 2023, cities = ARRAY['Madrid'] 
WHERE name = 'Ada Capital';

UPDATE sf_funds SET founded_year = 2023, cities = ARRAY['Valencia'] 
WHERE name = 'Dangalena Capital';

UPDATE sf_funds SET founded_year = 2023, cities = ARRAY['Madrid'] 
WHERE name = 'Oportuna Capital';

UPDATE sf_funds SET founded_year = 2023, cities = ARRAY['Sevilla'] 
WHERE name = 'Grupo Bocanegra';

UPDATE sf_funds SET founded_year = 2023, cities = ARRAY['Santander'] 
WHERE name = 'Albor Capital';

-- Fase 3: Actualizar adquisiciones existentes con deal_year correcto
UPDATE sf_acquisitions SET deal_year = 2021 
WHERE company_name = 'IESMAT';

UPDATE sf_acquisitions SET deal_year = 2023 
WHERE company_name = 'Libnova';

-- Fase 4: Crear nuevas adquisiciones (excluyendo las que ya existen)
INSERT INTO sf_acquisitions (fund_id, company_name, sector, deal_year, status) VALUES
-- 2021 (11 nuevas)
((SELECT id FROM sf_funds WHERE name = 'Ventura'), 'Business Software Group', 'Software ERP', 2021, 'owned'),
((SELECT id FROM sf_funds WHERE name = 'Sotavento Capital'), 'Cinergia', 'Tecnología / Electrónica de potencia', 2021, 'owned'),
((SELECT id FROM sf_funds WHERE name = 'NCA - Jan Nikolaisen'), 'Farmacia de Dalt', 'Salud / Farmacia', 2021, 'owned'),
((SELECT id FROM sf_funds WHERE name = 'Eon Partners'), 'Gesinflot (TDI)', 'SaaS gestión flotas', 2021, 'owned'),
((SELECT id FROM sf_funds WHERE name = 'D''Ella Capital'), 'Grabalfa', 'Artes gráficas / Impresión', 2021, 'owned'),
((SELECT id FROM sf_funds WHERE name = 'Tilden Capital'), 'Grupo Espiral MS', 'Software educativo', 2021, 'owned'),
((SELECT id FROM sf_funds WHERE name = 'Arista Partners'), 'Instituto Médico Láser (IML)', 'Clínica salud / Estética', 2021, 'owned'),
((SELECT id FROM sf_funds WHERE name = 'Navega Capital'), 'Kapalua', 'Productos de consumo / Surf', 2021, 'owned'),
((SELECT id FROM sf_funds WHERE name = 'Bogo Inversión'), 'Nortconsulting', 'Software finanzas', 2021, 'owned'),
((SELECT id FROM sf_funds WHERE name = 'Vesta Capital Partners'), 'Proyecto Salvavidas (Anek S3)', 'Servicios médicos / Desfibriladores', 2021, 'owned'),

-- 2022 (4 nuevas - Termopack ya existe)
((SELECT id FROM sf_funds WHERE name = 'Taurus Capital'), 'BikeOcasión', 'e-Commerce / Bicicletas', 2022, 'owned'),
((SELECT id FROM sf_funds WHERE name = 'Antesala Capital'), 'Cropsalsa', 'Industria alimentaria / Salsas', 2022, 'owned'),
((SELECT id FROM sf_funds WHERE name = 'Albatros Equity'), 'Grupo OHI', 'Salud / Odontología hospitalaria', 2022, 'owned'),
((SELECT id FROM sf_funds WHERE name = 'Emptio Capital'), 'Recambio Fácil', 'Marketplace & SaaS / Automoción', 2022, 'owned'),

-- 2023 (12 nuevas - Fasten Sistemas ya existe)
((SELECT id FROM sf_funds WHERE name = 'Axias Partners'), 'Amix', 'Servicios sanitarios / Clínicas', 2023, 'owned'),
((SELECT id FROM sf_funds WHERE name = 'Aretê Mgmt & Capital Partners'), 'AutoMatic', 'Automoción / Talleres', 2023, 'owned'),
((SELECT id FROM sf_funds WHERE name = 'Almond Capital'), 'Dental Ibérica', 'Salud / Clínicas dentales', 2023, 'owned'),
((SELECT id FROM sf_funds WHERE name = 'Nobis Capital'), 'Leaseir Medical', 'Equipos médicos / Depilación láser', 2023, 'owned'),
((SELECT id FROM sf_funds WHERE name = 'Verus Inversiones'), 'Novas & Mar', 'Distribución alimentaria', 2023, 'owned'),
((SELECT id FROM sf_funds WHERE name = 'Aqua Capital Partners'), 'ProviSport', 'Software gestión deportiva', 2023, 'owned'),
((SELECT id FROM sf_funds WHERE name = 'J Capital Partners'), 'Rafe Demoliciones', 'Construcción / Demolición', 2023, 'owned'),
((SELECT id FROM sf_funds WHERE name = 'Luceiro Capital'), 'Safetop', 'Industrial / Seguridad laboral', 2023, 'owned'),
((SELECT id FROM sf_funds WHERE name = 'Albion Capital'), 'Seyses', 'Ingeniería / Servicios profesionales', 2023, 'owned'),
((SELECT id FROM sf_funds WHERE name = 'Somontano Capital'), 'TC Componentes', 'Distribución componentes electrónicos', 2023, 'owned'),
((SELECT id FROM sf_funds WHERE name = 'Versa Capital'), 'TodoExtintor + Seg. SM Alcarràs', 'Industrial/Servicios / Extintores', 2023, 'owned');

-- Fase 5: Añadir Searchers Identificados
INSERT INTO sf_people (fund_id, full_name, role, is_primary_contact) VALUES
((SELECT id FROM sf_funds WHERE name = 'NCA - Jan Nikolaisen'), 'Jan Nikolaisen', 'searcher', true),
((SELECT id FROM sf_funds WHERE name = 'Axias Partners'), 'Marc Desmond', 'searcher', true),
((SELECT id FROM sf_funds WHERE name = 'Axias Partners'), 'Carlos Oehling', 'searcher', false),
((SELECT id FROM sf_funds WHERE name = 'Aretê Mgmt & Capital Partners'), 'Mar Raposo', 'searcher', true),
((SELECT id FROM sf_funds WHERE name = 'Nobis Capital'), 'Arturo Alvarez', 'searcher', true),
((SELECT id FROM sf_funds WHERE name = 'Lemnos Capital'), 'Jorge Larrea Urquiola', 'searcher', true),
((SELECT id FROM sf_funds WHERE name = 'Lemnos Capital'), 'Zorion Ugalde', 'searcher', false),
((SELECT id FROM sf_funds WHERE name = 'Albor Capital'), 'Ramón Martín Núñez', 'searcher', true);