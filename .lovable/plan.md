

## Fix: Importacion de Google Ads falla por tipo de datos

### Causa raiz

La columna `conversions` en la tabla `ads_costs_history` es de tipo `integer`, pero el CSV de Google Ads contiene valores decimales como `61.67` y `50.33`. Postgres rechaza el INSERT/UPSERT al intentar almacenar un float en una columna integer, lo que genera el error generico "Error al importar".

### Solucion

**1. Migracion SQL: Cambiar `conversions` de `integer` a `numeric`**

```text
ALTER TABLE ads_costs_history ALTER COLUMN conversions TYPE numeric USING conversions::numeric;
```

Esto permite almacenar valores decimales sin perder los datos existentes (los enteros son compatibles con numeric).

**2. Mejora del feedback de errores en `useGoogleAdsImport.ts`**

En la funcion `importData`, el catch actual muestra un mensaje generico. Cambiar para incluir el detalle del error de Supabase/Postgres:

| Linea | Cambio |
|-------|--------|
| 367 | Extraer `err.message`, `err.details`, `err.hint` del error de Supabase y mostrarlos en el toast |

**3. Refresh automatico de graficas**

En la funcion `importData`, anadir invalidaciones adicionales de queries para que las graficas se actualicen al importar:

| Query key a invalidar | Proposito |
|----------------------|-----------|
| `ads-costs-history` (general) | Tabla principal de costes |
| `google-ads-stats` | Dashboard de Google Ads |
| `unified-costs` | Vista unificada de costes |
| `campaign-registry` | Registro de campanas |

**4. Redondear conversions en el parseo como medida defensiva**

Aunque la columna se cambie a numeric, anadir `Math.round()` en el campo `conversions` del batch de upsert como proteccion adicional (el campo `results` ya guarda el valor decimal exacto).

### Archivos afectados

- **Migracion SQL**: Cambiar tipo de columna `conversions`
- **`src/hooks/useGoogleAdsImport.ts`**: Mejorar mensajes de error y refresh de queries

### Lo que NO se toca

- Import de Meta: sin cambios
- Preview del modal: funciona correctamente, no se modifica
- `GoogleAdsImportModal.tsx`: sin cambios necesarios

