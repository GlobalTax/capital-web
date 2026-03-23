

## Límite de 1320 caracteres en descripción del catálogo ROD

### Cambios

**2 archivos, 1 línea cada uno:**

1. **`src/features/operations-management/utils/generateDealhubPptx.ts`** (línea 371)
   - Cambiar truncado de 800 → 1320 caracteres:
   ```ts
   const desc = rawDesc.length > 1320 ? rawDesc.substring(0, 1317) + '...' : rawDesc;
   ```

2. **`src/features/operations-management/utils/generateDealhubPdf.tsx`** (línea 288)
   - Mismo cambio para la versión PDF:
   ```ts
   const desc = (...).substring(0, 1320);
   ```

Ambos ficheros generan las slides de operación (PPTX y PDF respectivamente) y actualmente cortan la descripción a 800 caracteres. Se sube el límite a 1320 (contando letras y espacios).

