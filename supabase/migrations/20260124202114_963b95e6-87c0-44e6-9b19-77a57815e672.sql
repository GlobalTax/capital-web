-- =====================================================
-- IMPORTACIÓN DIRECTORIO DE SEARCH FUNDS (Enero 2026)
-- =====================================================

-- FASE 1: Crear los 17 Fondos/Vehículos
INSERT INTO sf_funds (name, country_base, status, investment_style) VALUES
-- Fondos con adquisiciones cerradas 2024
('Pleamar Partners', 'Spain', 'acquired', 'single'),
('Phoenix Rise Capital', 'Spain', 'acquired', 'single'),
('Imagine+ Inversión', 'Spain', 'acquired', 'single'),
('Ada Capital', 'Spain', 'acquired', 'single'),
('Kramer Inversiones', 'Spain', 'acquired', 'single'),
('Oportuna Capital', 'Spain', 'acquired', 'single'),
('Dangalena Capital', 'Spain', 'acquired', 'single'),
('Lemnos Capital', 'Spain', 'acquired', 'single'),
('Grupo Bocanegra', 'Spain', 'acquired', 'single'),
('Pontem Capital', 'Spain', 'acquired', 'single'),
('Viriato Capital', 'Spain', 'acquired', 'single'),
-- Cerrada 2025
('Albor Capital', 'Spain', 'acquired', 'single'),
-- Fondos operando (holding)
('Signatus Capital', 'Spain', 'holding', 'single'),
('Arcadio Investments', 'Spain', 'holding', 'single'),
('Road Capital', 'Spain', 'holding', 'single'),
('Surca Capital', 'Spain', 'holding', 'single'),
-- Fondo con EXIT
('Ibérica Partners', 'Spain', 'exited', 'single')
ON CONFLICT DO NOTHING;

-- FASE 2: Crear las 17 Adquisiciones
INSERT INTO sf_acquisitions (fund_id, company_name, sector, deal_year, status, exit_year, notes)
VALUES
-- Cerradas 2024
((SELECT id FROM sf_funds WHERE name = 'Pleamar Partners'), 'Adinor', 'Industrial / Aluminio', 2024, 'owned', NULL, 'Adquisición cerrada en 2024'),
((SELECT id FROM sf_funds WHERE name = 'Phoenix Rise Capital'), 'GSE Composystem / Setroson', 'Aeroespacial', 2024, 'owned', NULL, 'Adquisición cerrada en 2024'),
((SELECT id FROM sf_funds WHERE name = 'Imagine+ Inversión'), 'Azeler Automoción', 'Software / Auto', 2024, 'owned', NULL, 'Adquisición cerrada en 2024'),
((SELECT id FROM sf_funds WHERE name = 'Ada Capital'), 'Milton Education', 'EdTech', 2024, 'owned', NULL, 'Adquisición cerrada en 2024'),
((SELECT id FROM sf_funds WHERE name = 'Kramer Inversiones'), 'Ibérica Semiconductores (ISP)', 'Energía / Electrónica', 2024, 'owned', NULL, 'Adquisición cerrada en 2024'),
((SELECT id FROM sf_funds WHERE name = 'Oportuna Capital'), 'Prestige Software', 'Software Hotelero', 2024, 'owned', NULL, 'Adquisición cerrada en 2024'),
((SELECT id FROM sf_funds WHERE name = 'Dangalena Capital'), 'Pago de Tharsys', 'Bodega / Vino', 2024, 'owned', NULL, 'Adquisición cerrada en 2024'),
((SELECT id FROM sf_funds WHERE name = 'Lemnos Capital'), 'Cartonajes Limousin', 'Packaging', 2024, 'owned', NULL, 'Adquisición cerrada en 2024'),
((SELECT id FROM sf_funds WHERE name = 'Grupo Bocanegra'), 'Trans Sev', 'Logística', 2024, 'owned', NULL, 'Adquisición cerrada en 2024'),
((SELECT id FROM sf_funds WHERE name = 'Pontem Capital'), 'Alonso Luz y Gas', 'Instalaciones', 2024, 'owned', NULL, 'Adquisición cerrada en 2024'),
((SELECT id FROM sf_funds WHERE name = 'Viriato Capital'), 'Effisus', 'Construcción', 2024, 'owned', NULL, 'Adquisición en Portugal, cerrada en 2024'),
-- Cerrada 2025
((SELECT id FROM sf_funds WHERE name = 'Albor Capital'), 'Manufacturas Deportivas', 'Industrial / Deporte', 2025, 'owned', NULL, 'Adquisición cerrada en 2025'),
-- Operando
((SELECT id FROM sf_funds WHERE name = 'Signatus Capital'), 'IESMAT', 'Científico', NULL, 'owned', NULL, 'Operando actualmente'),
((SELECT id FROM sf_funds WHERE name = 'Arcadio Investments'), 'Libnova', 'Tecnología', NULL, 'owned', NULL, 'Operando actualmente'),
((SELECT id FROM sf_funds WHERE name = 'Road Capital'), 'Termopack', 'Packaging', 2022, 'owned', NULL, 'Operando desde 2022'),
((SELECT id FROM sf_funds WHERE name = 'Surca Capital'), 'Fasten Sistemas', 'Industrial', 2023, 'owned', NULL, 'Operando desde 2023'),
-- EXIT a PSG 2025
((SELECT id FROM sf_funds WHERE name = 'Ibérica Partners'), 'CarPro / Jimpisoft', 'Software Rent-a-car', NULL, 'exited', 2025, 'EXIT a PSG Equity en 2025. Caso de éxito notable del ecosistema de Search Funds en España.')
ON CONFLICT DO NOTHING;

