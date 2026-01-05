import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GuideCTAProps {
  title?: string;
  description?: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
}

export const GuideCTA = ({
  title = '¿Tienes una empresa que podría encajar?',
  description = 'Hablemos sin compromiso. Te explicamos cómo funciona el proceso y evaluamos si tu empresa es candidata ideal para un Search Fund.',
  primaryAction = { label: 'Agendar llamada', href: '/contacto' },
  secondaryAction = { label: 'Más sobre Search Funds', href: '/servicios/search-funds' },
}: GuideCTAProps) => {
  return (
    <div className="my-12 p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border">
      <div className="max-w-2xl">
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p className="text-muted-foreground mb-6">{description}</p>
        
        <div className="flex flex-wrap gap-4">
          <Button asChild size="lg">
            <Link to={primaryAction.href}>
              <Calendar className="mr-2 h-4 w-4" />
              {primaryAction.label}
            </Link>
          </Button>
          
          <Button variant="outline" asChild size="lg">
            <Link to={secondaryAction.href}>
              {secondaryAction.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
