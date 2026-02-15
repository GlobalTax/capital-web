

## Restaurar el logo de Capittal en toda la web

### Problema
El logo no se muestra porque la URL de Supabase Storage devuelve 404. El usuario ha subido dos versiones PNG del logotipo.

### Cambios

**1. Copiar el logo al repositorio**
- Copiar `user-uploads://Logo_Capittal.png` a `src/assets/logotipo.png` (version principal, alta resolucion)
- Copiar `user-uploads://Logo_Capittal_450x450.png` a `src/assets/logotipo-small.png` (version compacta para headers)

**2. Actualizar `src/config/brand.ts`**
- Reemplazar la URL de Supabase por un import local del PNG
- Exportar la imagen importada como constante

```ts
import logotipo from '@/assets/logotipo.png';

export const CAPITTAL_LOGO_SVG = logotipo;
export const CAPITTAL_LOGO_ALT = 'Capittal - Especialistas en M&A';
```

**3. Actualizar templates de email HTML** (`reengagementTemplates.ts`, `send-corporate-email`)
- Estas plantillas usan la URL directa en strings HTML (no imports de React), por lo que no pueden usar imports de assets locales
- Se mantendran con un fallback de texto "Capittal" en negrita, ya que los emails necesitan URLs publicas absolutas y la de Supabase no funciona

### Resultado
- Todos los componentes React (Header, LandingHeaderMinimal, BookingPage, LeadMagnetLandingPage, presentaciones) mostraran el logo automaticamente via `brand.ts`
- Los emails usaran texto estilizado como fallback seguro

