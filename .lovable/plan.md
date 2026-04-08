

## Análisis: Relación entre Lista ROD y Directorio de Contactos

### Estado actual

La tabla `rod_list_members` es **completamente independiente** del directorio de contactos (`contactos`) y de `buyer_contacts`. No existe ninguna FK, trigger, ni sincronización entre ellas.

```text
┌──────────────────┐     ┌──────────────┐     ┌─────────────────┐
│ rod_list_members │     │  contactos   │     │ buyer_contacts  │
│                  │     │              │     │                 │
│ full_name        │  ✗  │ nombre       │  ✗  │ full_name       │
│ email            │────▶│ email        │◀────│ email           │
│ company          │  NO │ empresa_id   │  NO │ company         │
│ phone            │ FK  │ telefono     │ FK  │ phone           │
│ sector           │     │ cargo        │     │ position        │
│ language         │     │              │     │                 │
└──────────────────┘     └──────────────┘     └─────────────────┘
        ▲
        │ Puntos de entrada (sin sincronización):
        ├─ Alta manual (RODListsTab)
        ├─ Import CSV/Excel (RODListsTab)
        ├─ AddToRODDialog (desde SF, CR, Empresas)
        ├─ generate-rod-document (auto-upsert al descargar)
        └─ Edición inline (RODListsTab)
```

### Problemas identificados

1. **Sin vínculo con `contactos`**: Al añadir un miembro a la lista ROD, no se crea ni se vincula un registro en `contactos`. Si el contacto no existe en el CRM, queda invisible para mandatos, directorios y el resto del sistema.

2. **Sin deduplicación cruzada**: Se puede añadir alguien a `rod_list_members` que ya existe en `contactos` (por email), generando datos duplicados y desconectados.

3. **Ediciones no sincronizadas**: Si editas el nombre o email inline en la lista ROD, el cambio NO se refleja en `contactos` ni en `buyer_contacts`.

4. **Sin trazabilidad**: No hay forma de saber, desde el perfil de un contacto en el CRM, si ese contacto está en alguna lista ROD.

### Plan propuesto

#### 1. Añadir columna `contacto_id` a `rod_list_members`
- Migración SQL: `ALTER TABLE rod_list_members ADD COLUMN contacto_id UUID REFERENCES contactos(id) ON DELETE SET NULL`
- Permite vincular opcionalmente cada miembro ROD a su ficha en el CRM.

#### 2. Trigger de auto-vinculación/creación en INSERT/UPDATE
- Función SQL `sync_rod_member_to_contactos()` que al insertar o actualizar un `rod_list_member`:
  - **Busca por email** en `contactos`. Si existe, asigna el `contacto_id` automáticamente.
  - **Si no existe**, crea un nuevo registro en `contactos` con los datos disponibles (nombre, email, teléfono, empresa) y el `source = 'rod_list'`, y vincula el ID.
  - Evita duplicados gracias al matching por email.

#### 3. Poblar `contacto_id` para registros existentes
- Migración de datos: UPDATE masivo que vincule los ~257+ miembros actuales con sus contactos existentes por email, y cree los que falten.

#### 4. Sincronización bidireccional de ediciones inline
- Actualizar `EditableCell` en `RODListsTab.tsx`: cuando se edite un campo (nombre, email, teléfono), si el miembro tiene `contacto_id`, también actualizar el registro correspondiente en `contactos`.
- Alternativa más limpia: el trigger SQL lo haga automáticamente en UPDATE.

#### 5. Indicador visual de vinculación
- En la tabla ROD, mostrar un icono sutil (enlace) cuando el miembro tiene `contacto_id`, con click para navegar al perfil del contacto en el directorio.

### Resumen de archivos a modificar

| Archivo | Cambio |
|---|---|
| Nueva migración SQL | Columna `contacto_id`, trigger `sync_rod_member_to_contactos`, poblado de datos |
| `src/components/admin/rod/RODListsTab.tsx` | Mostrar indicador de vinculación, sync ediciones |
| `src/components/admin/shared/AddToRODDialog.tsx` | Sin cambios (el trigger maneja la vinculación) |

### Alcance de seguridad
- La FK usa `ON DELETE SET NULL` para no bloquear eliminaciones de contactos.
- El trigger usa `SECURITY DEFINER` para poder escribir en `contactos` desde cualquier contexto autenticado.

