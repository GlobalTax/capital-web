
# Plan: Template de Firm Deck Corporativo de Capittal con Contenido Real

## Resumen

Mejorar el template de Firm Deck existente con contenido real enriquecido extraído de la web de Capittal, añadiendo más slides y datos corporativos auténticos.

---

## Contenido Real Identificado

### Datos Corporativos (Fuentes Verificadas)
| Métrica | Valor | Fuente |
|---------|-------|--------|
| Valor total asesorado | €902M | Hero.tsx, ValoracionesCTA.tsx |
| Tasa de éxito | 98,7% | MinimalistHero.tsx, múltiples componentes |
| Operaciones cerradas | 200+ | DetailedCaseStudies, varios |
| Profesionales | 60-70+ | MinimalistDifferentiators.tsx |
| Años de experiencia | 25+ años | MinimalistDifferentiators.tsx |
| Tiempo de cierre | 6-8 meses | MinimalistDifferentiators.tsx |
| Incremento valor | +40% más valor | MinimalistDifferentiators.tsx |
| Grupo | Grupo Navarro (Capittal + Navarro Legal) | MinimalistDifferentiators.tsx |

### Diferenciadores Clave
1. **Especialización Exclusiva**: Solo M&A desde hace +25 años
2. **Resultados Medibles**: +40% más valor que media del mercado
3. **Proceso Optimizado**: 6-8 meses vs el doble del mercado
4. **Ecosistema Integral**: 70+ especialistas coordinados
5. **Servicio 360°**: Capittal + Navarro Legal

### Servicios Confirmados
- Valoración de empresas
- Venta de empresas (Sell-side)
- Compra de empresas (Buy-side)
- Due Diligence financiero, fiscal y legal
- Planificación fiscal M&A
- Reestructuraciones y refinanciaciones
- Asesoramiento legal integrado

### Enfoque (4 Pilares)
1. Enfoque Personalizado
2. Confidencialidad Total
3. Eficiencia Temporal
4. Maximización de Valor

---

## Estructura del Nuevo Firm Deck (8 slides)

### Slide 1: Hero - Posicionamiento
| Campo | Contenido |
|-------|-----------|
| Layout | `hero` |
| Headline | Maximizamos el valor de tu empresa |
| Subline | Especialistas exclusivos en M&A desde 2008 |
| Content | Bullets: "Asesoramiento M&A integral en España", "Parte del ecosistema Grupo Navarro", "Más de 70 profesionales especializados" |

### Slide 2: Stats - Track Record
| Campo | Contenido |
|-------|-----------|
| Layout | `stats` |
| Headline | Track Record |
| Subline | Resultados que avalan más de 25 años de experiencia |
| Stats | €902M Valor asesorado, 98,7% Tasa de éxito, 200+ Operaciones cerradas, 70+ Profesionales |

### Slide 3: Bullets - Servicios
| Campo | Contenido |
|-------|-----------|
| Layout | `bullets` |
| Headline | Nuestros Servicios |
| Subline | Acompañamos a empresarios en todo el ciclo de la transacción |
| Bullets | Valoración de empresas, Venta de empresas (Sell-side), Compra de empresas (Buy-side), Due Diligence integral (financiero, fiscal, legal), Planificación fiscal M&A, Reestructuraciones y refinanciaciones |

### Slide 4: Comparison - Diferenciadores
| Campo | Contenido |
|-------|-----------|
| Layout | `comparison` |
| Headline | Lo Que Nos Diferencia |
| Subline | No somos una consultora generalista |
| Options | Especialización Exclusiva (Solo M&A 25+ años), Resultados Medibles (+40% más valor), Proceso Optimizado (6-8 meses), Ecosistema Integral (70+ especialistas), Servicio 360° (Capittal + Navarro Legal) |

### Slide 5: Bullets - Nuestro Enfoque
| Campo | Contenido |
|-------|-----------|
| Layout | `bullets` |
| Headline | Nuestro Enfoque |
| Subline | Un método probado que combina experiencia con servicio personalizado |
| Bullets | Enfoque Personalizado: Estrategia adaptada a tu negocio, Confidencialidad Total: Protocolos estrictos de protección, Eficiencia Temporal: Procesos optimizados sin comprometer calidad, Maximización de Valor: Objetivo de mejor precio y términos |

