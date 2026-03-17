

## Plan: Añadir nombre del consolidador editable en la tabla

### Cambios necesarios

**1. Migración de base de datos**
- Añadir columna `consolidador_nombre` (text, nullable) a `outbound_list_companies`

**2. `useListColumnPreferences.ts`**
- Cambiar la columna `consolidador` para que tenga `minWidth: '180px'` (necesita espacio para checkbox + nombre)

**3. `ContactListDetailPage.tsx` — caso `consolidador` en `renderColumnCell`**
- Reemplazar el render actual (solo checkbox) por un layout con:
  - Checkbox a la izquierda (funcionalidad actual)
  - `EditableCell` a la derecha para el nombre del consolidador, que aparece al marcar el checkbox
  - Al hacer click en el texto o en el placeholder "Nombre..." se edita inline
  - Al guardar, hace update de `consolidador_nombre` en Supabase

**4. `needsStopPropagation`** — ya incluye `consolidador`, no requiere cambios

### Resultado
La columna "Consolidador" mostrará: `[✓] Nombre del consolidador` — editable inline con el mismo patrón que notas y contacto.

