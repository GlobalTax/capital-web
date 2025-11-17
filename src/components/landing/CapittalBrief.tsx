import React from 'react';
import { useI18n } from '@/shared/i18n/I18nProvider';

const CapittalBrief: React.FC = () => {
  const { t } = useI18n();
  
  return (
    <section aria-labelledby="about-capittal" className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="max-w-3xl">
          <h2 id="about-capittal" className="text-2xl font-semibold text-gray-900">
            {t('capittalBrief.title')}
          </h2>
          <p className="mt-3 text-gray-700">
            {t('capittalBrief.description')}
          </p>
        </header>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-500">{t('capittalBrief.experience.label')}</p>
            <p className="mt-1 font-medium text-gray-900">{t('capittalBrief.experience.value')}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-500">{t('capittalBrief.coverage.label')}</p>
            <p className="mt-1 font-medium text-gray-900">{t('capittalBrief.coverage.value')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CapittalBrief;
