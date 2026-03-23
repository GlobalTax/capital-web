

## Fix: Descarga y previsualización de Estudios de Mercado + Build error

### Problemas identificados

1. **Build error**: `main.tsx` y `App.tsx` tienen atributos `data-lov-id` duplicados (artefacto del tagger). Se necesita un touch mínimo para forzar re-compilación limpia.

2. **Descarga no funciona**: `handleDownload` usa `getSignedUrl` + `<a download>`, pero las signed URLs de Supabase no respetan el atributo `download` del navegador (CORS/cross-origin). Hay que usar `getFileBlob` que descarga el archivo como blob vía la edge function con `Content-Disposition: attachment`.

3. **Previsualización**: `getSignedUrl` funciona para PDFs (se abre en nueva pestaña). Para PPT/PPTX no se puede previsualizar en el navegador, hay que mostrar un mensaje al usuario.

### Cambios

**`src/hooks/useMarketStudies.ts`** — Ajustar `getFileBlob` para que devuelva un blob real (actualmente `supabase.functions.invoke` parsea la respuesta como JSON por defecto; hay que usar `responseType: 'blob'` o hacer fetch directo).

Reemplazar `getFileBlob` por un fetch directo a la edge function con el header de auth, para recibir el blob binario correctamente:

```ts
const getFileBlob = async (storagePath: string, fileName?: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('No hay sesión activa');

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const response = await fetch(`${supabaseUrl}/functions/v1/upload-campaign-presentation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      action: 'download_blob',
      bucket: 'market-studies',
      path: storagePath,
      fileName,
    }),
  });

  if (!response.ok) throw new Error('Error al descargar el archivo');
  return await response.blob();
};
```

**`src/components/admin/campanas-valoracion/MarketStudiesPanel.tsx`**

1. **`handleDownload`**: Usar `getFileBlob` en vez de `getSignedUrl`. Crear blob URL, descargar con `<a>`, y revocar:
```ts
const blob = await getFileBlob(study.storage_path, study.file_name);
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = study.file_name;
a.click();
URL.revokeObjectURL(url);
```

2. **`handlePreview`**: Para PDFs, usar `getFileBlob` → blob URL → `window.open()` (el navegador mostrará el visor PDF). Para PPT/PPTX, mostrar toast informando que no se puede previsualizar y ofrecer descarga directa:
```ts
const ext = study.file_name.split('.').pop()?.toLowerCase();
if (ext === 'ppt' || ext === 'pptx') {
  toast({ title: 'Los archivos PPT no se pueden previsualizar', description: 'Usa el botón Descargar.' });
  return;
}
const blob = await getFileBlob(study.storage_path, study.file_name);
const url = URL.createObjectURL(blob);
window.open(url, '_blank');
```

3. **Icono diferenciado**: Mostrar icono `FileText` para PDFs y un icono distinto (como `Presentation`) para PPT/PPTX en las tarjetas.

**`src/main.tsx`** y **`src/App.tsx`** — Touch mínimo (añadir/quitar espacio en blanco) para forzar re-compilación y resolver el error de `data-lov-id` duplicados.

### Resultado
- **Descargar**: Funciona para PDF y PPT, fuerza descarga real al equipo.
- **Previsualizar**: PDFs se abren en el visor del navegador. PPT muestra toast indicando que hay que descargar.
- **Subir**: Ya acepta `.pdf`, `.ppt`, `.pptx` (el `accept` del input ya lo tiene).

