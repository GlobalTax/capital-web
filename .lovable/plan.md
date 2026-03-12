

## Añadir campos de configuración avanzada a la pestaña "Configuración" de listas de contacto

### Cambios en base de datos

Migración SQL para añadir 6 columnas a `outbound_lists`:

```sql
ALTER TABLE outbound_lists
  ADD COLUMN IF NOT EXISTS descripcion_proposito text,
  ADD COLUMN IF NOT EXISTS cnaes_utilizados text[],
  ADD COLUMN IF NOT EXISTS facturacion_min numeric,
  ADD COLUMN IF NOT EXISTS facturacion_max numeric,
  ADD COLUMN IF NOT EXISTS criterios_construccion text,
  ADD COLUMN IF NOT EXISTS lista_madre_id uuid REFERENCES outbound_lists(id) ON DELETE SET NULL;
```

### Cambios en `ContactListDetailPage.tsx`

**1. Nuevos estados de configuración (junto a los existentes línea ~200):**
- `configDescProposito`, `configCnaes` (string[]), `configFactMin`, `configFactMax`, `configCriteriosConstruccion`, `configListaMadreId`
- Inicializados desde `list` en el useEffect existente (línea 206)

**2. Query para cargar todas las listas (para el selector "Lista madre"):**
- Query simple a `outbound_lists` para obtener `id, name`, excluyendo la lista actual

**3. Query para obtener el nombre de la lista madre (si hay `lista_madre_id`):**
- Solo si `list.lista_madre_id` existe, obtener su nombre para el breadcrumb

**4. Breadcrumb en la cabecera (línea ~512):**
- Si la lista tiene `lista_madre_id`, mostrar un badge/breadcrumb "Sublista de: [nombre madre]" con link a esa lista

**5. Campos nuevos en la pestaña Configuración (entre la Card existente y la zona peligrosa, línea ~821):**
- Nueva Card "Configuración avanzada" con:
  - **Descripción / Propósito**: Textarea
  - **CNAEs utilizados**: Input con tags/chips (reutilizar patrón de `SFFundTagEditor` existente)
  - **Rango de facturación**: Dos inputs numéricos en fila (Mín / Máx)
  - **Criterios de construcción**: Textarea
  - **Lista madre**: Select con todas las listas excepto la actual

**6. Actualizar `handleSaveConfig` (línea ~434):**
- Incluir los 6 nuevos campos en el `.update()`

### Ficheros modificados

Solo 1 fichero: `src/pages/admin/ContactListDetailPage.tsx`

No se crean ficheros nuevos. Se reutiliza el componente `SFFundTagEditor` para los CNAEs (ya existe con la funcionalidad exacta de tags con Enter/Backspace/eliminar individual). Si no se quiere esa dependencia, se puede hacer inline con un patrón similar.

