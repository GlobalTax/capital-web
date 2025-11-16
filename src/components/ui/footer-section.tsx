
import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useI18n } from '@/shared/i18n/I18nProvider';
import { getLocalizedUrl } from '@/shared/i18n/dictionaries';

export function Footerdemo() {
  const { t, lang } = useI18n();
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <Link to="/" className="text-2xl font-bold text-white">
                Capittal
              </Link>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              {t('footer.company.description')}
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-gray-300">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{t('footer.company.address')}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Phone className="h-4 w-4 mr-2" />
                <a href="tel:+34911234567" className="hover:text-white transition-colors">
                  {t('footer.company.phone')}
                </a>
              </div>
              <div className="flex items-center text-gray-300">
                <Mail className="h-4 w-4 mr-2" />
                <a href="mailto:info@capittal.es" className="hover:text-white transition-colors">
                  {t('footer.company.email')}
                </a>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.section.services')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to={getLocalizedUrl('serviciosValoraciones', lang)} className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.link.valoraciones')}
                </Link>
              </li>
              <li>
                <Link to={getLocalizedUrl('ventaEmpresas', lang)} className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.link.ventaEmpresas')}
                </Link>
              </li>
              <li>
                <Link to="/servicios/due-diligence" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.link.dueDiligence')}
                </Link>
              </li>
              <li>
                <Link to="/servicios/asesoramiento-legal" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.link.asesoramientoLegal')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.section.company')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/nosotros" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.link.nosotros')}
                </Link>
              </li>
              <li>
                <Link to={getLocalizedUrl('equipo', lang)} className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.link.equipo')}
                </Link>
              </li>
              <li>
                <Link to={getLocalizedUrl('casosExito', lang)} className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.link.casosExito')}
                </Link>
              </li>
              <li>
                <Link to={getLocalizedUrl('contacto', lang)} className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.link.contacto')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              {t('footer.copyright', { year: currentYear })}
            </div>
            <div className="flex space-x-6">
              <Link to="/politica-privacidad" className="text-gray-400 hover:text-white text-sm transition-colors">
                {t('footer.link.privacidad')}
              </Link>
              <Link to="/terminos-uso" className="text-gray-400 hover:text-white text-sm transition-colors">
                {t('footer.link.terminos')}
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">
                {t('footer.link.cookies')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
