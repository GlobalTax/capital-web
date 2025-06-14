
-- Eliminar todos los registros existentes para poder recrearlos con la estructura correcta
DELETE FROM public.sector_multiples;

-- Insertar todos los sectores con sus rangos completos
-- Tecnología (múltiplos altos)
INSERT INTO public.sector_multiples (sector_name, employee_range, ebitda_multiple, revenue_multiple, description) VALUES
('tecnologia', '2-5', 3.4, 1.1, 'Empresas de software, SaaS, desarrollo tecnológico'),
('tecnologia', '6-25', 5.5, 1.2, 'Empresas de software, SaaS, desarrollo tecnológico'),
('tecnologia', '26-99', 6.8, 1.3, 'Empresas de software, SaaS, desarrollo tecnológico'),
('tecnologia', '100-249', 7.1, 1.3, 'Empresas de software, SaaS, desarrollo tecnológico'),
('tecnologia', '250-499', 7.5, 1.3, 'Empresas de software, SaaS, desarrollo tecnológico'),
('tecnologia', '500+', 7.8, 1.4, 'Empresas de software, SaaS, desarrollo tecnológico');

-- Salud (múltiplos muy altos)
INSERT INTO public.sector_multiples (sector_name, employee_range, ebitda_multiple, revenue_multiple, description) VALUES
('salud', '2-5', 3.6, 1.0, 'Servicios sanitarios, farmacéuticas, dispositivos médicos'),
('salud', '6-25', 5.8, 1.1, 'Servicios sanitarios, farmacéuticas, dispositivos médicos'),
('salud', '26-99', 7.2, 1.2, 'Servicios sanitarios, farmacéuticas, dispositivos médicos'),
('salud', '100-249', 7.6, 1.3, 'Servicios sanitarios, farmacéuticas, dispositivos médicos'),
('salud', '250-499', 7.9, 1.3, 'Servicios sanitarios, farmacéuticas, dispositivos médicos'),
('salud', '500+', 8.3, 1.4, 'Servicios sanitarios, farmacéuticas, dispositivos médicos');

-- Manufactura
INSERT INTO public.sector_multiples (sector_name, employee_range, ebitda_multiple, revenue_multiple, description) VALUES
('manufactura', '2-5', 3.3, 0.7, 'Fabricación industrial, maquinaria, productos manufacturados'),
('manufactura', '6-25', 5.1, 0.8, 'Fabricación industrial, maquinaria, productos manufacturados'),
('manufactura', '26-99', 6.2, 0.8, 'Fabricación industrial, maquinaria, productos manufacturados'),
('manufactura', '100-249', 6.6, 0.9, 'Fabricación industrial, maquinaria, productos manufacturados'),
('manufactura', '250-499', 6.9, 1.0, 'Fabricación industrial, maquinaria, productos manufacturados'),
('manufactura', '500+', 7.2, 1.0, 'Fabricación industrial, maquinaria, productos manufacturados');

-- Retail
INSERT INTO public.sector_multiples (sector_name, employee_range, ebitda_multiple, revenue_multiple, description) VALUES
('retail', '2-5', 2.6, 0.5, 'Comercio minorista, distribución, e-commerce'),
('retail', '6-25', 4.2, 0.5, 'Comercio minorista, distribución, e-commerce'),
('retail', '26-99', 5.2, 0.5, 'Comercio minorista, distribución, e-commerce'),
('retail', '100-249', 5.6, 0.5, 'Comercio minorista, distribución, e-commerce'),
('retail', '250-499', 6.0, 0.6, 'Comercio minorista, distribución, e-commerce'),
('retail', '500+', 6.4, 0.6, 'Comercio minorista, distribución, e-commerce');

-- Servicios
INSERT INTO public.sector_multiples (sector_name, employee_range, ebitda_multiple, revenue_multiple, description) VALUES
('servicios', '2-5', 2.9, 0.9, 'Servicios profesionales, consultoría, outsourcing'),
('servicios', '6-25', 4.7, 0.9, 'Servicios profesionales, consultoría, outsourcing'),
('servicios', '26-99', 5.8, 0.9, 'Servicios profesionales, consultoría, outsourcing'),
('servicios', '100-249', 6.1, 0.9, 'Servicios profesionales, consultoría, outsourcing'),
('servicios', '250-499', 6.4, 1.0, 'Servicios profesionales, consultoría, outsourcing'),
('servicios', '500+', 6.7, 1.0, 'Servicios profesionales, consultoría, outsourcing');

-- Finanzas
INSERT INTO public.sector_multiples (sector_name, employee_range, ebitda_multiple, revenue_multiple, description) VALUES
('finanzas', '2-5', 3.2, 1.0, 'Servicios financieros, seguros, fintech'),
('finanzas', '6-25', 5.2, 1.1, 'Servicios financieros, seguros, fintech'),
('finanzas', '26-99', 6.3, 1.1, 'Servicios financieros, seguros, fintech'),
('finanzas', '100-249', 6.8, 1.2, 'Servicios financieros, seguros, fintech'),
('finanzas', '250-499', 7.2, 1.2, 'Servicios financieros, seguros, fintech'),
('finanzas', '500+', 7.5, 1.3, 'Servicios financieros, seguros, fintech');

