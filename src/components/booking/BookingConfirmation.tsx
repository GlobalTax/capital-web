import React from 'react';
import { CheckCircle, Calendar, Clock, Phone, Mail, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BookingConfirmationProps {
  bookingDetails: {
    date: string;
    time: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
  };
  onClose?: () => void;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  bookingDetails,
  onClose
}) => {
  const formattedDate = new Date(bookingDetails.date).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="text-center space-y-6 py-8">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-success" />
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">
          ¡Cita confirmada!
        </h2>
        <p className="text-muted-foreground">
          Hemos reservado tu llamada con el equipo de Capittal
        </p>
      </div>

      {/* Booking Details Card */}
      <div className="max-w-sm mx-auto bg-card border border-border rounded-lg p-6 text-left space-y-4">
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">Fecha</p>
            <p className="font-medium text-foreground capitalize">{formattedDate}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">Hora</p>
            <p className="font-medium text-foreground">{bookingDetails.time} (Europe/Madrid)</p>
          </div>
        </div>

        {bookingDetails.phone && (
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Te llamaremos al</p>
              <p className="font-medium text-foreground">{bookingDetails.phone}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">Confirmación enviada a</p>
            <p className="font-medium text-foreground">{bookingDetails.email}</p>
          </div>
        </div>

        {bookingDetails.company && (
          <div className="flex items-start gap-3">
            <Building2 className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Empresa</p>
              <p className="font-medium text-foreground">{bookingDetails.company}</p>
            </div>
          </div>
        )}
      </div>

      {/* Next Steps */}
      <div className="max-w-sm mx-auto bg-primary/5 border border-primary/20 rounded-lg p-4">
        <p className="text-sm text-foreground">
          <strong>Próximos pasos:</strong>
          <br />
          Recibirás un email de confirmación con todos los detalles. 
          Un asesor de Capittal te llamará a la hora acordada.
        </p>
      </div>

      {/* Actions */}
      {onClose && (
        <div className="pt-4">
          <Button onClick={onClose} variant="outline">
            Cerrar
          </Button>
        </div>
      )}
    </div>
  );
};
