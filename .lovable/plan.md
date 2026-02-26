

# Añadir BreadcrumbList Schema JSON-LD al Blog

## Resumen

Añadir structured data `BreadcrumbList` a las dos páginas del blog (listado y post individual) para mejorar los rich results en Google, reutilizando la función `getBreadcrumbSchema` que ya existe en el proyecto.

## Cambios

### 1. Listado del blog (`src/pages/recursos/Blog.tsx`)

Cambiar el `structuredData` del `SEOHead` para pasar un **array** con el schema Blog existente + el nuevo BreadcrumbList:

```text
Breadcrumb: Inicio > Recursos > Blog
```

- Importar `getBreadcrumbSchema` desde `@/utils/seo`
- Cambiar `structuredData` de objeto a array: `[blogSchema, breadcrumbSchema]`

### 2. Post individual (`src/pages/blog/BlogPost.tsx`)

Igual: cambiar `structuredData` para pasar un array con Article + BreadcrumbList:

```text
Breadcrumb: Inicio > Blog > {título del post}
```

- Importar `getBreadcrumbSchema` desde `@/utils/seo`
- Añadir el breadcrumb schema al array junto con el Article schema existente

## Detalle técnico

No se necesitan cambios en `SEOHead.tsx` ni en `schemas.ts` porque:
- `SEOHead` ya acepta `object | object[]` en su prop `structuredData`
- `getBreadcrumbSchema()` ya genera el formato correcto

Solo se modifican 2 archivos, añadiendo ~5 líneas en cada uno.
