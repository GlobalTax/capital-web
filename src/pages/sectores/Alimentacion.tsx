import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { UtensilsCrossed, Truck, Wine, Coffee } from 'lucide-react';
import { SEOHead } from '@/components/seo';
import { getServiceSchema, getWebPageSchema, getBreadcrumbSchema } from '@/utils/seo/schemas';
import { useHreflang } from '@/hooks/useHreflang';
import {
  SectorHeroV2,
  SectorStatsV2,
  SectorMarketInsights,
  SectorExpertiseGrid,
  SectorMethodology,
  SectorFAQ,
  SectorCTAV2,
  SectorOperationsGrid
} from '@/components/sector-v2';

const Alimentacion = () => {
  const location = useLocation();
  useHreflang();

  const heroMetrics = [
    { value: '€130.000M', label: 'Industria alimentaria' },
    { value: '+6%', label: 'Crecimiento anual' },
    { value: '6-10x', label: 'Múltiplo EBITDA' },
    { value: '31.000+', label: 'Empresas sector' }
  ];

  const stats = [
    { 
      value: '€130.000M', 
      label: 'Facturación Sector', 
      trend: { value: '+6,2%', direction: 'up' as const },
      description: 'Primera industria manufacturera de España'
    },
    { 
      value: '500.000', 
      label: 'Empleados Directos', 
      description: 'Puestos de trabajo en la industria alimentaria'
    },
    { 
      value: '+9%', 
      label: 'Exportaciones', 
      trend: { value: 'récord', direction: 'up' as const },
      description: 'Crecimiento de exportaciones alimentarias españolas'
    },
    { 
      value: '6-10x', 
      label: 'Múltiplo EBITDA', 
      description: 'Rango de valoración según marca y canal'
    }
  ];

  const marketInsights = {
    description: 'La industria alimentaria española es la primera del sector manufacturero y atraviesa una fase de consolidación activa. Grupos familiares buscan sucesión, multinacionales quieren presencia en productos españoles, y fondos apuestan por plataformas con capacidad exportadora.',
    bulletPoints: [
      'España, 4º exportador alimentario de la UE con récord en 2024',
      'Consolidación activa en distribución foodservice y HORECA',
      'Demanda creciente de productos premium, ecológicos y de origen',
      'Fondos de private equity muy activos en plataformas con marca'
    ],
    insightCards: [
      { title: 'Producción', value: '6-9x', description: 'Fabricantes con marca propia' },
      { title: 'Distribución', value: '5-7x', description: 'Mayoristas y cash & carry' },
      { title: 'HORECA', value: '6-8x', description: 'Distribución foodservice' },
      { title: 'Premium', value: '8-12x', description: 'Productos gourmet y DOP' }
    ]
  };

  const expertiseItems = [
    {
      icon: UtensilsCrossed,
      title: 'Industria Alimentaria',
      description: 'Fabricantes de productos alimentarios, conservas, congelados y elaborados.',
      features: ['Capacidad productiva', 'Certificaciones', 'Marcas propias']
    },
    {
      icon: Truck,
      title: 'Distribución',
      description: 'Mayoristas, distribuidores y operadores logísticos alimentarios.',
      features: ['Red de distribución', 'Cartera clientes', 'Cadena de frío']
    },
    {
      icon: Wine,
      title: 'Bebidas',
      description: 'Bodegas, cerveceras, aguas y bebidas espirituosas.',
      features: ['Marcas y DO', 'Capacidad producción', 'Exportación']
    },
    {
      icon: Coffee,
      title: 'Canal HORECA',
      description: 'Distribución a hostelería, restauración y catering.',
      features: ['Contratos recurrentes', 'Cobertura geográfica', 'Servicios añadidos']
    }
  ];

  const methodologySteps = [
    {
      number: '1',
      title: 'Análisis de Mercado',
      description: 'Evaluación del posicionamiento, marcas, canales y capacidad exportadora.',
      features: ['Cuota de mercado', 'Marcas y patentes', 'Mix de canales', 'Exportación']
    },
    {
      number: '2',
      title: 'Due Diligence Operativa',
      description: 'Análisis de capacidad productiva, certificaciones y cadena de suministro.',
      features: ['Plantas y equipos', 'Certificaciones', 'Proveedores', 'Trazabilidad']
    },
    {
      number: '3',
      title: 'Valoración y Transacción',
      description: 'Determinación del valor y acceso a compradores estratégicos del sector.',
      features: ['Múltiplos sector', 'Sinergias', 'Compradores naturales', 'Estructuración']
    }
  ];

  const faqs = [
    {
      question: '¿Cómo se valora una empresa alimentaria?',
      answer: 'Las empresas alimentarias se valoran por múltiplo de EBITDA (6-10x) según marca, canal y capacidad exportadora. Factores clave: marcas propias vs marca blanca, certificaciones (IFS, BRC, ecológico), mix de clientes, capacidad productiva y recurrencia de pedidos. Productos premium y DOP obtienen múltiplos superiores.'
    },
    {
      question: '¿Qué diferencia hay entre producción y distribución?',
      answer: 'Los fabricantes con marca propia cotizan a múltiplos superiores (6-9x) por el valor de la marca y márgenes. Los distribuidores (5-7x) se valoran por red logística, cartera de clientes y contratos recurrentes. La distribución HORECA puede obtener primas por recurrencia y barreras de entrada.'
    },
    {
      question: '¿Quién compra empresas alimentarias en España?',
      answer: 'Los principales compradores son: multinacionales alimentarias buscando productos españoles y capacidad exportadora, fondos de private equity armando plataformas, y grupos familiares españoles consolidando. Hay especial interés en aceite, vino, conservas, productos cárnicos y gourmet.'
    },
    {
      question: '¿Cómo afectan las certificaciones a la valoración?',
      answer: 'Las certificaciones (IFS, BRC, ecológico, DOP, IGP) son muy valoradas. Permiten acceso a grandes distribuidores y exportación. Una empresa con certificaciones completas puede obtener 0,5-1x adicional de múltiplo. La trazabilidad y food safety son requisitos esenciales para compradores institucionales.'
    },
    {
      question: '¿Cuánto tiempo lleva vender una empresa alimentaria?',
      answer: 'El proceso típico es de 6-10 meses. La due diligence incluye análisis de certificaciones, contratos con distribuidores, calidad de producto y cadena de suministro. Empresas con marcas reconocidas y buena documentación atraen más interés y pueden acelerar el proceso.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Valoración de Empresas Alimentarias | M&A Food & Beverage | Capittal"
        description="Expertos en M&A y valoración de empresas alimentarias: producción, distribución, bebidas, HORECA. Asesoramiento especializado en el sector food & beverage."
        canonical={`https://capittal.es${location.pathname}`}
        keywords="valoración empresas alimentarias, vender empresa alimentación, M&A food beverage, valoración distribución alimentaria"
        structuredData={[
          getServiceSchema(
            "Valoración de Empresas Alimentarias",
            "Servicios especializados de M&A y valoración para empresas del sector alimentario",
            "Mergers & Acquisitions"
          ),
          getWebPageSchema(
            "Sector Alimentación y Bebidas",
            "Especialización en M&A y valoración de empresas alimentarias",
            "https://capittal.es/sectores/alimentacion"
          ),
          getBreadcrumbSchema([
            { name: 'Inicio', url: 'https://capittal.es/' },
            { name: 'Sectores', url: 'https://capittal.es/sectores' },
            { name: 'Alimentación', url: 'https://capittal.es/sectores/alimentacion' }
          ])
        ]}
      />
      <Header />
      
      <SectorHeroV2
        badge="Sector Alimentación"
        title="Expertos en M&A del Sector Alimentario"
        description="Asesoramiento especializado en valoración y venta de empresas alimentarias: producción, distribución, bebidas y canal HORECA."
        metrics={heroMetrics}
        accentColor="slate"
      />
      
      <SectorStatsV2 
        title="El Sector Alimentario en Cifras"
        subtitle="Primera industria manufacturera de España con fuerte crecimiento exportador"
        stats={stats}
        accentColor="slate"
      />
      
      <SectorMarketInsights
        title="Contexto del Mercado Alimentario"
        description={marketInsights.description}
        bulletPoints={marketInsights.bulletPoints}
        insightCards={marketInsights.insightCards}
        accentColor="slate"
      />
      
      <SectorExpertiseGrid 
        title="Áreas de Especialización"
        subtitle="Experiencia integral en todos los subsectores alimentarios"
        items={expertiseItems}
        accentColor="slate"
      />
      
      <SectorMethodology
        title="Metodología Específica Alimentación"
        subtitle="Un proceso adaptado a las particularidades del sector food & beverage"
        steps={methodologySteps}
        accentColor="slate"
      />
      
      <SectorOperationsGrid
        sectorKey="alimentacion"
        title="Operaciones en Cartera"
        subtitle="Oportunidades activas en el sector alimentación y bebidas"
      />
      
      <SectorFAQ
        title="Preguntas Frecuentes - Alimentación"
        subtitle="Resolvemos las dudas más habituales sobre M&A en alimentación"
        faqs={faqs}
        accentColor="slate"
      />
      
      <SectorCTAV2
        title="¿Tienes una empresa alimentaria?"
        description="Obtén una valoración confidencial de tu empresa de producción, distribución o canal HORECA. Nuestros expertos te asesorarán sin compromiso."
        accentColor="slate"
      />
      
      <Footer />
    </div>
  );
};

export default Alimentacion;
