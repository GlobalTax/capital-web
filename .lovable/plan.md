
# Plan: Corregir Legibilidad del Blog

## Problema Identificado

El plugin `@tailwindcss/typography` **no está instalado** en el proyecto. Esto significa que todas las clases `prose-*` que se aplicaron (como `prose-xl`, `prose-headings:font-medium`, etc.) **no tienen efecto alguno**.

Además, hay estilos globales en `index.css` que fuerzan todos los headers a `font-weight: 400`.

## Cambios a Implementar

### 1. Instalar el Plugin de Typography

Añadir la dependencia `@tailwindcss/typography` al proyecto.

### 2. Configurar el Plugin en Tailwind

Modificar `tailwind.config.ts`:

```typescript
// Línea 198
plugins: [
  require("tailwindcss-animate"),
  require("@tailwindcss/typography")
],
```

### 3. Modificar estilos globales para no interferir con prose

Actualizar `index.css` para excluir los elementos dentro de `.prose`:

```css
/* Headers - same weight as body (400) EXCEPT inside prose */
h1:not(.prose *), 
h2:not(.prose *), 
h3:not(.prose *), 
h4:not(.prose *), 
h5:not(.prose *), 
h6:not(.prose *) {
  @apply font-sans;
  font-weight: 400;
}
```

### 4. Simplificar las clases prose en BlogPostContent

Actualizar las clases en `BlogPostContent.tsx` para que funcionen correctamente con el plugin:

```typescript
<div className="prose prose-lg lg:prose-xl dark:prose-invert max-w-none
  prose-headings:font-semibold prose-headings:text-slate-900
  prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
  prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-4
  prose-p:text-slate-700 prose-p:leading-relaxed prose-p:text-[18px]
  prose-li:text-slate-700
  prose-strong:text-slate-900
  prose-blockquote:border-slate-300 prose-blockquote:text-slate-600">
```

---

## Resumen de Cambios

| Archivo | Cambio | Propósito |
|---------|--------|-----------|
| `package.json` | Añadir `@tailwindcss/typography` | Habilitar clases prose |
| `tailwind.config.ts` | Añadir plugin typography | Activar el plugin |
| `src/index.css` | Excluir `.prose *` del reset de headers | Permitir que prose controle los estilos |
| `BlogPostContent.tsx` | Ajustar clases prose | Mejorar tipografía |

---

## Resultado Esperado

Después de los cambios:
- Texto del artículo a 18-20px, legible
- H2 claramente diferenciados del cuerpo (negrita, más grande)
- H3 diferenciados de H2
- Espaciado adecuado entre secciones
- Ancho de línea óptimo para lectura

## Nota Técnica

El plugin `@tailwindcss/typography` proporciona estilos pre-configurados para contenido HTML generado (como el de un CMS o editor de texto). Sin él, las clases `prose-*` no existen y no aplican ningún estilo.
