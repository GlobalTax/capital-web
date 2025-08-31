-- Insertar todas las operaciones del marketplace
-- Ventas Destacadas (is_featured = true)
INSERT INTO public.company_operations (
  company_name, sector, valuation_amount, year, description, is_featured, is_active, display_locations
) VALUES 
  ('Proyecto Olande', 'Distribución Industrial', 16000000, 2024, 'Distribuye fijaciones y herramienta profesional con catálogo >100.000 referencias y red comercial nacional. Propiedad abierta a transición ordenada. Facturación: 16,0 M€ | EBITDA: 1,3 M€ | Margen: 8,1%.', true, true, ARRAY['home', 'operaciones', 'destacadas']),
  ('Proyecto Graft', 'Industria Gráfica', 20000000, 2024, 'Fabricante líder de etiquetas con fuerte penetración en pharma y logística; experiencia y canales propios. Facturación: 20,0 M€ | EBITDA: 2,0 M€ | Margen: 10,0%.', true, true, ARRAY['home', 'operaciones', 'destacadas']),
  ('Proyecto Kappa', 'Productos Desechables', 8300000, 2024, 'Mayorista y fabricante multi-material (plástico, papel, porex) para HORECA y gran distribución. Facturación: 8,3 M€ | EBITDA: 0,55 M€ | Margen: 6,6%.', true, true, ARRAY['home', 'operaciones', 'destacadas']),
  ('Proyecto Firme', 'Construcción', 12500000, 2024, 'Diseño y ejecución de suelos de altas prestaciones para logística, alimentación y automoción. Facturación: 12,5 M€ | EBITDA: >2,0 M€ | Margen: ~16%.', true, true, ARRAY['home', 'operaciones', 'destacadas']),
  ('Proyecto Hidra', 'Distribución Sanitaria', 26000000, 2024, 'Más de 50 años; marcas reconocidas y plan de expansión nacional/internacional. Facturación: 26,0 M€ | EBITDA: 2,0 M€ | Proyección 2025: 30–32 M€.', true, true, ARRAY['home', 'operaciones', 'destacadas']),
  ('Proyecto Gest', 'SaaS', 500000, 2024, 'Software vertical para flotas con crecimiento anual del 20% y base de clientes fidelizada. Facturación: 0,5 M€ | EBITDA: 0,25 M€ | Margen: 50%.', true, true, ARRAY['home', 'operaciones', 'destacadas']),
  ('Proyecto Energy', 'Energías Renovables', 4100000, 2024, 'Ingeniería e implementación FV con >160 clientes y 80% ingresos recurrentes (servicios). Facturación: 4,1 M€ | EBITDA: 0,5 M€ | Margen: 12,2%.', true, true, ARRAY['home', 'operaciones', 'destacadas']),
  ('Proyecto Ascensa', 'Construcción', 15000000, 2024, 'Flota propia para excavación/demolición, foco regional y contratos con constructoras. Facturación: 15,0 M€ | EBITDA: 3,0 M€.', true, true, ARRAY['home', 'operaciones', 'destacadas']),
  ('Proyecto Stratalis', 'Turismo', 4030000, 2024, 'Gestión integral en Málaga (explotación, mantenimiento, vacacional) con ingresos diversificados. Facturación: 4,03 M€ | EBITDA: 0,34 M€ | Margen: 8,4%.', true, true, ARRAY['home', 'operaciones', 'destacadas']),
  ('Proyecto Poli', 'Industria Química', 7800000, 2024, 'Fabricación y distribución PUR/elastómeros con clientes industriales (frío, panel sándwich). Facturación: 7,8 M€ | EBITDA: 1,25 M€ | Margen: 16%.', true, true, ARRAY['home', 'operaciones', 'destacadas']);

