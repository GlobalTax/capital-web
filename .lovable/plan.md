

## Corregir imagen del Hero: eliminar hardcode del primer slide

### Problema

En `src/components/Hero.tsx` (linea 202), hay una condicion hardcodeada que fuerza la primera diapositiva a usar siempre `/hero-slide-1.jpg`, ignorando la imagen configurada en la base de datos:

```text
src={currentSlide === 0 ? '/hero-slide-1.jpg' : slide.image}
```

La base de datos tiene configurada una imagen diferente para el slide 1:
`https://fwhqtzkkvnjkazhaficj.supabase.co/storage/v1/object/public/hero-images/hero_1770583284440.jpg`

Esto tambien causa el warning del navegador: "The resource /hero-slide-1.jpg was preloaded but not used".

### Solucion

**Archivo: `src/components/Hero.tsx`**

Cambiar la linea 202 de:
```text
src={currentSlide === 0 ? '/hero-slide-1.jpg' : slide.image}
```

A simplemente:
```text
src={slide.image}
```

Esto hara que todas las diapositivas usen la imagen configurada desde el admin (`hero_slides.image_url`), que es el comportamiento esperado del sistema dinamico.

### Impacto

- El Hero mostrara la imagen correcta configurada desde el panel de administracion
- Se elimina el warning de preload en consola
- El sistema de gestion de Hero Slides funciona como fue disenado originalmente

| Archivo | Cambio |
|---|---|
| `src/components/Hero.tsx` | Linea 202: eliminar condicion hardcodeada, usar `slide.image` directamente |

