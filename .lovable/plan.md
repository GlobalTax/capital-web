

## Plan: Sincronización bidireccional Madre ↔ Sublistas

### Problema
1. **No existe sincronización madre → sublistas**: Cuando actualizas datos en una lista madre, los sublistas NO se actualizan.
2. **El trigger actual (sublista → madre) usa columnas incorrectas**: Referencia `company_name`, `contact_name`, `contact_email`, etc., pero las columnas reales son `empresa`, `contacto`, `email`, `telefono`, `linkedin`, `web`. Esto significa que la sincronización sublista → madre tampoco funciona actualmente.

### Cambio
Una única migración SQL que:

1. **Corrige el trigger existente** `sync_sublist_company_to_madre` para usar los nombres de columna correctos (`empresa`, `contacto`, `email`, `telefono`, `linkedin`, `web`, `provincia`, `cnae`, `descripcion_actividad`, `director_ejecutivo`, `facturacion`, `ebitda`, `num_trabajadores`, `consolidador_nombre`, `tipo_accionista`, `nombre_accionista`, `notas`).

2. **Crea un nuevo trigger** `sync_madre_company_to_sublists` que se dispara en UPDATE sobre `outbound_list_companies`. Cuando la empresa actualizada pertenece a una lista madre (es decir, existen listas con `lista_madre_id` apuntando a esa lista), propaga los cambios a todas las sublistas, haciendo matching por CIF o nombre de empresa. Usa COALESCE para no sobreescribir datos que ya existan en la sublista con valores vacíos.

3. **Prevención de bucles infinitos**: El trigger madre→sublistas y el trigger sublista→madre podrían dispararse mutuamente. Se añade una guarda: el trigger madre→sublistas solo actúa si la lista es madre (tiene sublistas vinculadas) y el trigger sublista→madre solo actúa si la lista tiene `lista_madre_id`. Además se usa `pg_trigger_depth() < 2` para cortar recursión.

### Lógica del nuevo trigger (madre → sublistas)

```text
ON UPDATE outbound_list_companies
  → ¿La lista del registro es una lista madre? (¿existen listas con lista_madre_id = list_id?)
  → Si sí: para cada sublista vinculada
    → Buscar empresa por CIF o nombre
    → UPDATE con COALESCE (no sobreescribir con vacíos)
```

### Archivos afectados
- **1 migración SQL** (sin cambios en código frontend)

