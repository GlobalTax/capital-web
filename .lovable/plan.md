

## Hacer visible la columna "Descripción" por defecto

### Problema
La columna `descripcion_actividad` está en `DEFAULT_COLUMNS` con `visible: false`. Además, los usuarios que ya tienen preferencias guardadas en localStorage no verán el cambio del default porque la lógica de merge solo añade columnas nuevas (por key) — y esta key ya existe en sus prefs guardadas como `visible: false`.

### Cambios

**`src/hooks/useListColumnPreferences.ts`**
1. Cambiar `visible: false` → `visible: true` en la entrada `descripcion_actividad` de `DEFAULT_COLUMNS` (línea 30)
2. En la lógica de merge de preferencias guardadas (líneas 56-65), forzar que si la columna `descripcion_actividad` existe en las prefs guardadas con `visible: false`, se actualice a `visible: true`. Esto es un one-time fix para usuarios existentes.

