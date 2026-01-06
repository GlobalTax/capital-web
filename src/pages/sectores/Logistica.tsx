import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Truck, Package, Warehouse, MapPin } from 'lucide-react';
import { SEOHead } from '@/components/seo';
import { getServiceSchema, getWebPageSchema } from '@/utils/seo/schemas';
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

const Logistica = () => {
  useHreflang();

  const heroMetrics = [
    { value: '€115.000M', label: 'Mercado logístico 2024' },
    { value: '+7%', label: 'Crecimiento anual' },
    { value: '5-8x', label: 'Múltiplo EBITDA' },
    { value: '200.000+', label: 'Empresas transporte' }
  ];

  const stats = [
    { 
      value: '€115.000M', 
      label: 'Facturación Sector', 
      trend: { value: '+7,1%', direction: 'up' as const },
      description: 'Mercado de transporte y logística en España'
    },
    { 
      value: '1,1M', 
      label: 'Empleados', 
      description: 'Puestos de trabajo en el sector logístico'
    },
    { 
      value: '+15%', 
      label: 'E-commerce', 
      trend: { value: 'driver', direction: 'up' as const },
      description: 'Crecimiento en logística de última milla'
    },
    { 
      value: '5-8x', 
      label: 'Múltiplo EBITDA', 
      description: 'Rango de valoración según especialización'
    }
  ];

  const marketInsights = {
    description: 'El sector logístico español atraviesa una transformación acelerada por el e-commerce y la sostenibilidad. La escasez de conductores, la presión en márgenes y la necesidad de escala están impulsando una consolidación sin precedentes en transporte y operadores logísticos.',
    bulletPoints: [
      'Consolidación activa: principales operadores en modo adquisición',
      'Escasez de conductores acelera integración y automatización',
      'Última milla y e-commerce como drivers de crecimiento',
      'Sostenibilidad y flota eléctrica como diferencial competitivo'
    ],
    insightCards: [
      { title: 'Transporte', value: '4-6x', description: 'Flotas y empresas de transporte' },
      { title: 'Operadores 3PL', value: '6-8x', description: 'Operadores logísticos integrales' },
      { title: 'Última Milla', value: '5-7x', description: 'Distribución urbana y e-commerce' },
      { title: 'Almacenaje', value: '6-9x', description: 'Almacenes y gestión de inventario' }
    ]
  };

  const expertiseItems = [
    {
      icon: Truck,
      title: 'Transporte',
      description: 'Empresas de transporte por carretera, grupaje y carga completa.',
      features: ['Flota propia', 'Rutas y contratos', 'Licencias y permisos']
    },
    {
      icon: Package,
      title: 'Operadores Logísticos',
      description: 'Operadores 3PL y 4PL, gestión integral de cadena de suministro.',
      features: ['Contratos recurrentes', 'Tecnología WMS', 'Servicios de valor añadido']
    },
    {
      icon: MapPin,
      title: 'Última Milla',
      description: 'Distribución urbana, paquetería y entregas e-commerce.',
      features: ['Cobertura geográfica', 'Tecnología tracking', 'Flota sostenible']
    },
    {
      icon: Warehouse,
      title: 'Almacenaje',
      description: 'Operadores de almacén, cross-docking y gestión de inventario.',
      features: ['M² gestionados', 'Automatización', 'Clientes recurrentes']
    }
  ];

  const methodologySteps = [
    {
      number: '1',
      title: 'Análisis de Operaciones',
      description: 'Evaluación de flota, contratos, rutas y estructura de costes.',
      features: ['Flota y antigüedad', 'Contratos clientes', 'Conductores', 'Licencias']
    },
    {
      number: '2',
      title: 'Due Diligence Operativa',
      description: 'Análisis de eficiencia, tecnología y cumplimiento normativo.',
      features: ['KPIs operativos', 'Sistemas TMS/WMS', 'Compliance', 'Sostenibilidad']
    },
    {
      number: '3',
      title: 'Valoración y Cierre',
      description: 'Determinación del valor y acceso a compradores estratégicos.',
      features: ['Múltiplos sector', 'Sinergias de red', 'Compradores', 'Estructuración']
    }
  ];

  const faqs = [
    {
      question: '¿Cómo se valora una empresa de transporte?',
      answer: 'Las empresas de transporte se valoran por múltiplo de EBITDA (4-8x) ajustado por calidad de flota y contratos. Factores clave: antigüedad media de flota, proporción propia vs subcontratada, concentración de clientes, márgenes por ruta y situación de conductores. Flotas modernas y contratos recurrentes obtienen primas.'
    },
    {
      question: '¿Qué diferencia hay entre transporte y operador logístico?',
      answer: 'Los operadores logísticos 3PL cotizan a múltiplos superiores (6-8x) por mayor recurrencia, servicios de valor añadido y contratos a largo plazo. El transporte puro (4-6x) es más intensivo en activos (flota) y tiene márgenes más ajustados. La combinación de ambos (transporte + almacenaje) es muy valorada.'
    },
    {
      question: '¿Quién compra empresas de logística en España?',
      answer: 'Los principales compradores son: grandes operadores logísticos (XPO, SEUR, Logista) buscando capilaridad, fondos de private equity armando plataformas, y competidores regionales buscando rutas complementarias. Hay especial interés en última milla y operadores con tecnología avanzada.'
    },
    {
      question: '¿Cómo afecta la flota a la valoración?',
      answer: 'La flota es un activo clave pero también un pasivo potencial. Se valora: antigüedad media (ideal <5 años), proporción Euro 6 y vehículos eléctricos, financiación pendiente, y programa de renovación. Una flota moderna y sostenible puede añadir 0,5-1x al múltiplo.'
    },
    {
      question: '¿Cuánto tiempo lleva vender una empresa logística?',
      answer: 'El proceso típico es de 6-9 meses. La due diligence incluye análisis de contratos, flota, conductores y cumplimiento normativo. Empresas con sistemas de gestión (TMS/WMS), KPIs claros y contratos formalizados pueden acelerar significativamente el proceso.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Valoración de Empresas de Logística | M&A Transporte | Capittal"
        description="Expertos en M&A y valoración de empresas de logística: transporte, operadores 3PL, última milla, almacenaje. Asesoramiento especializado en el sector."
        canonical="https://capittal.es/sectores/logistica"
        keywords="valoración empresas logística, vender empresa transporte, M&A logística, valoración operador logístico"
        structuredData={[
          getServiceSchema(
            "Valoración de Empresas de Logística",
            "Servicios especializados de M&A y valoración para empresas del sector logístico",
            "Mergers & Acquisitions"
          ),
          getWebPageSchema(
            "Sector Logística y Transporte",
            "Especialización en M&A y valoración de empresas logísticas",
            "https://capittal.es/sectores/logistica"
          )
        ]}
      />
      <Header />
      
      <SectorHeroV2
        badge="Sector Logística"
        title="Expertos en M&A del Sector Logístico"
        description="Asesoramiento especializado en valoración y venta de empresas de transporte, operadores logísticos, última milla y almacenaje."
        metrics={heroMetrics}
        accentColor="slate"
      />
      
      <SectorStatsV2 
        title="El Sector Logístico en Cifras"
        subtitle="Un mercado en consolidación impulsado por e-commerce y sostenibilidad"
        stats={stats}
        accentColor="slate"
      />
      
      <SectorMarketInsights
        title="Contexto del Mercado Logístico"
        description={marketInsights.description}
        bulletPoints={marketInsights.bulletPoints}
        insightCards={marketInsights.insightCards}
        accentColor="slate"
      />
      
      <SectorExpertiseGrid 
        title="Áreas de Especialización"
        subtitle="Experiencia integral en todos los subsectores logísticos"
        items={expertiseItems}
        accentColor="slate"
      />
      
      <SectorMethodology
        title="Metodología Específica Logística"
        subtitle="Un proceso adaptado a las particularidades del sector"
        steps={methodologySteps}
        accentColor="slate"
      />
      
      <SectorOperationsGrid
        sectorKey="logistica"
        title="Operaciones en Cartera"
        subtitle="Oportunidades activas en el sector logística y transporte"
      />
      
      <SectorFAQ
        title="Preguntas Frecuentes - Logística"
        subtitle="Resolvemos las dudas más habituales sobre M&A en logística"
        faqs={faqs}
        accentColor="slate"
      />
      
      <SectorCTAV2
        title="¿Tienes una empresa de logística?"
        description="Obtén una valoración confidencial de tu empresa de transporte u operador logístico. Nuestros expertos te asesorarán sin compromiso."
        accentColor="slate"
      />
      
      <Footer />
    </div>
  );
};

export default Logistica;
