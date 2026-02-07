

# Plan: Limpiar acciones del perfil del lead

## Cambios

Un solo archivo a modificar: `src/pages/admin/LeadDetailPage.tsx`

### 1. Eliminar botones del UI (lineas 436-446 y 491-517)

- **"+ Nuevo Lead"** (lineas 436-443): Eliminar el Button completo
- **"Convertir en Operacion"** (lineas 445-446): Eliminar el componente `LeadToOperationConverter`
- **"Pasar a Fase 1 (ROD)"** (lineas 491-517): Eliminar el bloque condicional completo

Se mantienen intactos:
- "Enviar a Brevo" (lineas 448-479)
- "Archivar" (lineas 481-489)

### 2. Limpiar imports no usados

Eliminar:
- `LeadToOperationConverter` (linea 43)
- `Plus` del import de lucide-react (linea 28)
- `TrendingUp` del import de lucide-react (linea 24)

### 3. Lo que NO se toca

- Ningun endpoint backend ni tabla de DB
- Ningun estado, flag ni dato historico
- Timeline, Brevo, archivar, pipeline, stats: todo intacto
- El componente `LeadToOperationConverter` sigue existiendo en su modulo por si se necesita en el futuro; solo se deja de importar aqui

### Resultado

La barra de acciones quedara con solo dos botones claros:
**[Enviar a Brevo] [Archivar]**

