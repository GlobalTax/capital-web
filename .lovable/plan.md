

## Plan: 10 Mejoras al Modulo de Campanas de Valoracion Outbound

Este es un conjunto extenso de mejoras. Para evitar romper funcionalidad existente, se implementaran en orden de dependencia.

---

### Fase 1: Cambios pequenos e independientes (bajo riesgo)

#### MEJORA 1: Firma del asesor en CampaignConfigStep
- Anadir una nueva Card "Firma del Informe" despues de la card "IA y CRM"
- Toggle `use_custom_advisor` con Switch
- 4 inputs condicionales: `advisor_name`, `advisor_email`, `advisor_phone`, `advisor_role`
- **Archivo**: `steps/CampaignConfigStep.tsx`

#### MEJORA 8: Formato de moneda en inputs financieros
- Reutilizar el componente `CurrencyInput` existente en `src/components/ui/currency-input.tsx`
- Reemplazar los `<Input type="number">` de Facturacion y EBITDA en el formulario manual de CompaniesStep
- Adaptar el estado local `manualYears` para trabajar con valores numericos en vez de strings
- **Archivo**: `steps/CompaniesStep.tsx`

#### MEJORA 7: Links a valoraciones en ProcessSendStep
- Hacer clickable la columna "Empresa" cuando existe `professional_valuation_id`
- Usar `useNavigate` para navegar a `/admin/valoraciones-pro/{id}`
- **Archivo**: `steps/ProcessSendStep.tsx`

#### MEJORA 9: Seguridad del edge function
- Anadir verificacion de auth header despues del check OPTIONS
- Sanitizar errores en el catch final (devolver mensaje generico, mantener console.error)
- Envolver `req.json()` en try-catch para cuerpos malformados
- **Archivo**: `supabase/functions/enrich-campaign-company/index.ts`

#### MEJORA 10: Grafico de distribucion en CampaignSummaryStep
- Usar `recharts` (BarChart horizontal) para mostrar distribucion por rangos de valoracion
- Rangos: <500K, 500K-1M, 1M-2M, 2M-5M, 5M-10M, >10M
- Solo visible si hay al menos 1 empresa con valoracion
- **Archivo**: `steps/CampaignSummaryStep.tsx`

---

### Fase 2: Mejoras de complejidad media

#### MEJORA 2: Guardar/cargar plantilla de sector
- Dos botones inline debajo del selector de sector: "Guardar como plantilla" y "Cargar plantilla"
- Persistencia en `localStorage` bajo key `campaign-sector-templates`
- La plantilla incluye todos los campos de configuracion (multiplos, textos, advisor, etc.)
- Toast informativo al cambiar de sector si existe plantilla guardada
- Confirmacion antes de cargar para evitar sobrescritura accidental
- **Archivo**: `steps/CampaignConfigStep.tsx`

#### MEJORA 4: Editar empresas existentes
- Boton Pencil junto al Trash2 en cada fila de la tabla de empresas
- Dialog modal con formulario pre-rellenado (mismos campos que entrada manual)
- Llamar a `updateCompany` del hook existente al guardar
- **Archivo**: `steps/CompaniesStep.tsx`

#### MEJORA 6: Panel de detalle por empresa (Sheet)
- Click en fila de ReviewCalculateStep abre Sheet lateral derecho
- Muestra datos de la empresa, Slider para override de multiplo individual
- Recalculo en tiempo real con `calculateProfessionalValuation`
- Textareas editables para fortalezas/debilidades (si ai_enriched)
- Boton "Enriquecer esta empresa con IA" individual
- Boton "Excluir del lote" (status: excluded)
- **Archivo**: `steps/ReviewCalculateStep.tsx`

---

### Fase 3: Mejoras complejas

#### MEJORA 5: Checkboxes de seleccion en ReviewCalculateStep
- Columna de checkbox al inicio de la tabla con Select All/Deselect All en header
- Estado local `selectedIds: Set<string>` inicializado con todos los IDs
- Botones de accion rapida: "Seleccionar todo", "Deseleccionar todo", "Excluir sin EBITDA", "Excluir sin email"
- Las acciones de Calcular y Enriquecer solo aplican a empresas seleccionadas
- Al excluir, actualizar status a `excluded` via `updateCompany`
- **Archivo**: `steps/ReviewCalculateStep.tsx`

#### MEJORA 3: Preview del Excel antes de importar
- Al soltar Excel, guardar filas parseadas en estado local `previewRows` en vez de importar directo
- Tabla de preview con cabeceras mostrando mapeo automatico (badge verde) o sin mapear (badge amarillo)
- Select dropdown en cada cabecera para override manual del mapeo
- Stats cards: Total (azul), Validas (verde), Sin email (amarillo), Invalidas (rojo), Duplicadas (naranja)
- Filas invalidas resaltadas en rojo, sin email en amarillo
- Mostrar solo primeras 10 filas con indicador "y N mas..."
- Botones "Importar N filas validas" y "Cancelar"
- Deteccion de duplicados por CIF o nombre de empresa vs empresas existentes
- **Archivo**: `steps/CompaniesStep.tsx`

---

### Resumen tecnico

| Mejora | Archivo(s) | Complejidad | Dependencias nuevas |
|--------|-----------|-------------|-------------------|
| 1. Firma asesor | CampaignConfigStep.tsx | Baja | Ninguna |
| 2. Plantilla sector | CampaignConfigStep.tsx | Media | Ninguna |
| 3. Preview Excel | CompaniesStep.tsx | Alta | Ninguna |
| 4. Editar empresa | CompaniesStep.tsx | Media | Ninguna |
| 5. Checkboxes | ReviewCalculateStep.tsx | Media | Ninguna |
| 6. Sheet detalle | ReviewCalculateStep.tsx | Alta | Ninguna |
| 7. Links valoracion | ProcessSendStep.tsx | Baja | Ninguna |
| 8. Formato moneda | CompaniesStep.tsx | Baja | Ninguna (reutiliza CurrencyInput existente) |
| 9. Seguridad edge fn | enrich-campaign-company/index.ts | Baja | Ninguna |
| 10. Grafico resumen | CampaignSummaryStep.tsx | Media | Ninguna (recharts ya instalado) |

Todas las dependencias necesarias ya estan instaladas. No se crearan archivos nuevos excepto posibles subcomponentes si CompaniesStep o ReviewCalculateStep crecen demasiado.

