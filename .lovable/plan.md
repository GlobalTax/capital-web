

## Plan: Mover "Valoración de Empresas" de Servicios a Recursos

### Cambios

**1. `src/components/header/data/serviciosData.ts`**
Eliminar el item "Valoración de Empresas" (líneas 32-38) del array de Servicios Principales.

**2. `src/components/header/data/recursosData.ts`**
Añadir "Guía de Valoración de Empresas" en la categoría "Contenido", con href `/valoracion-empresas` e icono `chart-bar`. Posicionarlo como primer item de Contenido para darle visibilidad.

### Resultado
- **Menú Servicios**: Venta, Compra, Valoraciones, Search Funds (sin duplicado)
- **Menú Recursos > Contenido**: Guía de Valoración de Empresas, Informes M&A, Noticias, Blog...
- La página `/valoracion-empresas` sigue existiendo sin cambios, solo cambia dónde aparece en el menú.

