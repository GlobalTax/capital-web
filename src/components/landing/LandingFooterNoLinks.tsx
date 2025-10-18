import React from 'react';

/**
 * Footer minimalista para landing pages sin enlaces clickables.
 * Optimizado para maximizar conversión evitando fugas de tráfico.
 */
const LandingFooterNoLinks: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-4 text-center md:text-left">
          {/* Copyright */}
          <p className="text-sm text-foreground font-medium">
            © {currentYear} Capittal. Todos los derechos reservados.
          </p>

          {/* Contacto - Solo texto, sin enlaces */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Tel:</span> +34 695 717 490
            </p>
            <p>
              <span className="font-medium text-foreground">Email:</span> info@capittal.es
            </p>
          </div>

          {/* Ubicaciones */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Sede Central:</span> Carrer Ausias March número 36, 08010 Barcelona
            </p>
            <p>
              <span className="font-medium text-foreground">Otras oficinas:</span> Madrid · Girona · Lleida · Tarragona · Palma de Mallorca · Zaragoza · Valencia
            </p>
          </div>

          {/* Nota de confidencialidad */}
          <p className="text-xs text-muted-foreground pt-2 max-w-2xl mx-auto md:mx-0">
            Toda la información compartida con Capittal es tratada de forma estrictamente confidencial según nuestra política de privacidad.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooterNoLinks;
