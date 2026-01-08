import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Calculator, 
  ClipboardCheck, 
  BookOpen, 
  ArrowUpRight,
  Headphones,
  Video,
  FileText,
  ExternalLink
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  link: string;
  isExternal?: boolean;
  tag?: string;
  tagColor?: string;
}

const internalResources: Resource[] = [
  {
    id: '1',
    title: 'Calculadora de Valoración',
    description: 'Obtén una valoración inicial de tu empresa en minutos.',
    icon: Calculator,
    link: '/lp/calculadora',
    tag: 'Herramienta',
    tagColor: 'bg-primary',
  },
  {
    id: '2',
    title: 'Test Exit-Ready',
    description: '¿Está tu empresa preparada para la venta?',
    icon: ClipboardCheck,
    link: '/recursos/test-exit-ready',
    tag: 'Test',
    tagColor: 'bg-blue-500',
  },
  {
    id: '3',
    title: 'Servicio Search Funds',
    description: 'Conoce cómo Capittal conecta vendedores con searchers.',
    icon: BookOpen,
    link: '/servicios/search-funds',
    tag: 'Servicio',
    tagColor: 'bg-green-500',
  },
];

const externalResources: Resource[] = [
  {
    id: '4',
    title: 'Stanford Search Fund Primer',
    description: 'La guía académica de referencia sobre Search Funds.',
    icon: FileText,
    link: 'https://www.gsb.stanford.edu/faculty-research/centers-initiatives/ces/resources/search-funds',
    isExternal: true,
    tag: 'Stanford',
  },
  {
    id: '5',
    title: 'IESE Search Fund Study',
    description: 'Estudio anual del ecosistema de Search Funds en España.',
    icon: FileText,
    link: 'https://www.iese.edu/entrepreneurship/search-funds/',
    isExternal: true,
    tag: 'IESE',
  },
  {
    id: '6',
    title: 'AcEF - Asociación',
    description: 'Asociación española de emprendedores por adquisición.',
    icon: ExternalLink,
    link: 'https://www.acef.es/',
    isExternal: true,
    tag: 'Comunidad',
  },
];

const ResourceCard: React.FC<{ resource: Resource; index: number }> = ({ resource, index }) => {
  const CardWrapper = resource.isExternal ? 'a' : Link;
  const linkProps = resource.isExternal 
    ? { href: resource.link, target: '_blank', rel: 'noopener noreferrer' }
    : { to: resource.link };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <CardWrapper {...(linkProps as any)}>
        <Card className="h-full hover:shadow-md transition-all hover:border-primary/30 group cursor-pointer">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <resource.icon className="w-5 h-5 text-primary" />
              </div>
              {resource.tag && (
                <Badge variant="secondary" className="text-xs">
                  {resource.tag}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors flex items-center gap-1">
              {resource.title}
              {resource.isExternal && <ArrowUpRight className="w-4 h-4" />}
            </h3>
            <p className="text-sm text-muted-foreground">{resource.description}</p>
          </CardContent>
        </Card>
      </CardWrapper>
    </motion.div>
  );
};

export const SearchFundsHubResources: React.FC = () => {
  return (
    <section id="recursos" className="py-16 scroll-mt-24">
      <div className="mb-12">
        <h2 className="text-3xl font-normal text-foreground mb-4">
          Recursos Adicionales
        </h2>
        <p className="text-muted-foreground max-w-3xl">
          Herramientas, guías y referencias para profundizar en el mundo de los Search Funds.
        </p>
      </div>

      {/* Internal Resources */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Recursos Capittal
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {internalResources.map((resource, index) => (
            <ResourceCard key={resource.id} resource={resource} index={index} />
          ))}
        </div>
      </div>

      {/* External Resources */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <ExternalLink className="w-5 h-5 text-primary" />
          Recursos Externos
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {externalResources.map((resource, index) => (
            <ResourceCard key={resource.id} resource={resource} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
