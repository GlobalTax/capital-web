
# Plan: Estandarizar Tipografía del Blog en Todos los Componentes

## Análisis Realizado

He revisado todos los archivos que muestran contenido de blog o texto largo. El componente principal `BlogPostContent.tsx` ya tiene los estilos correctos, pero hay un archivo crítico que necesita actualización:

### Archivo que Requiere Actualización

| Archivo | Estado Actual | Problema |
|---------|--------------|----------|
| `src/pages/admin/BlogPreviewPage.tsx` | `prose prose-lg max-w-none` | Falta la tipografía mejorada |

## Cambios a Implementar

### 1. BlogPreviewPage.tsx (líneas 157-160)

**Antes:**
```tsx
<div 
  className="prose prose-lg max-w-none"
  dangerouslySetInnerHTML={{ __html: sanitizeRichText(post.content) }}
/>
```

**Después:**
```tsx
<div 
  className="prose prose-xl dark:prose-invert max-w-none
    prose-headings:scroll-mt-24 prose-headings:text-slate-900 prose-headings:font-medium
    prose-h2:text-3xl prose-h2:mt-14 prose-h2:mb-8 prose-h2:tracking-tight
    prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-6 prose-h3:tracking-tight
    prose-p:text-slate-700 prose-p:text-lg prose-p:leading-relaxed prose-p:mb-8
    prose-li:text-slate-700 prose-li:text-lg prose-li:leading-relaxed prose-li:mb-2
    prose-strong:text-slate-900 prose-strong:font-semibold
    prose-ul:my-8 prose-ol:my-8
    prose-blockquote:border-l-4 prose-blockquote:border-slate-300 
    prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-slate-600"
  dangerouslySetInnerHTML={{ __html: sanitizeRichText(post.content) }}
/>
```

---

## Documentación: Estándar de Tipografía para Blog

### Clases CSS Estándar para Contenido de Blog

Cuando se muestre contenido HTML de blog (con `dangerouslySetInnerHTML`), usar SIEMPRE estas clases:

```tsx
className="prose prose-xl dark:prose-invert max-w-none
  prose-headings:scroll-mt-24 prose-headings:text-slate-900 prose-headings:font-medium
  prose-h2:text-3xl prose-h2:mt-14 prose-h2:mb-8 prose-h2:tracking-tight
  prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-6 prose-h3:tracking-tight
  prose-p:text-slate-700 prose-p:text-lg prose-p:leading-relaxed prose-p:mb-8
  prose-li:text-slate-700 prose-li:text-lg prose-li:leading-relaxed prose-li:mb-2
  prose-strong:text-slate-900 prose-strong:font-semibold
  prose-ul:my-8 prose-ol:my-8
  prose-blockquote:border-l-4 prose-blockquote:border-slate-300 
  prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-slate-600"
```

### Desglose de Estilos

| Clase | Propósito |
|-------|-----------|
| `prose-xl` | Tamaño base de 20px para mejor legibilidad |
| `prose-headings:font-medium` | Headers con peso semi-negrita |
| `prose-h2:text-3xl` | H2 grandes y distinguibles |
| `prose-h2:mt-14 prose-h2:mb-8` | Espaciado generoso alrededor de H2 |
| `prose-p:text-lg` | Párrafos a 18px |
| `prose-p:leading-relaxed` | Interlineado amplio (1.625) |
| `prose-p:mb-8` | Margen inferior entre párrafos |
| `prose-li:mb-2` | Espaciado entre items de lista |
| `prose-blockquote:*` | Citas con borde izquierdo y estilo itálica |

### Requisitos Previos

1. **Plugin instalado**: `@tailwindcss/typography`
2. **Configurado en**: `tailwind.config.ts` → `plugins: [require("@tailwindcss/typography")]`
3. **CSS global**: Los headers fuera de `.prose` mantienen `font-weight: 400`

### Archivos que Ya Cumplen el Estándar

- ✅ `src/components/blog/BlogPostContent.tsx` - Página principal de artículo

### Archivos a Actualizar

- ⚠️ `src/pages/admin/BlogPreviewPage.tsx` - Preview del admin

---

## Resumen de Cambios

| Archivo | Líneas | Cambio |
|---------|--------|--------|
| `BlogPreviewPage.tsx` | 157-160 | Aplicar clases prose estándar |

## Resultado Esperado

Después de estos cambios:
- Todos los artículos del blog tendrán tipografía consistente
- El preview del admin mostrará exactamente lo mismo que verá el usuario final
- Los estilos están documentados para futuros desarrollos
