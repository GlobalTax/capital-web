

## Plan: Sincronización automática sublista → lista madre

### Problema actual
Cuando se importan empresas en una sublista (ej: "Asesorías Madrid"), esas empresas solo existen en la sublista. La lista madre no recibe esos registros automáticamente. El usuario tiene que hacerlo manualmente o no tiene visibilidad completa.

### Solución
Crear un **trigger en PostgreSQL** que, al insertar una empresa en una sublista (`outbound_list_companies` con `list_id` de una lista cuyo `lista_madre_id` no es null), automáticamente:

1. Compruebe si ya existe una empresa con el mismo CIF en la lista madre
2. Si **no existe**: inserte una copia en la lista madre con toda la información disponible
3. Si **ya existe**: actualice los campos que estén vacíos en la madre con los datos de la sublista (enriquecimiento sin sobrescribir)

### Detalle técnico

#### 1) Migración SQL: trigger `sync_sublist_to_madre`

```text
INSERT en sublista (list_id = sublista)
  ↓
trigger AFTER INSERT
  ↓
¿La sublista tiene lista_madre_id?
  NO → nada
  SÍ → buscar madre_id
    ↓
¿Existe CIF en madre?
  NO → INSERT copia en madre
  SÍ → UPDATE campos vacíos en madre con datos de sublista
```

Campos a sincronizar/enriquecer: `empresa`, `contacto`, `email`, `telefono`, `web`, `provincia`, `facturacion`, `ebitda`, `anios_datos`, `num_trabajadores`, `director_ejecutivo`, `linkedin`, `comunidad_autonoma`, `posicion_contacto`, `cnae`, `descripcion_actividad`.

Regla de enriquecimiento: solo sobrescribir si el campo en la madre es NULL y el de la sublista tiene valor.

También añadir trigger AFTER UPDATE para que si se edita una empresa en la sublista, los cambios se propaguen a la madre (misma lógica de enriquecimiento).

#### 2) Sin cambios en frontend

El trigger es transparente — la lista madre se actualiza automáticamente y la UI ya recarga datos via React Query.

### Archivos a modificar

| Recurso | Cambio |
|---------|--------|
| Nueva migración SQL | Crear función `sync_sublist_company_to_madre()` + triggers AFTER INSERT y AFTER UPDATE en `outbound_list_companies` |

### Resultado esperado
Al importar un Excel en cualquier sublista, las empresas aparecerán automáticamente también en la lista madre con toda la información disponible. Si la madre ya tenía la empresa pero con campos vacíos, se rellenan con los datos de la sublista.

