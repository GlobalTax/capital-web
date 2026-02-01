
# Mejorar la Legibilidad del Blog

## Problema

El artículo del blog en `/blog/search-funds-espana-informe-actividad-2024-2025` presenta dificultades de lectura. Tras analizar el componente `BlogPostContent.tsx` y los estilos del sistema, se identifican los siguientes problemas:

---

## Problemas Detectados

| Problema | Impacto | Solución |
|----------|---------|----------|
| Tamaño de fuente pequeño | Fatiga visual | Aumentar a 18-20px |
| Líneas demasiado largas | Dificultad de seguimiento | Limitar ancho a ~70 caracteres |
| Poco contraste de texto | Cansancio visual | Texto negro intenso |
| Espaciado insuficiente | Texto apiñado | Más margen entre elementos |
| H2/H3 no destacan | Estructura confusa | Mayor peso y tamaño |

---

## Cambios a Implementar

### 1. Mejorar tipografia del contenido (`BlogPostContent.tsx`)

Modificar la clase prose en línea 246:

```typescript
// ANTES:
className="prose prose-lg dark:prose-invert max-w-none..."

// DESPUÉS:
className="prose prose-xl dark:prose-invert max-w-prose mx-auto
  prose-headings:text-slate-900 prose-headings:font-medium
  prose-h2:text-3xl prose-h2:mt-14 prose-h2:mb-8
  prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-6
  prose-p:text-slate-700 prose-p:text-lg prose-p:leading-relaxed prose-p:mb-8
  prose-li:text-slate-700 prose-li:text-lg prose-li:leading-relaxed
  prose-strong:text-slate-900 prose-strong:font-semibold
  prose-ul:my-8 prose-ol:my-8
  prose-blockquote:border-l-4 prose-blockquote:border-slate-300 
  prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-slate-600"
```

### 2. Ajustar el layout del grid

El contenido está en 8 columnas de 12. Para mejor legibilidad, el texto debería tener un ancho máximo de ~65-75 caracteres.

```typescript
// ANTES:
<div className="lg:col-span-8">

// DESPUÉS - añadir max-w-prose al contenedor del texto:
<div className="lg:col-span-8">
  <div className="max-w-prose"> // ~65 caracteres de ancho
```

---

## Resumen de Mejoras Visuales

| Elemento | Antes | Después |
|----------|-------|---------|
| Tamaño texto | 18px (prose-lg) | 20px (prose-xl) |
| Ancho máximo | Sin límite | 65ch (~700px) |
| Color texto | Heredado | Slate-700 (más contraste) |
| Color headings | Normal | Slate-900 + font-medium |
| Espaciado párrafos | mb-6 | mb-8 |
| Espaciado h2 | mt-12/mb-6 | mt-14/mb-8 |

---

## Archivo a Modificar

**`src/components/blog/BlogPostContent.tsx`** - Líneas 244-252

El cambio afectará solo a la visualización del contenido del artículo, manteniendo el sidebar y la navegación intactos.

---

## Resultado Esperado

Tras los cambios:
- Texto más grande y legible
- Líneas de longitud óptima para lectura
- Mayor contraste entre texto y fondo
- Headings que destacan claramente la estructura
- Experiencia de lectura profesional tipo Medium/Substack
