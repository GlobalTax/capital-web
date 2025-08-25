import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Building2, Phone, Video, MessageSquare, Handshake, FileText, Users, Briefcase } from 'lucide-react';
import { useCalendarBooking } from '@/hooks/useCalendarBooking';

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
    meetingFormat: 'video_call' as 'phone_call' | 'video_call',
    notes: ''
  });
  
  const { createBooking, getAvailableDates, getAvailableTimeSlots, isSubmitting } = useCalendarBooking();
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Generate available dates using hook
  useEffect(() => {
    const dates = getAvailableDates(30);
    setAvailableDates(dates);
  }, [getAvailableDates]);

  // Generate time slots for selected date using hook
  useEffect(() => {
    if (!selectedDate) {
      setTimeSlots([]);
      return;
    }

    const times = getAvailableTimeSlots(selectedDate);
    const slots: TimeSlot[] = times.map(time => ({
      time,
      label: time,
      available: true
    }));

    setTimeSlots(slots);
  }, [selectedDate, getAvailableTimeSlots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      return;
    }

    if (!formData.clientName || !formData.clientEmail) {
      return;
    }

    try {
      const bookingData = {
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        companyName: formData.companyName,
        bookingDate: selectedDate,
        bookingTime: selectedTime,
        meetingType: formData.meetingType as 'consultation' | 'valuation_review' | 'negotiation' | 'sell_company',
        meetingFormat: formData.meetingFormat,
        notes: formData.notes
      };

      await createBooking(bookingData);

      // Reset form
      setSelectedDate('');
      setSelectedTime('');
      setFormData({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        companyName: '',
        meetingType: 'consultation',
        meetingFormat: 'video_call',
        notes: ''
      });

      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      // Error handling is done in the hook
      console.error('Error in form submission:', error);
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

          {/* Meeting Format */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Formato de Reunión
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant={formData.meetingFormat === 'phone_call' ? "default" : "outline"}
                onClick={() => setFormData(prev => ({ ...prev, meetingFormat: 'phone_call' }))}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <Phone className="h-5 w-5" />
                <span className="text-sm">Llamada Telefónica</span>
              </Button>
              
              <Button
                type="button"
                variant={formData.meetingFormat === 'video_call' ? "default" : "outline"}
                onClick={() => setFormData(prev => ({ ...prev, meetingFormat: 'video_call' }))}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <Video className="h-5 w-5" />
                <span className="text-sm">Videollamada</span>
              </Button>
            </div>
          </div>

          {/* Meeting Type */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Motivo de la Reunión
            </h3>
            
            <Select 
              value={formData.meetingType} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, meetingType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consultation">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Consulta General
                  </div>
                </SelectItem>
                <SelectItem value="valuation_review">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Revisión de Valoración
                  </div>
                </SelectItem>
                <SelectItem value="negotiation">
                  <div className="flex items-center gap-2">
                    <Handshake className="h-4 w-4" />
                    Proceso de Negociación
                  </div>
                </SelectItem>
                <SelectItem value="sell_company">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Vender mi Empresa
                  </div>
                </SelectItem>
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
                <p><strong>Formato:</strong> {
                  formData.meetingFormat === 'phone_call' ? 'Llamada Telefónica' : 'Videollamada'
                }</p>
                <p><strong>Motivo:</strong> {
                  formData.meetingType === 'consultation' ? 'Consulta General' :
                  formData.meetingType === 'valuation_review' ? 'Revisión de Valoración' :
                  formData.meetingType === 'negotiation' ? 'Proceso de Negociación' :
                  'Vender mi Empresa'
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