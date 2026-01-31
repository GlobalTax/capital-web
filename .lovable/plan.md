
# Plan: Corregir estilo del botón Contacto en el Header

## Problema Identificado

El botón "Contacto" en el header debería ser **amber/dorado** (`bg-amber-500`) pero aparece **negro** (`bg-black`).

### Causa Raíz

En `src/components/ui/simple-button.tsx`, las clases se concatenan en este orden:

```typescript
const classes = [
  baseClasses,
  variantClasses[variant],  // ← bg-black (variant="primary")
  sizeClasses[size],
  className                  // ← bg-amber-500 (pasado por Header.tsx)
].filter(Boolean).join(" ");
```

**Tailwind CSS no garantiza que las clases posteriores sobrescriban las anteriores** cuando hay conflicto. El resultado depende del orden de las clases en el CSS compilado, no del orden en la cadena de clases. Por eso `bg-amber-500` no sobrescribe `bg-black`.

## Solución

Usar `tailwind-merge` (ya instalado en el proyecto) para resolver conflictos de clases correctamente:

```typescript
// ANTES
const classes = [
  baseClasses,
  variantClasses[variant],
  sizeClasses[size],
  className
].filter(Boolean).join(" ");

// DESPUÉS
import { cn } from "@/lib/utils";  // cn usa tailwind-merge

const classes = cn(
  baseClasses,
  variantClasses[variant],
  sizeClasses[size],
  className  // ← Ahora SÍ sobrescribirá bg-black correctamente
);
```

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/ui/simple-button.tsx` | Importar `cn` de `@/lib/utils` y usarlo para combinar clases |

## Cambio Específico

```typescript
// simple-button.tsx

import React from "react";
import { cn } from "@/lib/utils"; // AGREGAR

// ... resto del código ...

const classes = cn(  // CAMBIAR de .join(" ") a cn()
  baseClasses,
  variantClasses[variant],
  sizeClasses[size],
  className
);
```

## Resultado Esperado

El botón "Contacto" mostrará correctamente:
- **Fondo**: amber-500 (dorado)
- **Texto**: slate-900 (oscuro)
- **Hover**: amber-400 (dorado más claro)
- **Borde**: amber-500

## Alternativa

Si prefieres no modificar el componente base, otra opción es:

1. Agregar una nueva variante `amber` en SimpleButton:
```typescript
const variantClasses = {
  primary: "bg-black text-white border border-black hover:shadow-lg hover:-translate-y-1",
  secondary: "bg-white text-black border border-black hover:shadow-lg hover:-translate-y-1",
  outline: "bg-transparent text-black border border-black hover:shadow-md hover:-translate-y-0.5",
  amber: "bg-amber-500 text-slate-900 border border-amber-500 hover:bg-amber-400 hover:shadow-lg hover:-translate-y-1", // NUEVA
};
```

2. Usarla en el Header:
```typescript
<SimpleButton 
  text={t('nav.contacto')}
  variant="amber"
  size="sm"
/>
```

**Recomendación**: La primera opción (usar `cn()`) es más flexible y soluciona el problema de raíz para cualquier uso futuro del componente.

## Sección Técnica

### Por qué ocurre el problema

CSS Cascade: Cuando dos clases tienen la misma especificidad, la que aparece **después en el archivo CSS compilado** gana, no la que aparece después en el atributo class del HTML.

Tailwind genera sus clases en un orden determinístico basado en la configuración, no en el orden de uso. Esto significa que `bg-black` podría aparecer después de `bg-amber-500` en el CSS final, haciendo que `bg-black` "gane".

### Cómo lo soluciona tailwind-merge

La utilidad `cn()` (que usa `tailwind-merge` internamente) detecta conflictos entre clases de Tailwind y mantiene solo la última clase de cada "grupo" (background, text, border, etc.), garantizando que las clases pasadas como `className` siempre sobrescriban las anteriores.
