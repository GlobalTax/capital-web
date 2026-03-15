

# Auditoría de Páginas de Servicio: Marketing, SEO y Conversión

## Resumen Ejecutivo

He revisado en profundidad las 8 páginas de servicio activas. Hay una base sólida pero con inconsistencias significativas que afectan al SEO, la conversión y la experiencia del usuario.

---

## 1. PROBLEMAS CRÍTICOS DE SEO

### 1.1 FAQ Schema ausente en 6 de 7 páginas
Solo **Search Funds** inyecta `getFAQSchema` como structured data. Las otras 6 páginas (Venta, Valoraciones, Due Diligence, Reestructuraciones, Legal, Fiscal) tienen FAQs visibles pero **no generan el schema FAQ de Google**. Esto significa que Google no puede mostrar los rich snippets de preguntas/respuestas en los resultados de busqueda.

**Impacto**: Pérdida de visibilidad SERP significativa. Las FAQs son uno de los rich results más efectivos para servicios profesionales.

### 1.2 Breadcrumb Schema ausente en Venta y Compra
- `VentaEmpresas.tsx`: No tiene `getBreadcrumbSchema`
- `CompraEmpresas.tsx`: No tiene `getBreadcrumbSchema`
- Las otras 5 sí lo tienen.

### 1.3 CompraEmpresas tiene SEOHead fuera de UnifiedLayout
```
<>
  <SEOHead ... />     ← fuera
  <UnifiedLayout>     ← dentro
```
Las otras páginas lo tienen dentro. Debería ser consistente (funciona igual, pero es una inconsistencia de código).

---

## 2. PROBLEMAS DE CONVERSIÓN

### 2.1 CTA final inconsistente entre páginas
| Página | CTA final | Formulario | Contacto directo |
|--------|-----------|------------|------------------|
| **Venta** | Formulario Contact embebido | Si | Si (en form) |
| **Compra** | Formulario Contact embebido | Si | Si (en form) |
| **Valoraciones** | Calculadora + Form profesional | Si | Si (tel) |
| **Search Funds** | Formulario Contact embebido | Si | Si |
| **Due Diligence** | Solo texto + tel/email | **No** | Si |
| **Reestructuraciones** | Solo texto + tel/email | **No** | Si |
| **Legal** | Solo botón a /contacto + tel/email | **No** | Si |
| **Fiscal** | Dialog form + descarga guía | Si | Si |

**Problema grave**: Due Diligence, Reestructuraciones y Legal no tienen formulario de contacto en la página. El usuario tiene que llamar, enviar email, o navegar a /contacto. Esto rompe la regla de oro de conversión: **nunca saques al usuario de la página donde ya está convencido**.

### 2.2 Hero CTAs inconsistentes
| Página | CTA primario | Destino |
|--------|-------------|---------|
| Venta | "Valorar mi empresa" | /lp/calculadora |
| Compra | "Solicitar Consulta" | scroll #contact |
| Valoraciones | "Valorar Empresa" | /lp/calculadora-web |
| Search Funds | "Quiero vender" | scroll #contact |
| Due Diligence | "Solicitar Análisis" | /contacto (sale de página) |
| Reestructuraciones | "Evaluar Reestructuración" | /contacto (sale de página) |
| Legal | "Consulta" | window.location /contacto |
| Fiscal | "Consulta Fiscal Gratuita" | /contacto (sale de página) |

**Problema**: Due Diligence, Reestructuraciones, Legal y Fiscal envían al usuario a `/contacto`, sacándolo de la página de servicio donde se estaba generando confianza.

### 2.3 AsesoramientoLegal usa SimpleButton en vez de InteractiveHoverButton
Rompe la consistencia visual con el resto de páginas y el estándar definido.

---

## 3. MÉTRICAS HARDCODED INCONSISTENTES

Los datos se repiten entre hero y CTA pero con valores distintos:

