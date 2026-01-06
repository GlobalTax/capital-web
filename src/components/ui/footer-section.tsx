
import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Linkedin, Twitter } from 'lucide-react';
import { useI18n } from '@/shared/i18n/I18nProvider';
import { getLocalizedUrl } from '@/shared/i18n/dictionaries';

export function Footerdemo() {
  const { t, lang } = useI18n();
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <Link to="/" className="text-2xl font-bold text-white">
                Capittal
              </Link>
            </div>
            <p className="text-gray-300 mb-4 max-w-md text-sm">
              {t('footer.company.description')}
            </p>
            <div className="space-y-2">
              <div className="flex items-start text-gray-300 text-sm">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <div className="space-y-0.5">
                  <span className="block">{t('footer.company.address')}</span>
                  <span className="block text-xs text-gray-400">{t('footer.company.otherOffices')}</span>
                </div>
              </div>
              <div className="flex items-center text-gray-300 text-sm">
                <Phone className="h-4 w-4 mr-2" />
                <a href="tel:+34695717490" className="hover:text-white transition-colors">
                  {t('footer.company.phone')}
                </a>
              </div>
              <div className="flex items-center text-gray-300 text-sm">
                <Mail className="h-4 w-4 mr-2" />
                <a href="mailto:info@capittal.es" className="hover:text-white transition-colors">
                  {t('footer.company.email')}
                </a>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-white">{t('footer.section.services')}</h3>
            <ul className="space-y-2 text-sm">
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
                <Link to={getLocalizedUrl('compraEmpresas', lang)} className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.link.compraEmpresas')}
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
              <li>
                <Link to="/servicios/reestructuraciones" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.link.reestructuraciones')}
                </Link>
              </li>
              <li>
                <Link to="/servicios/search-funds" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.link.searchFunds')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Sectors */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-white">{t('footer.section.sectors')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/sectores/industrial" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.link.industrial')}
                </Link>
              </li>
              <li>
                <Link to="/sectores/healthcare" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.link.healthcare')}
                </Link>
              </li>
              <li>
                <Link to="/sectores/construccion" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.link.construccion')}
                </Link>
              </li>
              <li>
                <Link to="/sectores/seguridad" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.link.seguridad')}
                </Link>
              </li>
              <li>
                <Link to="/sectores/medio-ambiente" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.link.medioAmbiente')}
                </Link>
              </li>
              <li>
                <Link to="/sectores/tecnologia" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.link.tecnologia')}
                </Link>
              </li>
              <li>
                <Link to="/sectores/retail-consumer" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.link.retail')}
                </Link>
              </li>
              <li>
                <Link to="/sectores/alimentacion" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.link.alimentacion')}
                </Link>
              </li>
              <li>
                <Link to="/sectores/energia" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.link.energia')}
                </Link>
              </li>
              <li>
                <Link to="/sectores/logistica" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.link.logistica')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-white">{t('footer.section.resources')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={getLocalizedUrl('blog', lang)} className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.link.blog')}
                </Link>
              </li>
              <li>
                <Link to="/recursos/newsletter" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.link.newsletter')}
                </Link>
              </li>
              <li>
                <Link to="/search-funds/recursos" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.link.centroSearchFunds')}
                </Link>
              </li>
              <li>
                <Link to="/oportunidades" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.link.oportunidades')}
                </Link>
              </li>
              <li>
                <Link to="/lp/calculadora" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.link.calculadora')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-white">{t('footer.section.company')}</h3>
            <ul className="space-y-2 text-sm">
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
                <Link to={getLocalizedUrl('programaColaboradores', lang)} className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.link.programaColaboradores')}
                </Link>
              </li>
              <li>
                <Link to="/por-que-elegirnos" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.link.porQueElegirnos')}
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
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              {t('footer.copyright', { year: currentYear })}
            </div>
            
            {/* Social Media Icons */}
            <div className="flex items-center space-x-4">
              <a 
                href="https://www.linkedin.com/company/capittal" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com/capittal_es" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
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