-- Nuevas Oportunidades (is_featured = false)
INSERT INTO public.company_operations (
  company_name, sector, valuation_amount, year, description, is_featured, is_active, display_locations
) VALUES 
  ('Alarion', 'Estructuras Metálicas', 7200000, 2025, 'Fabricación/montaje para petroquímico, energético y naval; actividad también en la UE. Facturación: 7,2 M€ | EBITDA: 0,225 M€.', false, true, ARRAY['home', 'operaciones', 'nuevas']),
  ('Aedifica', 'Servicios Verticales', 4150000, 2025, 'Rehabilitación y mantenimiento en fachadas/cubiertas con 17 años de recorrido en Baleares. Facturación: 4,15 M€ | EBITDA: 0,13 M€.', false, true, ARRAY['home', 'operaciones', 'nuevas']),
  ('Eate', 'Restauración', 1300000, 2025, 'Local de marca reconocida, zona con flujo estable de clientes; estándar franquiciador. Facturación: 1,3 M€ | EBITDA: 0,215 M€ | Margen: 16,5%.', false, true, ARRAY['home', 'operaciones', 'nuevas']),
  ('Eje', 'Reparación Vehículos', 1420000, 2025, '25+ años; >2.500 clientes; servicio recurrente a líderes nacionales. Facturación: 1,42 M€ | EBITDA: 0,09 M€.', false, true, ARRAY['home', 'operaciones', 'nuevas']),
  ('Haul', 'Consultoría TIC', 2300000, 2025, '20+ años; integración de sistemas y conectividad de Data Centers; smart cities. Facturación: 2,3 M€ | EBITDA: 0,23 M€ | Margen: 10%.', false, true, ARRAY['home', 'operaciones', 'nuevas']),
  ('Crossway', 'Transporte y Logística', 1340000, 2025, 'Operador con logística integral y aduanas; combinación de transporte y almacenaje. Facturación: 1,34 M€ | EBITDA: 0,125 M€ | Margen: 9,3%.', false, true, ARRAY['home', 'operaciones', 'nuevas']),
  ('Manteno', 'Facility Services', 1150000, 2025, 'Mantenimiento, limpieza y multiservicio con clientes públicos y privados. Facturación: 1,15 M€ | EBITDA: 0,11 M€ | Margen: 9,6%.', false, true, ARRAY['home', 'operaciones', 'nuevas']),
  ('Alvor', 'Gestión de Residuos', 4400000, 2025, 'Especializada en retirada de residuos de construcción; flota propia. Facturación: 4,4 M€ | EBITDA: 0,55 M€ | Margen: 12,5%.', false, true, ARRAY['home', 'operaciones', 'nuevas']),
  ('Air', 'Frío Industrial', 1600000, 2025, 'Instalación y mantenimiento para alimentación, ingenierías y restauración. Facturación: 1,6 M€ | EBITDA: 0,2 M€ | Margen: 12,5%.', false, true, ARRAY['home', 'operaciones', 'nuevas']),
  ('Ventia', 'Ventanas PVC', 4100000, 2025, '20+ años; fabricación e instalación con equipo propio y transición acompañada. Facturación: 4,1 M€ | EBITDA: 0,75 M€ | 45 empleados.', false, true, ARRAY['home', 'operaciones', 'nuevas']);

-- Mandatos de Compra (categoría especial)
INSERT INTO public.company_operations (
  company_name, sector, valuation_amount, year, description, is_featured, is_active, display_locations
) VALUES 
  ('Safety', 'Seguridad Electrónica', 5000000, 2025, 'Busca empresas de alarmas/CRA y PCI detección en ES-PT-IT. EBITDA ≥ 0,5 M€ | Ingresos: 2–40 M€. Mandato de compra activo.', false, true, ARRAY['operaciones', 'mandatos-compra']),
  ('Baz', 'Alquiler Maquinaria', 10000000, 2025, 'Alquiler con varios puntos; interesan targets con capilaridad. Ingresos ≥ 5 M€. Mandato de compra activo.', false, true, ARRAY['operaciones', 'mandatos-compra']),
  ('Yellow', 'Distribución Alimentaria', 15000000, 2025, 'Grupo >1.000 empleados; distribución y retail alimentario en norte de España. Ingresos: 0–30 M€ | EBITDA: 0–10 M€. Mandato de compra activo.', false, true, ARRAY['operaciones', 'mandatos-compra']),
  ('Purge', 'Sanidad Ambiental', 1500000, 2025, 'Legionela, control de plagas, CAI; adquisiciones mayoritas o 100%. Ingresos: 0–3 M€ | EBITDA: 0–1 M€. Mandato de compra activo.', false, true, ARRAY['operaciones', 'mandatos-compra']),
  ('PCI Madrid', 'Protección Contra Incendios', 2000000, 2025, 'Instalación/servicio PCI en Madrid; mayoría o 100%. Ingresos ≥ 0,4 M€. Mandato de compra activo.', false, true, ARRAY['operaciones', 'mandatos-compra']),
  ('Horse', 'SaaS Vertical', 7500000, 2025, 'Fondo especializado con cierres en 8–10 semanas. Ingresos: 0,3–15 M€. Mandato de compra activo.', false, true, ARRAY['operaciones', 'mandatos-compra']),
  ('Tech', 'Consultoría SAP', 1500000, 2025, 'IT con foco SAP/RPA/IA; preferencia península; valuation ≤ 3 M€. Ingresos: 0–4 M€ | EBITDA: 0–1 M€. Mandato de compra activo.', false, true, ARRAY['operaciones', 'mandatos-compra']);

-- Actualizar estadísticas del marketplace
COMMENT ON TABLE public.company_operations IS 'Updated with 27 new operations: 10 featured sales, 10 new opportunities, 7 purchase mandates';