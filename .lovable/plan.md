

## Anadir meta tags faltantes - Variantes multiidioma y sub-paginas

### Diagnostico

Se han comparado las 229 rutas de `AppRoutes.tsx` con las 68 entradas actuales del mapa `R` en `index.html`. Excluyendo redirects (`Navigate to`), rutas internas (`/admin`, `/auth`, `/test`, `/v2`), rutas privadas (`/favoritos`, `/book/:token`, `/p/:token`) y wildcards (`/*`), faltan **50 rutas publicas indexables**.

### Rutas faltantes por categoria

**Paginas principales - Catalan (10 rutas):**
| Ruta | Title |
|------|-------|
| `/ca` | Capittal Transaccions - Fusions i Adquisicions a Espanya - M&A Advisory |
| `/inici` | Capittal Transaccions - Fusions i Adquisicions a Espanya |
| `/venda-empreses` | Venda d'Empreses a Espanya - Assessorament M&A - Capittal |
| `/contacte` | Contacte - Capittal Transaccions - M&A Barcelona |
| `/equip` | Equip de Professionals M&A - Capittal Transaccions |
| `/casos-exit` | Casos d'Exit - Operacions M&A - Capittal |
| `/per-que-triar-nos` | Per Que Triar-nos - Capittal Transaccions |
| `/programa-col·laboradors` | Programa de Col·laboradors - Capittal |
| `/programa-col-laboradors` | Programa de Col·laboradors - Capittal |

**Paginas principales - English (8 rutas):**
| Ruta | Title |
|------|-------|
| `/en` | Capittal - Mergers & Acquisitions Advisory in Spain |
| `/sell-companies` | Sell Your Company in Spain - M&A Advisory - Capittal |
| `/buy-companies` | Buy Companies in Spain - Buy-Side Advisory - Capittal |
| `/contact` | Contact - Capittal - M&A Barcelona |
| `/success-stories` | Success Stories - M&A Transactions - Capittal |
| `/why-choose-us` | Why Choose Us - Capittal M&A Advisory |
| `/collaborators-program` | Collaborators Program - Capittal |
| `/partners-program` | Partners Program - Capittal M&A Advisory |

**Servicios - Catalan (6 rutas):**
| Ruta | Title |
|------|-------|
| `/serveis/valoracions` | Valoracio d'Empreses - Multiples EBITDA i DCF - Capittal |
| `/serveis/venda-empreses` | Venda d'Empreses a Espanya - Assessorament M&A - Capittal |
| `/serveis/due-diligence` | Due Diligence Financera i Fiscal - M&A Espanya - Capittal |
| `/serveis/assessorament-legal` | Assessorament Legal en M&A - Capittal |
| `/serveis/reestructuracions` | Reestructuracio d'Empreses - Assessorament Financer - Capittal |
| `/serveis/planificacio-fiscal` | Planificacio Fiscal en Venda d'Empreses - Capittal |

**Servicios - English (6 rutas):**
| Ruta | Title |
|------|-------|
| `/services/valuations` | Business Valuation Services - EBITDA Multiples & DCF - Capittal |
| `/services/sell-companies` | Sell-Side M&A Advisory in Spain - Capittal |
| `/services/due-diligence` | Financial & Tax Due Diligence - M&A Spain - Capittal |
| `/services/legal-advisory` | Legal Advisory in M&A - Capittal |
| `/services/restructuring` | Business Restructuring Advisory - Capittal |
| `/services/tax-planning` | Tax Planning for Company Sales - Capittal |

**Sectores - Catalan (10 rutas):**
| Ruta | Title |
|------|-------|
| `/sectors/tecnologia` | M&A Tecnologia Espanya - Venda Empreses Tech - Capittal |
| `/sectors/salut` | M&A Salut Espanya - Venda Empreses Sanitaries - Capittal |
| `/sectors/industrial` | M&A Industrial Espanya - Venda Empreses Industrials - Capittal |
| `/sectors/retail-consum` | M&A Retail i Consum - Capittal |
| `/sectors/energia` | M&A Energia Espanya - Venda Empreses Energetiques - Capittal |
| `/sectors/seguretat` | M&A Seguretat Privada Espanya - Capittal |
| `/sectors/construccio` | M&A Sector Construccio - Capittal |
| `/sectors/alimentacio` | M&A Sector Alimentacio - Capittal |
| `/sectors/logistica` | M&A Sector Logistica - Capittal |
| `/sectors/medi-ambient` | M&A Sector Medi Ambient - Capittal |

**Sectores - English (5 rutas):**
| Ruta | Title |
|------|-------|
| `/sectors/technology` | M&A Technology Spain - Tech Company Sales - Capittal |
| `/sectors/healthcare` | M&A Healthcare Spain - Health Company Sales - Capittal |
| `/sectors/retail-consumer` | M&A Retail & Consumer Spain - Capittal |
| `/sectors/energy` | M&A Energy Spain - Energy Company Sales - Capittal |
| `/sectors/security` | M&A Private Security Spain - Capittal |

**Sub-paginas espanol (3 rutas):**
| Ruta | Title |
|------|-------|
| `/por-que-elegirnos/experiencia` | Nuestra Experiencia en M&A - Capittal |
| `/por-que-elegirnos/metodologia` | Metodologia de Trabajo M&A - Capittal |
| `/por-que-elegirnos/resultados` | Resultados en Operaciones M&A - Capittal |

**Otras rutas (2 rutas):**
| Ruta | Title |
|------|-------|
| `/servicios/asesoramiento-legal/tecnico` | Asesoramiento Legal Tecnico en M&A - Capittal |
| `/search-funds` | Search Funds - Asesoramiento Especializado - Capittal |

### Rutas excluidas (no necesitan meta tags)

- Redirects (`Navigate to`): `/home`, `/compra-empreses`, `/nosotros`, `/marketplace`, `/blog`, `/calculadora-valoracion`, etc.
- Internas: `/admin/*`, `/auth`, `/test/*`, `/v2`
- Privadas: `/favoritos`, `/book/:token`, `/p/:token`
- Paginas de confirmacion: `/lp/calculadora-meta/gracias`, `/lp/valoracion-2026/gracias`, `/search-funds/registro-confirmado` (noindex)
- Test: `/recursos/test-exit-ready`
- Dinamicas con slug: `/blog/:slug`, `/oportunidades/empleo/:slug`, `/landing/:slug` (gestionadas por React)
- Standalone interno: `/calculadora-standalone`

### Cambios

**Archivo: `index.html`**
- Anadir 50 nuevas entradas al mapa `var R = {...}` con title y description unicos en el idioma correspondiente
- Cada entrada en catalan tendra title/description en catalan
- Cada entrada en ingles tendra title/description en ingles
- Las sub-paginas en espanol tendran meta tags especificos

### Seccion tecnica

Solo se modifica `index.html`, expandiendo el objeto `R` de 68 a 118 entradas dentro del script sincrono de meta tags. No hay nuevas dependencias ni cambios en componentes React. Las descriptions tendran entre 120-160 caracteres, optimizadas para la intencion de busqueda en cada idioma.

