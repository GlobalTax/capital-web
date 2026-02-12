

## Ajuste de fotos del equipo

### Problema
Las tarjetas del equipo usan `aspect-square` con `object-top`, lo que corta los rostros en algunas fotos donde la persona no esta alineada exactamente en la parte superior de la imagen.

### Solucion

**Archivo:** `src/components/Team.tsx`

Cambios en `PartnerCard` y `TeamMemberCard`:

1. Cambiar `object-top` por `object-[20%]` en ambos componentes de imagen -- esto centra el encuadre ligeramente por debajo del borde superior, capturando mejor los rostros sin importar la composicion original de la foto
2. Cambiar `aspect-square` por `aspect-[3/4]` para dar mas altura vertical a las tarjetas y mostrar mas del cuerpo, reduciendo el recorte agresivo del cuadrado

Esto afecta las lineas 42 y 95 (clase de la imagen) y las lineas 37 y 90 (contenedor con aspect ratio).

### Resultado esperado
Fotos con mas espacio vertical (proporcion 3:4 en vez de 1:1), con el punto focal centrado en la zona del rostro/pecho, sin cortar cabezas.
