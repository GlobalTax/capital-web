

## Plan: Auto-scroll del pipeline al arrastrar tarjetas

### Problema
Al arrastrar una tarjeta desde una columna visible hacia una que está fuera de la pantalla, el contenedor no se desplaza automáticamente, obligando a hacer el movimiento en dos pasos.

### Solución
Añadir un listener de `onDragUpdate`/mouse position durante el drag que detecte cuando el cursor está cerca de los bordes izquierdo/derecho del contenedor scrollable, y auto-scroll horizontalmente en esa dirección.

### Implementación

**Archivo**: `src/features/leads-pipeline/components/LeadsPipelineView.tsx`

1. Añadir un `useRef` al contenedor scrollable (`div.overflow-x-auto`)
2. Implementar auto-scroll con `onDragStart`/`onDragEnd` de `DragDropContext`:
   - Al iniciar drag, activar un `requestAnimationFrame` loop que lee la posición del mouse
   - Si el cursor está a <100px del borde derecho del contenedor → scroll derecha
   - Si está a <100px del borde izquierdo → scroll izquierda
   - Velocidad proporcional a la cercanía al borde
   - Al soltar, detener el loop

3. Aplicar el mismo patrón a `BuyPipelineView.tsx` para consistencia

### Detalle técnico
```typescript
// Hook o lógica inline:
const scrollContainerRef = useRef<HTMLDivElement>(null);
const animationRef = useRef<number>();
const mouseXRef = useRef(0);

// Track mouse during drag
useEffect(() => {
  const handler = (e: MouseEvent) => { mouseXRef.current = e.clientX; };
  window.addEventListener('mousemove', handler);
  return () => window.removeEventListener('mousemove', handler);
}, []);

const startAutoScroll = () => {
  const scroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = mouseXRef.current;
    const edge = 120; // px from edge to trigger
    const speed = 12;
    
    if (x < rect.left + edge) {
      container.scrollLeft -= speed * (1 - (x - rect.left) / edge);
    } else if (x > rect.right - edge) {
      container.scrollLeft += speed * (1 - (rect.right - x) / edge);
    }
    animationRef.current = requestAnimationFrame(scroll);
  };
  scroll();
};

const stopAutoScroll = () => {
  if (animationRef.current) cancelAnimationFrame(animationRef.current);
};
```

### Archivos afectados
- `src/features/leads-pipeline/components/LeadsPipelineView.tsx`
- `src/features/leads-pipeline/components/BuyPipelineView.tsx`

