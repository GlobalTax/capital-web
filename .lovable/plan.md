

## Plan: Establecer relaciones madre-sublista automáticamente por CIF

### Situación actual

Hay **muchas listas huérfanas** (sin `lista_madre_id`) que en realidad son sublistas de listas madre existentes. Por ejemplo:
- **Categoría Dermatología** comparte 84 CIFs con **Sector Salud** → debería ser su sublista
- **Gabitec** comparte 55 CIFs con **Empresas de construcción, obra civil** 
- **Tucsegur Alarmas** comparte 24 CIFs con **Seguridad privada**
- Y muchas más...

### Solución

Ejecutar una **migración SQL única** que:

1. Para cada lista huérfana (sin `lista_madre_id`, tipo != 'madre'), buscar la lista madre con la que comparte más CIFs
2. Solo establecer la relación si hay un mínimo de coincidencias significativas (≥ 2 CIFs compartidos) para evitar falsos positivos
3. Actualizar `lista_madre_id` de esas listas automáticamente

### SQL a ejecutar

```sql
WITH best_match AS (
  SELECT DISTINCT ON (orphan.id)
    orphan.id as orphan_id,
    madre.id as madre_id,
    COUNT(*) as shared_cifs
  FROM outbound_lists orphan
  JOIN outbound_list_companies oc ON oc.list_id = orphan.id AND oc.cif IS NOT NULL AND oc.cif != ''
  JOIN outbound_list_companies mc ON mc.cif = oc.cif
  JOIN outbound_lists madre ON madre.id = mc.list_id AND madre.tipo = 'madre'
  WHERE orphan.lista_madre_id IS NULL
    AND (orphan.tipo IS NULL OR orphan.tipo != 'madre')
  GROUP BY orphan.id, madre.id
  HAVING COUNT(*) >= 2
  ORDER BY orphan.id, COUNT(*) DESC
)
UPDATE outbound_lists ol
SET lista_madre_id = bm.madre_id
FROM best_match bm
WHERE ol.id = bm.orphan_id;
```

### Resultado esperado

- ~15-20 listas huérfanas se vincularán automáticamente a su lista madre
- Las columnas "Sublistas" y "Lista Madre" aparecerán inmediatamente en las listas correspondientes
- No se requieren cambios de código, solo la migración de datos

