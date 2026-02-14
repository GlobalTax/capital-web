

## Corregir error de build en Edge Function

### Estado del Sidebar
El enlace "Calendario Editorial" **ya existe** en la seccion "CREAR CONTENIDO" con:
- Posicion: 1 (justo despues de "AI Content Studio")
- URL: `/admin/content-calendar`
- Icono y badge configurados

No se necesitan cambios en el sidebar.

### Error de Build a Corregir
La edge function `check-calculator-errors` tiene un error de importacion con el paquete `resend`. El import actual usa `npm:resend@2.0.0` que no es compatible con el entorno Deno del proyecto.

**Archivo**: `supabase/functions/check-calculator-errors/index.ts` (linea 3)

**Cambio**:
```typescript
// Antes:
import { Resend } from "npm:resend@2.0.0";

// Despues:
import { Resend } from "https://esm.sh/resend@2.0.0";
```

Esto cambia el import de `npm:` (que requiere configuracion adicional en Deno) a `esm.sh` (CDN compatible con Deno, consistente con el patron usado para `@supabase/supabase-js` en la misma funcion).

