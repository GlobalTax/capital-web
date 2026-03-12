

## Sistema de importación Excel mejorado con plantilla

### Situación actual

La tabla `outbound_list_companies` tiene: empresa, contacto, email, telefono, cif, web, provincia, facturacion, ebitda, anios_datos, notas.

Faltan 3 campos que necesitas: `num_trabajadores`, `director_ejecutivo`, `linkedin`.

El importador actual ya funciona con drag & drop + auto-mapeo, pero no tiene plantilla descargable ni los nuevos campos.

### Cambios

#### 1. Migración SQL — 3 columnas nuevas

```sql
ALTER TABLE outbound_list_companies 
  ADD COLUMN num_trabajadores INTEGER,
  ADD COLUMN director_ejecutivo TEXT,
  ADD COLUMN linkedin TEXT;
```

#### 2. Hook (`useContactLists.ts`)

Añadir `num_trabajadores`, `director_ejecutivo` y `linkedin` al tipo `ContactListCompany`.

#### 3. Página de detalle (`ContactListDetailPage.tsx`)

- **Botón "Descargar plantilla"** junto al botón de importar: genera un .xlsx vacío con las cabeceras exactas: `Nombre empresa`, `CIF`, `Año datos`, `Facturación`, `EBITDA`, `Nº Trabajadores`, `Director Ejecutivo`, `Nombre Contacto`, `Email`, `LinkedIn`, `Teléfono`.
- **Sinónimos de mapeo**: añadir los nuevos campos (`num_trabajadores`, `director_ejecutivo`, `linkedin`) al diccionario `COLUMN_SYNONYMS`.
- **Import handler**: mapear los nuevos campos al insertar.
- **Tabla, formulario manual, modal edición y drawer**: mostrar los nuevos campos donde corresponda.
- **Exportación Excel**: incluir los nuevos campos.

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| Nueva migración SQL | 3 columnas nuevas |
| `src/hooks/useContactLists.ts` | Tipo actualizado |
| `src/pages/admin/ContactListDetailPage.tsx` | Plantilla, sinónimos, formularios, tabla |

