

## Plan: Añadir email y teléfono a la ficha de empresa

La tabla `dealsuite_empresas` no tiene campos de email ni telefono. Se añadiran a nivel de base de datos y se hara editable en la ficha.

### 1. Migracion SQL

Añadir dos columnas a `dealsuite_empresas`:
- `email TEXT` (nullable)
- `telefono TEXT` (nullable)

### 2. Actualizar tipo TypeScript

En `src/hooks/useDealsuiteEmpresas.ts`, añadir `email` y `telefono` a la interfaz `DealsuiteEmpresa`.

### 3. Actualizar la ficha de empresa

En `src/components/admin/DealsuiteEmpresaCard.tsx`:

**Modo edicion**: Añadir dos inputs (email y telefono) en el formulario, junto a los campos existentes de sitio web/imagen.

**Modo lectura**: Mostrar email y telefono debajo de la info basica (ubicacion, tipo), con iconos de Mail y Phone y links clickables (mailto: y tel:).

### Archivos a modificar

- Migracion SQL (nueva)
- `src/hooks/useDealsuiteEmpresas.ts` (interfaz DealsuiteEmpresa)
- `src/components/admin/DealsuiteEmpresaCard.tsx` (formulario + vista lectura)
