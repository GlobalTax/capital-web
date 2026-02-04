
# Plan: Corrección de Alineación de la Tabla de Contactos

## Problema Identificado

Analizando la captura y el código, he encontrado varios problemas de alineación:

### Problema 1: Altura de fila inconsistente
En `ContactTableRow.tsx` (línea 159):
```tsx
className="flex items-center h-[44px] cursor-pointer..."
```

Pero en `LinearContactsTable.tsx` (línea 41):
```tsx
const ROW_HEIGHT = ADMIN_LAYOUT.table.rowHeight; // = 40px
```

La lista virtualizada usa `itemSize={ROW_HEIGHT}` (40px) pero el componente de fila tiene `h-[44px]` (44px), causando un desajuste de 4px por fila que se acumula.

### Problema 2: Ancho de columna "origin" muy pequeño
La columna "F. Registro" tiene solo `80px` asignados pero contiene una fecha editable que necesita más espacio. En la captura se ve cómo el header se corta.

### Problema 3: Header fuera de flujo
El header de la tabla está separado de la lista virtualizada, lo que puede causar desalineación horizontal si hay scroll.

## Solución

### Archivo 1: `src/components/admin/contacts/ContactTableRow.tsx`
Cambiar la altura fija hardcodeada para usar la constante centralizada:

| Línea | Antes | Después |
|-------|-------|---------|
| 159 | `h-[44px]` | `h-[40px]` (usando ROW_HEIGHT de config) |

### Archivo 2: `src/config/admin-layout.config.ts`
Aumentar el ancho de la columna "origin" para que quepa "F. REGISTRO":

| Propiedad | Antes | Después |
|-----------|-------|---------|
| `origin` | 80 | 95 |

Esto mejorará la legibilidad sin afectar mucho al ancho total.

## Sección Técnica

### Por Qué La Altura Causa Desalineación

```
react-window dice: cada fila = 40px
  Fila 0: posición top = 0px
  Fila 1: posición top = 40px
  Fila 2: posición top = 80px

Pero ContactTableRow renderiza 44px de alto:
  Fila 0: ocupa 0-44px ← 4px de overlap
  Fila 1: ocupa 40-84px ← solapamiento continuo
  
Resultado: contenido visual desplazado del scroll esperado
```

### Anchos de Columnas Actuales vs Necesarios

| Columna | Actual | Contenido | ¿Suficiente? |
|---------|--------|-----------|--------------|
| star | 32px | Icono | ✓ |
| checkbox | 36px | Checkbox | ✓ |
| contact | 170px | Nombre + email | ✓ |
| origin | 80px | "dd MMM yy" | ⚠️ Corto para header |
| channel | 120px | Select + subtext | ✓ |
| company | 140px | Nombre empresa | ✓ |

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/admin/contacts/ContactTableRow.tsx` | Cambiar `h-[44px]` a `h-[40px]` |
| `src/config/admin-layout.config.ts` | Aumentar `origin: 80` a `origin: 95` |

## Resultado Esperado

1. Las filas tendrán exactamente 40px de altura, coincidiendo con `itemSize` de react-window
2. La columna "F. REGISTRO" tendrá espacio suficiente para mostrar el header completo
3. El scroll será suave sin saltos visuales
4. La alineación vertical entre header y filas será perfecta
