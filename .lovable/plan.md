

## Actualizar CORS headers en send-professional-valuation-email

### Cambio
Actualizar la linea 12 del archivo `supabase/functions/send-professional-valuation-email/index.ts` para incluir los headers estandar de Supabase que previenen bloqueos de preflight.

### Antes
```
"Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
```

### Despues
```
"Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version"
```

### Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/send-professional-valuation-email/index.ts` | Linea 12: ampliar `Access-Control-Allow-Headers` |

Cambio minimo de una sola linea. Sin impacto funcional mas alla de evitar posibles bloqueos CORS con versiones recientes del SDK de Supabase.

