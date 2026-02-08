

## Usar la imagen panoramica como fondo completo (sin mosaico)

### Problema

Las imagenes del equipo son panoramicas (1920x600), disenadas para verse como un banner completo. Intentar cortarlas en celdas pequenas de un grid siempre resulta en fotos irreconocibles, porque cada celda solo muestra un fragmento diminuto de una imagen enorme.

### Solucion

Cambiar la estrategia del mosaico: en lugar de dividir las fotos en un grid de celdas, mostrar una sola imagen panoramica del equipo como fondo completo (igual que los otros slides del hero usan una imagen de fondo). Si hay varias fotos de equipo, se pueden rotar/ciclar.

### Cambios

**Archivo**: `src/components/Hero.tsx`

1. **Reemplazar el bloque del mosaico** (lineas 158-188) por una imagen de fondo simple:
   - Tomar la primera foto del equipo (`teamMembers[0].image_url`)
   - Mostrarla como `<img>` con `absolute inset-0 w-full h-full object-cover object-center` (exactamente como hacen los otros slides)
   - Mantener el overlay oscuro encima para legibilidad del texto

2. **Codigo resultante** (reemplaza lineas 158-188):
```tsx
) : slide.isMosaic && teamMembers.length > 0 ? (
  <>
    <img
      src={teamMembers[0].image_url || ''}
      alt="Equipo"
      className="absolute inset-0 w-full h-full object-cover object-center"
    />
    <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/40" />
  </>
)
```

### Resultado esperado

- La imagen panoramica 1920x600 se muestra completa como fondo del hero
- Se ve exactamente como los otros slides (imagen + overlay + texto encima)
- Sin recorte excesivo: `object-cover` ajusta proporcionalmente
- Mucho mas simple y efectivo que el grid de celdas

