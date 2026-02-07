

## Plan: Dealsuite por captura de imagen

Reemplazar el sistema actual de scraping con cookies por un flujo simple: **subir captura de pantalla de un deal de Dealsuite y extraer los datos con IA (vision)**.

### Flujo del usuario

1. El usuario hace una captura de pantalla de un deal en Dealsuite (como la imagen que has compartido)
2. Arrastra/sube la imagen en el panel de Dealsuite
3. La IA analiza la imagen y extrae todos los campos visibles
4. Los datos se guardan en la tabla `dealsuite_deals`
5. El usuario puede revisar y editar antes de guardar

### Campos a extraer de la imagen

De la captura que has compartido, se extraerian estos campos:

| Campo | Ejemplo |
|---|---|
| title | Sustainability and Energy Efficiency Consulting Platform |
| sector | Management Consulting, IT Consulting |
| country/location | DACH, France, Spain |
| revenue_min / revenue_max | 3.000.000 / 20.000.000 |
| deal_type | Complete Sale (100%), Majority Stake (>50%) |
| advisor | Eduardo Gonzalez-Gallarza, CDI Global Iberia |
| description | Descripcion completa del deal |
| published_at | Active 6 February 2026 |
| reference | ESG |
| customer_types | B2B |
| contact_email | Eduardo.gonzalez-gallarza@cdiglobal.com |

### Cambios en base de datos

Ampliar la tabla `dealsuite_deals` con nuevos campos para la informacion adicional visible en los deals:

```sql
ALTER TABLE dealsuite_deals
  ADD COLUMN IF NOT EXISTS stake_offered TEXT,
  ADD COLUMN IF NOT EXISTS customer_types TEXT,
  ADD COLUMN IF NOT EXISTS reference TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS contact_name TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_company TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT;
```

### Nueva Edge Function: `dealsuite-extract-image`

- Recibe la imagen en base64 desde el frontend
- Sube la imagen a un bucket de Supabase Storage (`dealsuite-images`)
- Llama a Lovable AI (Gemini 2.5 Flash, que soporta vision) con la imagen
- Extrae los datos estructurados usando tool calling
- Hace upsert en `dealsuite_deals`
- Devuelve los datos extraidos para preview

### UI: Nuevo panel en DealsuiteSyncPanel

Reemplazar el formulario de cookie actual con:

1. **Zona de drop/upload de imagen**: Drag & drop o click para subir captura
2. **Preview de imagen**: Muestra la captura subida
3. **Boton "Extraer datos"**: Llama a la edge function
4. **Preview de datos extraidos**: Tabla editable con los campos extraidos antes de confirmar
5. **Boton "Guardar deal"**: Confirma y guarda en BD
6. Mantener la tabla de deals existentes abajo

### Archivos a crear/modificar

| Archivo | Accion |
|---|---|
| `supabase/functions/dealsuite-extract-image/index.ts` | Crear: Edge function con vision AI |
| `supabase/config.toml` | Anadir entrada para la nueva funcion |
| `src/components/admin/DealsuiteSyncPanel.tsx` | Reescribir: Reemplazar formulario de cookie por upload de imagen + preview de datos |
| `src/hooks/useDealsuitDeals.ts` | Actualizar: Anadir campos nuevos al tipo |
| Migracion SQL | Ampliar tabla con columnas nuevas + crear bucket storage |

### Notas tecnicas

- Se usa `google/gemini-2.5-flash` via Lovable AI Gateway (soporta imagenes y es rapido/barato)
- La imagen se sube a Supabase Storage para tener referencia persistente
- Se mantiene la tabla de deals existente y sus datos
- El sistema antiguo de scraping con cookies se elimina del UI pero se puede mantener la edge function por si se necesita en el futuro
