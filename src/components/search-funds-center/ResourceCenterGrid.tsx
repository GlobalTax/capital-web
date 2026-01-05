import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, BookMarked, Wrench, Trophy, Library, Users, ArrowRight, Target, Calculator, Handshake, Calendar } from 'lucide-react';

const basicSections = [
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
    description: 'Conecta con el ecosistema: IESE, AcEF, podcasts y eventos.',
    tag: 'Networking',
    color: 'from-teal-500/10 to-teal-600/5',
  },
];

const advancedSections = [
  {
    href: '/search-funds/recursos/sourcing',
    icon: Target,
    title: 'Cómo Conseguir Empresas',
    description: 'Canales de sourcing, estrategias de outreach, métricas de embudo y gestión del pipeline de oportunidades.',
    tag: 'Sourcing',
    color: 'from-cyan-500/10 to-cyan-600/5',
  },
  {
    href: '/search-funds/recursos/valoracion',
    icon: Calculator,
    title: 'Valoración en Search Funds',
    description: 'Múltiplos de EBITDA, ajustes de normalización, Quality of Earnings y técnicas de negociación del precio.',
    tag: 'Análisis',
    color: 'from-indigo-500/10 to-indigo-600/5',
  },
  {
    href: '/search-funds/recursos/negociacion',
    icon: Handshake,
    title: 'Negociación con Vendedores',
    description: 'Psicología del vendedor, estructuración creativa del deal, earn-outs y vendor financing.',
    tag: 'Estrategia',
    color: 'from-orange-500/10 to-orange-600/5',
  },
  {
    href: '/search-funds/recursos/post-adquisicion',
    icon: Calendar,
    title: 'Primeros 100 Días',
    description: 'Plan de transición, comunicación con empleados, retención de talento y quick wins tras la adquisición.',
    tag: 'Operaciones',
    color: 'from-emerald-500/10 to-emerald-600/5',
  },
];

interface SectionCardProps {
  section: {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    tag: string;
    color: string;
  };
  index: number;
}

const SectionCard = ({ section, index }: SectionCardProps) => {
  const Icon = section.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
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
};

export const ResourceCenterGrid = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Recursos Básicos */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-2">Recursos Básicos</h2>
          <p className="text-muted-foreground mb-8">
            Fundamentos del modelo Search Fund: guías, glosario y herramientas esenciales.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {basicSections.map((section, index) => (
              <SectionCard key={section.href} section={section} index={index} />
            ))}
          </div>
        </div>

        {/* Guías Avanzadas */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold">Guías Avanzadas</h2>
            <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
              Nuevo
            </span>
          </div>
          <p className="text-muted-foreground mb-8">
            Contenido profundo para searchers activos: sourcing, valoración, negociación y transición.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advancedSections.map((section, index) => (
              <SectionCard key={section.href} section={section} index={index + basicSections.length} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
