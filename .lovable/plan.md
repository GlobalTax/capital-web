

## Nueva sección "Estudios de Mercado" en Campañas Outbound

### Qué se construye
Una nueva pestaña en la página de campañas outbound (`/admin/campanas-valoracion`) para subir, listar y descargar PDFs de estudios de mercado. Funciona como un repositorio simple de archivos organizado por sector.

### Cambios en base de datos

**1. Bucket de Storage `market-studies`** (público para lectura con signed URLs)

**2. Tabla `market_studies`**
- `id` (uuid, PK)
- `title` (text, nombre del estudio)
- `sector` (text, nullable — para agrupar por sector)
- `description` (text, nullable)
- `file_name` (text — nombre original del archivo)
- `storage_path` (text — ruta en el bucket)
- `file_size` (bigint)
- `uploaded_by` (uuid, ref auth.users)
- `created_at`, `updated_at`
- RLS: solo usuarios autenticados pueden CRUD

### Cambios en frontend

**3. Nueva pestaña en `CampanasValoracion.tsx`**
- Añadir `'market-studies'` al tipo de `activeTab`
- Nueva pestaña con icono `BookOpen` y texto "Estudios de Mercado"
- Cuando está activa, renderizar el nuevo componente `MarketStudiesPanel`

**4. Componente `MarketStudiesPanel`**
- Grid de cards con los estudios subidos (título, sector, fecha, tamaño)
- Botón "Subir Estudio" que abre un diálogo con: título, sector (select), descripción, file input (solo PDF)
- Cada card tiene acciones: descargar (signed URL) y eliminar
- Filtro por sector y búsqueda por título
- Usa el patrón existente de `campaign-presentations` para upload/download via edge function o directamente al bucket

**5. Hook `useMarketStudies`**
- Queries: listar todos los estudios
- Mutations: subir (upload a bucket + insert en tabla), eliminar (delete de bucket + delete de tabla)
- Signed URLs para descarga

### Archivos a crear/modificar
| Archivo | Cambio |
|---------|--------|
| `migration` | Crear bucket `market-studies` + tabla `market_studies` + RLS |
| `src/hooks/useMarketStudies.ts` | Hook con CRUD y storage |
| `src/components/admin/campanas-valoracion/MarketStudiesPanel.tsx` | Panel principal con grid + upload dialog |
| `src/pages/admin/CampanasValoracion.tsx` | Añadir tab "Estudios de Mercado" y renderizar panel |

