import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Twitter, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

interface NewsItem {
  date: string;
  title: string;
  href: string;
}

const latestNews: NewsItem[] = [
  {
    date: '20 Enero 2025',
    title: 'Capittal asesora la venta de grupo industrial líder en el sector alimentario',
    href: '/noticias/venta-grupo-industrial',
  },
  {
    date: '15 Enero 2025',
    title: 'Nueva operación cerrada en el sector tecnológico por valor de €25M',
    href: '/noticias/operacion-tecnologico',
  },
];

const serviceLinks = [
  { label: 'Venta de empresas', href: '/servicios/venta-empresas' },
  { label: 'Valoración', href: '/servicios/valoracion' },
  { label: 'Due Diligence', href: '/servicios/due-diligence' },
  { label: 'Planificación fiscal', href: '/servicios/planificacion-fiscal' },
];

const InstitutionalFooter: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white">
      {/* News Section */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-slate-500 text-sm tracking-[0.2em] uppercase block mb-6">
              Últimas noticias
            </span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {latestNews.map((news) => (
                <a
                  key={news.title}
                  href={news.href}
                  className="group block p-6 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <span className="text-slate-500 text-sm block mb-3">
                    {news.date}
                  </span>
                  <h4 className="text-white text-lg font-medium leading-snug group-hover:text-slate-300 transition-colors mb-4">
                    {news.title}
                  </h4>
                  <span className="inline-flex items-center gap-2 text-slate-400 text-sm group-hover:text-white transition-colors">
                    Leer más
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <span className="text-white text-2xl tracking-[0.1em] block mb-4">
              Capittal
            </span>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Especialistas en M&A y valoraciones desde 2008. Más de 200 operaciones cerradas con éxito.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://linkedin.com/company/capittal"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com/capittal"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h5 className="text-white text-sm font-medium tracking-wide uppercase mb-6">
              Servicios
            </h5>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-400 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h5 className="text-white text-sm font-medium tracking-wide uppercase mb-6">
              La Firma
            </h5>
            <ul className="space-y-3">
              <li>
                <a href="/sobre-nosotros" className="text-slate-400 text-sm hover:text-white transition-colors">
                  Sobre nosotros
                </a>
              </li>
              <li>
                <a href="/equipo" className="text-slate-400 text-sm hover:text-white transition-colors">
                  Equipo
                </a>
              </li>
              <li>
                <a href="/casos-exito" className="text-slate-400 text-sm hover:text-white transition-colors">
                  Casos de éxito
                </a>
              </li>
              <li>
                <a href="/noticias" className="text-slate-400 text-sm hover:text-white transition-colors">
                  Noticias
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h5 className="text-white text-sm font-medium tracking-wide uppercase mb-6">
              Contacto
            </h5>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-slate-500 mt-1 flex-shrink-0" />
                <a href="mailto:info@capittal.es" className="text-slate-400 text-sm hover:text-white transition-colors">
                  info@capittal.es
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-slate-500 mt-1 flex-shrink-0" />
                <a href="tel:+34934000000" className="text-slate-400 text-sm hover:text-white transition-colors">
                  +34 934 000 000
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-500 mt-1 flex-shrink-0" />
                <span className="text-slate-400 text-sm">
                  Paseo de Gracia, 123<br />
                  08008 Barcelona
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-slate-500 text-sm">
              © 2025 Capittal. Todos los derechos reservados.
            </span>
            <div className="flex items-center gap-6">
              <a href="/privacidad" className="text-slate-500 text-sm hover:text-white transition-colors">
                Política de privacidad
              </a>
              <a href="/aviso-legal" className="text-slate-500 text-sm hover:text-white transition-colors">
                Aviso legal
              </a>
              <a href="/cookies" className="text-slate-500 text-sm hover:text-white transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default InstitutionalFooter;
