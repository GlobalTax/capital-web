

## Fix: Botones Ver y Descargar no reaccionan en Estudios de Mercado

### Diagnóstico

Los handlers `handleDownload` y `handlePreview` tienen un `catch` vacío con comentario "toast handled in hook", pero `getDownloadUrl` **no es una mutación** — es una función async normal que lanza errores sin mostrar toast. El error se traga silenciosamente.

Causa probable: `createSignedUrl` falla (permisos del bucket, path incorrecto, o bucket no público) y el `catch {}` oculta el error.

### Cambios

**`src/components/admin/campanas-valoracion/MarketStudiesPanel.tsx`**

1. Añadir toast de error en los `catch` de `handleDownload` y `handlePreview` para que el usuario vea qué falla:

```tsx
const handleDownload = async (study: MarketStudy) => {
  try {
    const url = await getDownloadUrl(study.storage_path, true);
    const a = document.createElement('a');
    a.href = url;
    a.download = study.file_name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err: any) {
    toast({ title: 'Error al descargar', description: err?.message || 'No se pudo obtener la URL', variant: 'destructive' });
  }
};
```

2. Lo mismo para `handlePreview`.

**`src/hooks/useMarketStudies.ts`** — Verificar que `getDownloadUrl` no tiene un bug lógico. La función actual se ve correcta, pero el parámetro `options` con `download` podría no estar pasándose bien a `createSignedUrl`. Revisar la firma: `createSignedUrl(path, expiresIn, options)` — el tercer parámetro acepta `{ download: string | boolean }`. La implementación actual es correcta.

### Posible causa raíz: Bucket no configurado

Si `createSignedUrl` devuelve error tipo "Bucket not found" o "Object not found", el problema es de Supabase Storage. Tras añadir los toasts de error, el usuario verá el mensaje exacto y podremos actuar.

### Resultado
- Los botones mostrarán un toast con el error específico si falla la obtención de URL.
- Si la URL se obtiene correctamente, la descarga y preview funcionarán como se espera.

