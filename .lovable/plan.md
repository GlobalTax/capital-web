

## Plan: Imagen ampliable, notas y base de datos de contactos

Tres mejoras solicitadas:

### 1. Imagen ampliable a pantalla completa

Actualmente la imagen del sidebar se muestra en un tamano fijo (`max-h-[200px]`). Se anadira un **Dialog/modal** que al hacer clic en la imagen la muestre a tamano completo.

**Cambios en `DealsuitePreviewCard.tsx`:**
- Importar `Dialog`, `DialogContent`, `DialogTrigger` de shadcn/ui
- Envolver la imagen del sidebar en un `DialogTrigger` con `cursor-zoom-in`
- El `DialogContent` mostrara la imagen a tamano completo (`max-w-4xl`, `max-h-[90vh]`, `object-contain`)

### 2. Seccion de notas en la ficha del deal

Anadir un area de notas internas debajo de la descripcion en la ficha del deal. Las notas se guardaran en la columna `raw_data` (JSONB) del deal, usando una clave `notes` dentro de ese JSON, evitando crear una tabla separada para algo tan sencillo.

**Cambios en `DealsuitePreviewCard.tsx`:**
- Anadir una nueva seccion "Notas" debajo de "Descripcion" con un textarea
- Nueva prop `notes` (string) y `onNotesChange` (callback)

**Cambios en `DealsuiteSyncPanel.tsx`:**
- Al guardar el deal, incluir las notas en `raw_data: { notes: "..." }`
- Al abrir un deal existente, leer `deal.raw_data?.notes` y pasarlo como prop

### 3. Base de datos de contactos Dealsuite

Crear una nueva tabla `dealsuite_contacts` para almacenar los contactos extraidos de los deals, con deduplicacion por email.

**Nueva tabla SQL:**
```sql
CREATE TABLE dealsuite_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  empresa TEXT,
  email TEXT UNIQUE,
  telefono TEXT,
  deal_ids TEXT[] DEFAULT '{}',
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Logica de guardado:**
- Al guardar un deal con `contact_name`/`contact_email`/`contact_company`, hacer un upsert automatico en `dealsuite_contacts`
- Si el email ya existe, anadir el `deal_id` al array `deal_ids`

### 4. Traduccion a castellano

Cambiar todas las etiquetas en ingles del `DealsuitePreviewCard` a castellano:
- "Details" -> "Detalles"
- "Sector" -> "Sector" (igual)
- "Country" -> "Pais"
- "Location" -> "Ubicacion"
- "Revenue" -> "Facturacion"
- "Stake offered" -> "Participacion ofrecida"
- "Customer types" -> "Tipo de clientes"
- "Reference" -> "Referencia"
- "Description" -> "Descripcion"
- "Contact" -> "Contacto"
- "Status" -> "Estado"
- "Active" -> "Activo"
- "Original screenshot" -> "Captura original"
- "Name" -> "Nombre"
- "Company" -> "Empresa"
- Placeholders tambien en castellano

### Archivos a modificar

- **`DealsuitePreviewCard.tsx`**: Modal de imagen, seccion de notas, traduccion a castellano
- **`DealsuiteSyncPanel.tsx`**: Logica de notas (leer/guardar en raw_data), upsert en dealsuite_contacts al guardar
- **Migracion SQL**: Crear tabla `dealsuite_contacts` con RLS

