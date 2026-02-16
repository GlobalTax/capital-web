

## Anadir meta tags faltantes a index.html

### Diagnostico

Se han comparado las rutas definidas en `AppRoutes.tsx` (373 lineas, ~80 rutas unicas) con el mapa `R` en `index.html` (38 entradas actuales). Faltan meta tags para las siguientes paginas publicas e indexables:

### Paginas faltantes (agrupadas por tipo)

**Landing Pages (9 rutas):**
| Ruta | Title propuesto |
|------|----------------|
| `/lp/calculadora-b` | Calculadora de Valoracion B - Capittal |
| `/lp/calculadora-meta` | Calculadora de Valoracion - Meta Ads - Capittal |
| `/lp/venta-empresas` | Venta de Empresas - Valoracion Gratuita - Capittal |
| `/lp/venta-empresas-v2` | Vender Tu Empresa al Mejor Precio - Capittal |
| `/lp/suiteloop` | SuiteLoop - Software M&A para Asesorias - Capittal |
| `/lp/accountex` | Capittal en Accountex Madrid 2025 |
| `/lp/valoracion-2026` | Valoracion de Tu Empresa - Cierre de Ano - Capittal |
| `/lp/compra-empresas-meta` | Compra de Empresas - Oportunidades de Inversion - Capittal |
| `/lp/rod-linkedin` | Descarga el ROD - Resumen de Operacion - Capittal |

**Landing Pages adicionales (3 rutas):**
| Ruta | Title propuesto |
|------|----------------|
| `/lp/open-deals` | Open Deals - Empresas en Venta - Capittal |
| `/lp/oportunidades-meta` | Oportunidades de Inversion - Empresas en Venta - Capittal |
| `/lp/simulador-seguridad` | Simulador de Valoracion - Seguridad Privada - Capittal |

**Calculadora de seguridad (1 ruta):**
| Ruta | Title propuesto |
|------|----------------|
| `/seguridad/calculadora` | Calculadora de Valoracion - Empresas de Seguridad - Capittal |

**Recursos (4 rutas):**
| Ruta | Title propuesto |
|------|----------------|
| `/recursos/noticias` | Noticias M&A Espana - Capittal |
| `/recursos/case-studies` | Casos de Estudio M&A - Capittal |
| `/recursos/newsletter` | Newsletter M&A - Capittal Transacciones |
| `/recursos/webinars` | Webinars M&A - Capittal Transacciones |

**Search Funds - Centro de Recursos (10 rutas):**
| Ruta | Title propuesto |
|------|----------------|
| `/search-funds/recursos` | Centro de Recursos Search Funds - Capittal |
| `/search-funds/recursos/guia` | Guia Completa de Search Funds - Capittal |
| `/search-funds/recursos/glosario` | Glosario de Search Funds - Capittal |
| `/search-funds/recursos/herramientas` | Herramientas para Search Funds - Capittal |
| `/search-funds/recursos/casos` | Casos de Exito Search Funds - Capittal |
| `/search-funds/recursos/biblioteca` | Biblioteca Search Funds - Capittal |
| `/search-funds/recursos/comunidad` | Comunidad Search Funds Espana - Capittal |
| `/search-funds/recursos/sourcing` | Sourcing de Empresas para Search Funds - Capittal |
| `/search-funds/recursos/valoracion` | Valoracion en Search Funds - Capittal |
| `/search-funds/recursos/negociacion` | Negociacion en Search Funds - Capittal |
| `/search-funds/recursos/post-adquisicion` | Post-Adquisicion en Search Funds - Capittal |

**Registro Searcher (1 ruta):**
| Ruta | Title propuesto |
|------|----------------|
| `/search-funds/registro-searcher` | Registro de Searcher - Search Funds - Capittal |

**Empleo (1 ruta):**
| Ruta | Title propuesto |
|------|----------------|
| `/oportunidades/empleo` | Empleo en M&A - Trabaja en Capittal |

**Total: 30 rutas faltantes**

### Que NO se anade (y por que)

- Rutas de redireccion (`Navigate to`): no necesitan meta tags, el destino ya los tiene
- Rutas internas: `/admin/*`, `/auth`, `/test/*`, `/v2`, `/favoritos`, `/book/:token`, `/p/:token`
- Variantes de idioma (CA/EN): comparten la misma pagina que la version ES; el script ya cubre la ruta principal. Si se quiere indexar las variantes como paginas separadas, se anadiran en una segunda fase
- Rutas con wildcard (`/*`): usan los mismos meta tags que su ruta base

### Cambios

**Archivo: `index.html`**
- Anadir las 30 entradas al mapa `var R = {...}` con title y description unicos para cada una
- Cada entrada tendra un title descriptivo con la keyword principal y "Capittal" como marca
- Cada description tendra entre 120-160 caracteres, orientada a la intencion de busqueda

### Seccion tecnica

Solo se modifica `index.html`, anadiendo ~30 lineas al objeto `R` dentro del script sincrono de meta tags (lineas 44-82). No hay nuevas dependencias ni cambios en componentes React.

