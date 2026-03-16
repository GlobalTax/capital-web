

## Diagnóstico: por qué falla la subida de 12.500 filas

### Causa raíz
El trigger `trg_sync_sublist_insert` que acabamos de crear se ejecuta **por cada fila insertada**. Con 12.500 filas, cada lote de 25 inserts genera además 25 operaciones adicionales del trigger (SELECT + INSERT/UPDATE en la lista madre). Esto **triplica** la carga por lote y provoca timeouts en la base de datos.

Antes del trigger, 25 inserts eran 25 operaciones. Ahora son ~75 (25 inserts + 25 selects + 25 inserts en madre).

### Solución

#### 1) `useContactLists.ts` — Reducir carga por lote
- Bajar `BATCH_SIZE` de 25 a **10** para compensar la carga del trigger
- Subir `SUB_BATCH_SIZE` de 5 a **3**
- Aumentar `DELAY_MS` de 150 a **300ms** para dar más respiro a la DB
- Esto es más lento (~65 minutos para 12.500 filas) pero completará sin fallar

#### 2) Migración SQL — Optimizar el trigger
- Añadir un **índice** en `outbound_list_companies` sobre `(list_id, lower(trim(cif)))` para que la búsqueda de duplicados en la madre sea instantánea en vez de un full scan
- Esto reducirá drásticamente el coste de cada ejecución del trigger

### Archivos a modificar
- `src/hooks/useContactLists.ts` — ajustar constantes de batching
- Nueva migración SQL — crear índice para optimizar el trigger

