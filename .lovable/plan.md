

## Rangos de Valoracion Automaticos para Campanas Outbound

### Resumen
Anadir un sistema de rangos configurables por campana que asigne automaticamente multiplos (conservador/base/optimista) segun el EBITDA o facturacion de cada empresa.

### Cambios en Base de Datos

**1. Nueva tabla `valuation_ranges`**
- `id` UUID PK
- `campaign_id` FK a valuation_campaigns (ON DELETE CASCADE)
- `range_order` INT
- `min_value` DECIMAL (nullable = sin minimo)
- `max_value` DECIMAL (nullable = sin maximo)
- `multiple_low` DECIMAL NOT NULL
- `multiple_mid` DECIMAL NOT NULL
- `multiple_high` DECIMAL NOT NULL
- `range_label` TEXT
- `created_at` TIMESTAMPTZ
- Indices por campaign_id y (campaign_id, range_order)
- RLS: lectura/escritura para usuarios autenticados

**2. Nuevas columnas en `valuation_campaign_companies`**
- `range_label` TEXT - etiqueta del rango asignado
- `is_auto_assigned` BOOLEAN DEFAULT FALSE

No se anaden `multiple_low/mid/high` a companies porque ya existen `valuation_low/central/high` (valoraciones calculadas) y `multiple_used` + `custom_multiple` (multiplos). El rango se refleja en estos campos existentes.

### Cambios en Frontend

**3. Nuevo componente: `ValuationRangesConfig.tsx`**
Ubicacion: `src/components/admin/campanas-valoracion/ValuationRangesConfig.tsx`

Card con:
- Tabla editable de rangos (etiqueta, desde, hasta, multiplo conservador/base/optimista)
- Boton "Anadir rango"
- Boton "Eliminar rango"
- Preview visual de los rangos configurados
- Boton "Guardar rangos"
- Boton "Aplicar rangos a empresas existentes" que recalcula todas las empresas usando los rangos

**4. Integrar en `CampaignConfigStep.tsx`**
Anadir el componente `ValuationRangesConfig` debajo de la seccion de multiplos existente (linea ~252). Se muestra solo si la campana ya tiene ID (esta guardada).

**5. Nueva utilidad: `assignMultiplesFromRanges.ts`**
Ubicacion: `src/utils/assignMultiplesFromRanges.ts`

Funcion que:
- Recibe `baseValue` (EBITDA o facturacion) y `campaignId`
- Consulta `valuation_ranges` ordenados por `range_order`
- Busca el rango donde `min_value <= baseValue < max_value`
- Retorna `{ multiple_low, multiple_mid, multiple_high, range_label, is_auto_assigned }`
- Si no hay rangos definidos, retorna `null` (para que el sistema use los multiplos de campana como fallback)

**6. Modificar `ReviewCalculateStep.tsx`**
En `handleCalculateAll` y `handleRecalculateAll`:
- Antes de calcular, obtener rangos de la campana (una sola query)
- Para cada empresa, si hay rangos definidos, buscar el rango que aplica segun su baseValue
- Usar los multiplos del rango en vez de los de campana
- Guardar `range_label` e `is_auto_assigned` en el update

**7. Modificar tabla en `ReviewCalculateStep.tsx`**
En la columna de "Multiplo", si la empresa tiene `range_label`, mostrar un Badge con el nombre del rango:
```
5.0x [Mediana]
```

**8. Modificar `CompaniesStep.tsx` (importacion Excel)**
No se modifica la importacion directamente porque las empresas se importan primero y se calculan despues en ReviewCalculateStep. El flujo actual ya funciona: importar -> calcular. Los rangos se aplican en el paso de calculo.

### Flujo de usuario
1. En Configuracion, define rangos (ej: Pequena 0-300k con 2x/3x/4x, Mediana 300k-1M con 4x/5x/6x)
2. Importa empresas via Excel (sin cambios)
3. En Revision, click "Calcular pendientes" o "Recalcular todas"
4. El sistema detecta rangos configurados y asigna multiplos automaticamente
5. La tabla muestra badges con el rango asignado

### Detalle tecnico

```text
Flujo de calculo con rangos:

ReviewCalculateStep.handleCalculateAll()
  |
  +-- Query valuation_ranges WHERE campaign_id ORDER BY range_order
  |
  +-- Para cada empresa:
  |     baseValue = isRevenue ? revenue : ebitda
  |     rango = findMatchingRange(baseValue, ranges)
  |     
  |     Si rango existe:
  |       multipleUsed = rango.multiple_mid
  |       effectiveLow = rango.multiple_low
  |       effectiveHigh = rango.multiple_high
  |       range_label = rango.range_label
  |     Si no:
  |       Usar multiplos de campana (comportamiento actual)
  |
  +-- Calcular: valuation_low = baseValue * effectiveLow
  |              valuation_central = baseValue * multipleUsed
  |              valuation_high = baseValue * effectiveHigh
  |
  +-- Guardar con range_label e is_auto_assigned
```

### Archivos a crear
- `supabase/migrations/xxx_valuation_ranges.sql` (tabla + columnas + RLS)
- `src/utils/assignMultiplesFromRanges.ts`
- `src/components/admin/campanas-valoracion/ValuationRangesConfig.tsx`

### Archivos a modificar
- `src/components/admin/campanas-valoracion/steps/CampaignConfigStep.tsx` (integrar componente de rangos)
- `src/components/admin/campanas-valoracion/steps/ReviewCalculateStep.tsx` (usar rangos en calculo + badge en tabla)

