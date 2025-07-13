-- Insertar posts del blog con contenido real
INSERT INTO blog_posts (
  title,
  slug,
  excerpt,
  content,
  author_name,
  category,
  tags,
  reading_time,
  is_published,
  is_featured,
  published_at,
  meta_title,
  meta_description
) VALUES 
(
  'Guía Completa de Valoración de Empresas Tecnológicas 2024',
  'valoracion-empresas-tecnologicas-2024',
  'Metodologías avanzadas para valorar empresas tech: desde startups hasta scaleups. Múltiplos actualizados, casos prácticos y análisis de tendencias.',
  '# Guía Completa de Valoración de Empresas Tecnológicas 2024

## Introducción

La valoración de empresas tecnológicas presenta desafíos únicos que requieren metodologías especializadas. En 2024, hemos observado cambios significativos en los múltiplos y enfoques de valoración.

## Metodologías Clave

### 1. Método de Múltiplos de Mercado
- EV/Revenue: 3-15x según madurez
- EV/EBITDA: 15-50x para empresas rentables
- Price/Book: Variable según activos intangibles

### 2. Descuento de Flujos de Caja (DCF)
- WACC ajustado por riesgo tech: 12-18%
- Tasa de crecimiento perpetuo: 2-4%
- Análisis de sensibilidad crítico

### 3. Valoración por Activos
- Propiedad intelectual
- Base de datos y usuarios
- Tecnología propietaria

## Casos Prácticos

**Caso 1: Startup SaaS B2B**
- Facturación: 2M€ ARR
- Crecimiento: 150% YoY
- Valoración: 12-18M€ (6-9x Revenue)

**Caso 2: Marketplace Digital**
- GMV: 50M€
- Take rate: 8%
- Valoración: 80-120M€

## Tendencias 2024

1. **Mayor foco en rentabilidad**: Los múltiplos privilegian EBITDA positivo
2. **AI Premium**: Empresas con IA real obtienen múltiplos superiores
3. **ESG Integration**: Criterios sostenibilidad impactan valoración

## Conclusiones

La valoración tech requiere un enfoque multidisciplinar que combine métricas tradicionales con indicadores específicos del sector digital.',
  'Ana Rodríguez, Director de Valoraciones',
  'Valoración',
  ARRAY['Tecnología', 'Valoración', 'SaaS', 'Startups', 'DCF'],
  12,
  true,
  true,
  '2024-12-15 10:00:00+00:00',
  'Valoración de Empresas Tecnológicas 2024 - Guía Completa | Capittal',
  'Metodologías especializadas para valorar empresas tech. Múltiplos actualizados, casos prácticos y tendencias 2024. Guía completa de expertos.'
),
(
  'Tendencias M&A España 2024: Sectores en Auge',
  'tendencias-ma-espana-2024',
  'Análisis del mercado M&A español: sectores más activos, volúmenes de transacción y previsiones para 2025.',
  '# Tendencias M&A España 2024: Sectores en Auge

## Panorama General

El mercado español de M&A ha mostrado una recuperación sólida en 2024, con un crecimiento del 23% en número de operaciones respecto a 2023.

## Sectores Más Activos

### 1. Tecnología y Software (34% del total)
- Fintech: 45 operaciones
- Healthtech: 28 operaciones
- Proptech: 19 operaciones

### 2. Servicios Financieros (18%)
- Consolidación bancaria regional
- Insurtech en crecimiento
- Asset management

### 3. Healthcare y Farma (15%)
- Laboratorios especializados
- Servicios sanitarios privados
- Biotecnología

### 4. Energías Renovables (12%)
- Parques eólicos
- Solar fotovoltaica
- Almacenamiento energético

## Múltiplos por Sector

**Tecnología**: 8-25x EBITDA
**Healthcare**: 12-20x EBITDA
**Energía**: 6-15x EBITDA
**Servicios**: 5-12x EBITDA

## Origen del Capital

- **Nacional**: 65% de las operaciones
- **Internacional**: 35% (Francia e Itália lideran)
- **Private Equity**: 42% del valor total

## Predicciones 2025

1. **Consolidación tech** continuará
2. **AI y Data** serán premium
3. **ESG** como factor crítico
4. **Cross-border** aumentará 15%

## Oportunidades de Inversión

- Empresas familiares en digitalización
- Startups con tracción demostrada
- Assets energéticos en transición',
  'Carlos Martínez, Managing Partner',
  'Tendencias',
  ARRAY['M&A', 'España', 'Tendencias', 'Private Equity', 'Sectores'],
  10,
  true,
  true,
  '2024-12-12 09:00:00+00:00',
  'Tendencias M&A España 2024 - Sectores en Auge | Capittal',
  'Análisis completo del mercado M&A español 2024. Sectores más activos, múltiplos de valoración y previsiones 2025. Datos exclusivos de expertos.'
),
(
  'Due Diligence en Adquisiciones: Checklist Completo',
  'due-diligence-checklist-completo',
  'Proceso exhaustivo de due diligence para adquisiciones exitosas. Red flags, documentación crítica y mejores prácticas.',
  '# Due Diligence en Adquisiciones: Checklist Completo

## Introducción

Un proceso de due diligence riguroso es fundamental para el éxito de cualquier adquisición. Esta guía proporciona un framework completo basado en nuestra experiencia en +200 transacciones.

## 1. Due Diligence Financiero

### Análisis Histórico (3-5 años)
- [ ] Estados financieros auditados
- [ ] Análisis de márgenes y rentabilidad
- [ ] Flujos de caja operativos
- [ ] Capital de trabajo normalizado
- [ ] CAPEX histórico y proyectado

### Calidad de Ingresos
- [ ] Concentración de clientes (>10% facturación)
- [ ] Contratos a largo plazo vs spot
- [ ] Estacionalidad y ciclicidad
- [ ] Pricing power y elasticidad

### Estructura de Costes
- [ ] Costes fijos vs variables
- [ ] Dependencia de proveedores críticos
- [ ] Escalabilidad operativa
- [ ] Benchmarking sectorial

## 2. Due Diligence Comercial

### Mercado y Competencia
- [ ] Tamaño y crecimiento del mercado
- [ ] Posicionamiento competitivo
- [ ] Barreras de entrada
- [ ] Amenazas disruptivas

### Base de Clientes
- [ ] Segmentación y perfil
- [ ] Satisfacción y retención
- [ ] Pipeline comercial
- [ ] Estrategia de expansión

## 3. Due Diligence Operacional

### Procesos y Sistemas
- [ ] Mapeo de procesos críticos
- [ ] Sistemas IT y digitalización
- [ ] Certificaciones de calidad
- [ ] Capacidad productiva

### Recursos Humanos
- [ ] Organigrama y competencias clave
- [ ] Retención de talento crítico
- [ ] Cultura organizacional
- [ ] Pasivos laborales

## 4. Due Diligence Legal

### Estructura Corporativa
- [ ] Titularidad y governance
- [ ] Contratos material
- [ ] Propiedad intelectual
- [ ] Contingencias legales

### Compliance y Regulatorio
- [ ] Licencias y permisos
- [ ] Cumplimiento normativo
- [ ] Exposición regulatoria
- [ ] ESG y sostenibilidad

## 5. Red Flags Críticos

⚠️ **Señales de Alarma**:
- Concentración excesiva (>30% en 1 cliente)
- Deterioro márgenes sin explicación
- Alta rotación directivos
- Contingencias ocultas
- Falta transparencia financiera

## 6. Timeline Recomendado

**Semana 1-2**: Due diligence financiero y comercial
**Semana 3-4**: Operacional y legal
**Semana 5-6**: Consolidación y valoración final

## Conclusiones

Un due diligence exhaustivo reduce significativamente el riesgo de la transacción y permite una valoración más precisa.',
  'Miguel Santos, Director de Transacciones',
  'Due Diligence',
  ARRAY['Due Diligence', 'M&A', 'Adquisiciones', 'Risk Management', 'Checklist'],
  15,
  true,
  false,
  '2024-12-10 11:00:00+00:00',
  'Due Diligence Completo para Adquisiciones - Checklist Experto | Capittal',
  'Guía completa de due diligence para M&A. Checklist exhaustivo, red flags y mejores prácticas. Framework probado en +200 transacciones.'
),
(
  'Preparación de Empresas para Venta: Guía Estratégica',
  'preparacion-empresas-venta-guia',
  'Estrategias para maximizar el valor de empresa antes de la venta. Timeline, mejores prácticas y casos de éxito reales.',
  '# Preparación de Empresas para Venta: Guía Estratégica

## Por Qué es Crucial la Preparación

Una preparación adecuada puede incrementar la valoración entre 15-30%. Nuestro análisis de 150+ transacciones demuestra el impacto directo de la preparación en el éxito del proceso.

## Timeline de Preparación (12-18 meses)

### Fase 1: Diagnóstico y Planificación (Meses 1-3)

#### Auditoría Inicial
- [ ] **Análisis financiero**: Normalización EBITDA, working capital
- [ ] **Benchmark sectorial**: Múltiplos y comparables
- [ ] **Gap analysis**: Identificación de áreas de mejora
- [ ] **Valoración preliminar**: Rango orientativo

#### Estrategia de Salida
- [ ] **Objetivos del proceso**: Valor mínimo, timing, estructura
- [ ] **Universo de compradores**: Estratégicos vs financieros
- [ ] **Estructura óptima**: Asset vs share deal
- [ ] **Equipo asesor**: Investment bank, legal, fiscal

### Fase 2: Optimización (Meses 4-9)

#### Mejoras Financieras
- [ ] **Clean-up** cuentas anuales
- [ ] **Optimización fiscal**: Estructura eficiente
- [ ] **Working capital**: Reducción días cobro/pago
- [ ] **CAPEX**: Plan inversiones críticas

#### Mejoras Operacionales
- [ ] **Procesos**: Automatización y eficiencia
- [ ] **Sistemas**: ERP, CRM, reporting
- [ ] **Talento**: Retención equipo clave
- [ ] **Compliance**: Normalización regulatoria

#### Mejoras Estratégicas
- [ ] **Diversificación**: Reducir concentración clientes
- [ ] **Contractualización**: Fidelizar base cliente
- [ ] **Digitalización**: Capabilities tech
- [ ] **ESG**: Iniciativas sostenibilidad

### Fase 3: Ejecución (Meses 10-12)

#### Preparación Documentación
- [ ] **Information Memorandum**: Documento comercial
- [ ] **Data room**: Documentación técnica
- [ ] **Financial model**: Proyecciones y sensibilidades
- [ ] **Legal clean-up**: Contratos y contingencias

#### Proceso de Venta
- [ ] **Long list**: 30-50 potenciales compradores
- [ ] **Short list**: 8-12 candidatos cualificados
- [ ] **Ofertas indicativas**: Valoración y estructura
- [ ] **Due diligence**: Gestión proceso
- [ ] **Ofertas finales**: Negociación y cierre

## Casos de Éxito

### Caso A: Empresa Industrial
**Situación inicial**: 15M€ EBITDA, múltiplo 8x
**Después de preparación**: 18M€ EBITDA, múltiplo 12x
**Resultado**: +62% valoración final

**Mejoras clave**:
- Diversificación geográfica: Europa +35%
- Digitalización procesos: Margen +2pp
- Equipo management profesional

### Caso B: Empresa Servicios
**Situación inicial**: 8M€ EBITDA, múltiplo 6x
**Después de preparación**: 10M€ EBITDA, múltiplo 9x
**Resultado**: +88% valoración final

**Mejoras clave**:
- Contractualización clientes: 75% ingresos recurrentes
- Expansión digital: 40% servicios online
- Certificaciones calidad y sostenibilidad

## Factores Críticos de Éxito

### 1. Leadership Commitment
- Involucración CEO/propietarios
- Asignación recursos adecuados
- Comunicación transparente equipo

### 2. Timing Óptimo
- Momento mercado favorable
- Ciclo negocio en peak
- Sin disrupciones internas

### 3. Asesoramiento Experto
- Investment bank sectorial
- Abogados M&A especializados
- Asesores fiscales transaccionales

## ROI de la Preparación

**Inversión típica**: 1-3% valor empresa
**Retorno promedio**: 20-40% valoración adicional
**Probabilidad éxito**: +75% vs procesos sin preparar

## Conclusiones

La preparación estratégica es la palanca más efectiva para maximizar valor en una venta. Requiere tiempo, recursos y expertise, pero el retorno es significativo tanto en valoración como en probabilidad de éxito.',
  'David López, Partner',
  'Venta de Empresas',
  ARRAY['Venta Empresas', 'Estrategia', 'Valoración', 'Preparación', 'M&A'],
  18,
  true,
  true,
  '2024-12-08 08:00:00+00:00',
  'Preparación Empresas para Venta - Guía Estratégica Completa | Capittal',
  'Maximiza el valor de tu empresa antes de la venta. Guía estratégica completa con timeline, casos de éxito y mejores prácticas probadas.'
),
(
  'Private Equity vs Deuda: Financiación para Adquisiciones',
  'private-equity-vs-deuda-financiacion',
  'Comparativa exhaustiva entre fuentes de financiación para M&A. Ventajas, desventajas y estructura óptima según tipo de operación.',
  '# Private Equity vs Deuda: Financiación para Adquisiciones

## Introducción

La elección de la estructura de financiación es crítica en cualquier operación M&A. Analizamos las principales alternativas y sus aplicaciones óptimas.

## 1. Private Equity

### Características
- **Equity stake**: 30-80% del capital
- **Horizonte**: 4-7 años típicamente
- **Target returns**: 15-25% IRR
- **Governance**: Activa participación en gestión

### Ventajas
✅ **Mayor capacidad adquisitiva**: Leverage típico 4-6x EBITDA
✅ **Expertise sectorial**: Conocimiento y red de contactos
✅ **Governance profesional**: Best practices y reporting
✅ **Exit strategy**: Experiencia en procesos de salida

### Desventajas
❌ **Dilución control**: Pérdida autonomía decisional
❌ **Presión resultados**: Targets ambiciosos corto plazo
❌ **Coste capital**: 15-25% vs 5-8% deuda
❌ **Complejidad**: Due diligence exhaustivo y negociación

### Casos de Uso Óptimos
- Adquisiciones >50M€ enterprise value
- Sectores fragmentados con oportunidades consolidación
- Management experimentado y alineado
- Growth capital para expansión internacional

## 2. Financiación con Deuda

### Tipos de Deuda

#### Deuda Senior
- **Coste**: Euribor + 2-4%
- **Leverage**: 3-4x EBITDA
- **Amortización**: 5-7 años
- **Garantías**: Assets y cash flow

#### Deuda Mezzanine
- **Coste**: 8-12% + equity kicker
- **Leverage**: 1-2x EBITDA adicional
- **Subordinación**: A deuda senior
- **Flexibilidad**: PIK interest opciones

### Ventajas
✅ **Mantenimiento control**: 100% ownership post-pago
✅ **Coste capital menor**: 5-8% all-in vs 15-25% equity
✅ **Flexibilidad operativa**: Menos restricciones gestión
✅ **Simplicidad**: Proceso más ágil y directo

### Desventajas
❌ **Capacidad limitada**: Leverage máximo 4-5x EBITDA
❌ **Servicio deuda**: Cash flow comprometido
❌ **Covenants**: Restricciones financieras y operativas
❌ **Riesgo refinanciación**: Exposición tipos interés

## 3. Estructuras Híbridas

### Combo Deuda + Mezzanine
**Estructura típica**:
- Equity: 30%
- Deuda senior: 50% (3.5x EBITDA)
- Mezzanine: 20% (1.5x EBITDA)

**Beneficios**:
- Optimización coste capital
- Mayor apalancamiento vs solo deuda senior
- Menor dilución vs solo equity

### Deuda con Warrants
**Características**:
- Pricing atractivo deuda
- Upside potential via warrants
- Governance ligera vs PE

## 4. Análisis Comparativo por Situación

### Adquisición Defensiva (Empresa Madura)
**Recomendación**: Deuda senior + mezzanine
- Cash flows predecibles
- Bajo riesgo ejecución
- Optimización fiscal intereses

### Adquisición Growth (Sector Dinámico)
**Recomendación**: Private equity
- Expertise sectorial crítico
- Capacidad inversión elevada
- Riesgo/retorno elevado

### Buy & Build (Plataforma Consolidación)
**Recomendación**: PE + debt facility
- Múltiples adquisiciones
- Expertise transaccional
- Flexibilidad financiera

### Management Buyout
**Recomendación**: Estructura híbrida
- Alineamiento management
- Optimización leverage
- Governance equilibrada

## 5. Factores Decisión Clave

### Tamaño Operación
- **<25M€**: Predomina deuda/mezzanine
- **25-100M€**: Estructuras híbridas
- **>100M€**: Private equity dominante

### Perfil Riesgo
- **Bajo riesgo**: Favor deuda
- **Alto riesgo**: Favor equity
- **Medio**: Estructuras híbridas

### Objetivos Vendedor
- **Liquidez total**: PE buyout
- **Liquidez parcial**: Minority stake PE
- **Reinversión**: Management equity

## Conclusiones

No existe solución única. La estructura óptima depende de múltiples factores: tamaño, sector, perfil riesgo y objetivos específicos. El análisis detallado de cada alternativa es fundamental para maximizar probabilidad éxito y retorno.',
  'Roberto García, Director Financiero',
  'Financiación',
  ARRAY['Private Equity', 'Deuda', 'Financiación', 'M&A', 'Leverage'],
  14,
  true,
  false,
  '2024-12-05 14:00:00+00:00',
  'Private Equity vs Deuda para M&A - Comparativa Completa | Capittal',
  'Guía completa de financiación para adquisiciones. Comparativa PE vs deuda, estructuras híbridas y casos de uso óptimos según operación.'
),
(
  'Reestructuraciones Empresariales: Cuándo y Cómo Ejecutarlas',
  'reestructuraciones-empresariales-guia',
  'Estrategias de reestructuración empresarial: operativa, financiera y accionarial. Casos prácticos y factores críticos de éxito.',
  '# Reestructuraciones Empresariales: Cuándo y Cómo Ejecutarlas

## ¿Qué son las Reestructuraciones?

Las reestructuraciones son procesos de transformación profunda de la organización, estructura financiera o accionarial de una empresa para mejorar su competitividad, eficiencia o viabilidad.

## Tipos de Reestructuraciones

### 1. Reestructuración Operativa

#### Cuándo Aplicarla
- Pérdida competitividad vs competencia
- Márgenes en deterioro estructural
- Procesos obsoletos o ineficientes
- Sobredimensionamiento organizativo

#### Componentes Clave
**Optimización Procesos**:
- Automatización y digitalización
- Lean management y Six Sigma
- Outsourcing actividades no core
- Optimización cadena suministro

**Restructuring Organizacional**:
- Simplificación estructura jerárquica
- Eliminación duplicidades
- Redimensionamiento plantilla
- Reskilling y upskilling

**Transformación Digital**:
- ERP integrado y analytics
- CRM y marketing automation
- E-commerce y omnicanalidad
- IoT e Industry 4.0

#### Caso Práctico: Empresa Industrial
**Situación**: Pérdida cuota mercado, márgenes en caída
- **Diagnóstico**: Procesos manuales, estructura rígida
- **Acción**: Automatización 60% líneas producción
- **Resultado**: +25% productividad, -15% costes fijos

### 2. Reestructuración Financiera

#### Cuándo es Necesaria
- Leverage excesivo (>6x EBITDA)
- Breach covenants financieros
- Falta liquidez operativa
- Estructura capital subóptima

#### Instrumentos Disponibles

**Renegociación Deuda**:
- Extensión plazos amortización
- Reducción tipos interés
- Modificación covenants
- Moratoria temporal pagos

**Debt-to-Equity Swaps**:
- Capitalización deuda
- Dilución accionistas existentes
- Alineamiento acreedores/accionistas

**Refinanciación**:
- Nueva deuda para cancelar existente
- Mejores condiciones financieras
- Diversificación fuentes financiación

#### Caso Práctico: Grupo Retail
**Situación**: Leverage 7x EBITDA post-COVID
- **Problema**: Imposibilidad servir deuda
- **Solución**: 40% debt-to-equity + refinanciación
- **Resultado**: Leverage 4x, liquidez restaurada

### 3. Reestructuración Accionarial

#### Triggers Habituales
- Entrada nuevo socio estratégico
- Sucesión generacional
- Salida parcial fundadores
- Profesionalización governance

#### Estructuras Comunes

**Incorporación Socio Financiero**:
- Private equity o family office
- Aporte capital y expertise
- Governance profesional
- Exit strategy definida

**Management Buyout (MBO)**:
- Adquisición por equipo directivo
- Alineamiento ownership-gestión
- Financiación con deuda/mezzanine

**Spin-off Divisiones**:
- Separación unidades negocio
- Foco estratégico especializado
- Unlock valor assets

#### Caso Práctico: Empresa Familiar
**Situación**: 3ª generación, falta consenso estratégico
- **Challenge**: Visiones divergentes desarrollo
- **Solución**: Entrada PE minority + governance
- **Outcome**: Crecimiento 150% en 4 años

## Framework de Decisión

### 1. Diagnóstico Integral

#### Análisis Financiero
- [ ] Performance histórico vs benchmark
- [ ] Estructura capital y liquidez
- [ ] Generación caja operativa
- [ ] ROI y creación valor

#### Análisis Estratégico
- [ ] Posición competitiva
- [ ] Atractivo mercado/sector
- [ ] Capacidades diferenciales
- [ ] Amenazas y oportunidades

#### Análisis Organizacional
- [ ] Estructura y governance
- [ ] Cultura y talento
- [ ] Procesos y sistemas
- [ ] Capacidad transformación

### 2. Diseño Estrategia

#### Objetivos Claros
- Targets financieros específicos
- Timeline realista ejecución
- KPIs seguimiento progreso
- Quick wins identificados

#### Stakeholder Buy-in
- Alineamiento accionistas
- Comunicación transparente empleados
- Gestión expectativas acreedores
- Coordinación asesores externos

### 3. Ejecución y Monitorización

#### Governance Proceso
- Steering committee
- Project management office
- Reporting semanal/mensual
- Escalation procedures

#### Change Management
- Comunicación continua
- Training y development
- Gestión resistencias
- Celebración hitos

## Factores Críticos Éxito

### ✅ Success Factors
1. **Liderazgo committed**: CEO/ownership totalmente alineado
2. **Diagnóstico riguroso**: Root cause analysis profundo
3. **Plan realista**: Objetivos ambitious pero achievable
4. **Comunicación efectiva**: Transparencia y frecuencia
5. **Expertise externo**: Asesores especializados sector
6. **Timing adecuado**: Ventana oportunidad mercado

### ❌ Common Pitfalls
1. **Underestimate complejidad**: Scope creep y delays
2. **Insufficient buy-in**: Resistencia interna/externa
3. **Poor execution**: Lack governance y accountability
4. **Communication gaps**: Rumores y uncertainty
5. **Resource constraints**: Insufficient investment
6. **Market timing**: External headwinds

## ROI Típico Reestructuraciones

### Reestructuración Operativa
- **Timeframe**: 12-24 meses
- **EBITDA improvement**: 15-40%
- **ROI**: 3-8x inversión

### Reestructuración Financiera
- **Timeframe**: 6-18 meses
- **Interest savings**: 20-50%
- **Equity value**: +25-100%

### Reestructuración Accionarial
- **Timeframe**: 6-12 meses setup
- **Growth acceleration**: 2-5x
- **Valuation multiple**: +30-80%

## Conclusiones

Las reestructuraciones exitosas requieren diagnóstico preciso, planificación exhaustiva y ejecución disciplinada. El ROI potencial es significativo, pero el riesgo de ejecución es alto. El acompañamiento experto es fundamental para maximizar probabilidades de éxito.',
  'Laura Fernández, Director de Reestructuraciones',
  'Reestructuraciones',
  ARRAY['Reestructuración', 'Transformación', 'Turnaround', 'Estrategia', 'Change Management'],
  16,
  true,
  false,
  '2024-12-03 16:00:00+00:00',
  'Reestructuraciones Empresariales - Guía Completa de Ejecución | Capittal',
  'Guía completa de reestructuraciones: operativa, financiera y accionarial. Casos prácticos, factores críticos de éxito y ROI esperado.'
);

