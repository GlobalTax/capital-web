import React, { useState } from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import OperationsList from '@/components/operations/OperationsList';
import { RODDownloadForm } from '@/components/operations/RODDownloadForm';
import BuyerTestimonials from '@/components/operations/BuyerTestimonials';
import { CompareBar } from '@/components/operations/CompareBar';
import { OperationCompareModal } from '@/components/operations/OperationCompareModal';
import { WishlistBar } from '@/components/operations/WishlistBar';
import { WishlistModal } from '@/components/operations/WishlistModal';
import { BulkInquiryForm } from '@/components/operations/BulkInquiryForm';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { Button } from '@/components/ui/button';
import { Download, Bell, CheckCircle2 } from 'lucide-react';
import BuyerPreferencesModal from '@/components/operations/BuyerPreferencesModal';
import { SEOHead } from '@/components/seo';
import { getWebPageSchema, getProductSchema } from '@/utils/seo';
import { useI18n } from '@/shared/i18n/I18nProvider';
import { useSectors } from '@/hooks/useSectors';
import { useOperationLocations } from '@/hooks/useOperationLocations';

const Oportunidades = () => {
  const [rodFormOpen, setRodFormOpen] = useState(false);
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
  const { t } = useI18n();
  const { activeSectors } = useSectors();
  const { data: locations = [] } = useOperationLocations();

  return (
    <WishlistProvider>
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
        <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-background py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
                {t('opportunities.hero.title')}
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
                {t('opportunities.hero.subtitle')}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                onClick={() => setRodFormOpen(true)}
                className="gap-2"
              >
                <Download className="h-5 w-5" />
                {t('opportunities.hero.cta')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setPreferencesModalOpen(true)}
                className="gap-2"
              >
                <Bell className="h-5 w-5" />
                {t('opportunities.hero.configureAlerts')}
              </Button>
            </div>

            {/* Disclaimer de mandato */}
            <p className="mt-6 text-sm text-muted-foreground/80 text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500/70" />
              <span>{t('opportunities.hero.mandateDisclaimer')}</span>
            </p>
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

        {/* Buyer Testimonials Section */}
        <BuyerTestimonials />

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
        
        {/* Buyer Preferences Modal */}
        <BuyerPreferencesModal
          isOpen={preferencesModalOpen}
          onClose={() => setPreferencesModalOpen(false)}
          sectors={activeSectors.map(s => s.name_es)}
          locations={locations}
        />

        {/* Compare Bar (floating) */}
        <CompareBar />
        
        {/* Compare Modal */}
        <OperationCompareModal />

        {/* Wishlist Bar (floating, above compare bar) */}
        <div className="pb-16">
          <WishlistBar />
        </div>
        
        {/* Wishlist Modal */}
        <WishlistModal />
        
        {/* Bulk Inquiry Form */}
        <BulkInquiryForm />
      </div>
    </UnifiedLayout>
    </WishlistProvider>
  );
};

export default Oportunidades;