import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Building2, Phone, Mail, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CalendarBookingProps {
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  companyName?: string;
  onSuccess?: () => void;
}

interface TimeSlot {
  time: string;
  label: string;
  available: boolean;
}

const CalendarBooking = ({
  contactName = '',
  contactEmail = '',
  contactPhone = '',
  companyName = '',
  onSuccess
}: CalendarBookingProps) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [formData, setFormData] = useState({
    clientName: contactName,
    clientEmail: contactEmail,
    clientPhone: contactPhone,
    companyName: companyName,
    meetingType: 'consultation',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Generate available dates (next 30 days, excluding weekends)
  useEffect(() => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 45; i++) {  // Check next 45 days to get 30 business days
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date.toISOString().split('T')[0]);
      }
      
      if (dates.length >= 30) break;  // Stop when we have 30 business days
    }
    
    setAvailableDates(dates);
  }, []);

  // Generate time slots for selected date
  useEffect(() => {
    if (!selectedDate) {
      setTimeSlots([]);
      return;
    }

    const slots: TimeSlot[] = [];
    
    // Morning slots: 9:00 - 13:00
    for (let hour = 9; hour < 14; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      slots.push({
        time,
        label: `${hour}:00`,
        available: true
      });
    }
    
    // Afternoon slots: 15:00 - 18:00 (excluding 14:00-15:00 lunch break)
    for (let hour = 15; hour < 19; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      slots.push({
        time,
        label: `${hour}:00`,
        available: true
      });
    }

    setTimeSlots(slots);
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      toast.error('Por favor selecciona fecha y hora');
      return;
    }

    if (!formData.clientName || !formData.clientEmail) {
      toast.error('Nombre y email son obligatorios');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create booking datetime
      const bookingDateTime = new Date(`${selectedDate}T${selectedTime}`);

      const bookingData = {
        client_name: formData.clientName,
        client_email: formData.clientEmail,
        client_phone: formData.clientPhone || null,
        company_name: formData.companyName || null,
        booking_date: selectedDate,
        booking_time: selectedTime,
        booking_datetime: bookingDateTime.toISOString(),
        meeting_type: formData.meetingType,
        notes: formData.notes || null,
        status: 'pending'
      };

      console.log('Submitting booking:', bookingData);

      const { data, error } = await supabase
        .from('calendar_bookings')
        .insert([bookingData])
        .select()
        .single();

      if (error) {
        console.error('Error creating booking:', error);
        throw error;
      }

      console.log('Booking created successfully:', data);

      toast.success('¡Cita reservada correctamente!', {
        description: 'Te enviaremos una confirmación por email en breve.'
      });

      // Reset form
      setSelectedDate('');
      setSelectedTime('');
      setFormData({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        companyName: '',
        meetingType: 'consultation',
        notes: ''
      });

      if (onSuccess) {
        onSuccess();
      }

    } catch (error: any) {
      console.error('Error booking appointment:', error);
      toast.error('Error al reservar la cita', {
        description: error.message || 'Por favor, inténtalo de nuevo'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Reservar Cita de Consulta
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Agenda una reunión con nuestro equipo para revisar tu valoración y discutir los próximos pasos.
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Información de Contacto
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Nombre completo *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Tu nombre completo"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="clientEmail">Email *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientPhone">Teléfono</Label>
                <Input
                  id="clientPhone"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                  placeholder="600 000 000"
                />
              </div>
              
              <div>
                <Label htmlFor="companyName">Empresa</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Nombre de tu empresa"
                />
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Seleccionar Fecha
            </h3>
            
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger>
                <SelectValue placeholder="Elige una fecha disponible" />
              </SelectTrigger>
              <SelectContent>
                {availableDates.map((date) => (
                  <SelectItem key={date} value={date}>
                    {formatDateForDisplay(date)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Seleccionar Hora
              </h3>
              
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    type="button"
                    variant={selectedTime === slot.time ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTime(slot.time)}
                    disabled={!slot.available}
                    className="text-sm"
                  >
                    {slot.label}
                  </Button>
                ))}
              </div>
              
              <p className="text-xs text-muted-foreground">
                Horario disponible: 9:00-13:00 y 15:00-18:00 (no disponible de 14:00-15:00)
              </p>
            </div>
          )}

          {/* Meeting Type */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Tipo de Reunión
            </h3>
            
            <Select 
              value={formData.meetingType} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, meetingType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consultation">Consulta General</SelectItem>
                <SelectItem value="valuation_review">Revisión de Valoración</SelectItem>
                <SelectItem value="negotiation">Proceso de Negociación</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comentarios Adicionales
            </h3>
            
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Información adicional que quieras compartir sobre la reunión..."
              rows={3}
            />
          </div>

          {/* Summary */}
          {selectedDate && selectedTime && (
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Resumen de la Cita</h4>
              <div className="text-sm space-y-1">
                <p><strong>Fecha:</strong> {formatDateForDisplay(selectedDate)}</p>
                <p><strong>Hora:</strong> {selectedTime}</p>
                <p><strong>Tipo:</strong> {
                  formData.meetingType === 'consultation' ? 'Consulta General' :
                  formData.meetingType === 'valuation_review' ? 'Revisión de Valoración' :
                  'Proceso de Negociación'
                }</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || !selectedDate || !selectedTime}
          >
            {isSubmitting ? 'Reservando...' : 'Confirmar Reserva'}
          </Button>
          
        </form>
      </CardContent>
    </Card>
  );
};

export default CalendarBooking;