

## Plan: Acelerar la importación de empresas

Los valores actuales son muy conservadores (BATCH_SIZE=10, DELAY=300ms). Podemos subirlos sin llegar a los niveles que causaban timeouts antes.

### Cambios en `src/hooks/useContactLists.ts`

| Parámetro | Actual | Nuevo | Efecto |
|-----------|--------|-------|--------|
| `BATCH_SIZE` | 10 | **20** | El doble de filas por lote |
| `SUB_BATCH_SIZE` | 3 | **5** | Sub-lotes más grandes en fallback |
| `DELAY_MS` | 300 | **150** | La mitad de pausa entre lotes |

Esto duplica aproximadamente la velocidad (~30 min en vez de ~65 min para 12.500 filas). La resiliencia se mantiene: si un lote de 20 falla, baja a sub-lotes de 5, y si eso falla, va fila a fila.

El índice que ya creamos en la migración anterior optimiza el trigger, así que lotes de 20 deberían funcionar sin problema.

### Archivo a modificar
- `src/hooks/useContactLists.ts` — líneas 237-239, cambiar las 3 constantes

