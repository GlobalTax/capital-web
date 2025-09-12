// Datos simulados editables para la Landing Page de SuiteLoop
// Análisis del mercado de asesorías en España 2025

export const suiteloopData = {
  // Segmentación del mercado por tamaño de despacho
  segmentacion: [
    { segmento: "Micro (<10)", porcentaje: 58, empleados: "1-9", count: 38860 },
    { segmento: "Pequeño (10-25)", porcentaje: 26, empleados: "10-25", count: 17420 },
    { segmento: "Mediano (26-50)", porcentaje: 12, empleados: "26-50", count: 8040 },
    { segmento: "Grande (>50)", porcentaje: 4, empleados: ">50", count: 2680 }
  ],

  // Distribución geográfica por CCAA (datos simulados)
  distribucionGeografica: [
    { ccaa: "Madrid", asesorias: 12500, densidad: "alta" },
    { ccaa: "Cataluña", asesorias: 11200, densidad: "alta" },
    { ccaa: "Andalucía", asesorias: 8900, densidad: "media" },
    { ccaa: "Valencia", asesorias: 6700, densidad: "media" },
    { ccaa: "País Vasco", asesorias: 3800, densidad: "media" },
    { ccaa: "Galicia", asesorias: 3200, densidad: "baja" },
    { ccaa: "Castilla y León", asesorias: 2900, densidad: "baja" },
    { ccaa: "Otras", asesorias: 17800, densidad: "baja" }
  ],

  // Pain points del sector con impacto (1-10)
  dolores: [
    { 
      pain: "Horas no facturables", 
      impacto: 9, 
      descripcion: "Tiempo perdido en tareas administrativas y búsqueda de documentación",
      icon: "Clock"
    },
    { 
      pain: "Fricción con cliente", 
      impacto: 8, 
      descripcion: "Intercambio constante de emails y llamadas para solicitar documentos",
      icon: "MessageSquareX"
    },
    { 
      pain: "Picos fiscales/laborales", 
      impacto: 8, 
      descripcion: "Sobrecarga en períodos de declaraciones y cierre contable",
      icon: "TrendingUp"
    },
    { 
      pain: "Miedo a migrar on-prem", 
      impacto: 7, 
      descripcion: "Resistencia al cambio por dependencia de sistemas legacy",
      icon: "AlertTriangle"
    },
    { 
      pain: "Escasez de talento", 
      impacto: 6, 
      descripcion: "Dificultad para encontrar y retener profesionales cualificados",
      icon: "Users"
    }
  ],

  // Mix competidores y posicionamiento
  mixCompetidores: [
    { 
      proveedor: "WK A3 (on-prem)", 
      fuerza: "Solidez fiscal y compliance", 
      gap: "Colaboración cloud y portal cliente",
      marketShare: 35
    },
    { 
      proveedor: "Sage", 
      fuerza: "ERP generalista y ecosistema", 
      gap: "Foco específico en asesorías",
      marketShare: 28
    },
    { 
      proveedor: "Startups Cloud", 
      fuerza: "UX moderna y agilidad", 
      gap: "Cobertura completa asesoría",
      marketShare: 22
    },
    { 
      proveedor: "Otros/Legacy", 
      fuerza: "Conocimiento local", 
      gap: "Modernización tecnológica",
      marketShare: 15
    }
  ],

  // KPIs y ROI esperado con SuiteLoop
  kpisROI: { 
    ahorroHorasMes: 35, 
    npsMejora: 20, 
    ttvSemanas: 2,
    reduccionEmails: 60,
    automatizacionProcesos: 45,
    mejoraCashFlow: 25
  },

  // Timeline regulatorio y drivers
  timelineRegulatorio: [
    {
      fecha: "2023 Q1",
      hito: "Ley Crea y Crece",
      descripcion: "Facturación electrónica obligatoria progresiva",
      impacto: "alto",
      status: "activo"
    },
    {
      fecha: "2024 Q2", 
      hito: "e-Factura B2B",
      descripcion: "Obligatoriedad empresas >8M€ facturación",
      impacto: "alto", 
      status: "activo"
    },
    {
      fecha: "2025 Q1",
      hito: "SIF - Sistema de Información de la Facturación", 
      descripcion: "Reporte automático de facturas a Hacienda",
      impacto: "crítico",
      status: "próximo"
    },
    {
      fecha: "2025 Q3",
      hito: "IA Copilots",
      descripcion: "Adopción masiva de asistentes de IA en contabilidad",
      impacto: "medio",
      status: "tendencia"
    },
    {
      fecha: "2026 Q1",
      hito: "Full e-Factura",
      descripcion: "Obligatoriedad para todas las empresas",
      impacto: "alto", 
      status: "futuro"
    }
  ],

  // Insights clave para resumen ejecutivo
  insightsEjecutivo: [
    {
      titulo: "67k Asesorías en España",
      valor: "67.000",
      descripcion: "Mercado fragmentado con ~58% microdespachos",
      tendencia: "estable"
    },
    {
      titulo: "Target Modernización", 
      valor: "25.460",
      descripcion: "Despachos 10-50 empleados listos para digitalizar",
      tendencia: "creciente"
    },
    {
      titulo: "Driver e-Factura",
      valor: "2025",
      descripcion: "SIF obliga a automatización de procesos fiscales", 
      tendencia: "urgente"
    },
    {
      titulo: "Oportunidad Post-OnPrem",
      valor: "€2.1B",
      descripción: "Mercado SaaS B2B para asesorías en transformación",
      tendencia: "explosiva"
    }
  ],

  // Propuesta de valor de SuiteLoop
  propuestaValor: {
    tagline: "La plataforma post-on-premise que convive con A3/Sage",
    descripcion: "Acelera tu despacho sin reimplantar: portal cliente, automatización OCR, tesorería PSD2 y cumplimiento regulatorio en una sola capa.",
    productos: [
      {
        nombre: "DataLoop (iPaaS)",
        descripcion: "Orquestación e integración entre sistemas legacy y cloud",
        beneficio: "Conecta A3/Sage con herramientas modernas sin fricción",
        icon: "Network"
      },
      {
        nombre: "BiLoop (Portal Cliente)", 
        descripcion: "Colaboración digital asesoría-cliente con workflows",
        beneficio: "Reduce emails un 60% y mejora experiencia cliente",
        icon: "Users"
      },
      {
        nombre: "OCRLoop",
        descripcion: "Extracción inteligente y proposición automática de asientos",
        beneficio: "Ahorra 35% del tiempo en contabilización manual", 
        icon: "ScanLine"
      },
      {
        nombre: "CashLoop (PSD2)",
        descripcion: "Tesorería conectada y conciliación bancaria automática", 
        beneficio: "Conciliación en tiempo real con bancos principales",
        icon: "CreditCard"
      },
      {
        nombre: "Planner (SIF Ready)",
        descripcion: "Planificación fiscal y cumplimiento normativo automatizado",
        beneficio: "Compliance e-factura y SIF sin configuración manual",
        icon: "Calendar"
      }
    ]
  },

  // FAQs más frecuentes
  faqs: [
    {
      pregunta: "¿SuiteLoop sustituye a A3 o Sage?",
      respuesta: "No. SuiteLoop es una capa post-on-premise que **convive** con tu ERP actual. Mantienes A3/Sage para contabilidad fiscal y añades automatización, portal cliente y tesorería sin migración traumática."
    },
    {
      pregunta: "¿Cuánto tiempo lleva la implementación?",
      respuesta: "El Time-To-Value es de 2 semanas típicamente. DataLoop se conecta via APIs estándar, BiLoop se configura con tu branding, y los clients empiezan a subir documentos inmediatamente."
    },
    {
      pregunta: "¿Cómo cumple con e-factura y SIF?",
      respuesta: "Planner gestiona automáticamente el reporte SIF y la validación e-factura. Recibe las facturas via BiLoop, las valida con normativa vigente y reporta a Hacienda sin intervención manual."
    },
    {
      pregunta: "¿Qué nivel de seguridad tiene?",
      respuesta: "Certificación ISO 27001, encriptación AES-256, hosting en EU (GDPR compliant), y póliza de ciberseguridad de 2M€. Audit logs completos y acceso por roles granular."
    },
    {
      pregunta: "¿Funciona con mi banco actual?",
      respuesta: "CashLoop se conecta via PSD2 con +150 entidades bancarias españolas (BBVA, Santander, CaixaBank, Sabadell, etc). Conciliación automática sin cambiar de banco."
    },
    {
      pregunta: "¿Cuál es el modelo de precios?",
      respuesta: "SaaS por asesoría + módulos: desde 89€/mes BiLoop básico hasta 299€/mes suite completa. Sin coste de setup. Prueba gratuita 30 días con tu despacho real."
    }
  ],

  // Trust signals y referencias
  trustSignals: {
    logos: [
      { nombre: "ETL Global", tipo: "partner" },
      { nombre: "Ce Consulting", tipo: "client" }, 
      { nombre: "IusTime", tipo: "integration" },
      { nombre: "REAF", tipo: "association" }
    ],
    certificaciones: [
      { nombre: "ISO 27001", descripcion: "Seguridad de la información" },
      { nombre: "GDPR Compliant", descripcion: "Protección de datos EU" },
      { nombre: "PCI DSS", descripcion: "Seguridad en pagos" }
    ],
    polizas: [
      { tipo: "Ciberseguridad", cantidad: "2M€", aseguradora: "Allianz" },
      { tipo: "RC Profesional", cantidad: "1M€", aseguradora: "Zurich" }
    ]
  }
}

