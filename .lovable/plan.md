
# Plan: Corrección del Cálculo de Altura en Pestañas de Contactos

## Problema Identificado

La tabla de contactos se muestra correctamente en la pestaña "Favoritos" pero incorrectamente en "Todos" y otras pestañas. Analizando las capturas:

- **Favoritos**: La tabla ocupa todo el espacio disponible correctamente
- **Todos**: Hay un espacio en blanco enorme entre los filtros y la tabla (aprox. 450px de hueco)

### Causa Raíz

En `LinearContactsTable.tsx` (líneas 345-366), el cálculo de altura usa:

```tsx
useEffect(() => {
  const updateHeight = () => {
    if (containerRef.current) {
      const parent = containerRef.current.parentElement;
      if (parent) {
        const parentHeight = parent.clientHeight;
        setListHeight(Math.max(200, parentHeight - 40));
      }
    }
  };
  
  updateHeight();
  const timeout = setTimeout(updateHeight, 100);
  // ...
}, []); // ← Array vacío: solo se ejecuta al montar
```

**El problema**:
1. El `useEffect` tiene dependencias vacías (`[]`), ejecutándose solo una vez
2. Radix UI Tabs oculta el contenido inactivo con `display: none` (via `data-[state=inactive]`)
3. Cuando un tab inactivo tiene `display: none`, su `clientHeight` es 0
4. Si la tabla se monta mientras está en un tab oculto, calcula altura incorrecta
5. El `setTimeout(100)` no es suficiente para capturar el cambio de visibilidad del tab

### Flujo del Error

```text
1. Usuario abre /admin/contacts
2. Tab activo = "Favoritos" (se ve bien, parent.clientHeight = correcto)
3. Tab "Todos" está oculto (display: none)
4. LinearContactsTable en "Todos" se monta
5. updateHeight() calcula parent.clientHeight = 0 o muy pequeño
6. setListHeight(200) ← altura mínima por defecto
7. Usuario cambia a tab "Todos"
8. Tab ahora visible, pero listHeight sigue siendo 200
9. Resultado: espacio en blanco enorme ❌
```

## Solución

### Archivo: `src/components/admin/contacts/LinearContactsTable.tsx`

Añadir un detector de visibilidad usando `ResizeObserver` o `IntersectionObserver` para recalcular la altura cuando el componente se hace visible:

**Cambios en líneas 345-366:**

```tsx
// Calculate dynamic height based on parent container
useEffect(() => {
  const updateHeight = () => {
    if (containerRef.current) {
      const parent = containerRef.current.parentElement;
      if (parent) {
        const parentHeight = parent.clientHeight;
        // Solo actualizar si el padre tiene altura válida (visible)
        if (parentHeight > 50) {
          setListHeight(Math.max(200, parentHeight - 40));
        }
      }
    }
  };
  
  updateHeight();
  
  // Usar ResizeObserver para detectar cambios de tamaño/visibilidad
  const observer = new ResizeObserver(() => {
    updateHeight();
  });
  
  if (containerRef.current?.parentElement) {
    observer.observe(containerRef.current.parentElement);
  }
  
  window.addEventListener('resize', updateHeight);
  
  return () => {
    observer.disconnect();
    window.removeEventListener('resize', updateHeight);
  };
}, []);
```

El `ResizeObserver` detectará automáticamente cuando el elemento padre cambie de `display: none` a `display: block` (al cambiar de tab), disparando un recálculo de altura.

## Sección Técnica

### Por Qué ResizeObserver Soluciona el Problema

| Evento | Antes (setTimeout) | Después (ResizeObserver) |
|--------|-------------------|--------------------------|
| Tab oculto se hace visible | No se detecta | ✓ Detectado (resize de 0 a N) |
| Ventana cambia tamaño | Detectado | ✓ Detectado |
| Layout shift | No detectado | ✓ Detectado |

### Compatibilidad

`ResizeObserver` tiene soporte en todos los navegadores modernos (97%+ global):
- Chrome 64+
- Firefox 69+
- Safari 13.1+
- Edge 79+

### Consideraciones de Performance

- `ResizeObserver` es más eficiente que múltiples `setTimeout`
- Se ejecuta de forma asíncrona, no bloquea el main thread
- Auto-limpieza en el cleanup del useEffect

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/admin/contacts/LinearContactsTable.tsx` | Reemplazar setTimeout con ResizeObserver para detectar cambios de visibilidad del tab |

## Resultado Esperado

1. Al cambiar a cualquier pestaña, la tabla recalculará su altura correctamente
2. No más espacio en blanco entre filtros y tabla
3. Comportamiento consistente en todas las pestañas (Favoritos, Todos, Pipeline, Stats)
4. La tabla ocupará todo el espacio disponible en el contenedor flex
