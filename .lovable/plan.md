

## Plan: Usar el idioma elegido por el usuario para rod_list_members

### Problema
En la línea 264, el upsert a `rod_list_members` usa `selectedROD.language` (el idioma del documento servido tras fallbacks) en vez de `requestData.language` (lo que el usuario eligió en el formulario). Si el usuario pide EN pero solo hay PDF en ES, se le añade a la lista equivocada.

### Cambio

**Archivo: `supabase/functions/generate-rod-document/index.ts`** (línea 264)

Cambiar:
```typescript
const rodLanguage = selectedROD.language || 'es';
```
Por:
```typescript
const rodLanguage = requestData.language || selectedROD.language || 'es';
```

Esto prioriza el idioma que el usuario seleccionó en el formulario de descarga. Si descargó en inglés → lista EN. Si en castellano → lista ES.

Además, añadir el campo `phone` al upsert para no perder esa información:
```typescript
phone: requestData.phone || null,
```

### Despliegue
Re-deploy de la edge function `generate-rod-document`.

