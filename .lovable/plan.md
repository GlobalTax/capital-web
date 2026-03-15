

## Plan: Limpiar schemas en `index.html` — eliminar específicos, mantener globales

### Current State

El `index.html` tiene **4 schemas JSON-LD** hardcodeados:

| Schema | Líneas | Tipo | ¿Mantener? |
|--------|--------|------|------------|
| **Organization** | 45-81 | Global (válido en todas las páginas) | ✅ Sí |
| **FinancialService** | 83-113 | Específico (solo para páginas de servicios) | ❌ No |
| **WebPage** | 115-133 | Global (válido en todas las páginas) | ✅ Sí |
| **FAQPage** | 135-175 | Específico (solo para páginas con FAQs) | ❌ No |

### Problem

- **FinancialService** y **FAQPage** aparecen en el `<head>` global, por lo que se sirven en **todas las URLs** (incluyendo `/venta-empresas`, `/contacto`, `/equipo`, etc.)
- Google puede considerar esto **spam estructurado** o datos incorrectos cuando un schema de "servicios financieros" aparece en una página de contacto
- Estos schemas específicos deberían inyectarse solo vía React (`SEOHead` component) en las páginas correspondientes

### Changes

| Acción | Líneas | Detalle |
|--------|--------|---------|
| **Eliminar** FinancialService | 83-113 | Borrar todo el bloque `<script type="application/ld+json">` del schema FinancialService |
| **Eliminar** FAQPage | 135-175 | Borrar todo el bloque `<script type="application/ld+json">` del schema FAQPage |
| **Mantener** Organization | 45-81 | Schema válido globalmente |
| **Mantener** WebPage | 115-133 | Schema válido globalmente (aunque idealmente debería ser WebSite, eso es otra mejora) |

### Resultado esperado

Solo quedarán **2 schemas** en `index.html`:
- `Organization` — identidad de marca en todas las páginas
- `WebPage` — metadatos de página en todas las páginas

Los schemas **FinancialService** e **FAQPage** deben moverse a inyección dinámica vía `SEOHead` en las páginas específicas donde apliquen (`/servicios/*`, páginas con FAQ, etc.)

