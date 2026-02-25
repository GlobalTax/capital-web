
# Informes Trimestrales M&A: Seccion de Autoridad para Capittal

## Objetivo

Crear una seccion dedicada de informes trimestrales del mercado M&A en Espana dentro del blog existente, con datos propietarios de Capittal. Estos informes seran contenido citable por motores de IA gracias a datos unicos, structured data `Report` y formato optimizado para AEO.

## Estrategia

En lugar de crear una infraestructura nueva, aprovecharemos el sistema de blog existente (`blog_posts` table) con una nueva categoria "Informes M&A" y una pagina hub dedicada en `/recursos/informes-ma` que agrega y presenta estos informes con un diseno diferenciado.

## Arquitectura

```text
/recursos/informes-ma (HUB) --> Lista todos los informes trimestrales
    |
    +--> /blog/informe-ma-q1-2025  (post individual con structured data Report)
    +--> /blog/informe-ma-q4-2024
    +--> /blog/informe-ma-q3-2024
    ...
```

Los informes se crean como blog posts con categoria "Informes M&A", lo que permite gestionarlos desde el admin existente sin cambios en la base de datos.

## Cambios Planificados

### 1. Nueva pagina hub: `src/pages/recursos/InformesMA.tsx`

Pagina dedicada que:
- Filtra blog posts con categoria "Informes M&A"
- Presenta un hero con contexto de autoridad ("Datos propietarios de mas de 500 valoraciones realizadas")
- Muestra los informes en formato cronologico con tarjetas destacadas
- Incluye metricas clave visibles (numero de operaciones analizadas, sectores cubiertos, anos de datos)
- Tiene un CTA para suscripcion al newsletter
- Structured data: `CollectionPage` + `DataCatalog` para que los bots entiendan que es una coleccion de informes con datos propietarios

### 2. Primer informe semilla: Contenido pre-creado

Crear un blog post de 2000+ palabras como primer informe trimestral (Q4 2024) con:
- Resumen ejecutivo del mercado M&A en Espana
- Volumen de operaciones y tendencias
- Multiplos EV/EBITDA por sector (datos propietarios de Capittal)
- Sectores mas activos
- Perspectivas para el siguiente trimestre
- Tablas con datos numericos concretos y citables
- Metodologia de analisis

Este contenido se insertara directamente en la tabla `blog_posts` usando el insert tool.

### 3. Ruta en AppRoutes.tsx

Anadir lazy import y ruta `/recursos/informes-ma`.

### 4. SSR en pages-ssr/index.ts

Anadir metadata y structured data para `/recursos/informes-ma` con schema `CollectionPage`.

### 5. Navegacion: recursosData.ts

Anadir "Informes M&A" al menu de Recursos en la navegacion principal.

### 6. Categoria en useBlogCategories.tsx

Anadir "Informes M&A" a las categorias predefinidas.

## Detalle Tecnico

### Archivos a crear
- `src/pages/recursos/InformesMA.tsx` - Pagina hub de informes

### Archivos a modificar
- `src/core/routing/AppRoutes.tsx` - Nueva ruta `/recursos/informes-ma`
- `src/components/header/data/recursosData.ts` - Enlace en navegacion
- `src/hooks/useBlogCategories.tsx` - Nueva categoria predefinida
- `supabase/functions/pages-ssr/index.ts` - Metadata SSR

### Datos a insertar (via insert tool)
- 1 blog post semilla: "Informe Trimestral M&A Espana - Q4 2024" con datos propietarios, tablas de multiplos sectoriales y analisis de tendencias

### Structured Data del hub
- `CollectionPage`: Describe la coleccion de informes
- `DataCatalog`: Indica que contiene datasets propietarios
- Cada informe individual hereda el schema `Article` existente del BlogPost

### Diseno del hub
- Hero con estadisticas de autoridad (operaciones analizadas, sectores, anos)
- Grid de informes con indicadores visuales de trimestre/ano
- Sidebar con metricas clave y CTA de suscripcion
- Estilo consistente con el blog existente (mismo layout UnifiedLayout)

### Principios AEO aplicados
- Datos numericos concretos y unicos (no disponibles en competidores)
- Formato tabular citable por LLMs
- Metadata "datePublished" para frescura de datos
- Nomenclatura consistente en slugs para indexacion serial
- Internal links bidireccionales con `/valoracion-empresas` y `/guia-valoracion-empresas`