| Métrica | Hero Venta | Hero Valoraciones | Hero Compra | Hero Legal | CTA DD | CTA Reestr. |
|---------|-----------|------------------|-------------|-----------|--------|-------------|
| Operaciones | 200+ | 500+ valoradas | 47 adquisiciones | +100 | 150+ DD | - |
| Valor | €902M | €902M | €180M | 905 millones | €1.8B | €450M |
| Éxito | 98,7% | 98,7% precisión | 92% | - | 98% | 87% |

**Problema**: "905 millones" vs "€902M" vs "€1.8B" vs "€450M" son datos que parecen inventados y contradictorios. Si un usuario visita 2 páginas y ve cifras diferentes, pierde confianza.

---

## 4. ESTRUCTURA DE CONTENIDO

### 4.1 Secciones por página (actual)
| Página | Hero | Why/Types | Process | Benefits | Operations | FAQ | CTA |
|--------|------|-----------|---------|----------|------------|-----|-----|
| Venta | Yes | Benefits | Process | Valuation | Yes | Yes | Contact |
| Compra | Yes | Strategy | Process | WhyUs | Stories | No | Contact |
| Valoraciones | Yes | Methodology | Process | Benefits | Yes | Yes | Calculator+Form |
| Search Funds | Yes | WhatAre+Compare | Process | WhyCapittal | Grid | Yes | Contact |
| Due Diligence | Yes | Types | Process | Benefits | Yes | Yes | Texto |
| Reestructuraciones | Yes | - | Process | Benefits | Yes | Yes | Texto |
| Legal | Yes | WhyChoose | Services | Benefits | Yes | Yes | Texto |
| Fiscal | Yes | WhyOptimize | Services | - | Yes | Yes | Form+Guide |

**Compra no tiene FAQ** - oportunidad perdida de SEO.

---

## 5. PLAN DE MEJORAS RECOMENDADO

### Prioridad 1 - SEO (impacto alto, esfuerzo bajo)
1. **Añadir `getFAQSchema` a las 6 páginas que no lo tienen** (Venta, Valoraciones, DD, Reestructuraciones, Legal, Fiscal)
2. **Añadir `getBreadcrumbSchema` a Venta y Compra**
3. **Crear FAQ para Compra** y añadir su schema

### Prioridad 2 - Conversión (impacto alto, esfuerzo medio)
4. **Añadir formulario de contacto embebido (Contact component) al final de DD, Reestructuraciones y Legal**, igual que Venta y Search Funds, en lugar de solo mostrar tel/email
5. **Cambiar los CTAs de hero que van a /contacto** (DD, Reestructuraciones, Legal, Fiscal) para que hagan scroll al formulario de la propia página
6. **Reemplazar SimpleButton por InteractiveHoverButton en Legal**

### Prioridad 3 - Consistencia de datos (impacto medio)
7. **Unificar métricas**: Todas las páginas deberían usar los datos de `key_statistics` (Supabase) en lugar de hardcodear cifras distintas. ServiceClosedOperations ya lo hace correctamente; los heroes y CTAs deberían seguir el mismo patrón.

### Prioridad 4 - Mejoras adicionales
8. **Normalizar estructura de Compra**: Mover SEOHead dentro de UnifiedLayout
9. **Añadir hreflang a las páginas que no lo tienen** (DD, Reestructuraciones, Legal, Fiscal no usan `useHreflang` o lo usan pero sin traducciones reales)

---

## Resumen de impacto estimado

| Mejora | Esfuerzo | Impacto SEO | Impacto Conversión |
|--------|----------|-------------|-------------------|
| FAQ Schema en 6 páginas | Bajo | Alto | Medio |
| Breadcrumbs en Venta/Compra | Muy bajo | Medio | - |
| Formulario embebido en DD/Reestr./Legal | Medio | - | Alto |
| CTAs scroll en vez de /contacto | Bajo | - | Alto |
| Unificar métricas desde Supabase | Medio | Bajo | Medio |
| FAQ para Compra | Medio | Alto | Medio |

