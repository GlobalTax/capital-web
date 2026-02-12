

## Correccion del encuadre de fotos del equipo

### Problema actual
La clase CSS `object-[center_20%]` esta cortando la parte superior de las cabezas. El 20% posiciona el punto focal demasiado arriba, lo que hace que el recorte del aspect-ratio 3:4 pierda la parte superior del rostro en muchas fotos.

### Solucion

**Archivo:** `src/components/Team.tsx`

Cambiar `object-[center_20%]` por `object-[center_30%]` en ambos componentes (`PartnerCard` linea 42 y `TeamMemberCard` linea 95).

El valor 30% desplaza el punto focal un poco mas abajo, dando mas espacio por encima de la cabeza y evitando el corte de frentes y cabello. Es un ajuste conservador que funciona bien con fotos de retrato profesional donde la persona esta centrada o ligeramente por encima del centro.

### Resultado esperado
Las fotos muestran la cabeza completa con algo de aire por encima, sin cortar frentes ni pelo.
