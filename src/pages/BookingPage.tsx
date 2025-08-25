import React from 'react';
import { useSearchParams } from 'react-router-dom';
import CalendarBooking from '@/components/calendar/CalendarBooking';
import LandingHeaderMinimal from '@/components/landing/LandingHeaderMinimal';
import LandingFooterMinimal from '@/components/landing/LandingFooterMinimal';

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  
  // Extract pre-filled data from URL parameters
  const contactName = searchParams.get('contact') || '';
  const contactEmail = searchParams.get('email') || '';
  const contactPhone = searchParams.get('phone') || '';
  const companyName = searchParams.get('company') || '';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingHeaderMinimal />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Reserva tu Cita con Capittal
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Agenda una reunión personalizada con nuestro equipo de expertos para revisar 
              tu valoración y discutir los próximos pasos en el proceso de venta.
            </p>
          </div>

          {/* Benefits Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">💬</span>
              </div>
              <h3 className="font-semibold mb-2">Consulta Personalizada</h3>
              <p className="text-sm text-muted-foreground">
                Revisamos tu valoración y respondemos todas tus preguntas
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">📊</span>
              </div>
              <h3 className="font-semibold mb-2">Análisis Detallado</h3>
              <p className="text-sm text-muted-foreground">
                Profundizamos en los aspectos clave que afectan a tu valoración
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">🎯</span>
              </div>
              <h3 className="font-semibold mb-2">Próximos Pasos</h3>
              <p className="text-sm text-muted-foreground">
                Te orientamos sobre las mejores opciones para tu empresa
              </p>
            </div>
          </div>

          {/* Booking Form */}
          <CalendarBooking
            contactName={contactName}
            contactEmail={contactEmail}
            contactPhone={contactPhone}
            companyName={companyName}
            onSuccess={() => {
              // Scroll to top or show success message
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          {/* Contact Alternative */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              ¿Prefieres contactar directamente?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:+34910123456" 
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80"
              >
                <span className="text-lg">📞</span>
                +34 910 123 456
              </a>
              <a 
                href="mailto:info@capittal.es" 
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80"
              >
                <span className="text-lg">📧</span>
                info@capittal.es
              </a>
            </div>
          </div>

        </div>
      </main>
      
      <LandingFooterMinimal />
    </div>
  );
};

export default BookingPage;