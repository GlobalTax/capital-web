import { motion } from 'framer-motion';
import { FileText, Calculator, Podcast, BookOpen, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface Resource {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  link: string;
  isExternal?: boolean;
  tag?: string;
}

const resources: Resource[] = [
  {
    id: '1',
    title: 'Guía completa de Search Funds',
    description: 'Todo lo que necesitas saber sobre el modelo de Search Funds en España: historia, estructura, proceso y claves del éxito.',
    icon: BookOpen,
    link: '/blog/guia-search-funds-espana',
    tag: 'Guía',
  },
  {
    id: '2',
    title: 'Calculadora de Valoración',
    description: 'Obtén una estimación gratuita del valor de tu empresa en menos de 2 minutos. Basada en múltiplos de mercado actualizados.',
    icon: Calculator,
    link: '/lp/calculadora',
    tag: 'Herramienta',
  },
  {
    id: '3',
    title: '5 errores al vender a un Search Fund',
    description: 'Los errores más comunes que cometen los empresarios al negociar con searchers y cómo evitarlos.',
    icon: FileText,
    link: '/blog/errores-vender-search-fund',
    tag: 'Artículo',
  },
  {
    id: '4',
    title: 'Podcast: Conversaciones M&A',
    description: 'Entrevistas con searchers, empresarios y expertos del ecosistema de Search Funds en España.',
    icon: Podcast,
    link: '#',
    tag: 'Próximamente',
    isExternal: true,
  },
];

export const SearchFundsResources = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Recursos para profundizar
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Aprende más sobre Search Funds con nuestras guías, herramientas y contenido especializado.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {resources.map((resource, index) => {
            const Icon = resource.icon;
            const isDisabled = resource.tag === 'Próximamente';
            
            const CardContent = (
              <Card 
                className={`p-6 h-full flex flex-col group transition-all ${
                  isDisabled 
                    ? 'opacity-60 cursor-not-allowed' 
                    : 'hover:shadow-lg hover:border-primary/50 cursor-pointer'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <Icon className="w-6 h-6" />
                  </div>
                  {resource.tag && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      resource.tag === 'Próximamente'
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {resource.tag}
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {resource.title}
                </h3>
                
                <p className="text-sm text-muted-foreground flex-grow mb-4">
                  {resource.description}
                </p>

                {!isDisabled && (
                  <div className="flex items-center text-sm text-primary font-medium">
                    Leer más
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Card>
            );

            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                {isDisabled ? (
                  CardContent
                ) : resource.isExternal ? (
                  <a href={resource.link} target="_blank" rel="noopener noreferrer">
                    {CardContent}
                  </a>
                ) : (
                  <Link to={resource.link}>
                    {CardContent}
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SearchFundsResources;
