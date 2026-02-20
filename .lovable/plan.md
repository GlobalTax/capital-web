
# Arreglar descarga de documentos en Perfil de Empresa (OperationDocumentsPanel)

## Diagnóstico exacto del problema

Analizando el código y la base de datos, hay **dos causas raíz** combinadas:

### Causa 1: RLS policy de storage demasiado restrictiva (problema principal)

El bucket `operation-documents` es **privado** y tiene estas policies en `storage.objects`:

```
SELECT: (bucket_id = 'operation-documents') AND is_user_admin(auth.uid())
INSERT: (bucket_id = 'operation-documents') AND is_user_admin(auth.uid())
DELETE: (bucket_id = 'operation-documents') AND is_user_admin(auth.uid())
UPDATE: (bucket_id = 'operation-documents') AND is_user_admin(auth.uid())
```

La función `is_user_admin(auth.uid())` llama a `check_is_admin(check_user_id)` que busca en `admin_users`. Esto significa que **solo los super_admin/admin/editor/viewer del panel pueden acceder**. Aunque el usuario esté autenticado y sea admin, el problema está en que `is_user_admin` recibe `auth.uid()` pero la función espera `check_user_id uuid`. Si hay cualquier issue con el contexto de la llamada desde storage, falla silenciosamente.

La query confirma que **hay 0 documentos en `operation_documents`** (tabla BD vacía) y **0 objetos en el bucket `operation-documents`** — lo que significa que la subida también está fallando, o la feature es relativamente nueva y no se han subido archivos reales aún con el sistema actual.

### Causa 2: `downloadMutation` busca en `documents` (state local) que puede ser undefined

En `useOperationDocuments.ts`, línea 139:
```typescript
const document = documents?.find(d => d.id === documentId);
if (!document) throw new Error('Documento no encontrado');
```

La mutación accede a `documents` (el estado del `useQuery`), pero si hay una condición de carrera o el cache se invalida antes de que se ejecute la mutación, `documents` puede ser `undefined` o vacío, causando el error "Documento no encontrado".

### Causa 3: El `download_count` no se incrementa en la DB

El `downloadMutation` registra en `operation_document_downloads` pero nunca actualiza `download_count` en `operation_documents`. Esto es menor pero incompleto.

### Contexto adicional
- El bucket existe y es privado (confirmado)
- Las policies usan `is_user_admin(auth.uid())` — la función existe en `public` schema y acepta `uuid`
- El `createSignedUrl` debería funcionar para admins, pero si `documents` state es undefined la mutación falla antes de llegar al storage call
- El error "Error al descargar el archivo" proviene del `onError` del `downloadMutation`

## Solución

### 1. Migración SQL — Añadir policy SELECT para `operation_document_downloads` y arreglar storage policy

La policy de storage actual es correcta para admins pero necesitamos asegurarnos de que la función `is_user_admin` se ejecuta correctamente en el contexto de storage. Añadimos también una policy más robusta que incluya a todos los usuarios autenticados que sean admin (usando `admin_users` directamente en lugar de la función wrapper).

```sql
-- Reemplazar las policies de storage con versión más robusta
DROP POLICY IF EXISTS "Admins view operation documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins upload operation documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete operation documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins update operation documents" ON storage.objects;

-- Nueva policy unificada usando JOIN directo (más robusta)
CREATE POLICY "Admin users can manage operation documents"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'operation-documents'
  AND EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
    AND admin_users.role IN ('super_admin', 'admin', 'editor', 'viewer')
  )
)
WITH CHECK (
  bucket_id = 'operation-documents'
  AND EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
    AND admin_users.role IN ('super_admin', 'admin', 'editor', 'viewer')
  )
);
```

### 2. Arreglar `useOperationDocuments.ts` — `downloadMutation`

El problema clave: la mutación accede a `documents` del closure, que puede no estar disponible. La solución es hacer un fetch del documento directamente desde la BD en el `mutationFn`, garantizando que siempre tenemos datos frescos. También añadimos logs exhaustivos y actualizamos `download_count`.

**Cambios en `downloadMutation` (líneas 137-182):**

