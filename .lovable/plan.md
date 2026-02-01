

# Diagnóstico y Solución: Header y Footer no visibles en /v2

## Problema Identificado

Después de una investigación exhaustiva, he identificado **dos problemas distintos**:

### Problema 1: La ruta `/v2` NO está cargando el diseño nuevo

Al acceder a `webcapittal.lovable.app/v2` (producción), se muestra la **Calculadora de Valoración** en lugar del **NuevoDiseno institucional**.

**Causa**: Los cambios recientes (añadir la ruta `/v2` en `AppRoutes.tsx`) están en el código pero **no se han publicado a producción todavía**. La versión publicada no incluye esta ruta.

### Problema 2: El Header está en `position: fixed` pero el Hero ocupa toda la pantalla

Aunque el código del header y footer existen en `NuevoDiseno.tsx`, hay un conflicto de capas:

- `InstitutionalHeader`: `position: fixed`, `z-50`, altura total ~112px
- `HeroSliderSection`: `h-screen` (100% viewport), sin z-index explícito

El header debería aparecer SOBRE el hero, pero actualmente tiene fondo blanco semi-transparente que puede dificultar su visibilidad contra imágenes claras.

---

## Solución Propuesta

### Paso 1: Verificar que los cambios se aplican al preview

El usuario debe ver el nuevo diseño en el **iframe de preview** dentro de Lovable (no en la URL de producción publicada). La ruta `/v2` debería funcionar igual que `/test/nuevo-diseno`.

### Paso 2: Mejorar la visibilidad del Header

Modificar `InstitutionalHeader.tsx` para asegurar máxima visibilidad:

```typescript
// ANTES (línea 18):
<header className="fixed top-0 left-0 right-0 z-50">

// DESPUÉS - añadir sombra sutil para distinguir del contenido:
<header className="fixed top-0 left-0 right-0 z-50 shadow-sm">
```

Y asegurar que la barra superior tenga fondo sólido:

```typescript
// Top bar - garantizar visibilidad
<div className="bg-slate-100 border-b border-slate-200">
```

### Paso 3: Verificar imports y lazy loading

Confirmar que `NuevoDiseno` se carga correctamente:

```typescript
// En AppRoutes.tsx (ya existe en línea 29):
const NuevoDiseno = lazy(() => import('@/pages/test/NuevoDiseno'));

// Rutas (líneas 154-157):
<Route path="/test/nuevo-diseno" element={<NuevoDiseno />} />
<Route path="/v2" element={<NuevoDiseno />} />
```

---

## Cambios a Implementar

| Archivo | Cambio | Propósito |
|---------|--------|-----------|
| `InstitutionalHeader.tsx` | Añadir `shadow-sm` al header | Mejora contraste visual |
| Verificación | Navegar a `/v2` en el preview de Lovable | Confirmar que carga NuevoDiseno |

---

## Sección Técnica

### Estructura actual del componente NuevoDiseno

```text
NuevoDiseno.tsx
├── TestLayout (min-h-screen, bg-white)
│   ├── InstitutionalHeader (fixed, z-50, top-0)
│   ├── HeroSliderSection (h-screen, z-10 para contenido)
│   ├── AboutSection
│   ├── ServicesSectionWithImages
│   ├── TeamSection
│   ├── CaseStudiesSection
│   └── InstitutionalFooter
```

### Z-index actual

```text
Header: z-50 (posición fija, debería estar SOBRE todo)
Hero content: z-10 (dentro del hero)
Hero background: sin z-index (por defecto 0)
```

### Problema potencial

Si el header no aparece, puede ser porque:
1. **Error de importación** en el lazy loading
2. **CSS/Tailwind no compilado** correctamente
3. **Caché del navegador** mostrando versión antigua

---

## Pasos de Verificación Post-Implementación

1. **Navegar a `/v2` en el iframe de Lovable** (no en producción)
2. **Hard refresh** (Ctrl+Shift+R) para limpiar caché
3. **Verificar en DevTools** que el header está en el DOM
4. **Scroll hasta abajo** para ver el footer

---

## Resultado Esperado

Después de los cambios, al acceder a `/v2`:

- ✓ Top bar con idiomas (ES | CA | EN) visible
- ✓ Header con logo "Capittal" y navegación visible
- ✓ Hero slider con imágenes y texto
- ✓ Secciones de contenido
- ✓ Footer institucional visible al hacer scroll

