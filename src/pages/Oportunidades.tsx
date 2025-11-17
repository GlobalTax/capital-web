import React, { useState } from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import OperationsList from '@/components/operations/OperationsList';
import { RODDownloadForm } from '@/components/operations/RODDownloadForm';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { SEOHead } from '@/components/seo';
import { getWebPageSchema, getProductSchema } from '@/utils/seo';
import { useI18n } from '@/shared/i18n/I18nProvider';

const Oportunidades = () => {
  const [rodFormOpen, setRodFormOpen] = useState(false);
  const { t } = useI18n();

  return (
    <>
      <SEOHead 
        title={t('opportunities.seo.title')}
        description={t('opportunities.seo.description')}
        canonical="https://capittal.es/oportunidades"
        keywords={t('opportunities.seo.keywords')}
        structuredData={[
          getWebPageSchema(
            t('opportunities.hero.title'),
            t('opportunities.seo.description'),
            "https://capittal.es/oportunidades"
          ),
          getProductSchema(
            "Relación de Open Deals (ROD)",
            t('opportunities.seo.description'),
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
                {t('opportunities.hero.title')}
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                {t('opportunities.hero.subtitle')}
              </p>
              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={() => setRodFormOpen(true)}
                  className="gap-2"
                >
                  <Download className="h-5 w-5" />
                  {t('opportunities.hero.cta')}
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
              {t('opportunities.contact.title')}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t('opportunities.contact.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contacto" 
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
              >
                {t('opportunities.contact.cta_advisor')}
              </a>
              <a 
                href="/compra-empresas" 
                className="inline-flex items-center justify-center px-6 py-3 border border-input text-base font-medium rounded-md text-foreground bg-background hover:bg-accent transition-colors"
              >
                {t('opportunities.contact.cta_info')}
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