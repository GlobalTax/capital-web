

## Asegurar el logo de Capittal en todos los headers

### Problema
Los headers (`Header.tsx` y `LandingHeaderMinimal.tsx`) muestran solo texto "Capittal" en lugar de la imagen del logotipo real. El logo SVG existe en Supabase Storage y ya se usa en otros componentes como `BookingPage`.

Adicionalmente, el badge "Edit in Lovable" puede estar apareciendo en la esquina -- esto se desactiva manualmente desde Project Settings.

### Cambios

**1. `LandingHeaderMinimal.tsx`** -- Reemplazar el texto por la imagen del logo
- Cambiar el `<span>Capittal</span>` por un `<img>` apuntando al SVG de Supabase Storage
- URL: `https://fwhqtzkkvnjkazhaficj.supabase.co/storage/v1/object/public/public-assets/logotipo.svg`
- Mantener fallback con `alt="Capittal"` y dimensiones explícitas (`h-8`)

**2. `Header.tsx`** -- Hacer lo mismo en el header principal
- Reemplazar `<span className="text-2xl font-bold text-black">Capittal</span>` por la imagen del logo
- Mantener el `<Link>` envolvente para navegación

**3. `LeadMagnetLandingPage.tsx`** -- Ya usa una imagen (`.png`), se puede unificar al SVG por consistencia (opcional)

### Detalle tecnico

```
Logo SVG: https://fwhqtzkkvnjkazhaficj.supabase.co/storage/v1/object/public/public-assets/logotipo.svg

Componentes a modificar:
- src/components/landing/LandingHeaderMinimal.tsx (linea 11)
- src/components/Header.tsx (linea 23)
```

Ambos cambios son identicos: sustituir el `<span>` de texto por:
```html
<img 
  src="https://fwhqtzkkvnjkazhaficj.supabase.co/storage/v1/object/public/public-assets/logotipo.svg"
  alt="Capittal - Especialistas en M&A"
  className="h-8"
  width={120}
  height={32}
/>
```

### Sobre el badge de Lovable
El badge "Edit in Lovable" que aparece en la esquina se desactiva desde **Project Settings** (icono de engranaje) activando la opcion **"Hide 'Lovable' Badge"**. Esto no requiere cambios de codigo.

