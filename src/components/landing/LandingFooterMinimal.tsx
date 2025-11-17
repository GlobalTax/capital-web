import React from 'react';
import { useI18n } from '@/shared/i18n/I18nProvider';

const LandingFooterMinimal: React.FC = () => {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-sm">
        <div className="space-y-3 text-center md:text-left">
          <p className="text-gray-700 font-medium">{t('footer.copyright', { year: currentYear })}</p>
          <p className="text-gray-600">
            <span className="font-medium">Sede Central:</span> {t('footer.headquarters').split(': ')[1]}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Otras oficinas:</span> {t('footer.offices').split(': ')[1]}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Tel:</span> <a href={`tel:${t('footer.phone')}`} className="underline hover:text-gray-900 transition-colors" aria-label={`Llamar al ${t('footer.phone')}`}>{t('footer.phone')}</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooterMinimal;
