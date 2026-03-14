

## Problema

El Cloudflare Worker detecta `ahrefsbot` como bot y le sirve HTML pre-renderizado desde Supabase Edge Functions. Ese HTML no contiene el `<script>` de Ahrefs Analytics que está en `index.html`, por lo que la verificación falla.

## Solución

Eliminar `'ahrefsbot'` de la lista `BOT_UA_PATTERNS` en `cloudflare/worker-bot-prerender.js` (línea 19). Así el verificador de Ahrefs recibirá el SPA normal con el script estático en el `<head>`.

También eliminar `'semrushbot'` si se planea usar Semrush en el futuro (opcional).

### Archivo a modificar

- **`cloudflare/worker-bot-prerender.js`** — Eliminar `'ahrefsbot'` de la línea 19 del array `BOT_UA_PATTERNS`.

### Después de implementar

1. Desplegar el Worker actualizado en Cloudflare Dashboard.
2. Pulsar **Recheck installation** en Ahrefs.

