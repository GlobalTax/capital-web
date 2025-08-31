import React, { useEffect } from 'react';
import HomeLayout from '@/components/shared/HomeLayout';
import OperationsSection from '@/components/operations/OperationsSection';
import { Building, TrendingUp, Users, Globe } from 'lucide-react';

const MarketplaceOperaciones = () => {
  useEffect(() => {
    // SEO específico para el marketplace
    document.title = 'Capittal Market - Empresas en Venta | Marketplace de Adquisiciones';
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Marketplace líder de empresas en venta. Descubre oportunidades exclusivas de adquisición en múltiples sectores. Transacciones verificadas y profesionales.');

    // Meta tags específicos para marketplace
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', 'Capittal Market - Empresas en Venta');

    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute('content', 'Marketplace líder de empresas en venta. Descubre oportunidades exclusivas de adquisición.');

    // Canonical URL para el marketplace
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', 'https://capittalmarket.com');
  }, []);

  return (
    <HomeLayout>
      <div className="pt-16">
        {/* Hero Section - Optimizado para marketplace */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                <span className="text-primary">Capittal Market</span>
                <br />
                Empresas en Venta
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                El marketplace líder para la compra y venta de empresas. 
                Oportunidades exclusivas, transacciones verificadas y acceso profesional.
              </p>
            </div>

            {/* Stats optimizadas para marketplace */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              <div className="text-center">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <Building className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">47+</div>
                  <div className="text-sm text-gray-600">Empresas Disponibles</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">€180M+</div>
                  <div className="text-sm text-gray-600">Valor Portfolio</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <Users className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">500+</div>
                  <div className="text-sm text-gray-600">Inversores Registrados</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <Globe className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">12</div>
                  <div className="text-sm text-gray-600">Sectores Activos</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Operations List - Sin límites para marketplace */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <OperationsSection 
              variant="marketplace" 
              showFilters={true}
              showStats={false}
              showCTA={false}
              displayLocation="marketplace"
            />
          </div>
        </section>

        {/* CTA Section optimizada para conversión */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              ¿Buscas una empresa específica?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Accede a nuestro pipeline exclusivo de operaciones off-market. 
              Más de 200 empresas adicionales disponibles para inversores cualificados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contacto"
                className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Acceso Exclusivo
              </a>
              <a
                href="/lp/calculadora"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Valorar mi Empresa
              </a>
            </div>
          </div>
        </section>
      </div>
    </HomeLayout>
  );
};

export default MarketplaceOperaciones;