

## Plan: Mejorar visibilidad de empresas bloqueadas en listas madre

### Problema actual
Las empresas asignadas a sublistas solo tienen `opacity-50`, que es sutil y difícil de distinguir rápidamente.

### Cambios en `src/pages/admin/ContactListDetailPage.tsx`

**1. Fila bloqueada más visible**
- Cambiar `opacity-50` por un fondo diferenciado: `bg-muted/40` con borde izquierdo coloreado `border-l-2 border-l-orange-400`
- Añadir un icono `Lock` pequeño junto al nombre de la empresa

**2. Badge de sublista más prominente**
- Cambiar el badge actual (variant `secondary`, tamaño `sm`, texto 10px) por uno más visible: variant `accent` o custom con fondo naranja/amber claro, texto más grande (11-12px), y un icono `ArrowRight` inline
- Formato: `→ [Nombre sublista]` para que sea inmediatamente legible

**3. Separación visual**
- Ordenar las empresas: primero las NO asignadas (activas), luego las bloqueadas, con un separador visual (una fila con texto "Asignadas a sublistas (X)" en gris)

### Cambio concreto en la fila

```tsx
<TableRow key={company.id} className={cn(
  "group/row",
  isAssignedToSublist && "bg-muted/30 border-l-2 border-l-amber-400"
)}>
```

Badge de sublista:
```tsx
<Badge variant="outline" size="sm" className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 text-[11px] gap-1">
  <ArrowRight className="h-3 w-3" />
  {name}
</Badge>
```

Nombre de empresa con icono lock:
```tsx
<button className="text-sm font-medium hover:underline text-left flex items-center gap-1.5">
  {isAssignedToSublist && <Lock className="h-3 w-3 text-amber-500 flex-shrink-0" />}
  {company.empresa}
</button>
```

### No se toca
- Importador, trigger, configuración, notas, búsqueda por keywords
- Lógica de validación al mover/copiar (ya implementada)

