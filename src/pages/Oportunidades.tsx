import React, { useState } from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import OperationsList from '@/components/operations/OperationsList';
import { RODDownloadForm } from '@/components/operations/RODDownloadForm';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { SEOHead } from '@/components/seo';
import { getWebPageSchema, getProductSchema } from '@/utils/seo';

const Oportunidades = () => {
  const [rodFormOpen, setRodFormOpen] = useState(false);


  return (
    <>
      <SEOHead 
        title="Oportunidades de Inversión - Marketplace M&A | Capittal"
        description="Descubre oportunidades únicas de inversión y adquisición de empresas. Empresas en venta con información detallada de valoración, facturación y sector. Accede a nuestro ROD."
        canonical="https://capittal.es/oportunidades"
        keywords="oportunidades inversión, compra empresas España, marketplace M&A, empresas en venta, ROD"
        structuredData={[
          getWebPageSchema(
            "Oportunidades de Inversión",
            "Marketplace de empresas en venta con oportunidades exclusivas",
            "https://capittal.es/oportunidades"
          ),
          getProductSchema(
            "Relación de Open Deals (ROD)",
            "Accede a nuestro catálogo exclusivo de empresas disponibles para adquisición",
            "https://capittal.es/images/rod-preview.jpg"
          )
        ]}
      />
      <UnifiedLayout variant="home">
        <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Marketplace de Oportunidades
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Explora empresas disponibles para adquisición con información detallada sobre 
                valoración, sector y rendimiento financiero.
              </p>
              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={() => setRodFormOpen(true)}
                  className="gap-2"
                >
                  <Download className="h-5 w-5" />
                  Descargar Relación de Open Deals
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Operations List */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <OperationsList 
              displayLocation="operaciones"
              limit={12}
            />
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              ¿No encuentras lo que buscas?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Nuestro equipo puede ayudarte a encontrar oportunidades exclusivas 
              que se ajusten a tus criterios de inversión específicos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contacto" 
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
              >
                Contactar Asesor
              </a>
              <a 
                href="/compra-empresas" 
                className="inline-flex items-center justify-center px-6 py-3 border border-input text-base font-medium rounded-md text-foreground bg-background hover:bg-accent transition-colors"
              >
                Más Información
              </a>
            </div>
          </div>
        </section>

        {/* ROD Download Form */}
        <RODDownloadForm open={rodFormOpen} onOpenChange={setRodFormOpen} />
      </div>
    </UnifiedLayout>
    </>
  );
};

export default Oportunidades;