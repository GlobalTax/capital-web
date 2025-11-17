import React from 'react';
import { Lock, ShieldCheck, EyeOff } from 'lucide-react';
import { useI18n } from '@/shared/i18n/I18nProvider';

const ConfidentialityBlock: React.FC = () => {
  const { t } = useI18n();
  
  const items = [
    {
      title: t('confidentiality.secure.title'),
      desc: t('confidentiality.secure.desc'),
      Icon: Lock,
    },
    {
      title: t('confidentiality.gdpr.title'),
      desc: t('confidentiality.gdpr.desc'),
      Icon: ShieldCheck,
    },
    {
      title: t('confidentiality.access.title'),
      desc: t('confidentiality.access.desc'),
      Icon: EyeOff,
    },
  ];

  return (
    <section aria-labelledby="confidentiality" className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="max-w-3xl">
          <h2 id="confidentiality" className="text-2xl font-semibold text-gray-900">
            {t('confidentiality.title')}
          </h2>
          <p className="mt-3 text-gray-700">
            {t('confidentiality.subtitle')}
          </p>
        </header>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {items.map(({ title, desc, Icon }) => (
            <article key={title} className="rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-gray-900" aria-hidden>
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{title}</h3>
                  <p className="mt-1 text-sm text-gray-700">{desc}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ConfidentialityBlock;
