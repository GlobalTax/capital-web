
Objetivo: arreglar la duplicación completa de campañas para que no falle al copiar empresas aunque ya existan en CRM.

Diagnóstico profundo:
- El error real no viene del botón ni de React; ocurre al insertar en `valuation_campaign_companies` durante la duplicación.
- Esa inserción dispara el trigger `trg_sync_campaign_company_to_empresas`.
- En producción, la función activa `sync_campaign_company_to_empresas()` hace esto:
  - inserta en `empresas`
  - solo resuelve conflicto por `cif`
- Pero la tabla `empresas` también tiene un índice único adicional:
  - `idx_empresas_nombre_normalized`
  - `UNIQUE (normalize_company_name(nombre))`
- Resultado:
  - si la empresa ya existe en CRM con el mismo nombre normalizado, pero sin CIF coincidente o con CIF vacío, el trigger intenta insertar una nueva fila
  - Postgres rechaza la inserción con `duplicate key value violates unique constraint "idx_empresas_nombre_normalized"`
  - la transacción completa falla y la campaña no se duplica

Por qué algunas campañas sí duplican:
- La campaña “campaña para pruebas” probablemente no choca con nombres ya existentes en `empresas`.
- Las campañas grandes sí chocan porque contienen empresas ya sincronizadas previamente en CRM.

Prueba que confirma la causa:
- En código, `duplicateMutation` inserta primero todas las filas en `valuation_campaign_companies`.
- En base de datos, el trigger activo está desactualizado respecto a la versión más robusta que existe en migraciones del repo.
- El índice único conflictivo existe realmente en producción: `idx_empresas_nombre_normalized`.

Plan de solución:
1. Corregir la función SQL `public.sync_campaign_company_to_empresas()` mediante migración.
2. Hacer que el trigger:
   - busque primero por CIF normalizado si existe
   - si no encuentra, busque por `normalize_company_name(nombre)`
   - si encuentra empresa existente, haga `UPDATE`
   - solo haga `INSERT` cuando no exista ninguna coincidencia
3. Mantener la sincronización financiera desde campañas hacia CRM, pero sin crear duplicados por nombre.
4. Preservar `origen/source` de forma segura para no romper trazabilidad.
5. Verificar que la duplicación actual de frontend no necesita cambios estructurales; el fallo principal está en DB.

Implementación propuesta:
- Crear una migración que reemplace la función del trigger con una versión robusta, similar a la lógica correcta ya vista en el repo pero mejorada para:
  - comparar CIF con `lower(trim(cif))`
  - comparar nombres con `normalize_company_name(nombre) = normalize_company_name(NEW.client_company)`
  - actualizar campos financieros/website/provincia solo con `COALESCE`
  - evitar insertar si ya existe una empresa equivalente
- No tocar el índice único; ese índice es útil y correcto.
- No eliminar el trigger; hay que arreglar su lógica.
- Después, probar duplicación con una campaña que hoy falla.

Detalles técnicos:
```text
Duplicar campaña
  -> insert valuation_campaign_companies
    -> trigger sync_campaign_company_to_empresas
      -> buscar empresa existente por CIF
      -> si no, buscar por nombre normalizado
      -> UPDATE si existe
      -> INSERT solo si no existe
```

Archivos previstos:
- `supabase/migrations/...sql` — nueva migración para `sync_campaign_company_to_empresas()`
- Posible revisión menor de `src/hooks/useCampaigns.ts` solo si detectamos necesidad de mejor manejo de errores, pero no parece ser la causa raíz

Riesgos y consideraciones:
- Hay campañas con empresas repetidas dentro de la misma campaña; eso no explica este error concreto, pero conviene revisar luego si quieres impedir duplicados internos.
- Si existen registros históricos en `empresas` mal normalizados, la función corregida seguirá siendo mucho más tolerante que la actual.
- No hace falta cambiar RLS para este problema.

Resultado esperado tras el fix:
- El botón “Duplicar” podrá copiar campañas completas aunque sus empresas ya existan en CRM.
- La campaña duplicada seguirá copiando empresas, presentaciones, emails y secuencias.
- El CRM no generará duplicados por nombre normalizado al clonar campañas.
