import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, BookMarked, Wrench, Trophy, Library, Users, ArrowRight } from 'lucide-react';

const sections = [
  {
    href: '/search-funds/recursos/guia',
    icon: BookOpen,
    title: 'Guía Completa',
    description: 'Aprende todo sobre Search Funds: qué son, cómo funcionan, modelos de financiación y proceso de adquisición.',
    tag: 'Educación',
    color: 'from-blue-500/10 to-blue-600/5',
  },
  {
    href: '/search-funds/recursos/glosario',
    icon: BookMarked,
    title: 'Glosario M&A',
    description: 'Términos clave del mundo M&A y Search Funds explicados de forma clara y concisa.',
    tag: 'Referencia',
    color: 'from-purple-500/10 to-purple-600/5',
  },
  {
    href: '/search-funds/recursos/herramientas',
    icon: Wrench,
    title: 'Herramientas',
    description: 'Calculadora de Fit, Test Exit-Ready y otras herramientas para evaluar tu empresa.',
    tag: 'Interactivo',
    color: 'from-amber-500/10 to-amber-600/5',
  },
  {
    href: '/search-funds/recursos/casos',
    icon: Trophy,
    title: 'Casos de Éxito',
    description: 'Historias reales de transacciones Search Funds en España y Europa.',
    tag: 'Inspiración',
    color: 'from-green-500/10 to-green-600/5',
  },
  {
    href: '/search-funds/recursos/biblioteca',
    icon: Library,
    title: 'Biblioteca',
    description: 'Estudios de Stanford, IESE, whitepapers y PDFs descargables sobre Search Funds.',
    tag: 'Documentos',
    color: 'from-rose-500/10 to-rose-600/5',
  },
  {
    href: '/search-funds/recursos/comunidad',
    icon: Users,
    title: 'Comunidad',
    description: 'Conecta con el ecosistema: IESE, IE, ESADE, AcEF, podcasts y eventos.',
    tag: 'Networking',
    color: 'from-teal-500/10 to-teal-600/5',
  },
];

export const ResourceCenterGrid = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={section.href}
                  className="group block h-full p-6 rounded-2xl border bg-card hover:shadow-lg transition-all duration-300"
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${section.color} mb-4`}>
                    <Icon className="h-6 w-6 text-foreground" />
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {section.tag}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {section.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm mb-4">
                    {section.description}
                  </p>
                  
                  <div className="flex items-center text-sm font-medium text-primary">
                    Explorar
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
