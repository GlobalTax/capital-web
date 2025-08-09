import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SectorCalculatorsList } from '@/components/calculadora/SectorCalculatorsList';

const CalculadorasSectores: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Calculadoras por Sectores - Valoración Especializada | Capittal</title>
        <meta 
          name="description" 
          content="Calculadoras de valoración especializadas por sectores. Obtén valoraciones precisas para tu industria con múltiplos específicos y análisis personalizado." 
        />
        <meta 
          name="keywords" 
          content="calculadora valoración, sectores, tecnología, retail, manufactura, servicios, salud, múltiplos sectoriales" 
        />
        <meta property="og:title" content="Calculadoras por Sectores - Valoración Especializada | Capittal" />
        <meta 
          property="og:description" 
          content="Elige tu sector y obtén una valoración precisa con múltiplos específicos de tu industria." 
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://capittal.com/calculadoras" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Calculadoras de Valoración por Sectores",
            "description": "Lista de calculadoras especializadas para diferentes sectores empresariales",
            "url": "https://capittal.com/calculadoras",
            "numberOfItems": 14,
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "item": {
                  "@type": "WebApplication",
                  "name": "Calculadora Tecnología",
                  "url": "https://capittal.com/calculadora/tecnologia",
                  "description": "Valoración especializada para empresas tecnológicas"
                }
              },
              {
                "@type": "ListItem", 
                "position": 2,
                "item": {
                  "@type": "WebApplication",
                  "name": "Calculadora Retail",
                  "url": "https://capittal.com/calculadora/retail",
                  "description": "Valoración especializada para comercio y e-commerce"
                }
              },
              {
                "@type": "ListItem",
                "position": 3, 
                "item": {
                  "@type": "WebApplication",
                  "name": "Calculadora Manufactura",
                  "url": "https://capittal.com/calculadora/manufactura",
                  "description": "Valoración especializada para industria manufacturera"
                }
              }
            ],
            "provider": {
              "@type": "Organization",
              "name": "Capittal",
              "url": "https://capittal.com"
            }
          })}
        </script>
      </Helmet>

      <SectorCalculatorsList />
    </>
  );
};

export default CalculadorasSectores;