-- Inmobiliario
INSERT INTO public.sector_multiples (sector_name, employee_range, ebitda_multiple, revenue_multiple, description) VALUES
('inmobiliario', '2-5', 2.6, 0.6, 'Desarrollo inmobiliario, gestión de propiedades'),
('inmobiliario', '6-25', 4.2, 0.7, 'Desarrollo inmobiliario, gestión de propiedades'),
('inmobiliario', '26-99', 4.9, 0.6, 'Desarrollo inmobiliario, gestión de propiedades'),
('inmobiliario', '100-249', 5.3, 0.6, 'Desarrollo inmobiliario, gestión de propiedades'),
('inmobiliario', '250-499', 5.5, 0.7, 'Desarrollo inmobiliario, gestión de propiedades'),
('inmobiliario', '500+', 5.8, 0.7, 'Desarrollo inmobiliario, gestión de propiedades');

-- Energía
INSERT INTO public.sector_multiples (sector_name, employee_range, ebitda_multiple, revenue_multiple, description) VALUES
('energia', '2-5', 3.2, 0.9, 'Energías renovables, petróleo, gas, utilities'),
('energia', '6-25', 5.2, 0.9, 'Energías renovables, petróleo, gas, utilities'),
('energia', '26-99', 6.1, 0.9, 'Energías renovables, petróleo, gas, utilities'),
('energia', '100-249', 6.6, 0.9, 'Energías renovables, petróleo, gas, utilities'),
('energia', '250-499', 6.9, 1.0, 'Energías renovables, petróleo, gas, utilities'),
('energia', '500+', 7.2, 1.0, 'Energías renovables, petróleo, gas, utilities');

-- Consultoría
INSERT INTO public.sector_multiples (sector_name, employee_range, ebitda_multiple, revenue_multiple, description) VALUES
('consultoria', '2-5', 2.9, 0.9, 'Consultoría estratégica, tecnológica, especializada'),
('consultoria', '6-25', 4.7, 0.9, 'Consultoría estratégica, tecnológica, especializada'),
('consultoria', '26-99', 5.8, 0.9, 'Consultoría estratégica, tecnológica, especializada'),
('consultoria', '100-249', 6.1, 0.9, 'Consultoría estratégica, tecnológica, especializada'),
('consultoria', '250-499', 6.4, 1.0, 'Consultoría estratégica, tecnológica, especializada'),
('consultoria', '500+', 6.7, 1.0, 'Consultoría estratégica, tecnológica, especializada');

-- Educación
INSERT INTO public.sector_multiples (sector_name, employee_range, ebitda_multiple, revenue_multiple, description) VALUES
('educacion', '2-5', 2.9, 0.9, 'Educación, formación, e-learning'),
('educacion', '6-25', 4.7, 0.9, 'Educación, formación, e-learning'),
('educacion', '26-99', 5.8, 0.9, 'Educación, formación, e-learning'),
('educacion', '100-249', 6.1, 0.9, 'Educación, formación, e-learning'),
('educacion', '250-499', 6.4, 1.0, 'Educación, formación, e-learning'),
('educacion', '500+', 6.7, 1.0, 'Educación, formación, e-learning');

-- Turismo
INSERT INTO public.sector_multiples (sector_name, employee_range, ebitda_multiple, revenue_multiple, description) VALUES
('turismo', '2-5', 2.7, 0.6, 'Hotelería, restauración, agencias de viaje'),
('turismo', '6-25', 4.3, 0.7, 'Hotelería, restauración, agencias de viaje'),
('turismo', '26-99', 5.1, 0.7, 'Hotelería, restauración, agencias de viaje'),
('turismo', '100-249', 5.6, 0.8, 'Hotelería, restauración, agencias de viaje'),
('turismo', '250-499', 5.8, 0.9, 'Hotelería, restauración, agencias de viaje'),
('turismo', '500+', 6.1, 0.9, 'Hotelería, restauración, agencias de viaje');

-- Agricultura
INSERT INTO public.sector_multiples (sector_name, employee_range, ebitda_multiple, revenue_multiple, description) VALUES
('agricultura', '2-5', 2.4, 0.5, 'Agricultura, ganadería, industria alimentaria'),
('agricultura', '6-25', 3.8, 0.6, 'Agricultura, ganadería, industria alimentaria'),
('agricultura', '26-99', 4.3, 0.5, 'Agricultura, ganadería, industria alimentaria'),
('agricultura', '100-249', 4.7, 0.5, 'Agricultura, ganadería, industria alimentaria'),
('agricultura', '250-499', 4.9, 0.6, 'Agricultura, ganadería, industria alimentaria'),
('agricultura', '500+', 5.2, 0.6, 'Agricultura, ganadería, industria alimentaria');

-- Construcción
INSERT INTO public.sector_multiples (sector_name, employee_range, ebitda_multiple, revenue_multiple, description) VALUES
('construccion', '2-5', 2.5, 0.5, 'Construcción / Artesanía'),
('construccion', '6-25', 4.0, 0.6, 'Construcción / Artesanía'),
('construccion', '26-99', 4.8, 0.6, 'Construcción / Artesanía'),
('construccion', '100-249', 5.3, 0.6, 'Construcción / Artesanía'),
('construccion', '250-499', 5.5, 0.7, 'Construcción / Artesanía'),
('construccion', '500+', 5.8, 0.7, 'Construcción / Artesanía');

-- Otro
INSERT INTO public.sector_multiples (sector_name, employee_range, ebitda_multiple, revenue_multiple, description) VALUES
('otro', '2-5', 2.8, 0.7, 'Otros sectores no especificados'),
('otro', '6-25', 4.3, 0.8, 'Otros sectores no especificados'),
('otro', '26-99', 5.0, 0.7, 'Otros sectores no especificados'),
('otro', '100-249', 5.4, 0.7, 'Otros sectores no especificados'),
('otro', '250-499', 5.8, 0.8, 'Otros sectores no especificados'),
('otro', '500+', 6.1, 0.8, 'Otros sectores no especificados');
