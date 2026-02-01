
# Plan: Crear Componente Reutilizable para Tipografía de Blog

## Problema

Las clases de tipografía del blog están duplicadas en dos archivos:
- `src/components/blog/BlogPostContent.tsx` (línea 246)
- `src/pages/admin/BlogPreviewPage.tsx` (línea 158-167)

Esto viola el principio DRY y hace difícil mantener la consistencia si se necesitan cambios futuros.

## Solución Propuesta

Crear un componente `BlogProseContent` que encapsule las clases prose estándar y la sanitización del HTML.

---

## Cambios a Implementar

### 1. Crear nuevo componente BlogProseContent

**Archivo nuevo**: `src/components/blog/BlogProseContent.tsx`

```tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { sanitizeRichText } from '@/shared/utils/sanitize';

interface BlogProseContentProps {
  content: string;
  className?: string;
}

// Clases estándar de tipografía para contenido de blog
const BLOG_PROSE_CLASSES = `
  prose prose-xl dark:prose-invert max-w-none
  prose-headings:scroll-mt-24 prose-headings:text-slate-900 prose-headings:font-medium
  prose-h2:text-3xl prose-h2:mt-14 prose-h2:mb-8 prose-h2:tracking-tight
  prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-6 prose-h3:tracking-tight
  prose-p:text-slate-700 prose-p:text-lg prose-p:leading-relaxed prose-p:mb-8
  prose-li:text-slate-700 prose-li:text-lg prose-li:leading-relaxed prose-li:mb-2
  prose-strong:text-slate-900 prose-strong:font-semibold
  prose-ul:my-8 prose-ol:my-8
  prose-blockquote:border-l-4 prose-blockquote:border-slate-300 
  prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-slate-600
`;

export const BlogProseContent: React.FC<BlogProseContentProps> = ({ 
  content, 
  className 
}) => {
  return (
    <div 
      className={cn(BLOG_PROSE_CLASSES, className)}
      dangerouslySetInnerHTML={{ __html: sanitizeRichText(content) }}
    />
  );
};

// Exportar también las clases por si se necesitan en casos especiales
export { BLOG_PROSE_CLASSES };
```

### 2. Actualizar BlogPostContent.tsx

**Archivo**: `src/components/blog/BlogPostContent.tsx`

Reemplazar las líneas 246-252 con el nuevo componente:

```tsx
import { BlogProseContent } from './BlogProseContent';

// En el render (línea ~246):
<BlogProseContent 
  content={getFormattedContent(post.content)} 
  className="max-w-prose"
/>
```

### 3. Actualizar BlogPreviewPage.tsx

**Archivo**: `src/pages/admin/BlogPreviewPage.tsx`

Reemplazar las líneas 157-169 con:

```tsx
import { BlogProseContent } from '@/components/blog/BlogProseContent';

// En el render (línea ~157):
<BlogProseContent content={post.content} />
```

---

## Resumen de Cambios

| Archivo | Cambio |
|---------|--------|
| `src/components/blog/BlogProseContent.tsx` | **Nuevo**: Componente con clases prose estandarizadas |
| `src/components/blog/BlogPostContent.tsx` | Reemplazar div prose con `BlogProseContent` |
| `src/pages/admin/BlogPreviewPage.tsx` | Reemplazar div prose con `BlogProseContent` |

## Beneficios

1. **DRY**: Las clases se definen en un solo lugar
2. **Mantenibilidad**: Cambios futuros requieren editar solo un archivo
3. **Consistencia**: Garantiza que ambas vistas usen exactamente los mismos estilos
4. **Flexibilidad**: El prop `className` permite ajustes específicos por contexto
5. **Documentación**: Las clases exportadas sirven como referencia

## Consideración Técnica

En `BlogPostContent.tsx` se usa `DOMPurify.sanitize()` con `getFormattedContent()`. El nuevo componente usará `sanitizeRichText()` que internamente también usa DOMPurify, por lo que se mantiene la seguridad.