// Configuración SEO específica
export const seoConfig = {
  title: "SuiteLoop: Software para Asesorías | Análisis del Sector 2025 + Demo",
  description: "Radiografía del sector de asesorías en España y guía práctica de modernización con SuiteLoop: portal cliente, OCR, tesorería, SIF compliance.",
  keywords: "software para asesorías, portal cliente asesoría, facturación electrónica asesorías, SIF, OCR contable, iPaaS asesorías, post-on-premise",
  canonical: "https://capittal.es/lp/suiteloop",
  ogImage: "https://capittal.es/images/og-suiteloop-landing.jpg"
}

// Configuración del formulario de contacto
export const leadFormConfig = {
  fields: [
    { name: "nombre", label: "Nombre completo", type: "text", required: true },
    { name: "email", label: "Email corporativo", type: "email", required: true },
    { name: "telefono", label: "Teléfono", type: "tel", required: false },
    { name: "despacho", label: "Nombre del despacho", type: "text", required: true },
    { 
      name: "tipoDespacho", 
      label: "Tipo de despacho", 
      type: "select", 
      required: true,
      options: [
        { value: "micro", label: "Micro (1-9 empleados)" },
        { value: "pequeño", label: "Pequeño (10-25 empleados)" },
        { value: "mediano", label: "Mediano (26-50 empleados)" },
        { value: "grande", label: "Grande (>50 empleados)" }
      ]
    },
    { 
      name: "numPymes", 
      label: "Nº clientes PYMEs aprox.", 
      type: "select", 
      required: true,
      options: [
        { value: "1-50", label: "1-50 clientes" },
        { value: "51-150", label: "51-150 clientes" },
        { value: "151-300", label: "151-300 clientes" },
        { value: "300+", label: "Más de 300 clientes" }
      ]
    },
    { name: "mensaje", label: "¿Qué te interesa más de SuiteLoop?", type: "textarea", required: false }
  ]
}