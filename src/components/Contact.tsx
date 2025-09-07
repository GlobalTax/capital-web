import React from 'react';
import ContactForm from './ContactForm';
import ErrorBoundary from './ErrorBoundary';

interface ContactProps {
  title?: string;
  description?: string;
  pageOrigin?: string;
  className?: string;
  id?: string;
}

const Contact: React.FC<ContactProps> = ({ 
  title = "Contacta con Nosotros",
  description = "Ponte en contacto con nosotros para obtener más información sobre nuestros servicios de valoración y venta de empresas.",
  pageOrigin = "contacto",
  className = "",
  id
}) => {
  return (
    <ErrorBoundary>
      <div id={id} className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {title}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>
          </div>

          {/* Contact Form */}
          <ContactForm pageOrigin={pageOrigin} showTitle={false} />

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                ¿Prefieres contactar directamente?
              </h3>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>info@capittal.es</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+34 695 717 490</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Contact;