-- Insertar casos de éxito adicionales
INSERT INTO case_studies (
  title,
  sector,
  company_size,
  value_amount,
  value_currency,
  description,
  highlights,
  year,
  is_featured,
  is_active
) VALUES 
(
  'Adquisición Plataforma E-commerce B2B',
  'Tecnología',
  '50-100 empleados',
  45,
  '€',
  'Asesoramiento integral en la adquisición de una plataforma líder de e-commerce B2B por parte de un grupo multinacional tecnológico. Proceso competitivo con múltiples oferentes.',
  ARRAY[
    'Valoración 15x revenue múltiple premium sector',
    'Due diligence técnico especializado en arquitectura cloud',
    'Estructura earn-out basada en crecimiento ARR',
    'Retención 100% management team crítico'
  ],
  2024,
  true,
  true
),
(
  'Fusión Grupo Clínicas Privadas',
  'Healthcare',
  '200-500 empleados',
  120,
  '€',
  'Asesoramiento en la fusión de dos grupos de clínicas privadas para crear el 3er operador nacional. Operación compleja con sinergias significativas.',
  ARRAY[
    'Sinergias identificadas 18M€ anuales (EBITDA +22%)',
    'Integración 45 centros médicos en 8 CCAA',
    'Certificación conjunta ISO y acreditaciones',
    'Financiación híbrida debt+equity optimizada'
  ],
  2024,
  true,
  true
),
(
  'Carve-out División Industrial',
  'Industrial',
  '300-500 empleados',
  75,
  '€',
  'Spin-off y venta de división industrial de componentes automotive de multinacional europea. Creación standalone y proceso competitivo.',
  ARRAY[
    'Carve-out completo en 8 meses (IT, legal, operativo)',
    'TSA optimizado para transición suave',
    'Múltiplo 12x EBITDA en sector cíclico',
    'Management buyout parcial con PE backing'
  ],
  2023,
  false,
  true
),
(
  'Adquisición Cadena Retail Especializada',
  'Retail',
  '100-200 empleados',
  32,
  '€',
  'Expansión de cadena retail líder mediante adquisición de competidor regional. Consolidación mercado fragmentado con potencial cross-selling.',
  ARRAY[
    'Expansión geográfica +40% puntos venta',
    'Cross-selling productos premium +25% ticket medio',
    'Digitalización omnicanal acelerada',
    'Optimización supply chain centralizada'
  ],
  2023,
  false,
  true
),
(
  'Recapitalización Empresa Familiar',
  'Servicios Profesionales',
  '50-100 empleados',
  28,
  '€',
  'Entrada de private equity en empresa familiar de servicios profesionales para acelerar crecimiento orgánico e inorgánico. Governance modernizada.',
  ARRAY[
    'Growth capital 15M€ para expansión nacional',
    'Digitalización procesos y CRM avanzado',
    'Plan buy&build con 3 adquisiciones target',
    'Governance profesional con board independiente'
  ],
  2023,
  true,
  true
),
(
  'Venta a Estratégico Internacional',
  'Fintech',
  '30-50 empleados',
  18,
  '€',
  'Venta de fintech española especializada en pagos a grupo financiero europeo. Premium de control y sinergias tecnológicas estratégicas.',
  ARRAY[
    'Múltiplo 25x revenue para fintech rentable',
    'Integración API en ecosistema adquirente',
    'Retención talento tech con equity long-term',
    'Expansión europea acelerada post-adquisición'
  ],
  2024,
  false,
  true
);

