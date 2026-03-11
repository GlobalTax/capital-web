

## Plan: Enriquecimiento por campo (Web y Provincia) con IA

### Resumen
Añadir un botón de enriquecimiento por campo específico en el paso de Empresas. El usuario podrá seleccionar qué campos quiere enriquecer (web, provincia, u otros) y el sistema usará Firecrawl + IA para completarlos automáticamente.

### Cambios

#### 1. Actualizar Edge Function `enrich-campaign-companies-data`
- Aceptar un nuevo parámetro `fields` (array de campos a enriquecer, ej: `['client_website', 'client_provincia']`)
- Adaptar el prompt y la tool de extracción para incluir `website` y `provincia` cuando se soliciten
- Ajustar la query de búsqueda en Firecrawl según los campos (ej: para web buscar "sitio web oficial", para provincia buscar "ubicación sede")
- Mantener retrocompatibilidad: si no se pasa `fields`, se comporta igual que ahora (email, nombre, teléfono, CIF)

#### 2. Actualizar `CompaniesStep.tsx`
- Añadir un dropdown/popover junto al botón existente de "Enriquecer con IA" que permita elegir qué campos enriquecer:
  - Contacto (email, nombre, teléfono, CIF) — comportamiento actual
  - Web
  - Provincia
- Mostrar cuántas empresas tienen el campo vacío para cada opción
- Reutilizar la lógica de batches y progreso existente, pasando los `fields` seleccionados a la edge function

#### 3. Flujo de usuario
1. El usuario ve el botón "Enriquecer con IA" con un dropdown
2. Selecciona "Web" → el sistema busca las empresas sin web y llama a la edge function con `fields: ['client_website']`
3. Selecciona "Provincia" → igual con `fields: ['client_provincia']`
4. Puede seleccionar ambos a la vez o individualmente
5. El progreso y resultados se muestran igual que el enriquecimiento actual

### Archivos a modificar
- `supabase/functions/enrich-campaign-companies-data/index.ts` — añadir soporte para campos web/provincia
- `src/components/admin/campanas-valoracion/steps/CompaniesStep.tsx` — UI del selector de campos + lógica de llamada

