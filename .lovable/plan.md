

## Fix: Importación por lotes para listas grandes

### Problema

La inserción actual hace un único `supabase.from('outbound_list_companies').insert(allRows)` con todas las filas de golpe. Cada fila dispara el trigger `trg_sync_outbound_list_to_empresas` que hace upserts en `empresas` y `contactos`. Con listados grandes (100+ filas), la suma de operaciones excede el timeout de sentencia de Supabase (8s por defecto).

### Solución

Dividir la inserción en lotes (batches) de 25 filas, insertando secuencialmente con progreso visible.

### Cambios

**1. `src/hooks/useContactLists.ts` — `addCompanies` mutation con batching**

Reemplazar el `.insert(inputs)` único por un bucle que:
- Divide el array en chunks de 25 filas
- Inserta cada chunk secuencialmente
- Si un chunk falla, lanza error indicando cuántos se insertaron antes del fallo

```typescript
mutationFn: async (inputs) => {
  const BATCH_SIZE = 25;
  for (let i = 0; i < inputs.length; i += BATCH_SIZE) {
    const batch = inputs.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from(TB_COMPANIES).insert(batch);
    if (error) throw new Error(`Error en lote ${Math.floor(i/BATCH_SIZE)+1}: ${error.message}`);
  }
}
```

**2. `src/pages/admin/ContactListDetailPage.tsx` — Progreso de importación**

- Añadir estado `importProgress: { done: number; total: number } | null`
- Pasar callback de progreso a `addCompanies` (o gestionar desde `handleConfirmImport` dividiendo ahí los lotes)
- Mostrar progreso en el modal de importación: "Importando 50/200..."

### Fichero | Acción
- `src/hooks/useContactLists.ts` — Modificar mutation con batching
- `src/pages/admin/ContactListDetailPage.tsx` — Añadir indicador de progreso

### Tamaño de batch: 25

Justificación: cada fila dispara un trigger con múltiples queries (upsert empresa + upsert contacto + posible segundo contacto). 25 filas × ~3 queries = ~75 operaciones por batch, bien dentro del timeout.

