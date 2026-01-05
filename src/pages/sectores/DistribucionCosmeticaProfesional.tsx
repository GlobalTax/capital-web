import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SEOHead } from '@/components/seo';
import { getServiceSchema, getWebPageSchema } from '@/utils/seo/schemas';
import { useHreflang } from '@/hooks/useHreflang';
import SectorHero from '@/components/SectorHero';
import SectorStats from '@/components/sector/SectorStats';
import { Scissors, TrendingUp, Store, GraduationCap, Package, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const DistribucionCosmeticaProfesional = () => {
  useHreflang();
  
  const stats = [
    { number: "€280M", label: "Mercado core productos pro hair" },
    { number: "+8,9%", label: "Crecimiento hair care 2024" },
    { number: "6-10x", label: "Múltiplo EBITDA típico" },
    { number: "50+", label: "Distribuidores mapeados" }
  ];

  const expertise = [
    {
      icon: Store,
      title: "Cash & Carry",
      description: "Especialistas en valoración de redes de tiendas cash&carry para el profesional de peluquería y estética."
    },
    {
      icon: Package,
      title: "E-commerce B2B",
      description: "Experiencia en plataformas digitales de distribución mayorista con modelos de suscripción y reposición automática."
    },
    {
      icon: GraduationCap,
      title: "Formación y Academia",
      description: "Valoración de distribuidores con academias integradas y programas de formación como palanca de fidelización."
    },
    {
      icon: Building2,
      title: "Buy & Build",
      description: "Asesoramiento en estrategias de consolidación y roll-up de distribuidores regionales para crear plataformas nacionales."
    }
  ];

  const methodologies = [
    {
      number: "1",
      title: "Análisis de Cartera de Marcas",
      description: "Evaluamos la dependencia de marcas clave, contratos de exclusividad, y el mix de distribución para estimar riesgo y valor."
    },
    {
      number: "2",
      title: "Due Diligence de Inventario",
      description: "Análisis profundo de rotación, caducidades, obsolescencia y provisiones para ajustar el valor del stock."
    },
    {
      number: "3",
      title: "Valoración de Base de Clientes",
      description: "Evaluamos retención de salones, cohortes, frecuencia de compra y concentración para proyectar flujos recurrentes."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Valoración de Distribuidores Cosmética Profesional - M&A Pro Hair | Capittal"
        description="Expertos en valoración y venta de distribuidores de cosmética profesional: mayoristas B2B de productos de peluquería, cash&carry y e-commerce pro hair en España. Mercado €280M+."
        canonical="https://capittal.es/sectores/distribucion-cosmetica-profesional"
        keywords="vender distribuidora peluquería, valoración mayorista cosmética profesional, M&A distribución pro hair, vender cash and carry peluquería"
        structuredData={[
          getServiceSchema(
            "Valoración de Distribuidores de Cosmética Profesional",
            "Servicios especializados de M&A y valoración para mayoristas B2B de productos de peluquería y beauty profesional",
            "Mergers & Acquisitions"
          ),
          getWebPageSchema(
            "Sector Distribución Cosmética Profesional",
            "Especialización en M&A y valoración de distribuidores de productos profesionales de peluquería y estética",
            "https://capittal.es/sectores/distribucion-cosmetica-profesional"
          )
        ]}
      />
      <Header />
      <div className="pt-16">
        <SectorHero
          sector="Distribución Cosmética Profesional"
          title="Expertos en Valoración de Distribuidores Pro Hair & Beauty"
          description="Especialistas en la valoración de mayoristas B2B de productos profesionales de peluquería, estética y barber. Entendemos las dinámicas del canal profesional, desde cash&carry hasta e-commerce B2B, y aplicamos metodologías específicas para este sector fragmentado con alto potencial de consolidación."
          primaryButtonText="Valorar Mi Distribuidora"
          secondaryButtonText="Ver Análisis de Mercado"
          gradientFrom="from-pink-600"
          gradientTo="to-purple-600"
        />
        
        <SectorStats stats={stats} />
        
        {/* Market Context Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
                  Un mercado fragmentado con oportunidades de consolidación
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  El mercado español de distribución de cosmética profesional (productos pro hair, barber, estética) está altamente fragmentado, 
                  con múltiples operadores regionales y modelos de negocio diversos: cash&carry, e-commerce B2B, híbridos con formación, y distribuidores exclusivos de marca.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-pink-600 font-bold mr-2">•</span>
                    <span><strong>Mercado core:</strong> ~€280M en consumibles cosméticos pro (coloración, oxidantes, care, styling)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-pink-600 font-bold mr-2">•</span>
                    <span><strong>Mercado ampliado:</strong> €450-900M incluyendo utillaje, pequeño eléctrico y categorías adyacentes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-pink-600 font-bold mr-2">•</span>
                    <span><strong>Tendencia:</strong> Hair care creciendo +8,9% en 2024, impulsado por premiumización</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-black mb-6">Perfil de Operadores</h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-800">Multi-marca "clásico"</span>
                      <span className="text-sm text-pink-600 font-medium">GM 20-35%</span>
                    </div>
                    <p className="text-sm text-gray-600">One-stop-shop + crédito + disponibilidad</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-800">Cash & Carry</span>
                      <span className="text-sm text-pink-600 font-medium">GM 25-45%</span>
                    </div>
                    <p className="text-sm text-gray-600">Inmediatez + surtido + asesoramiento local</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-800">E-commerce B2B puro</span>
                      <span className="text-sm text-pink-600 font-medium">GM 18-35%</span>
                    </div>
                    <p className="text-sm text-gray-600">Conveniencia + precio + entrega rápida</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-800">Híbrido + Formación</span>
                      <span className="text-sm text-pink-600 font-medium">GM 22-40%</span>
                    </div>
                    <p className="text-sm text-gray-600">Retención alta mediante academia y protocolos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Expertise Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
                Nuestra Especialización en el Sector
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Conocimiento profundo de los modelos de negocio y dinámicas competitivas del canal profesional
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {expertise.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-pink-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Methodologies Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
                Metodología de Valoración Especializada
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Aplicamos métodos específicos para distribuidores de cosmética profesional
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {methodologies.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">{item.number}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Investment Thesis Section */}
        <section className="py-20 bg-gradient-to-br from-pink-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
                ¿Por qué es atractivo para inversores?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Cinco razones que hacen de este sector una oportunidad de consolidación
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                { title: "Fragmentación", desc: "Múltiples operadores locales con potencial de roll-up" },
                { title: "Demanda recurrente", desc: "Consumibles de alta rotación y recompra frecuente" },
                { title: "Palancas de valor", desc: "Centralización de compras, marca propia, digitalización" },
                { title: "Cross-sell", desc: "Expansión natural: hair → barber → estética → uñas" },
                { title: "Sucesión familiar", desc: "Muchos operadores en transición generacional" }
              ].map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-5 shadow-md text-center">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-pink-600 font-bold">{index + 1}</span>
                  </div>
                  <h3 className="font-semibold text-black mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-pink-600 to-purple-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              ¿Tienes un negocio de distribución cosmética profesional?
            </h2>
            <p className="text-xl text-pink-100 mb-8">
              Ya sea que estés considerando vender, buscar un socio estratégico, o necesites una valoración para planificar el futuro, 
              nuestro equipo especializado puede ayudarte.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/lp/calculadora">
                <Button 
                  size="lg" 
                  className="bg-white text-pink-600 hover:bg-gray-100 px-8"
                >
                  Calcular Valoración Gratuita
                </Button>
              </Link>
              <Link to="/contacto">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-pink-600 px-8"
                >
                  Hablar con un Experto
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default DistribucionCosmeticaProfesional;
