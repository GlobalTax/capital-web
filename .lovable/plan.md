

## Plan: Propagar datos de lista madre a sublistas (la madre manda)

### Problema

Hay dos cuestiones:

1. **El trigger actual NO sobrescribe**: `sync_madre_company_to_sublists` usa `COALESCE(NULLIF(NEW.valor, ''), valor_existente)`, lo que solo rellena campos vacíos en la sublista. Si la sublista ya tiene un dato antiguo, no se actualiza con el nuevo de la madre.

2. **Los datos ya subidos no se propagaron**: Como el trigger no sobrescribía, las ~10.215 empresas actualizadas en la madre no trasladaron su información nueva a las sublistas. Hace falta un re-sync en bloque.

3. **Match CIF case-sensitive**: El trigger compara `cif = NEW.cif` sin normalizar mayúsculas/minúsculas.

### Solución (1 migración SQL)

**Archivo:** Nueva migración SQL

#### A. Actualizar el trigger `sync_madre_company_to_sublists`

Cambiar la lógica para que la madre siempre sobrescriba los campos de las sublistas cuando el nuevo valor no sea vacío/nulo:

```sql
-- Antes (solo rellena vacíos):
empresa = COALESCE(NULLIF(NEW.empresa, ''), empresa)

-- Después (la madre manda):
empresa = CASE WHEN NEW.empresa IS NOT NULL AND NEW.empresa <> '' 
               THEN NEW.empresa ELSE empresa END
```

Aplicar este patrón a todos los campos sincronizados. Además, usar `lower(trim(cif))` para el match.

#### B. Re-sync en bloque de todas las listas madre existentes

Ejecutar un UPDATE masivo que copie los datos actuales de cada empresa en cada lista madre hacia sus sublistas correspondientes, usando la misma lógica "la madre manda":

```sql
UPDATE outbound_list_companies sub
SET empresa = CASE WHEN m.empresa IS NOT NULL AND m.empresa <> '' 
                   THEN m.empresa ELSE sub.empresa END,
    contacto = CASE WHEN m.contacto IS NOT NULL ...
    -- todos los campos
FROM outbound_list_companies m
JOIN outbound_lists sl ON sl.id = sub.list_id AND sl.lista_madre_id = m.list_id
WHERE lower(trim(sub.cif)) = lower(trim(m.cif))
  AND m.cif IS NOT NULL AND m.cif <> '';
```

#### C. También actualizar `sync_sublist_company_to_madre` (coherencia inversa)

Mantener la misma lógica: cuando se edita en una sublista, también sube a la madre sobrescribiendo.

### Resultado

- Todos los datos nuevos ya importados en la madre se copiarán inmediatamente a las sublistas.
- A partir de ahora, cualquier cambio en la madre sobrescribirá automáticamente en las sublistas.
- El match por CIF será case-insensitive.

