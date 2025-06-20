
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DocumentacionMAHero from '@/components/documentacion-ma/DocumentacionMAHero';
import DocumentacionMAStartHere from '@/components/documentacion-ma/DocumentacionMAStartHere';
import DocumentacionMAContent from '@/components/documentacion-ma/DocumentacionMAContent';
import DocumentacionMAPopularArticles from '@/components/documentacion-ma/DocumentacionMAPopularArticles';

const DocumentacionMA = () => {
  const navigationItems = [
    { label: 'Introducción a M&A', href: '#introduccion' },
    { label: 'Tipos de Operaciones', href: '#tipos-operaciones' },
    { label: 'Proceso de M&A', href: '#proceso-ma' },
    { label: 'Métodos de Valoración', href: '#valoracion' },
    { label: 'Due Diligence', href: '#due-diligence' },
    { label: 'Estructuras de Financiación', href: '#financiacion' },
    { label: 'Aspectos Legales', href: '#aspectos-legales' },
    { label: 'Integración Post-M&A', href: '#integracion' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="sticky top-32">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium text-black mb-6">Contenidos</h3>
                  <nav className="space-y-2">
                    {navigationItems.map((item, index) => (
                      <a 
                        key={index}
                        href={item.href} 
                        className="block text-gray-600 hover:text-black transition-colors py-2 text-sm"
                      >
                        {item.label}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-4">
              <DocumentacionMAHero />
              <DocumentacionMAStartHere />
              <DocumentacionMAContent />
            </div>
          </div>
        </div>
      </div>
      <DocumentacionMAPopularArticles />
      <Footer />
    </div>
  );
};

export default DocumentacionMA;
