

## Corregir fotos cortadas por el pelo

### Problema
Las imagenes usan `object-cover` con posicion centrada por defecto, lo que recorta la parte superior de las fotos (cabeza/pelo) al ajustarlas al aspect-ratio cuadrado.

### Solucion
Anadir `object-top` a las imagenes de ambos tipos de tarjeta (PartnerCard y TeamMemberCard). Esto ancla la imagen a la parte superior del contenedor, asegurando que la cabeza siempre sea visible y el recorte se haga por la parte inferior (cuerpo), que es menos importante visualmente.

### Cambios en `src/components/Team.tsx`

**Linea 42 (PartnerCard):**
- Cambiar `object-cover` a `object-cover object-top`

**Linea 95 (TeamMemberCard):**
- Cambiar `object-cover` a `object-cover object-top`

### Archivo afectado
- `src/components/Team.tsx` (2 lineas modificadas)

