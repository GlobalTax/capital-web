

## Plan: Conectar webhook de leads al descargar PDF

### Cambio en `src/pages/LandingCalculadoraAsesorias.tsx`

**1. Añadir constante WEBHOOK_URL** al inicio del archivo:
```typescript
const WEBHOOK_URL = 'TU_URL_WEBHOOK';
```

**2. Reemplazar `handleDownloaded`** (líneas 1462-1498): Añadir un `fetch` POST fire-and-forget con el payload especificado, envuelto en try-catch para no bloquear la descarga. Mantener el `console.log` existente y añadir `console.error` si falla.

El payload será plano con los campos exactos solicitados: `nombre`, `email`, `tel`, `empresa`, `ubicacion`, `servicios`, `empleados`, `facturacion`, `ebitda`, `margen`, `recurrencia`, `crecimiento`, `deuda`, `clientes`, `multiplo`, `ev_low`, `ev_high`, `ev_mid`, `equity`, `timestamp`, `source`.

### Detalle técnico
- El fetch se ejecuta con `.catch()` para no bloquear (fire-and-forget)
- Se loguea `[WEBHOOK_ERROR]` en consola si falla
- Se mantiene el log `[LEAD_CAPTURED]` existente
- Solo se modifica `src/pages/LandingCalculadoraAsesorias.tsx`

