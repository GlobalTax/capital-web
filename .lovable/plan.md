

## Diagnostico

Las llamadas `createSignedUrl` y `remove` sobre el bucket `campaign-presentations` se hacen directamente con el cliente Supabase (anon key), lo que activa las mismas politicas RLS que ya bloqueaban los uploads. El error en red es:

```
POST .../storage/v1/object/sign/campaign-presentations/...
Status: 400 → "new row violates row-level security policy"
```

Esto afecta a **3 operaciones** en `ProcessSendStep.tsx`:
1. `StudyPdfViewerModal` (previsualizar estudio) — linea 235
2. `downloadStudy` (descargar estudio) — linea 627
3. `remove` en `useCampaignPresentations.ts` — linea 267

La solucion es la misma que funciono para uploads: usar una Edge Function con `service_role`.

## Plan

### 1. Ampliar la Edge Function existente

Extender `upload-campaign-presentation` (o crear una nueva `campaign-presentation-ops`) para soportar dos operaciones adicionales:

- **`sign`**: Recibe `path` por JSON, devuelve `signedUrl` generada con `service_role`
- **`delete`**: Recibe `path` por JSON, elimina el archivo con `service_role`

La operacion se determina por un campo `action` en el body (`upload` | `sign` | `delete`). El upload sigue usando FormData; sign y delete usan JSON.

### 2. Crear helper en el cliente

Añadir a `campaignPresentationStorage.ts`:

- `safeCreateSignedUrl(path)`: invoca la Edge Function con `action: 'sign'`, devuelve la URL firmada
- `safeStorageDelete(path)`: invoca la Edge Function con `action: 'delete'`

### 3. Reemplazar llamadas directas

- `ProcessSendStep.tsx` linea 235: usar `safeCreateSignedUrl` en vez de `supabase.storage.from(...).createSignedUrl(...)`
- `ProcessSendStep.tsx` linea 627: idem
- `useCampaignPresentations.ts` linea 267: usar `safeStorageDelete` en vez de `supabase.storage.from(...).remove(...)`

### Archivos afectados
- `supabase/functions/upload-campaign-presentation/index.ts` (ampliar con sign/delete)
- `src/utils/campaignPresentationStorage.ts` (nuevos helpers)
- `src/components/admin/campanas-valoracion/steps/ProcessSendStep.tsx` (2 reemplazos)
- `src/hooks/useCampaignPresentations.ts` (1 reemplazo)

