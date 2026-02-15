

## Eliminar la card de Francisco Garcia & Assessors

### Cambio

En `src/pages/sectores/Seguridad.tsx`, seccion "Por que Capittal para el sector seguridad":

1. **Eliminar la 4a card** (lineas 422-432): el bloque completo de "Partnership con Francisco Garcia & Assessors"
2. **Cambiar el grid** de `grid md:grid-cols-2` a `grid md:grid-cols-3` para que las 3 cards restantes queden en una fila equilibrada

### Cards que se mantienen
- Conocimiento sectorial profundo (Shield)
- Red de contactos con PEs internacionales (Users)
- Track record demostrable (Award)

### Detalle tecnico

| Linea | Cambio |
|-------|--------|
| 385 | `grid md:grid-cols-2 gap-6` -> `grid md:grid-cols-3 gap-6` |
| 422-432 | Eliminar bloque completo de la card Partnership |

