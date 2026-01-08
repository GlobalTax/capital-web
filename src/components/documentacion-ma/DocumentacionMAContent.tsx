import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Calculator, FileText, Building, FileSignature, Search, Handshake, GitMerge, HelpCircle } from 'lucide-react';
import { MAResourcesFilter, MACategory } from './MAResourcesFilter';
import { MAContentSection, MAResource } from './MAContentSection';
import { MAResourcesForm } from './MAResourcesForm';
import { DownloadPackButton } from './DownloadPackButton';

// Content data for each M&A category
const maContentData = [
  {
    id: 'preparacion' as MACategory,
    title: 'Preparación',
    description: 'Cuándo comprar vs crecer, tipos de comprador, criterios estratégicos',
    icon: FileText,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    content: {
      overview: 'La fase de preparación es crucial para determinar si una adquisición es la estrategia correcta para alcanzar los objetivos empresariales. Incluye el análisis de alternativas, la definición de criterios y la preparación del equipo.',
      keyPoints: [
        'Valoración de crecimiento orgánico vs inorgánico según objetivos estratégicos',
        'Identificación del perfil de comprador: estratégico, financiero o industrial',
        'Definición de criterios de inversión: sector, tamaño, geografía, rentabilidad',
        'Preparación del equipo interno y selección de asesores externos',
        'Establecimiento de presupuesto y estructura de financiación disponible'
      ],
      resources: [
        { title: 'Template de Criterios de Inversión', type: 'template' as const, downloadable: true },
        { title: 'Checklist de Preparación M&A', type: 'checklist' as const, downloadable: true },
        { title: 'Guía de Selección de Asesores', type: 'guide' as const, downloadable: true }
      ],
      examples: [
        'Empresa tecnológica busca adquirir competidores para acelerar expansión internacional',
        'Grupo industrial evalúa comprar proveedores para integración vertical'
      ]
    }
  },
  {
    id: 'valoracion' as MACategory,
    title: 'Valoración',
    description: 'EBITDA múltiplos, DCF, metodologías para defender el valor',
    icon: Calculator,
    color: 'bg-green-50 text-green-700 border-green-200',
    content: {
      overview: 'La valoración es el proceso de determinar el valor justo de una empresa utilizando múltiples metodologías. Es fundamental para tomar decisiones informadas sobre el precio de la oferta y estructura del deal.',
      keyPoints: [
        'Análisis DCF (Discounted Cash Flow) con proyecciones detalladas a 5-10 años',
        'Múltiplos de transacciones comparables por sector y tamaño de empresa',
        'Valoración por suma de partes para empresas diversificadas',
        'Análisis de sensibilidad para evaluar rangos de valor',
        'Benchmarking con empresas cotizadas similares',
        'Ajustes por control, liquidez y tamaño'
      ],
      resources: [
        { title: 'Modelo DCF Avanzado', type: 'template' as const, downloadable: true },
        { title: 'Base de Datos de Múltiplos', type: 'template' as const, downloadable: true },
        { title: 'Calculadora de Valoración', type: 'template' as const, url: '/calculadora' },
        { title: 'Guía de Análisis Comparables', type: 'guide' as const, downloadable: true }
      ],
      examples: [
        'SaaS con ARR de €5M valorada entre 6-12x ingresos según crecimiento y retención',
        'Empresa industrial madura valorada 5-7x EBITDA ajustado por normalización'
      ]
    }
  },
  {
    id: 'estructura' as MACategory,
    title: 'Estructura del Deal',
    description: 'Cash vs earn-out vs seller financing, optimización fiscal',
    icon: Building,
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    content: {
      overview: 'La estructura del deal determina cómo se pagará el precio, se asignarán los riesgos y se optimizarán los aspectos fiscales. Una buena estructuración alinea los intereses de comprador y vendedor.',
      keyPoints: [
        'Cash vs stock: ventajas fiscales y de liquidez para cada parte',
        'Earn-out: vinculación del precio final al rendimiento futuro',
        'Seller financing: financiación del vendedor para facilitar la transacción',
        'Escrow accounts: garantías para cubrir contingencias post-cierre',
        'Consideraciones fiscales: estructuras tax-efficient',
        'Mecanismos de ajuste de precio basados en working capital y deuda neta'
      ],
      resources: [
        { title: 'Guía de Estructuras de Deal', type: 'guide' as const, downloadable: true },
        { title: 'Template de Earn-out', type: 'template' as const, downloadable: true },
        { title: 'Calculadora Fiscal M&A', type: 'template' as const, downloadable: true },
        { title: 'Modelos de Escrow', type: 'example' as const, downloadable: true }
      ],
      examples: [
        '70% cash al cierre + 30% earn-out basado en EBITDA años 1-2',
        '80% en acciones + 20% cash para optimizar fiscalidad del vendedor'
      ]
    }
  },
  {
    id: 'loi' as MACategory,
    title: 'LOI (Letter of Intent)',
    description: 'Qué debe contener una LOI y qué cláusulas evitar',
    icon: FileSignature,
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    content: {
      overview: 'La Letter of Intent (LOI) es el primer documento formal que establece los términos básicos de la transacción. Debe ser lo suficientemente específica para guiar la negociación pero flexible para permitir ajustes post-due diligence.',
      keyPoints: [
        'Precio indicativo y estructura de pago propuesta',
        'Condiciones precedentes: due diligence, financiación, aprobaciones',
        'Período de exclusividad y confidencialidad',
        'Cronograma de la transacción con hitos clave',
        'Tratamiento de empleos clave y management',
        'Aspectos no vinculantes vs vinculantes claramente definidos'
      ],
      resources: [
        { title: 'Template LOI Estándar', type: 'template' as const, downloadable: true },
        { title: 'Checklist de Términos LOI', type: 'checklist' as const, downloadable: true },
        { title: 'Cláusulas Problemáticas a Evitar', type: 'guide' as const, downloadable: true }
      ],
      examples: [
        'LOI con precio €50M sujeto a confirmación en due diligence',
        'Exclusividad de 60 días con opción de extensión 30 días adicionales'
      ]
    }
  },
  {
    id: 'due-diligence' as MACategory,
    title: 'Due Diligence',
    description: 'Checklist multisector: financiera, legal, comercial, operacional',
    icon: Search,
    color: 'bg-red-50 text-red-700 border-red-200',
    content: {
      overview: 'La due diligence es la investigación exhaustiva de la empresa objetivo para validar los supuestos de valoración, identificar riesgos y oportunidades, y confirmar la información proporcionada por el vendedor.',
      keyPoints: [
        'Due diligence financiera: calidad de earnings, working capital, deuda',
        'Análisis comercial: mercado, competencia, posicionamiento, clientes',
        'Revisión legal: contratos, litigios, compliance, propiedad intelectual',
        'Valoración operacional: procesos, sistemas, capacidades, sinergias',
        'Due diligence fiscal: exposiciones, optimizaciones, estructuras',
        'Análisis de RRHH: organización, talento clave, cultura, retención'
      ],
      resources: [
        { title: 'Checklist Due Diligence Completa', type: 'checklist' as const, downloadable: true },
        { title: 'Template Data Room Index', type: 'template' as const, downloadable: true },
        { title: 'Red Flags Financieros', type: 'guide' as const, downloadable: true },
        { title: 'Análisis de Contratos Clave', type: 'checklist' as const, downloadable: true }
      ],
      examples: [
        'DD financiera revela ajustes de €2M por normalización de EBITDA',
        'DD comercial confirma dependencia del 40% de ingresos en top 3 clientes'
      ]
    }
  },
  {
    id: 'cierre' as MACategory,
    title: 'Cierre',
    description: 'SPA, ajustes de precio, escrow, condiciones precedentes',
    icon: Handshake,
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    content: {
      overview: 'El cierre incluye la negociación final del SPA (Stock/Share Purchase Agreement), el cumplimiento de condiciones precedentes y la transferencia formal de la propiedad con todos los ajustes de precio correspondientes.',
      keyPoints: [
        'Negociación del SPA: términos definitivos, representaciones y garantías',
        'Cumplimiento de condiciones precedentes: financiación, aprobaciones, otros',
        'Cálculo de ajustes de precio: working capital, caja, deuda neta',
        'Establecimiento de escrow account y mecanismos de indemnización',
        'Coordinación con autoridades: registros mercantiles, fiscales, laborales',
        'Comunicación a stakeholders: empleados, clientes, proveedores'
      ],
      resources: [
        { title: 'Template SPA Estándar', type: 'template' as const, downloadable: true },
        { title: 'Checklist de Closing', type: 'checklist' as const, downloadable: true },
        { title: 'Calculadora de Ajustes', type: 'template' as const, downloadable: true },
        { title: 'Comunicación a Stakeholders', type: 'template' as const, downloadable: true }
      ],
      examples: [
        'Ajuste de precio: +€1.5M por working capital superior al normalizado',
        'Escrow del 10% del precio por 18 meses para cubrir contingencias'
      ]
    }
  },
  {
    id: 'integracion' as MACategory,
    title: 'Integración',
    description: 'Plan 100 días, seguimiento de sinergias, retención de talento',
    icon: GitMerge,
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    content: {
      overview: 'La integración post-adquisición es crítica para realizar las sinergias proyectadas. Un plan estructurado de 100 días establece las bases para una integración exitosa y la captura de valor.',
      keyPoints: [
        'Plan de integración 100 días con hitos y responsables definidos',
        'Integración de sistemas: IT, financiero, operacional, comercial',
        'Retención de talento clave y comunicación de cambios organizacionales',
        'Seguimiento y medición de sinergias de ingresos y costes',
        'Integración cultural y alineación de valores y procesos',
        'Reporting y comunicación regular del progreso a stakeholders'
      ],
      resources: [
        { title: 'Template Plan 100 Días', type: 'template' as const, downloadable: true },
        { title: 'KPIs de Integración', type: 'checklist' as const, downloadable: true },
        { title: 'Plan de Retención de Talento', type: 'template' as const, downloadable: true },
        { title: 'Dashboard de Sinergias', type: 'template' as const, downloadable: true }
      ],
      examples: [
        'Integración de sistemas ERP completada en 90 días con 0% pérdida de datos',
        'Retención del 98,7% del management clave mediante plan de incentivos'
      ]
    }
  },
  {
    id: 'faqs' as MACategory,
    title: 'FAQs / Glosario',
    description: 'Definiciones de términos clave y preguntas frecuentes',
    icon: HelpCircle,
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    content: {
      overview: 'Glosario completo de términos M&A y respuestas a las preguntas más frecuentes en procesos de fusiones y adquisiciones, desde la perspectiva tanto del comprador como del vendedor.',
      keyPoints: [
        'Términos financieros: EBITDA, Enterprise Value, Equity Value, Working Capital',
        'Estructura legal: SPA, LOI, Due Diligence, Escrow, Earn-out',
        'Procesos: Data Room, Management Presentation, Q&A process',
        'Valoración: DCF, Multiple, Comparable, Precedent transactions',
        'Fiscalidad: Tax efficiency, Step-up, Depreciation, Amortization',
        'Post-cierre: Integration, Synergies, PMI, Carve-out'
      ],
      resources: [
        { title: 'Glosario M&A Completo', type: 'guide' as const, downloadable: true },
        { title: 'FAQs del Comprador', type: 'guide' as const, downloadable: true },
        { title: 'FAQs del Vendedor', type: 'guide' as const, downloadable: true },
        { title: 'Términos Legales M&A', type: 'guide' as const, downloadable: true }
      ],
      examples: [
        'EBITDA: Earnings Before Interest, Taxes, Depreciation and Amortization',
        'Earn-out: Pago adicional basado en el rendimiento futuro de la empresa'
      ]
    }
  }
];