-- FASE 3: Añadir Searchers como Personas
INSERT INTO sf_people (fund_id, full_name, role, is_primary_contact)
VALUES
-- Pleamar Partners
((SELECT id FROM sf_funds WHERE name = 'Pleamar Partners'), 'J.L. Soria', 'searcher', true),
((SELECT id FROM sf_funds WHERE name = 'Pleamar Partners'), 'C. Gómez', 'searcher', false),
-- Phoenix Rise Capital
((SELECT id FROM sf_funds WHERE name = 'Phoenix Rise Capital'), 'J.I. López', 'searcher', true),
((SELECT id FROM sf_funds WHERE name = 'Phoenix Rise Capital'), 'F. Saenz', 'searcher', false),
-- Imagine+ Inversión
((SELECT id FROM sf_funds WHERE name = 'Imagine+ Inversión'), 'Nicolás Goñi', 'searcher', true),
-- Ada Capital
((SELECT id FROM sf_funds WHERE name = 'Ada Capital'), 'Inés Anoz', 'searcher', true),
((SELECT id FROM sf_funds WHERE name = 'Ada Capital'), 'Sofía Sabas', 'searcher', false),
-- Kramer Inversiones
((SELECT id FROM sf_funds WHERE name = 'Kramer Inversiones'), 'Ignacio Salido', 'searcher', true),
-- Oportuna Capital
((SELECT id FROM sf_funds WHERE name = 'Oportuna Capital'), 'Albert Palomar', 'searcher', true),
-- Dangalena Capital
((SELECT id FROM sf_funds WHERE name = 'Dangalena Capital'), 'Jaime Rioja', 'searcher', true),
-- Lemnos Capital
((SELECT id FROM sf_funds WHERE name = 'Lemnos Capital'), 'Z. Ugalde', 'searcher', true),
((SELECT id FROM sf_funds WHERE name = 'Lemnos Capital'), 'J. Larrea', 'searcher', false),
-- Grupo Bocanegra
((SELECT id FROM sf_funds WHERE name = 'Grupo Bocanegra'), 'E. Moreno de la Cova', 'searcher', true),
-- Pontem Capital
((SELECT id FROM sf_funds WHERE name = 'Pontem Capital'), 'David Malo', 'searcher', true),
-- Albor Capital
((SELECT id FROM sf_funds WHERE name = 'Albor Capital'), 'Ramón Martín Núñez', 'searcher', true),
-- Viriato Capital
((SELECT id FROM sf_funds WHERE name = 'Viriato Capital'), 'P. Álvarez', 'searcher', true),
((SELECT id FROM sf_funds WHERE name = 'Viriato Capital'), 'M. Costa', 'searcher', false),
-- Signatus Capital
((SELECT id FROM sf_funds WHERE name = 'Signatus Capital'), 'Enrique Sales', 'searcher', true),
-- Arcadio Investments
((SELECT id FROM sf_funds WHERE name = 'Arcadio Investments'), 'Jacobo Vera', 'searcher', true),
-- Ibérica Partners (EXIT a PSG)
((SELECT id FROM sf_funds WHERE name = 'Ibérica Partners'), 'G. Carmona', 'searcher', true),
((SELECT id FROM sf_funds WHERE name = 'Ibérica Partners'), 'K. Chalder', 'searcher', false)
ON CONFLICT DO NOTHING;