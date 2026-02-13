

## Soporte para 3 anos financieros en Campanas Outbound

### Contexto
La calculadora profesional (`/admin/valoraciones-pro`) pide datos financieros de 3 anos (facturacion + EBITDA por ano). Actualmente, las campanas outbound solo guardan 1 ano (`revenue`, `ebitda`, `financial_year`). Esto limita la calidad de las valoraciones generadas.

### Cambios necesarios

#### 1. Base de datos: nueva columna JSONB
Anadir una columna `financial_years_data` de tipo JSONB a la tabla `valuation_campaign_companies` para almacenar los 3 anos, siguiendo el mismo formato que usa `professional_valuations`:

```sql
ALTER TABLE valuation_campaign_companies 
ADD COLUMN financial_years_data JSONB DEFAULT '[]';
```

Se mantienen las columnas `revenue`, `ebitda`, `financial_year` existentes como datos del ano principal (compatibilidad).

#### 2. Plantilla Excel actualizada
Cambiar las columnas de la plantilla descargable:

**Antes:** Empresa, Contacto, Email, Telefono, CIF, Facturacion, EBITDA, Ano

**Despues:** Empresa, Contacto, Email, Telefono, CIF, Facturacion 2024, EBITDA 2024, Facturacion 2023, EBITDA 2023, Facturacion 2022, EBITDA 2022

(Los anos se calculan dinamicamente: ano actual - 1, -2, -3)

#### 3. Mapeo de columnas Excel (COLUMN_MAP)
Ampliar el `COLUMN_MAP` en `CompaniesStep.tsx` para reconocer las nuevas cabeceras con ano:
- `facturacion 2024` / `revenue 2024` -> revenue (ano 1)
- `ebitda 2024` -> ebitda (ano 1)
- `facturacion 2023` / `revenue 2023` -> revenue_year_2
- `ebitda 2023` -> ebitda_year_2
- Etc.

#### 4. Logica de importacion Excel
Actualizar `onDrop` para construir el array `financial_years_data` a partir de las columnas mapeadas y guardarlo junto con los datos de cada empresa.

#### 5. Formulario manual
Ampliar el formulario manual para incluir 3 filas de ano (similar a la calculadora pro), con campos Ano / Facturacion / EBITDA para cada uno.

#### 6. ProcessSendStep: pasar los 3 anos
Actualizar la linea que construye `financialYears` (actualmente linea 50):

**Antes:**
```
financialYears: [{ year: c.financial_year, revenue: c.revenue, ebitda: c.ebitda }]
```

**Despues:**
```
financialYears: c.financial_years_data?.length 
  ? c.financial_years_data 
  : [{ year: c.financial_year, revenue: c.revenue, ebitda: c.ebitda }]
```

#### 7. Tabla de empresas
Mostrar en la tabla del paso 2 una indicacion de cuantos anos de datos tiene cada empresa (ej: "3 anos" o "1 ano").

### Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `supabase/migrations/` (nueva) | Migracion: columna `financial_years_data` |
| `src/integrations/supabase/types.ts` | Se regenera tras migracion |
| `src/components/admin/campanas-valoracion/steps/CompaniesStep.tsx` | Template, COLUMN_MAP, onDrop, formulario manual, tabla |
| `src/hooks/useCampaignCompanies.ts` | Tipo actualizado si es necesario |
| `src/components/admin/campanas-valoracion/steps/ProcessSendStep.tsx` | Pasar array de 3 anos |

### Compatibilidad
- Las campanas existentes con 1 solo ano seguiran funcionando (fallback a `revenue`/`ebitda`/`financial_year`)
- La plantilla nueva es retrocompatible: si alguien sube un Excel con 1 solo ano, funciona igualmente

