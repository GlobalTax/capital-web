

## Actualizar meta tags SEO en pages-ssr y diccionarios i18n

### Diagnostico

Todas las paginas solicitadas ya existen en `pages-ssr` con title, description, canonical y JSON-LD. Sin embargo, los textos exactos difieren de los solicitados. Ademas, los diccionarios i18n del cliente (`src/shared/i18n/dictionaries.ts`) tienen sus propios valores que tambien necesitan sincronizarse.

### Cambios de titulo y descripcion

| Pagina | Campo | Valor actual | Valor solicitado |
|--------|-------|-------------|-----------------|
| `/` | title | "Capittal - Especialistas en M&A, Valoraciones y Due Diligence" | "Capittal \| Asesores M&A Especializados en el Sector Seguridad - Barcelona" |
| `/` | description | "Capittal es su socio estrategico en operaciones de fusiones..." | "Capittal Transacciones asesora en fusiones, adquisiciones, valoraciones y due diligence. Especialistas en el sector seguridad con mas de 70 profesionales. Barcelona." |
| `/venta-empresas` | title | "Vender mi Empresa \| Proceso de Venta \| Capittal" | "Venta de Empresas \| Asesoramiento M&A Profesional - Capittal" |
| `/venta-empresas` | description | "Quiere vender su empresa? Capittal le asesora..." | "Quieres vender tu empresa? Capittal te acompana en todo el proceso: valoracion, busqueda de comprador, negociacion y cierre. Maxima confidencialidad." |
| `/compra-empresas` | title | "Comprar una Empresa \| Buy-Side M&A \| Capittal" | "Compra de Empresas \| Asesoria Buy-Side M&A - Capittal" |
| `/compra-empresas` | description | "Busca adquirir una empresa?..." | "Identificamos y evaluamos oportunidades de adquisicion alineadas con tu estrategia de crecimiento. Especialistas en sector seguridad y servicios auxiliares." |
| `/equipo` | title | "Nuestro Equipo \| Profesionales M&A \| Capittal" | "Nuestro Equipo \| +70 Profesionales en M&A - Capittal Transacciones" |
| `/equipo` | description | "Conozca al equipo de Capittal: profesionales con experiencia en banca de inversion..." | "Conoce al equipo de Capittal: profesionales con experiencia en Deloitte, ESADE y las principales firmas de corporate finance de Espana." |
| `/sectores/tecnologia` | title | "M&A Sector Tecnologia \| Tech M&A Espana \| Capittal" | "M&A Sector Tecnologia \| Valoracion de Empresas Tech - Capittal" |
| `/sectores/tecnologia` | description | "Asesoramiento en fusiones y adquisiciones de empresas tecnologicas..." | "Asesoramiento especializado en fusiones y adquisiciones del sector tecnologico. Valoracion, due diligence y negociacion de operaciones tech." |
| `/sectores/industrial` | title | "M&A Sector Industrial \| Fusiones y Adquisiciones Industria \| Capittal" | "M&A Sector Industrial \| Compraventa de Empresas Industriales - Capittal" |
| `/sectores/industrial` | description | "Asesoramiento en M&A del sector industrial..." | "Expertos en transacciones del sector industrial. Asesoramiento integral en valoracion, compraventa y reestructuracion de empresas industriales." |

### Canonicals

Todos los canonicals ya estan correctamente configurados apuntando a su propia URL. La homepage usa `https://capittal.es/` como canonical (correcto).

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/pages-ssr/index.ts` | Actualizar title y description de 7 paginas en `PAGES_DATA` |
| `src/shared/i18n/dictionaries.ts` | Sincronizar las claves `home.seo.*`, `ventaEmpresas.seo.*`, `compraEmpresas.seo.*`, `equipo.seo.*` con los nuevos valores |

### Detalle tecnico

En `pages-ssr/index.ts`, se actualizan los campos `title` y `description` de las entradas `/`, `/venta-empresas`, `/compra-empresas`, `/equipo`, `/sectores/tecnologia` y `/sectores/industrial`. Los campos `keywords`, `canonical`, `structuredData` y `content` no cambian.

En `dictionaries.ts`, se actualizan las claves de idioma espanol (`es`) para que coincidan con los nuevos valores SSR. Las traducciones en catalan e ingles se mantienen tal cual, ya que los valores solicitados son solo en espanol.

Tambien se actualizan los `description` dentro de los objetos `structuredData` (JSON-LD) de cada pagina para mantener coherencia con las nuevas descripciones.

