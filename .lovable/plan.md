

## Fix: Pipeline se queda pillado al entrar

### Causa raiz

El `onClick={onViewDetails}` que acabamos de añadir al `<Card>` tiene dos problemas:

1. **Conflicto con drag-and-drop**: Al soltar una tarjeta tras arrastrarla, se dispara el `onClick` → navega a otra página durante el drag, dejando la UI congelada.
2. **Propagación de eventos**: Al clicar el menú "..." o cualquier botón dentro de la tarjeta, el evento burbujea al `<Card>` y también navega.

### Solución

**Archivo: `src/features/leads-pipeline/components/PipelineCard.tsx`**

1. Añadir tracking de drag con `onMouseDown`/`onMouseMove` para detectar si el usuario está arrastrando.
2. En el `onClick` del Card: solo navegar si NO hubo drag (movimiento < 5px) y si el click no viene de un elemento interactivo (botón, menú).

```tsx
const [mouseDownPos, setMouseDownPos] = useState<{x:number,y:number}|null>(null);
const wasDragging = useRef(false);

const handleMouseDown = (e: React.MouseEvent) => {
  setMouseDownPos({ x: e.clientX, y: e.clientY });
  wasDragging.current = false;
};

const handleMouseMove = (e: React.MouseEvent) => {
  if (mouseDownPos) {
    const dx = Math.abs(e.clientX - mouseDownPos.x);
    const dy = Math.abs(e.clientY - mouseDownPos.y);
    if (dx > 5 || dy > 5) wasDragging.current = true;
  }
};

const handleClick = (e: React.MouseEvent) => {
  // No navegar si fue drag o si el click viene de un botón/menú
  const target = e.target as HTMLElement;
  if (wasDragging.current) return;
  if (target.closest('button, [role="menuitem"], [data-radix-collection-item]')) return;
  onViewDetails();
};
```

3. Aplicar `onMouseDown`, `onMouseMove` y `onClick={handleClick}` al `<Card>`.

Un solo archivo, sin cambios funcionales adicionales.