### Slide 6: Timeline - Proceso de Venta
| Campo | Contenido |
|-------|-----------|
| Layout | `timeline` |
| Headline | Proceso de Venta |
| Subline | Fases del proceso M&A típico (6-8 meses) |
| Phases | 1. Preparación (Análisis y documentación, 1-4 sem), 2. Marketing (Contacto con inversores, 5-8 sem), 3. Ofertas (Recepción y negociación, 9-12 sem), 4. Due Diligence (Verificación exhaustiva, 13-16 sem), 5. Cierre (Firma y transmisión, 17-20 sem) |

### Slide 7: Overview - Grupo Navarro
| Campo | Contenido |
|-------|-----------|
| Layout | `overview` |
| Headline | Ecosistema Grupo Navarro |
| Subline | Servicio integral desde la valoración hasta el cierre legal |
| Content | Capittal (M&A Advisory), Navarro Legal (Asesoramiento jurídico), Beneficios: +15-25% incremento en precio final, Un solo equipo coordinado, Menor riesgo por identificación temprana de contingencias |

### Slide 8: Closing - Contacto
| Campo | Contenido |
|-------|-----------|
| Layout | `closing` |
| Headline | ¿Hablamos? |
| Subline | Contacta con nosotros para una consulta inicial confidencial |
| Content | Email: info@capittal.es, Web: www.capittal.es, CTA: "Solicitar reunión", Disclaimer: "Primera consulta sin compromiso" |

---

## Implementación Técnica

### 1. Actualizar useCapittalFirmDeckSeeder.ts

**Archivo**: `src/features/presentations/hooks/useCapittalFirmDeckSeeder.ts`

Cambios:
- Expandir de 6 a 8 slides
- Añadir slide de Diferenciadores (layout: `comparison`)
- Añadir slide del Grupo Navarro (layout: `overview`)
- Actualizar métricas con datos más precisos (70+ profesionales, +25 años)
- Añadir contenido de enfoque y metodología real
- Mejorar metadata con más información corporativa

### 2. Actualizar template en base de datos (opcional)

**SQL Migration**: Actualizar el template "Firm Presentation" en `presentation_templates` con la estructura de Capittal como ejemplo base.

---

## Cambios en Archivos

| Archivo | Cambio |
|---------|--------|
| `src/features/presentations/hooks/useCapittalFirmDeckSeeder.ts` | Reescribir con 8 slides y contenido real enriquecido |

---

## Datos Específicos por Slide

### Slide Stats - Métricas Exactas
```typescript
stats: [
  { value: '€902M', label: 'Valor asesorado', suffix: '' },
  { value: '98,7%', label: 'Tasa de éxito', suffix: '' },
  { value: '200+', label: 'Operaciones cerradas', suffix: '' },
  { value: '70+', label: 'Profesionales', suffix: '' }
]
```

### Slide Diferenciadores - Datos Reales
```typescript
differentiators: [
  { metric: 'Solo M&A', title: 'Especialización Exclusiva', description: '+25 años dedicados exclusivamente a M&A' },
  { metric: '+40% valor', title: 'Resultados Medibles', description: 'Valoraciones superiores a la media del mercado' },
  { metric: '6-8 meses', title: 'Proceso Optimizado', description: 'Tiempos reducidos sin comprometer calidad' },
  { metric: '70+ expertos', title: 'Ecosistema Integral', description: 'Abogados, fiscales, laborales y economistas' },
  { metric: 'Servicio 360°', title: 'Grupo Navarro', description: 'Capittal + Navarro Legal integrados' }
]
```

---

## Resultado Esperado

- Firm Deck profesional de 8 slides con datos corporativos reales de Capittal
- Contenido extraído y verificado de la web actual
- Diferenciadores competitivos destacados
- Proceso de venta con tiempos reales
- Integración con Grupo Navarro visible
- Métricas de track record actualizadas
- Un clic para generar la presentación completa lista para editar
