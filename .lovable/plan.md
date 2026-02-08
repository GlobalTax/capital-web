

## Montaje de fotos del equipo en el Hero

### Que se hara

Anadir un **avatar stack** (fotos del equipo superpuestas) en el lado derecho del Hero, debajo o junto al contenido actual. Se usaran las fotos reales de los 10 miembros del equipo desde la tabla `team_members`.

### Diseno visual

Un grupo de avatares circulares superpuestos (overlapping), estilo "avatar stack", con:
- Fotos circulares de ~48px (desktop) / ~36px (movil)
- Superpuestas con `-ml-3` (margen negativo) para solaparse
- Borde blanco de 2px alrededor de cada foto (`ring-2 ring-white`)
- Un texto acompanante: **"+60 profesionales a tu servicio"**
- Ubicado debajo de los Service Pills y encima de los CTAs

### Layout resultante

```text
[Titulo serif grande]
[Subtitulo descriptivo]
[Pill 1] · [Pill 2] · [Pill 3]
[Avatar stack: 8 fotos solapadas] + "60 profesionales"   <-- NUEVO
[CTA Contactar] [CTA Valorar]
```

### Detalle tecnico

**Archivo a modificar**: `src/components/Hero.tsx`

1. Importar `useTeamMembers` desde `@/hooks/useTeamMembers`
2. Importar `Avatar`, `AvatarImage`, `AvatarFallback` desde `@/components/ui/avatar`
3. En el componente, llamar al hook para obtener las fotos
4. Insertar entre los Service Pills (linea 180) y los CTAs (linea 182) un nuevo bloque:
   - Un `div` con `flex items-center gap-3`
   - Dentro, un `div` con `flex -space-x-3` que renderiza los primeros 8 avatares
   - Cada avatar usa el componente `Avatar` con tamano `h-10 w-10` y `ring-2 ring-white`
   - Al final, un `span` con el texto "+60 profesionales"
5. Si no hay fotos cargadas, no se muestra nada (render condicional)

### Datos

Se mostraran los primeros 8 miembros (de los 10 disponibles) para mantener el stack compacto. Las fotos ya estan almacenadas en Supabase Storage y se cargan via URL.

