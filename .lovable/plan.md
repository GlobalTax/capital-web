
# Mejora de Gestion de Casos de Exito

## Diagnostico

La tabla `case_studies` ya tiene campos `is_active`, `is_featured` y `display_locations`. Hay 10 casos en la base de datos, todos activos y destacados. El problema del limite de 6 es un `.slice(0, 6)` hardcodeado en `CaseStudies.tsx` (linea 24).

El admin actual (`CaseStudiesManager.tsx`) ya permite activar/desactivar y marcar destacados, pero le falta: estadisticas, filtros por estado, switches visuales (usa botones), y campo de orden.

## Cambios Planificados

### 1. Base de datos
- Agregar columna `display_order INT DEFAULT 0` a la tabla `case_studies`
- Crear indice para optimizar ordenamiento
- Los datos existentes no se pierden

### 2. Web publica - Eliminar limite de 6
- **CaseStudies.tsx**: Eliminar `.slice(0, 6)`, ordenar por `display_order`
- **useCaseStudies.tsx**: Agregar ordenamiento por `display_order` en la query
- **CaseStudiesCompact.tsx**: Mantener limite de 3 (es la version compacta para landing)

### 3. Admin - Panel mejorado
Redisenar `CaseStudiesManager.tsx` con:

- **Barra de estadisticas**: Total / Activos / Inactivos / Destacados (4 tarjetas)
- **Filtros por pestanas**: Todos | Activos | Inactivos
- **Switches visuales**: Usar componente `Switch` de Radix para activar/desactivar y marcar destacados de forma instantanea (en vez de botones)
- **Campo display_order**: Input numerico en cada caso y en el formulario de edicion
- **Badges de estado**: Verde "Activo" / Gris "Inactivo" visualmente claros
- **Tabla mejorada**: Mostrar orden, titulo, sector, ano, estado y destacado en formato mas compacto

### 4. Orden de visualizacion en web publica
La query publica ordenara por:
1. `is_featured` DESC (destacados primero)
2. `display_order` ASC (orden personalizado)
3. `year` DESC (mas recientes)

---

## Detalle Tecnico

### Migracion SQL
```text
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_case_studies_display_order ON case_studies(display_order);
```

### Archivos a modificar
1. `src/components/CaseStudies.tsx` - Eliminar slice(0,6), usar display_order
2. `src/hooks/useCaseStudies.tsx` - Agregar display_order al ordenamiento
3. `src/components/admin/CaseStudiesManager.tsx` - Redisenar con stats, filtros, switches, campo orden
4. No se tocan las RLS policies (ya estan correctas)

### Archivos que NO se modifican
- `CaseStudiesCompact.tsx` - Mantiene su limite de 3 (correcto para landing)
- `DetailedCaseStudies.tsx` - Componente separado
- Ninguna tabla se elimina ni se pierden datos
