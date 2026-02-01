
# Corrección del Header y Footer en /v2

## Problema Identificado

El `InstitutionalHeader` tiene `position: fixed` con una altura total de **112px** (32px top bar + 80px nav), pero el `HeroSliderSection` y el resto del contenido no compensan esta altura. Esto puede causar:

1. **Header visible pero contenido tapado**: El hero slider empieza desde el top de la pantalla y puede parecer que "no hay header" porque el contenido del hero empieza debajo visualmente
2. **El footer está al final**: Si no hay scroll suficiente, el footer puede no ser visible inmediatamente

## Solución Propuesta

### Opción A: Añadir padding-top al contenido (Recomendada para páginas normales)

Modificar `TestLayout.tsx` para añadir espacio para el header:

```typescript
const TestLayout: React.FC<TestLayoutProps> = ({ children }) => {
  return (
    <div className="light-institutional min-h-screen bg-white pt-28">
      {children}
    </div>
  );
};
```

**Problema**: Esto rompería el efecto full-screen del hero slider.

---

### Opción B: Mantener hero full-screen y ajustar z-index (Recomendada)

El hero slider ya está diseñado para ser full-screen (`h-screen`). El header con `z-50` debería ser visible sobre él.

Si el problema es que el header no se ve, revisar:

1. Verificar que el header tiene `z-50` (ya lo tiene)
2. Verificar que el hero NO tiene z-index mayor que 50
3. Verificar que el fondo del header es visible (tiene `bg-white/80 backdrop-blur-sm`)

**Revisando el código**:
- `InstitutionalHeader`: `z-50` ✓
- `HeroSliderSection`: No tiene z-index explícito ✓

El header **debería ser visible**. Si no lo es, puede ser un problema de compilación/caché.

---

## Cambios a Implementar

### 1. Verificar visibilidad del header

El header actual es semi-transparente (`bg-white/80`). En un hero con imagen clara, podría no tener suficiente contraste. Cambiar a:

```typescript
// En InstitutionalHeader.tsx línea 32
<div className="bg-white border-b border-slate-100">
```

Quitar el `/80` de opacidad para que sea sólido.

### 2. Asegurar que el Hero tiene margen para no tapar contenido importante

El hero ya posiciona el contenido de texto con suficiente margen (`max-w-2xl` y padding), por lo que el header no debería tapar información crítica.

---

## Resumen de Cambios

| Archivo | Cambio | Razón |
|---------|--------|-------|
| `InstitutionalHeader.tsx` | Cambiar `bg-white/80` a `bg-white` | Header sólido más visible |
| Verificar | Que el build se regenere | Posible problema de caché |

## Pasos de Implementación

1. **Modificar `InstitutionalHeader.tsx`**: Hacer el fondo del nav sólido
2. **Forzar rebuild**: El cambio debería regenerar el bundle
3. **Verificar en navegador**: Confirmar que `/v2` muestra el nuevo diseño

## Verificación

Después de los cambios, navegar a `/v2` debería mostrar:
- Top bar con selector de idiomas (ES | CA | EN)
- Header con logo "Capittal" y navegación (SERVICIOS, EQUIPO, etc.)
- Hero slider con imágenes y texto
- Secciones de contenido
- Footer institucional con noticias y contacto