const DocumentacionMAContent = () => {
  const [activeCategory, setActiveCategory] = useState<MACategory>('all');
  const [openSections, setOpenSections] = useState<Set<MACategory>>(new Set());

  const handleCategoryChange = (category: MACategory) => {
    setActiveCategory(category);
    
    // If selecting a specific category, open that section
    if (category !== 'all') {
      setOpenSections(prev => new Set([...prev, category]));
    }
  };

  const toggleSection = (categoryId: MACategory) => {
    setOpenSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const filteredContent = activeCategory === 'all' 
    ? maContentData 
    : maContentData.filter(item => item.id === activeCategory);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-normal text-foreground mb-6 leading-tight">
          Guía de Conocimiento M&A
        </h1>
        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
          Recursos clave para dominar cada fase de una adquisición: valoración, LOI, due diligence, cierre e integración.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <DownloadPackButton size="lg" />
          <Button size="lg" variant="outline">
            <Phone className="h-4 w-4 mr-2" />
            Solicitar Consulta
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground mb-2">€902M</div>
            <p className="text-muted-foreground">Valor en transacciones</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground mb-2">450+</div>
            <p className="text-muted-foreground">Operaciones completadas</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground mb-2">15+</div>
            <p className="text-muted-foreground">Años de experiencia</p>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <MAResourcesFilter 
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Content Sections */}
      <section className="max-w-4xl mx-auto">
        <div className="space-y-4">
          {filteredContent.map((item) => (
            <MAContentSection
              key={item.id}
              item={item}
              isOpen={openSections.has(item.id)}
              onToggle={() => toggleSection(item.id)}
            />
          ))}
        </div>
      </section>

      {/* CTA Form Section */}
      <section className="py-16">
        <MAResourcesForm />
      </section>

      {/* Final CTA */}
      <section className="bg-muted/30 rounded-2xl p-8 text-center">
        <h2 className="text-3xl font-normal text-foreground mb-4">
          ¿Listo para tu próxima operación?
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Nuestro equipo de expertos en M&A está preparado para acompañarte en cada fase de tu operación.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg">
            <Phone className="h-4 w-4 mr-2" />
            Solicitar Consulta
          </Button>
          <Button size="lg" variant="outline">
            <Calculator className="h-4 w-4 mr-2" />
            Iniciar Valoración
          </Button>
        </div>
      </section>
    </div>
  );
};

export default DocumentacionMAContent;