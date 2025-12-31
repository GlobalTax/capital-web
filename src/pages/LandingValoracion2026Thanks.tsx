import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, Phone, FileText, Calendar, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingValoracion2026Thanks() {
  useEffect(() => {
    // SEO meta tags - noindex for thank you page
    document.title = '¡Solicitud Recibida! | Valoración Empresarial - Capittal';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Tu solicitud de valoración ha sido recibida. Nuestro equipo se pondrá en contacto contigo en las próximas 24-48 horas.');
    }

    // Add noindex
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'noindex, nofollow');

    return () => {
      robotsMeta?.setAttribute('content', 'index, follow');
    };
  }, []);

  const steps = [
    {
      icon: Clock,
      title: 'Revisión (24-48h)',
      description: 'Nuestro equipo analizará la información proporcionada sobre tu empresa.'
    },
    {
      icon: Phone,
      title: 'Contacto Personalizado',
      description: 'Un asesor especializado se pondrá en contacto contigo para resolver dudas.'
    },
    {
      icon: FileText,
      title: 'Informe Preliminar',
      description: 'Recibirás un primer análisis de valoración basado en los datos proporcionados.'
    },
    {
      icon: Calendar,
      title: 'Reunión de Presentación',
      description: 'Agendaremos una reunión para presentar los resultados y discutir opciones estratégicas.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header Minimalista */}
      <header className="bg-card border-b border-border py-4">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">CAPITTAL</h1>
            <p className="text-sm text-muted-foreground">Asesores en M&A y Valoración</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-3xl mx-auto px-4 py-12 md:py-16">
        {/* Success Icon & Title */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ¡Solicitud Recibida!
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Hemos recibido tu solicitud de valoración. A continuación te explicamos los próximos pasos.
          </p>
        </div>

        {/* Next Steps */}
        <div className="bg-card border border-border rounded-xl p-6 md:p-8 mb-10">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <span className="text-xl">📋</span> Próximos Pasos
          </h3>
          
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">
                    {index + 1}. {step.title}
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-muted/50 rounded-xl p-6 text-center mb-10">
          <h3 className="font-semibold text-foreground mb-4">
            ¿Tienes alguna pregunta urgente?
          </h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            <a 
              href="tel:+34695717490" 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Phone className="w-4 h-4" />
              +34 695 717 490
            </a>
            <a 
              href="mailto:info@capittal.es" 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="w-4 h-4" />
              info@capittal.es
            </a>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Button asChild variant="outline">
            <Link to="/" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver a la página principal
            </Link>
          </Button>
        </div>
      </main>

      {/* Footer Minimalista */}
      <footer className="border-t border-border py-6 mt-auto">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Capittal. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
