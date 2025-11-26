import React from 'react';
import { useI18n } from '@/shared/i18n/I18nProvider';

/**
 * Footer minimalista para landing pages sin enlaces clickables.
 * Optimizado para maximizar conversión evitando fugas de tráfico.
 */
const LandingFooterNoLinks: React.FC = () => {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-4 text-center md:text-left">
          {/* Copyright */}
          <p className="text-sm text-foreground font-medium">
            {t('footer.copyright', { year: currentYear })}
          </p>

          {/* Contacto - Solo texto, sin enlaces */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">{t('footer.contact.tel')}:</span> {t('footer.company.phone')}
            </p>
            <p>
              <span className="font-medium text-foreground">{t('footer.contact.email')}:</span> info@capittal.es
            </p>
          </div>

          {/* Ubicaciones */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">{t('footer.contact.headquarters')}:</span> {t('footer.company.address')}
            </p>
            <p>
              <span className="font-medium text-foreground">{t('footer.contact.offices')}:</span> {t('footer.company.otherOffices')}
            </p>
          </div>

          {/* Nota de confidencialidad */}
          <p className="text-xs text-muted-foreground pt-2 max-w-2xl mx-auto md:mx-0">
            {t('footer.confidentiality')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooterNoLinks;
