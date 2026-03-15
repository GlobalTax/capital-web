import { Link } from 'react-router-dom';
import { BookOpen, Download, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GuideDownloadSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Visual */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative">
              <div className="w-64 h-80 sm:w-72 sm:h-96 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl shadow-2xl p-8 flex flex-col justify-between transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                <div>
                  <div className="w-10 h-1 bg-primary mb-6 rounded-full" />
                  <p className="text-white/60 text-xs uppercase tracking-widest mb-2">Capittal M&A</p>
                  <h3 className="text-white text-lg sm:text-xl font-medium leading-snug">
                    Guía Completa para Vender tu Empresa
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-white/40" />
                  <span className="text-white/40 text-xs">12 capítulos · PDF</span>
                </div>
              </div>
              {/* Decorative badge */}
              <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                GRATIS
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-sm text-primary font-medium mb-4">
              <Download className="h-3.5 w-3.5" />
              Recurso gratuito
            </div>

            <h2 className="text-2xl sm:text-3xl font-normal text-foreground tracking-tight mb-4 leading-snug">
              ¿Estás pensando en vender tu empresa?
            </h2>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              Descarga nuestra guía completa con todo lo que necesitas saber: desde la valoración inicial hasta el cierre de la operación.
            </p>

            <ul className="space-y-3 mb-8">
              {[
                'Métodos de valoración y múltiplos sectoriales',
                'Checklist de preparación pre-venta',
                'Impacto fiscal y estrategias de optimización',
                'Claves de negociación y cierre',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>

            <Link to="/recursos/guia-vender-empresa">
              <Button size="lg" className="h-12 px-8 gap-2">
                Descargar Guía Gratis
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GuideDownloadSection;
