
# Opcion de Valoracion con 1 o 3 Anos en Campanas Outbound

## Resumen

Anadir un selector en el paso de configuracion de campana que permita elegir entre valorar con 1 ano (solo ultimo ejercicio) o 3 anos (trienio completo). El formulario, calculos, plantillas Excel y resumen se adaptaran automaticamente segun la opcion elegida.

## Diagnostico actual

- La tabla `valuation_campaigns` ya tiene columna `financial_years` (array de 3 numeros, default `[2025, 2024, 2023]`)
- El `CampaignConfigStep` ya permite editar el "ultimo ano disponible" y calcula automaticamente los otros 2
- El `CompaniesStep` siempre muestra 3 anos en el formulario manual y en la plantilla Excel
- El calculo en `ReviewCalculateStep` ya soporta 1 o N anos via `financial_years_data` en cada empresa
- No existe campo `years_mode` en la tabla

## Cambios planificados

### 1. Base de datos

Agregar columna `years_mode` a `valuation_campaigns`:

```text
ALTER TABLE valuation_campaigns 
ADD COLUMN IF NOT EXISTS years_mode TEXT DEFAULT '3_years';
```

No se usa CHECK constraint (para evitar problemas de restauracion). La validacion se hace en frontend.

### 2. Hook useCampaigns

Agregar `years_mode` al tipo `ValuationCampaign` para que TypeScript lo reconozca.

### 3. CampaignConfigStep - Selector de modo

Anadir un **RadioGroup** con 2 opciones antes de la seccion de "Anos financieros":

- **"Ultimo ano disponible"** (1_year) - Badge "Recomendado", descripcion corta
- **"Ultimos 3 anos"** (3_years) - Descripcion de mayor precision

Cuando se selecciona `1_year`:
- Solo se muestra 1 campo de ano (editable)
- `financial_years` se guarda como array de 1 elemento: `[2025]`

Cuando se selecciona `3_years`:
- Se muestran 3 campos (como ahora): ultimo editable, los otros 2 auto-calculados
- `financial_years` se guarda como array de 3: `[2025, 2024, 2023]`

### 4. CompaniesStep - Formulario adaptativo

- El formulario manual mostrara 1 o 3 filas de datos financieros segun `years_mode`
- La plantilla Excel descargable tendra columnas para 1 o 3 anos segun la configuracion
- El mapeo de columnas Excel se adaptara al modo seleccionado

Para esto, `CompaniesStep` necesita recibir `years_mode` como prop (ademas de `financialYears`).

### 5. CampaignSummaryStep - Badge de modo

Agregar un badge informativo en el resumen que indique:
- "Valoracion con 1 ano" o "Valoracion con 3 anos"

### 6. CampanaValoracionForm (pagina principal)

- Inicializar `years_mode` como `'1_year'` por defecto (recomendado)
- Pasar `years_mode` al `CompaniesStep`
- Ajustar `financial_years` segun el modo cuando cambia

## Archivos a modificar

1. **Migracion SQL** - Agregar columna `years_mode`
2. **`src/hooks/useCampaigns.ts`** - Agregar `years_mode` al tipo
3. **`src/pages/admin/CampanaValoracionForm.tsx`** - Default `years_mode: '1_year'`, pasar como prop, ajustar `financial_years` segun modo
4. **`src/components/admin/campanas-valoracion/steps/CampaignConfigStep.tsx`** - RadioGroup selector + logica condicional de anos
5. **`src/components/admin/campanas-valoracion/steps/CompaniesStep.tsx`** - Adaptar formulario manual y plantilla Excel al modo
6. **`src/components/admin/campanas-valoracion/steps/CampaignSummaryStep.tsx`** - Badge informativo del modo

## Lo que NO cambia

- `ReviewCalculateStep` ya funciona con 1 o N anos (usa `financial_years_data` del company)
- `ProcessSendStep` ya mapea `financial_years_data` correctamente al PDF
- Los calculos de valoracion (`calculateProfessionalValuation`) ya soportan arrays de cualquier tamano
- Las RLS policies no se modifican
