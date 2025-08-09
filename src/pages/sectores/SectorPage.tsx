import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SectorCalculator } from '@/components/calculadora/SectorCalculator';
import { useSectorsList } from '@/hooks/useSectorMultiples';

// Contenido específico por sector
const sectorContent: Record<string, {
  description: string;
  keyBenefits: string[];
  industryInsights: string[];
  metaTitle: string;
  metaDescription: string;
}> = {
  tecnologia: {
    description: 'Empresas de software, SaaS, desarrollo tecnológico',
    keyBenefits: [
      'Múltiplos adaptados a modelos SaaS y tecnológicos',
      'Valoración de activos intangibles y PI',
      'Análisis de métricas recurrentes (ARR, MRR)',
      'Evaluación de escalabilidad y crecimiento'
    ],
    industryInsights: [
      'Factores clave: Recurrencia de ingresos, escalabilidad y defensibilidad tecnológica',
      'Tendencias: Crecimiento del SaaS B2B, automatización y IA',
      'Métricas críticas: LTV/CAC, churn rate, velocidad de crecimiento',
      'Casos de éxito: Empresas tecnológicas con valoraciones 10x+ revenue'
    ],
    metaTitle: 'Calculadora de Valoración para Empresas Tecnológicas | Capittal',
    metaDescription: 'Valora tu empresa tecnológica con múltiplos específicos del sector. Análisis especializado para SaaS, software y startups tech.'
  },
  retail: {
    description: 'Comercio minorista, distribución, e-commerce',
    keyBenefits: [
      'Múltiplos específicos para retail y e-commerce',
      'Análisis de márgenes y rotación de inventario',
      'Evaluación de canales de distribución',
      'Valoración de marca y posicionamiento'
    ],
    industryInsights: [
      'Factores clave: Márgenes operativos, rotación de stock y posicionamiento de marca',
      'Tendencias: Omnicanalidad, sostenibilidad y experiencia del cliente',
      'Métricas críticas: Margen bruto, rotación de inventario, ventas por m²',
      'Casos de éxito: Retailers con estrategias digitales exitosas'
    ],
    metaTitle: 'Calculadora de Valoración para Retail y E-commerce | Capittal',
    metaDescription: 'Valora tu negocio de retail o e-commerce con múltiplos específicos del sector comercial y de distribución.'
  },
  manufactura: {
    description: 'Fabricación industrial, maquinaria, productos manufacturados',
    keyBenefits: [
      'Múltiplos adaptados a la industria manufacturera',
      'Valoración de activos productivos y maquinaria',
      'Análisis de eficiencia operativa',
      'Evaluación de capacidad de producción'
    ],
    industryInsights: [
      'Factores clave: Eficiencia operativa, capacidad de producción y calidad del producto',
      'Tendencias: Industria 4.0, automatización y sostenibilidad',
      'Métricas críticas: Utilización de capacidad, EBITDA margin, ROA',
      'Casos de éxito: Manufacturers con procesos optimizados y alta calidad'
    ],
    metaTitle: 'Calculadora de Valoración para Industria Manufacturera | Capittal',
    metaDescription: 'Valora tu empresa manufacturera con múltiplos específicos del sector industrial y de fabricación.'
  },
  servicios: {
    description: 'Servicios profesionales, consultoría, outsourcing',
    keyBenefits: [
      'Múltiplos específicos para empresas de servicios',
      'Valoración de capital humano especializado',
      'Análisis de recurrencia de clientes',
      'Evaluación de diferenciación competitiva'
    ],
    industryInsights: [
      'Factores clave: Calidad del talento, recurrencia de clientes y diferenciación',
      'Tendencias: Digitalización de servicios, especialización y outsourcing',
      'Métricas críticas: Utilización de recursos, margen por proyecto, retención',
      'Casos de éxito: Firmas de servicios con alta especialización y recurrencia'
    ],
    metaTitle: 'Calculadora de Valoración para Empresas de Servicios | Capittal',
    metaDescription: 'Valora tu empresa de servicios profesionales con múltiplos específicos del sector servicios.'
  },
  salud: {
    description: 'Servicios sanitarios, farmacéuticas, dispositivos médicos',
    keyBenefits: [
      'Múltiplos específicos del sector sanitario',
      'Valoración de activos regulatorios y patentes',
      'Análisis de pipeline de productos',
      'Evaluación de compliance regulatorio'
    ],
    industryInsights: [
      'Factores clave: Regulación, innovación, pipeline de productos y demografía',
      'Tendencias: Telemedicina, biotecnología y medicina personalizada',
      'Métricas críticas: Margen de I+D, tiempo al mercado, penetración',
      'Casos de éxito: Empresas health-tech con soluciones innovadoras'
    ],
    metaTitle: 'Calculadora de Valoración para Sector Salud | Capittal',
    metaDescription: 'Valora tu empresa del sector salud con múltiplos específicos para servicios sanitarios y biotecnología.'
  }
};

// Agregar contenido por defecto para sectores sin contenido específico
const getDefaultContent = (sectorDescription: string) => ({
  description: sectorDescription,
  keyBenefits: [
    `Múltiplos específicos para ${sectorDescription.toLowerCase()}`,
    'Análisis adaptado a las características del sector',
    'Comparativa con empresas similares',
    'Recomendaciones personalizadas'
  ],
  industryInsights: [
    'Factores clave de valoración en el sector',
    'Tendencias de mercado y oportunidades',
    'Métricas de rendimiento sectoriales',
    'Casos de éxito relevantes'
  ],
  metaTitle: `Calculadora de Valoración para ${sectorDescription} | Capittal`,
  metaDescription: `Valora tu empresa del sector ${sectorDescription.toLowerCase()} con múltiplos específicos y análisis personalizado.`
});

const SectorPage: React.FC = () => {
  const { sector } = useParams<{ sector: string }>();
  const { data: sectors, isLoading } = useSectorsList();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando calculadora...</p>
        </div>
      </div>
    );
  }

  if (!sector || !sectors) {
    return <Navigate to="/calculadoras" replace />;
  }

  const sectorData = sectors.find(s => s.sector_name === sector);
  if (!sectorData) {
    return <Navigate to="/calculadoras" replace />;
  }

  const content = sectorContent[sector] || getDefaultContent(sectorData.description);

  return (
    <>
      <Helmet>
        <title>{content.metaTitle}</title>
        <meta name="description" content={content.metaDescription} />
        <meta name="keywords" content={`valoración, ${sector}, calculadora, empresa, ${sectorData.description}`} />
        <meta property="og:title" content={content.metaTitle} />
        <meta property="og:description" content={content.metaDescription} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`https://capittal.com/calculadora/${sector}`} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": `Calculadora de Valoración - ${sectorData.description}`,
            "description": content.metaDescription,
            "url": `https://capittal.com/calculadora/${sector}`,
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "EUR"
            },
            "provider": {
              "@type": "Organization",
              "name": "Capittal",
              "url": "https://capittal.com"
            }
          })}
        </script>
      </Helmet>

      <SectorCalculator
        sectorName={sector}
        sectorDescription={sectorData.description}
        keyBenefits={content.keyBenefits}
        industryInsights={content.industryInsights}
      />
    </>
  );
};

export default SectorPage;