-- Crear templates de landing pages
INSERT INTO landing_page_templates (
  name,
  type,
  description,
  template_html,
  template_config,
  is_active,
  display_order
) VALUES 
(
  'Calculadora Valoración Avanzada',
  'valoracion',
  'Landing page con calculadora interactiva de valoración empresarial',
  '<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{meta_title}}</title>
    <meta name="description" content="{{meta_description}}">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; margin: 0; background: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 4rem 2rem; }
        .calculator { background: white; border-radius: 12px; padding: 2rem; margin: 2rem 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151; }
        .form-group input, .form-group select { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem; }
        .btn-primary { background: #667eea; color: white; padding: 1rem 2rem; border: none; border-radius: 6px; font-size: 1.1rem; cursor: pointer; width: 100%; }
        .btn-primary:hover { background: #5a67d8; }
        .result { background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 1.5rem; margin: 2rem 0; border-radius: 6px; }
        .cta { background: #111827; color: white; text-align: center; padding: 3rem 2rem; margin-top: 3rem; border-radius: 12px; }
        .hidden { display: none; }
    </style>
</head>
<body>
    <div class="hero">
        <h1>{{headline}}</h1>
        <p>{{subheadline}}</p>
    </div>
    
    <div class="container">
        <div class="calculator">
            <h2>Calculadora de Valoración Empresarial</h2>
            <form id="valuation-form">
                <div class="form-group">
                    <label for="revenue">Facturación Anual (€)</label>
                    <input type="number" id="revenue" name="revenue" placeholder="ej. 5000000" required>
                </div>
                
                <div class="form-group">
                    <label for="ebitda">EBITDA Anual (€)</label>
                    <input type="number" id="ebitda" name="ebitda" placeholder="ej. 1000000" required>
                </div>
                
                <div class="form-group">
                    <label for="sector">Sector de Actividad</label>
                    <select id="sector" name="sector" required>
                        <option value="">Selecciona tu sector</option>
                        <option value="tecnologia">Tecnología</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="industrial">Industrial</option>
                        <option value="servicios">Servicios</option>
                        <option value="retail">Retail</option>
                        <option value="energia">Energía</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="employees">Número de Empleados</label>
                    <select id="employees" name="employees" required>
                        <option value="">Selecciona el tamaño</option>
                        <option value="1-10">1-10 empleados</option>
                        <option value="11-50">11-50 empleados</option>
                        <option value="51-100">51-100 empleados</option>
                        <option value="101-500">101-500 empleados</option>
                        <option value="500+">Más de 500 empleados</option>
                    </select>
                </div>
                
                <button type="submit" class="btn-primary">Calcular Valoración</button>
            </form>
            
            <div id="result" class="result hidden">
                <h3>Valoración Estimada de tu Empresa</h3>
                <p id="valuation-text"></p>
                <p><strong>Importante:</strong> Esta es una estimación orientativa. Para una valoración precisa, contacta con nuestros expertos.</p>
            </div>
        </div>
        
        <div class="cta">
            <h2>¿Quieres una Valoración Profesional?</h2>
            <p>Nuestros expertos pueden realizar una valoración detallada de tu empresa con metodologías avanzadas.</p>
            <form id="contact-form">
                <div style="display: flex; gap: 1rem; max-width: 500px; margin: 2rem auto;">
                    <input type="email" name="email" placeholder="Tu email profesional" required style="flex: 1;">
                    <button type="submit" class="btn-primary" style="width: auto; white-space: nowrap;">Solicitar Consulta</button>
                </div>
            </form>
        </div>
    </div>
    
    <script>
        document.getElementById(''valuation-form'').addEventListener(''submit'', function(e) {
            e.preventDefault();
            
            const revenue = parseFloat(document.getElementById(''revenue'').value);
            const ebitda = parseFloat(document.getElementById(''ebitda'').value);
            const sector = document.getElementById(''sector'').value;
            
            const multiples = {
                tecnologia: { min: 12, max: 25 },
                healthcare: { min: 10, max: 18 },
                industrial: { min: 6, max: 12 },
                servicios: { min: 8, max: 15 },
                retail: { min: 5, max: 10 },
                energia: { min: 6, max: 14 }
            };
            
            const sectorMultiple = multiples[sector] || { min: 6, max: 12 };
            const avgMultiple = (sectorMultiple.min + sectorMultiple.max) / 2;
            
            const valuation = ebitda * avgMultiple;
            const valuationMin = ebitda * sectorMultiple.min;
            const valuationMax = ebitda * sectorMultiple.max;
            
            document.getElementById(''valuation-text'').innerHTML = 
                `<strong>Rango de Valoración: ${(valuationMin/1000000).toFixed(1)}M€ - ${(valuationMax/1000000).toFixed(1)}M€</strong><br>
                Valoración Media: ${(valuation/1000000).toFixed(1)}M€<br>
                Múltiplo EBITDA aplicado: ${sectorMultiple.min}x - ${sectorMultiple.max}x`;
            
            document.getElementById(''result'').classList.remove(''hidden'');
        });
        
        document.getElementById(''contact-form'').addEventListener(''submit'', function(e) {
            e.preventDefault();
            
            const email = e.target.email.value;
            
            // Track conversion
            if (typeof trackConversion === ''function'') {
                trackConversion({
                    conversion_type: ''lead_form'',
                    conversion_value: 500,
                    form_data: { email: email, source: ''calculadora_valoracion'' }
                });
            }
            
            alert(''¡Gracias! Te contactaremos en las próximas 24 horas para agendar tu consulta gratuita.'');
        });
    </script>
</body>
</html>',
  '{
    "fields": {
      "headline": {
        "type": "text",
        "label": "Título Principal",
        "default": "Calcula el Valor Real de tu Empresa"
      },
      "subheadline": {
        "type": "text",
        "label": "Subtítulo",
        "default": "Herramienta gratuita de valoración empresarial con múltiplos actualizados por sector"
      },
      "meta_title": {
        "type": "text",
        "label": "Meta Title",
        "default": "Calculadora Valoración Empresarial Gratuita | Capittal"
      },
      "meta_description": {
        "type": "text",
        "label": "Meta Description",
        "default": "Calcula el valor de tu empresa gratis. Múltiplos actualizados por sector y metodología profesional. Valoración orientativa en 2 minutos."
      }
    }
  }',
  true,
  1
),
(
  'Consulta Gratuita M&A',
  'consulta',
  'Landing page para agendar consulta gratuita especializada',
  '<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{meta_title}}</title>
    <meta name="description" content="{{meta_description}}">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; margin: 0; background: #f8fafc; }
        .hero { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 4rem 2rem; text-align: center; }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .split-section { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; margin: 3rem 0; }
        .benefits { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .form-container { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .benefit-item { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.5rem; }
        .benefit-icon { width: 24px; height: 24px; background: #10b981; border-radius: 50%; flex-shrink: 0; }
        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151; }
        .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem; }
        .btn-primary { background: #1e3a8a; color: white; padding: 1rem 2rem; border: none; border-radius: 6px; font-size: 1.1rem; cursor: pointer; width: 100%; }
        .btn-primary:hover { background: #1e40af; }
        .testimonials { background: #f9fafb; padding: 3rem 2rem; margin: 3rem 0; border-radius: 12px; }
        .testimonial { background: white; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        @media (max-width: 768px) { .split-section { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div class="hero">
        <h1>{{headline}}</h1>
        <p>{{subheadline}}</p>
    </div>
    
    <div class="container">
        <div class="split-section">
            <div class="benefits">
                <h2>¿Por qué elegir Capittal?</h2>
                
                <div class="benefit-item">
                    <div class="benefit-icon"></div>
                    <div>
                        <h3>+15 años de experiencia</h3>
                        <p>Más de 200 transacciones exitosas en múltiples sectores</p>
                    </div>
                </div>
                
                <div class="benefit-item">
                    <div class="benefit-icon"></div>
                    <div>
                        <h3>Asesoramiento integral</h3>
                        <p>Desde valoración hasta cierre, te acompañamos en todo el proceso</p>
                    </div>
                </div>
                
                <div class="benefit-item">
                    <div class="benefit-icon"></div>
                    <div>
                        <h3>Red global de contactos</h3>
                        <p>Acceso a compradores estratégicos y financieros internacionales</p>
                    </div>
                </div>
                
                <div class="benefit-item">
                    <div class="benefit-icon"></div>
                    <div>
                        <h3>Resultados demostrables</h3>
                        <p>Valoraciones promedio 25% superiores al mercado</p>
                    </div>
                </div>
                
                <div class="benefit-item">
                    <div class="benefit-icon"></div>
                    <div>
                        <h3>Confidencialidad absoluta</h3>
                        <p>Proceso discreto y profesional con máxima confidencialidad</p>
                    </div>
                </div>
            </div>
            
            <div class="form-container">
                <h2>Agenda tu Consulta Gratuita</h2>
                <p>Análisis inicial sin compromiso con uno de nuestros expertos</p>
                
                <form id="consultation-form">
                    <div class="form-group">
                        <label for="name">Nombre y Apellidos</label>
                        <input type="text" id="name" name="name" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="email">Email Profesional</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="phone">Teléfono</label>
                        <input type="tel" id="phone" name="phone" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="company">Empresa</label>
                        <input type="text" id="company" name="company" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="sector">Sector</label>
                        <select id="sector" name="sector" required>
                            <option value="">Selecciona tu sector</option>
                            <option value="tecnologia">Tecnología</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="industrial">Industrial</option>
                            <option value="servicios">Servicios</option>
                            <option value="retail">Retail</option>
                            <option value="energia">Energía</option>
                            <option value="otros">Otros</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="revenue">Facturación Aproximada</label>
                        <select id="revenue" name="revenue" required>
                            <option value="">Selecciona rango</option>
                            <option value="<1M">Menos de 1M€</option>
                            <option value="1-5M">1M€ - 5M€</option>
                            <option value="5-10M">5M€ - 10M€</option>
                            <option value="10-25M">10M€ - 25M€</option>
                            <option value="25-50M">25M€ - 50M€</option>
                            <option value=">50M">Más de 50M€</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="objective">Objetivo Principal</label>
                        <select id="objective" name="objective" required>
                            <option value="">¿Qué te interesa?</option>
                            <option value="venta">Venta de empresa</option>
                            <option value="valoracion">Valoración empresarial</option>
                            <option value="adquisicion">Adquisición de empresa</option>
                            <option value="restructuring">Reestructuración</option>
                            <option value="due-diligence">Due diligence</option>
                            <option value="otros">Otros servicios</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="timeline">Timeline Estimado</label>
                        <select id="timeline" name="timeline">
                            <option value="">¿Cuándo planeas actuar?</option>
                            <option value="inmediato">Inmediato (1-3 meses)</option>
                            <option value="corto">Corto plazo (3-6 meses)</option>
                            <option value="medio">Medio plazo (6-12 meses)</option>
                            <option value="largo">Largo plazo (+12 meses)</option>
                            <option value="exploratorio">Exploratorio</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="message">Mensaje Adicional (Opcional)</label>
                        <textarea id="message" name="message" rows="3" placeholder="Cuéntanos más sobre tu situación específica..."></textarea>
                    </div>
                    
                    <button type="submit" class="btn-primary">Solicitar Consulta Gratuita</button>
                    
                    <p style="font-size: 0.9rem; color: #6b7280; margin-top: 1rem;">
                        Al enviar este formulario, aceptas que te contactemos para agendar la consulta. 
                        Tratamos tus datos con máxima confidencialidad.
                    </p>
                </form>
            </div>
        </div>
        
        <div class="testimonials">
            <h2 style="text-align: center; margin-bottom: 2rem;">Lo que dicen nuestros clientes</h2>
            
            <div class="testimonial">
                <p>"El equipo de Capittal nos acompañó durante todo el proceso de venta. Su experiencia y red de contactos fueron clave para conseguir una valoración un 30% superior a nuestras expectativas iniciales."</p>
                <strong>— CEO, Empresa Tecnológica (vendida por 45M€)</strong>
            </div>
            
            <div class="testimonial">
                <p>"Profesionalidad excepcional. Nos ayudaron a estructurar la operación de adquisición de forma que maximizara sinergias y minimizara riesgos. El proceso fue impecable."</p>
                <strong>— CFO, Grupo Industrial</strong>
            </div>
            
            <div class="testimonial">
                <p>"La valoración que realizaron fue muy detallada y nos sirvió tanto para negociar mejor con potenciales compradores como para tomar decisiones estratégicas internas."</p>
                <strong>— Founder, Startup Fintech</strong>
            </div>
        </div>
    </div>
    
    <script>
        document.getElementById(''consultation-form'').addEventListener(''submit'', function(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            // Track conversion
            if (typeof trackConversion === ''function'') {
                trackConversion({
                    conversion_type: ''consultation_request'',
                    conversion_value: 1000,
                    form_data: data
                });
            }
            
            // Here you would typically send the data to your backend
            alert(''¡Gracias por tu interés! Te contactaremos en las próximas 4 horas para agendar tu consulta gratuita.'');
            
            // Reset form
            e.target.reset();
        });
    </script>
</body>
</html>',
  '{
    "fields": {
      "headline": {
        "type": "text",
        "label": "Título Principal",
        "default": "Consulta Gratuita con Expertos M&A"
      },
      "subheadline": {
        "type": "text",
        "label": "Subtítulo",
        "default": "Análisis profesional de tu situación y recomendaciones estratégicas sin compromiso"
      },
      "meta_title": {
        "type": "text",
        "label": "Meta Title",
        "default": "Consulta Gratuita M&A - Expertos en Fusiones y Adquisiciones | Capittal"
      },
      "meta_description": {
        "type": "text",
        "label": "Meta Description",
        "default": "Agenda tu consulta gratuita con expertos M&A. Análisis profesional, recomendaciones estratégicas y valoración inicial sin compromiso."
      }
    }
  }',
  true,
  2
),
(
  'Reporte Sectorial Personalizado',
  'lead-magnet',
  'Landing page para descarga de reporte sectorial gratuito',
  '<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{meta_title}}</title>
    <meta name="description" content="{{meta_description}}">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; margin: 0; background: #f8fafc; }
        .hero { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 4rem 2rem; text-align: center; }
        .container { max-width: 1000px; margin: 0 auto; padding: 2rem; }
        .content-section { background: white; padding: 3rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 2rem 0; }
        .form-section { background: #f0f9ff; border: 2px solid #0ea5e9; padding: 2rem; border-radius: 12px; margin: 2rem 0; }
        .preview-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin: 2rem 0; }
        .preview-item { background: #f9fafb; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #059669; }
        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151; }
        .form-group input, .form-group select { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem; }
        .btn-primary { background: #059669; color: white; padding: 1rem 2rem; border: none; border-radius: 6px; font-size: 1.1rem; cursor: pointer; width: 100%; }
        .btn-primary:hover { background: #047857; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 2rem 0; }
        .stat-item { text-align: center; background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat-number { font-size: 2rem; font-weight: bold; color: #059669; }
        .guarantee { background: #fef3c7; border: 2px solid #f59e0b; padding: 1.5rem; border-radius: 8px; margin: 2rem 0; text-align: center; }
    </style>
</head>
<body>
    <div class="hero">
        <h1>{{headline}}</h1>
        <p>{{subheadline}}</p>
    </div>
    
    <div class="container">
        <div class="content-section">
            <h2>¿Qué incluye tu Reporte Sectorial Gratuito?</h2>
            
            <div class="preview-grid">
                <div class="preview-item">
                    <h3>📊 Múltiplos de Valoración</h3>
                    <p>Múltiplos actualizados por subsector: EV/Revenue, EV/EBITDA, P/E ratios con análisis histórico y tendencias.</p>
                </div>
                
                <div class="preview-item">
                    <h3>📈 Análisis de Transacciones</h3>
                    <p>Operaciones M&A recientes en tu sector: valores, múltiplos pagados y drivers de valoración identificados.</p>
                </div>
                
                <div class="preview-item">
                    <h3>🎯 Benchmarking Competitivo</h3>
                    <p>Comparativa de performance financiero vs competidores: márgenes, growth rates y eficiencia operativa.</p>
                </div>
                
                <div class="preview-item">
                    <h3>🔮 Outlook y Tendencias</h3>
                    <p>Previsiones sector 2024-2026: drivers de crecimiento, riesgos y oportunidades de consolidación.</p>
                </div>
                
                <div class="preview-item">
                    <h3>💡 Recomendaciones Estratégicas</h3>
                    <p>Insights específicos para tu empresa: areas de mejora, posicionamiento y timing óptimo para transacciones.</p>
                </div>
                
                <div class="preview-item">
                    <h3>📋 Lista de Potenciales Compradores</h3>
                    <p>Identificación de strategic buyers y financial buyers activos en tu sector con apetito específico.</p>
                </div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-number">25+</div>
                    <p>Sectores analizados</p>
                </div>
                <div class="stat-item">
                    <div class="stat-number">500+</div>
                    <p>Transacciones estudiadas</p>
                </div>
                <div class="stat-item">
                    <div class="stat-number">95%</div>
                    <p>Precisión valoraciones</p>
                </div>
                <div class="stat-item">
                    <div class="stat-number">48h</div>
                    <p>Entrega garantizada</p>
                </div>
            </div>
        </div>
        
        <div class="form-section">
            <h2 style="text-align: center; margin-bottom: 1rem;">Descarga tu Reporte Gratuito</h2>
            <p style="text-align: center; margin-bottom: 2rem;">Completa el formulario y recibe tu análisis sectorial personalizado en 48 horas</p>
            
            <form id="report-form">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label for="firstName">Nombre</label>
                        <input type="text" id="firstName" name="firstName" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="lastName">Apellidos</label>
                        <input type="text" id="lastName" name="lastName" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="email">Email Profesional</label>
                    <input type="email" id="email" name="email" required>
                </div>
                
                <div class="form-group">
                    <label for="company">Empresa</label>
                    <input type="text" id="company" name="company" required>
                </div>
                
                <div class="form-group">
                    <label for="position">Cargo/Posición</label>
                    <input type="text" id="position" name="position" placeholder="ej. CEO, CFO, Director General">
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label for="sector">Sector Principal</label>
                        <select id="sector" name="sector" required>
                            <option value="">Selecciona tu sector</option>
                            <option value="tecnologia">Tecnología y Software</option>
                            <option value="healthcare">Healthcare y Pharma</option>
                            <option value="industrial">Industrial y Manufacturing</option>
                            <option value="servicios">Servicios Profesionales</option>
                            <option value="retail">Retail y Consumer</option>
                            <option value="energia">Energía y Utilities</option>
                            <option value="financiero">Servicios Financieros</option>
                            <option value="inmobiliario">Real Estate</option>
                            <option value="logistica">Logística y Transporte</option>
                            <option value="educacion">Educación</option>
                            <option value="media">Media y Entertainment</option>
                            <option value="otros">Otros</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="revenue">Facturación Anual</label>
                        <select id="revenue" name="revenue" required>
                            <option value="">Selecciona rango</option>
                            <option value="<5M">Menos de 5M€</option>
                            <option value="5-10M">5M€ - 10M€</option>
                            <option value="10-25M">10M€ - 25M€</option>
                            <option value="25-50M">25M€ - 50M€</option>
                            <option value="50-100M">50M€ - 100M€</option>
                            <option value=">100M">Más de 100M€</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="interest">Principal Interés</label>
                    <select id="interest" name="interest" required>
                        <option value="">¿Qué te interesa más?</option>
                        <option value="valoracion">Conocer valoración actual empresa</option>
                        <option value="venta">Explorar venta/salida parcial</option>
                        <option value="adquisicion">Adquirir competidores/complementarios</option>
                        <option value="benchmark">Benchmarking vs competencia</option>
                        <option value="tendencias">Entender tendencias sector</option>
                        <option value="inversion">Atraer inversión/financiación</option>
                    </select>
                </div>
                
                <button type="submit" class="btn-primary">Descargar Reporte Sectorial Gratuito</button>
                
                <p style="font-size: 0.9rem; color: #6b7280; margin-top: 1rem; text-align: center;">
                    Al descargar el reporte, aceptas recibir comunicaciones relacionadas con análisis sectoriales.
                    Puedes darte de baja en cualquier momento.
                </p>
            </form>
        </div>
        
        <div class="guarantee">
            <h3>🔒 Garantía de Confidencialidad</h3>
            <p>Toda la información proporcionada será tratada con máxima confidencialidad. No compartimos datos con terceros y cumplimos estrictamente con GDPR.</p>
        </div>
        
        <div class="content-section">
            <h2>¿Por qué confiar en nuestros análisis?</h2>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin: 2rem 0;">
                <div>
                    <h3>✅ Metodología Probada</h3>
                    <p>Utilizamos la misma metodología que aplicamos en valoraciones profesionales para clientes corporativos de primer nivel.</p>
                </div>
                
                <div>
                    <h3>✅ Datos Actualizados</h3>
                    <p>Acceso a bases de datos premium y análisis en tiempo real de transacciones y múltiplos de mercado.</p>
                </div>
                
                <div>
                    <h3>✅ Equipo Experto</h3>
                    <p>Nuestros analistas tienen experiencia previa en investment banking y consultoria estratégica de top tier.</p>
                </div>
                
                <div>
                    <h3>✅ Sin Compromiso</h3>
                    <p>Reporte completamente gratuito sin obligación de contratar servicios adicionales. Es nuestra forma de demostrar calidad.</p>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        document.getElementById(''report-form'').addEventListener(''submit'', function(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            // Track conversion
            if (typeof trackConversion === ''function'') {
                trackConversion({
                    conversion_type: ''report_download'',
                    conversion_value: 300,
                    form_data: data
                });
            }
            
            // Show success message
            alert(''¡Perfecto! Tu reporte sectorial personalizado será enviado a '' + data.email + '' en las próximas 48 horas.\\n\\nAdemás, recibirás actualizaciones mensuales con las últimas tendencias de tu sector.'');
            
            // Reset form
            e.target.reset();
        });
    </script>
</body>
</html>',
  '{
    "fields": {
      "headline": {
        "type": "text",
        "label": "Título Principal",
        "default": "Reporte Sectorial Gratuito"
      },
      "subheadline": {
        "type": "text",
        "label": "Subtítulo",
        "default": "Análisis completo de múltiplos, transacciones y tendencias específicas de tu sector"
      },
      "meta_title": {
        "type": "text",
        "label": "Meta Title",
        "default": "Reporte Sectorial Gratuito - Múltiplos y Tendencias M&A | Capittal"
      },
      "meta_description": {
        "type": "text",
        "label": "Meta Description",
        "default": "Descarga gratis tu reporte sectorial: múltiplos actualizados, análisis de transacciones y tendencias M&A específicas de tu industria."
      }
    }
  }',
  true,
  3
);