```typescript
const downloadMutation = useMutation({
  mutationFn: async (documentId: string) => {
    console.group('[DOWNLOAD_DOCUMENT] Starting...');
    console.log('Document ID:', documentId);
    console.log('Documents in cache:', documents?.length);

    // Primero intentar desde cache, luego hacer fetch directo
    let document = documents?.find(d => d.id === documentId);
    
    if (!document) {
      console.log('[DOWNLOAD_DOCUMENT] Not in cache, fetching from DB...');
      const { data, error: fetchError } = await supabase
        .from('operation_documents')
        .select('*')
        .eq('id', documentId)
        .single();
      
      if (fetchError) {
        console.error('[DOWNLOAD_DOCUMENT] DB fetch error:', fetchError);
        throw new Error(`Documento no encontrado: ${fetchError.message}`);
      }
      document = data as OperationDocument;
    }
    
    console.log('[DOWNLOAD_DOCUMENT] Document:', document.file_name);
    console.log('[DOWNLOAD_DOCUMENT] File path:', document.file_path);
    console.log('[DOWNLOAD_DOCUMENT] File type:', document.file_type);

    if (!document.file_path) {
      throw new Error('El documento no tiene ruta de archivo (file_path vacío)');
    }

    // Intentar descarga directa primero (más eficiente)
    console.log('[DOWNLOAD_DOCUMENT] Attempting direct download...');
    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from('operation-documents')
      .download(document.file_path);

    if (downloadError) {
      console.warn('[DOWNLOAD_DOCUMENT] Direct download failed:', downloadError.message);
      // Fallback: signed URL
      console.log('[DOWNLOAD_DOCUMENT] Trying signed URL fallback...');
      const { data: signedData, error: signedError } = await supabase.storage
        .from('operation-documents')
        .createSignedUrl(document.file_path, 120);

      if (signedError || !signedData) {
        console.error('[DOWNLOAD_DOCUMENT] Signed URL failed:', signedError);
        throw new Error(`Error de acceso al archivo: ${signedError?.message || 'Sin URL firmada'}`);
      }

      console.log('[DOWNLOAD_DOCUMENT] Signed URL obtained, fetching blob...');
      const response = await fetch(signedData.signedUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const blob = await response.blob();
      triggerDownload(blob, document.file_name);
    } else {
      console.log('[DOWNLOAD_DOCUMENT] Direct download succeeded');
      triggerDownload(fileBlob, document.file_name);
    }

    // Log download in audit table
    const { data: user } = await supabase.auth.getUser();
    await supabase.from('operation_document_downloads').insert({
      document_id: documentId,
      downloaded_by: user.user?.id,
    });

    // Increment download_count
    await supabase
      .from('operation_documents')
      .update({ download_count: (document.download_count || 0) + 1 })
      .eq('id', documentId);

    console.log('[DOWNLOAD_DOCUMENT] Complete');
    console.groupEnd();
    
    return { fileName: document.file_name };
  },
  onSuccess: ({ fileName }) => {
    queryClient.invalidateQueries({ queryKey: [DOCUMENTS_QUERY_KEY, operationId] });
    toast({
      title: 'Descarga iniciada',
      description: `Descargando ${fileName}`,
    });
  },
  onError: (error: Error) => {
    console.error('[DOWNLOAD_DOCUMENT] Final error:', error);
    toast({
      title: 'Error al descargar documento',
      description: error.message,
      variant: 'destructive',
    });
  },
});
```

**Nueva helper function `triggerDownload`** (añadir fuera del hook, nivel de módulo):

```typescript
function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
```

**También arreglar `getPreviewUrl`** — mismo patrón: buscar en cache o fetch desde DB:
```typescript
const getPreviewUrl = async (documentId: string): Promise<string | null> => {
  let doc = documents?.find(d => d.id === documentId);
  
  if (!doc) {
    const { data } = await supabase
      .from('operation_documents')
      .select('file_path')
      .eq('id', documentId)
      .single();
    if (!data) return null;
    doc = data as OperationDocument;
  }

  const { data, error } = await supabase.storage
    .from('operation-documents')
    .createSignedUrl(doc.file_path, 300);

  if (error) {
    console.error('[PREVIEW_URL] Error:', error);
    return null;
  }
  return data.signedUrl;
};
```

## Archivos a modificar

1. **`supabase/migrations/TIMESTAMP_fix_operation_documents_storage_policy.sql`** — Migración que reemplaza las 4 policies separadas de storage por una policy `FOR ALL` con JOIN directo a `admin_users` (más robusta, mismo acceso)

2. **`src/features/operations-management/hooks/useOperationDocuments.ts`** — 
   - Añadir `triggerDownload` helper al nivel de módulo
   - Refactorizar `downloadMutation.mutationFn` con fetch directo + fallback a signed URL + logs
   - Refactorizar `getPreviewUrl` para no depender del estado local del cache

## Lo que NO cambia
- `uploadMutation` — la lógica de subida está correcta
- `updateMutation`, `deleteMutation` — correctos
- `OperationDocumentsPanel`, `DocumentCard`, `DocumentsGallery`, `DocumentViewer` — sin cambios de UI
- Tipos en `documents.ts` — sin cambios
- Permisos de acceso — solo admins pueden descargar (correcto para documentos de operaciones M&A)
